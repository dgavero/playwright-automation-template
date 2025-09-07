// helpers/discord/discordReporter.js
import { appendSummary, shutdownBot } from './discordBot.js';

class DiscordReporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
  }

  async onTestEnd(test, result) {
    if (result.status === 'passed') this.passed++;
    else if (result.status === 'skipped') this.skipped++;
    else this.failed++;
  }

  async onEnd() {
    await appendSummary({
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
    });
    await shutdownBot();
  }
}

export default DiscordReporter;
