/**
 * Utility helpers for Playwright tests with Discord integration.
 * - Provides markPassed/markFailed logging into Discord threads.
 * - Manages a message queue + flush cycle via REST (no Gateway).
 * - Safe helpers: wrappers around Playwright actions (click, input, hover, navigate, wait)
 *   that return boolean instead of throwing. This:
 *      • keeps test code clean and readable
 *      • allows custom Discord messages per failure
 *      • still lets you include the short Playwright error via getLastError(page)
 *
 * Timeouts:
 * - All helpers default to Timeouts.standard (15s).
 * - Can override per call, e.g. safeClick(page, sel, { timeout: Timeouts.short }).
 */

import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';
import { Timeouts } from './Timeouts';

/*
 *  Shared run metadata & REST client (used to post to the per-run thread)
 *  `.discord-run.json` is written during setup (see discordSetup/sendSuiteHeader).
 *  We only need REST here (no Gateway) to post ✅ / ❌ logs into the thread.
 */
const RUN_META_PATH = path.resolve('.discord-run.json');
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const rest = TOKEN ? new REST({ version: '10' }).setToken(TOKEN) : null;

// The currently executing test title (set by setCurrentTestTitle in test hooks)
let currentTestTitle = null;

// Outgoing message queue for thread posts (non-blocking ✅ / ❌)
// - messageQueue: FIFO queue of message strings to send
// - flushing: prevents overlapping flush loops
// - pendingPosts: promises for posts currently being awaited (for clean shutdown)
const messageQueue = [];
let flushing = false;
const pendingPosts = new Set();

// Prevent duplicate ❌ posts for the same test (de-dupe by test title)
const failedOnceByTitle = new Set();

// -------------------- Public API -------------------- //
/**
 * Sets the "current test title" so pass/fail helpers know what to post.
 * Call this from your test hooks (e.g., beforeEach/afterEach) with the test title.
 */
export function setCurrentTestTitle(title) {
  currentTestTitle = title;
}

/**
 * ✅ Mark a test as PASSED.
 * Enqueues "✅ <title>\nReason: <reason>" only when DISCORD_LOG_PASSED === "1".
 * No-op if currentTestTitle isn't set (guard).
 */
export function markPassed(reason) {
  if (!currentTestTitle) return;
  if (process.env.DISCORD_LOG_PASSED === '1') {
    enqueue(formatMsg('✅', currentTestTitle, reason));
  }
}

/**
 * ❌ Mark a test as FAILED.
 * Enqueues a single failure message per test (de-duped by title).
 * Immediately throws to fail fast with a consistent error message.
 * Requires a non-empty reason for clarity in the thread.
 */
export function markFailed(reason) {
  if (!currentTestTitle) throw new Error('markFailed() called without a current test title');
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    throw new Error(`[CONFIG ERROR] markFailed("${currentTestTitle}") requires a non-empty reason`);
  }

  // Enqueue only once per test title (avoid duplicate ❌ spam on multiple failures)
  if (!failedOnceByTitle.has(currentTestTitle)) {
    failedOnceByTitle.add(currentTestTitle);
    enqueue(formatMsg('❌', currentTestTitle, reason));
  }

  // Stop the current test immediately with a clear error message
  throw new Error(`[FAILED] ${currentTestTitle}: ${reason}`);
}

/**
 * Flush any queued posts before the worker exits.
 * - Awaits the queue flush loop, then any **pendingPosts** REST requests.
 * - Call this in your test runner teardown to avoid dropped messages.
 */
export async function flushReports() {
  await flush();
  if (pendingPosts.size > 0) {
    await Promise.all([...pendingPosts]);
  }
}

// -------------------- Internal Utils -------------------- //

/**
 * Builds a simple message:
 * - With reason:  "<emoji> <title>\nReason: <reason>"
 * - Without:      "<emoji> <title>"
 */
function formatMsg(emoji, title, reason) {
  return reason ? `${emoji} ${title}\nReason: ${reason}` : `${emoji} ${title}`;
}

/**
 * Reads the threadId from `.discord-run.json` (written during setup).
 * - Returns null if the file is missing / unreadable.
 */
function readThreadId() {
  try {
    const meta = JSON.parse(fs.readFileSync(RUN_META_PATH, 'utf-8'));
    return meta?.threadId || null;
  } catch {
    return null;
  }
}

/**
 * Enqueue a message for posting into the run thread.
 * - Schedules a flush (non-blocking) if not already flushing.
 */
