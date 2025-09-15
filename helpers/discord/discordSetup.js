// Initializes the Discord run: posts header + creates thread, then shuts down Gateway.


import { sendSuiteHeader, shutdownBot } from './discordBot.js';


/**
 * Extracts the raw value passed to Playwright via --grep / -g.
 * - Supports both split args:  --grep somePattern
 * - And inline form:           --grep=/samples/i
 * Returns the raw string or null if not present.
 */
function extractRawGrepFromArgs() {
  const idx = process.argv.findIndex(a => a === '--grep' || a === '-g');
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const inline = process.argv.find(a => a.startsWith('--grep='));
  if (inline) return inline.split('=')[1];
  return null;
}

/**
 * Converts a raw grep/tag string into a readable label for the header.
 * Examples:
 *   "/(smoke|samples)/i"  -> "smoke, samples"
 *   "samples"             -> "samples"
 *   "" or null            -> "all"
 * - Strips non-capturing groups (?:...) and parentheses for cleaner display.
 * - Normalizes "|" into a comma-separated list.
 */
function prettifyGrep(raw) {
  if (!raw) return 'all';
  const m = raw.match(/^\/(.+)\/[a-z]*$/i);
  const core = m ? m[1] : raw;
  const pretty = core.replace(/\(\?:/g, '(').replace(/[()]/g, '').trim();
  const parts = pretty.split('|').map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts.join(', ') : (pretty || 'all');
}

/**
 * Global setup for the Discord dashboard:
 * - Determines the environment label (TEST_ENV or "LOCAL").
 * - Chooses the visible "grep/tags" label:
 *     Prefer TAGS env (e.g., "samples|smoke"), otherwise fall back to CLI --grep.
 * - Posts the header + creates the run thread.
 * - Closes the Gateway client (we’ll use REST for live progress during the run).
 */
async function discordSetup() {
  const testEnv = process.env.TEST_ENV || 'LOCAL';

  // Prefer env TAGS for clarity (e.g., "samples|smoke"); fallback to CLI --grep if absent.
  const raw = process.env.TAGS && process.env.TAGS.trim().length ? process.env.TAGS : extractRawGrepFromArgs();
  const grepLabel = prettifyGrep(raw);

  await sendSuiteHeader({
    suiteName: 'End2End Test Suite',
    env: testEnv,
    grep: grepLabel,
  });

  // Close Gateway after setup to free resources.
  // Workers will use REST for live header edits during the run.
  await shutdownBot();
}

export default discordSetup;
