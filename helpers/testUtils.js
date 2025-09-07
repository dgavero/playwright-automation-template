// helpers/testUtils.js
import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';

const RUN_META_PATH = path.resolve('.discord-run.json');
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const rest = TOKEN ? new REST({ version: '10' }).setToken(TOKEN) : null;

let currentTestTitle = null;

// Queue for non-blocking posts (✅ or ❌)
const outbox = [];
let flushing = false;
const inFlight = new Set();

// De-dupe guard so the same failure isn't enqueued twice per test
const failedOnceByTitle = new Set();

// -------------------- Public API -------------------- //

export function setCurrentTestTitle(title) {
  currentTestTitle = title;
}

/** ✅ Mark passed tests — posts only if DISCORD_LOG_PASSED=1 */
export function markPassed(reason) {
  if (!currentTestTitle) return;
  if (process.env.DISCORD_LOG_PASSED === '1') {
    enqueue(formatMsg('✅', currentTestTitle, reason));
  }
}

/** ❌ Mark failed tests — enqueue once, then throw immediately */
export function markFailed(reason) {
  if (!currentTestTitle) throw new Error('markFailed() called without a current test title');
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    throw new Error(`[CONFIG ERROR] markFailed("${currentTestTitle}") requires a non-empty reason`);
  }

  // Enqueue failure message once per test
  if (!failedOnceByTitle.has(currentTestTitle)) {
    failedOnceByTitle.add(currentTestTitle);
    enqueue(formatMsg('❌', currentTestTitle, reason));
  }

  // Stop current test immediately
  throw new Error(`[FAILED] ${currentTestTitle}: ${reason}`);
}

/** Ensure queued posts are flushed before the worker exits */
export async function flushReports() {
  await flush();
  if (inFlight.size > 0) {
    await Promise.all([...inFlight]);
  }
}

// -------------------- Boolean Helpers -------------------- //

/** Wait for element to be visible → returns boolean */
export async function waitForElementVisible(target, selectorOrOpts, maybeOpts) {
  const { locator, opts } = toLocatorAndOpts(target, selectorOrOpts, maybeOpts);
  try {
    await locator.waitFor({ state: 'visible', timeout: opts.timeout ?? 5000 });
    return true;
  } catch {
    return false;
  }
}

/** Wait for element to be present in DOM → returns boolean */
export async function waitForElementPresent(target, selectorOrOpts, maybeOpts) {
  const { locator, opts } = toLocatorAndOpts(target, selectorOrOpts, maybeOpts);
  try {
    await locator.waitFor({ state: 'attached', timeout: opts.timeout ?? 5000 });
    return true;
  } catch {
    return false;
  }
}

// -------------------- Internal Utils -------------------- //

function formatMsg(emoji, title, reason) {
  return reason ? `${emoji} ${title}\nReason: ${reason}` : `${emoji} ${title}`;
}

function readThreadId() {
  try {
    const meta = JSON.parse(fs.readFileSync(RUN_META_PATH, 'utf-8'));
    return meta?.threadId || null;
  } catch {
    return null;
  }
}

function enqueue(content) {
  outbox.push(content);
  scheduleFlush();
}

function scheduleFlush() {
  if (flushing) return;
  flushing = true;
  setTimeout(() => void flush(), 0);
}

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

    while (outbox.length > 0) {
      const content = outbox.shift();
      const p = rest.post(Routes.channelMessages(threadId), { body: { content } });
      inFlight.add(p);
      await p.finally(() => inFlight.delete(p));
    }
  } finally {
    flushing = false;
    if (outbox.length > 0) scheduleFlush();
  }
}

function toLocatorAndOpts(target, selectorOrOpts, maybeOpts) {
  // If target is a Locator
  if (target && typeof target.waitFor === 'function') {
    return { locator: target, opts: selectorOrOpts || {} };
  }
  // If target is Page + selector
  if (target && typeof target.locator === 'function' && typeof selectorOrOpts === 'string') {
    return { locator: target.locator(selectorOrOpts), opts: maybeOpts || {} };
  }
  throw new Error(
    'Invalid args: use either waitForElementVisible(locator, { timeout }) or waitForElementVisible(page, "selector", { timeout })'
  );
}