function enqueue(content) {
  messageQueue.push(content);
  scheduleFlush();
}

/**
 * Starts a flush with a tiny delay (100ms) to coalesce bursty posts.
 * - Still non-blocking; yields back to the event loop before flushing.
 */
function scheduleFlush() {
  if (flushing) return;
  flushing = true;
  setTimeout(() => void flush(), 100);
}

/**
 * Flush loop: posts queued messages to the run thread via REST.
 * - If threadId/rest aren't ready yet, retries shortly (150ms) and reschedules.
 * - Sends messages one-by-one, tracking **pendingPosts** for clean shutdown.
 * - Reschedules if messageQueue refills while flushing (back-pressure friendly).
 */
async function flush() {
  try {
    const threadId = readThreadId();
    if (!threadId || !rest) {
      // Thread not ready yet — retry shortly
      setTimeout(() => {
        flushing = false;
        scheduleFlush();
      }, 150);
      return;
    }

    while (messageQueue.length > 0) {
      const content = messageQueue.shift();
      // Post directly to the run thread (threadId is a channel id for the thread)
      const p = rest.post(Routes.channelMessages(threadId), { body: { content } });
      pendingPosts.add(p);
      await p.finally(() => pendingPosts.delete(p));
    }
  } finally {
    flushing = false;
    if (messageQueue.length > 0) scheduleFlush();
  }
}

/**
 * Keeps the last short error per Playwright Page so tests can optionally include it in logs.
 * Usage in tests:
 *   if (!(await safeClick(page, sel))) {
 *     markFailed(`Click failed: ${getLastError(page)}`);
 *   }
 */
const lastErrorMap = new WeakMap(); // key = Page, value = short error string

function setLastErrorForPage(page, error) {
  const short = error?.message?.split('\n')[0] || String(error);
  lastErrorMap.set(page, short);
}

export function getLastError(page) {
  return lastErrorMap.get(page) || '';
}

/** Wait until an element is visible (boolean return). */
export async function safeWaitForElementVisible(
  page,
  selector,
  { timeout = Timeouts.standard } = {}
) {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch (error) {
    setLastErrorForPage(page, error);
    return false;
  }
}

/** Click anything (buttons, links, checkboxes, menu items).  */
export async function safeClick(page, selector, { timeout = Timeouts.standard } = {}) {
  try {
    const loc = page.locator(selector);
    await loc.waitFor({ state: 'visible', timeout });
    await loc.click({ timeout });
    return true;
  } catch (error) {
    setLastErrorForPage(page, error);
    return false;
  }
}

/** Type into input/textarea with keystrokes (cross-platform select-all). */
export async function safeInput(
  page,
  selector,
  text,
  { timeout = Timeouts.standard, delay = 15 } = {}
) {
  try {
    const loc = page.locator(selector);
    await loc.waitFor({ state: 'visible', timeout });
    await loc.click({ timeout }); // focus

    // Detect the right select-all combo for the current OS
    const selectAllShortcut = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
    await page.keyboard.press(selectAllShortcut);
    await page.keyboard.press('Backspace');

    if (text) await page.keyboard.type(String(text), { delay });
    return true;
  } catch (error) {
    setLastErrorForPage(page, error);
    return false;
  }
}

/** Hover over element. */
export async function safeHover(page, selector, { timeout = Timeouts.standard } = {}) {
  try {
    const loc = page.locator(selector);
    await loc.waitFor({ state: 'visible', timeout });
    await loc.hover({ timeout });
    return true;
  } catch (error) {
    setLastErrorForPage(page, error);
    return false;
  }
}

/** Navigate to a given URL and confirm it loads. */
export async function safeNavigateToUrl(
  page,
  url,
  { timeout = Timeouts.extraLong, waitUntil = 'load' } = {}
) {
  try {
    await page.goto(url, { timeout, waitUntil });
    return true;
  } catch (error) {
    setLastErrorForPage(page, error);
    return false;
  }
}

/** Wait for the page to load and URL to match the expected value (after a click or redirect). */
export async function safeWaitForPageLoad(
  page,
  expectedUrl,
  { timeout = Timeouts.extraLong, waitUntil = 'load' } = {}
) {
  try {
    await page.waitForURL(expectedUrl, { timeout, waitUntil });
    return true;
  } catch (error) {
    setLastErrorForPage(page, error);
    return false;
  }
}
