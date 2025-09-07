// helpers/discord/discordSetup.js
import { sendSuiteHeader, shutdownBot } from './discordBot.js';

function extractRawGrepFromArgs() {
  const idx = process.argv.findIndex(a => a === '--grep' || a === '-g');
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const inline = process.argv.find(a => a.startsWith('--grep='));
  if (inline) return inline.split('=')[1];
  return null;
}

function prettifyGrep(raw) {
  if (!raw) return 'all';
  const m = raw.match(/^\/(.+)\/[a-z]*$/i);
  const core = m ? m[1] : raw;
  const pretty = core.replace(/\(\?:/g, '(').replace(/[()]/g, '').trim();
  const parts = pretty.split('|').map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts.join(', ') : (pretty || 'all');
}

async function discordSetup() {
  const testEnv = process.env.TEST_ENV || 'LOCAL';
  // 🔧 Prefer env TAGS, fall back to CLI --grep
  const raw = process.env.TAGS && process.env.TAGS.trim().length ? process.env.TAGS : extractRawGrepFromArgs();
  const grepLabel = prettifyGrep(raw);

  await sendSuiteHeader({
    suiteName: 'End2End Test Suite',
    env: testEnv,
    grep: grepLabel,
  });

  await shutdownBot();
}

export default discordSetup;
