// helpers/discord/discordReporter.js
import { appendSummary, shutdownBot, editRunningHeader } from './discordBot.js';

class DiscordReporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.total = 0;
    this.completed = 0;
  }

  // Discover all planned tests so we can render 0% [0/N] right away
  async onBegin(config, suite) {
    const all = suite.allTests();
    this.total = all.length;

    await editRunningHeader({ completed: 0, total: this.total });
  }

  async onTestEnd(test, result) {
    this.completed += 1;

    if (result.status === 'passed') this.passed += 1;
    else if (result.status === 'skipped') this.skipped += 1;
    else this.failed += 1;

    await editRunningHeader({ completed: this.completed, total: this.total });
  }

  async onEnd() {
    // Switch to your existing final summary format (kept EXACTLY as you wrote it)
    await appendSummary({
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
    });
    await shutdownBot();
  }
}

export default DiscordReporter;
