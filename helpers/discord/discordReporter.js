/**
 * Custom Playwright reporter for Discord integration.
 * - Shows live progress updates (via REST) as tests run.
 * - Posts the final summary to Discord once all tests complete.
 */

import { appendSummary, shutdownBot, editRunningHeader } from './discordBot.js';
import { spawnSync } from 'node:child_process';

class DiscordReporter {
  constructor() {
    // Running tallies for the current suite.
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;

    // Progress counters for header updates.
    this.total = 0; // set once at start (planned tests after filters)
    this.completed = 0; // incremented on each test end (pass/fail/skip)
  }

  /**
   * Called once before any test runs.
   * - Discovers the exact set of tests that will run (after grep/tags/CLI filters).
   * - Immediately renders "0% [0/N]" so the Discord header shows progress from the start.
   */
  async onBegin(config, suite) {
    const all = suite.allTests();
    this.total = all.length;

    await editRunningHeader({ completed: 0, total: this.total, passed: 0, failed: 0, skipped: 0 });
  }

  /**
   * Called after each test completes (pass/fail/skip).
   * - Updates counters.
   * - Re-renders the running header with the latest percentage and [completed/total].
   *
   * Note: If retries are enabled, onTestEnd fires per attempt. For small suites this is fine;
   *       when the suite grows, consider counting a test as completed only once (final outcome).
   */
  async onTestEnd(test, result) {
    this.completed += 1;

    if (result.status === 'passed') this.passed += 1;
    else if (result.status === 'skipped') this.skipped += 1;
    else this.failed += 1;

    await editRunningHeader({
      completed: this.completed,
      total: this.total,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
    });
  }

  /**
   * Called once after the entire run finishes.
   * - Replaces the running header with the final summary (existing format).
   * - Closes the Gateway client (clean shutdown).
   */
  async onEnd() {

    // At test suite end:
    // - Auto-publishes Playwright HTML report to GitHub Pages (unless disabled via REPORT_PUBLISH=0)
    // - Parses machine-readable "REPORT_URL=..." line
    // - Passes link into appendSummary so it appears in final Discord message
     let reportUrl = null;
     if (process.env.REPORT_PUBLISH !== '0') {
       try {
         const res = spawnSync(process.execPath, ['scripts/publish-report.js'], { encoding: 'utf-8' });
         const out = (res.stdout || '') + (res.stderr || '');
         const m = out.match(/REPORT_URL=(\S+)/);
         if (m) reportUrl = m[1];
       } catch (_) {
         // ignore; we'll just fall back to local path in the summary
       }
     }
     await appendSummary({
       passed: this.passed,
       failed: this.failed,
       skipped: this.skipped,
       reportUrl, // let the bot render a direct link if available
     });
     await shutdownBot();
  }
}

export default DiscordReporter;
