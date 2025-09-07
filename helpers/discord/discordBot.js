// helpers/discord/discordBot.js
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// Shared run metadata so all workers can post to the same thread
const RUN_META_PATH = path.resolve('.discord-run.json');

let client = null;
let channel = null;

export async function initBot() {
  if (client) return client;
  if (!TOKEN || !CHANNEL_ID) {
    throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID');
  }
  client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
  await client.login(TOKEN);
  channel = await client.channels.fetch(CHANNEL_ID);
  return client;
}

export async function sendSuiteHeader({ suiteName, env, grep }) {
  await initBot();

  const title = `🧪 End2End Test Suite: ${env} | ${grep || 'all'}`;
  const headerMessage = await channel.send({ content: title });

  // Thread for per-test logs
  const thread = await headerMessage.startThread({
    name: `${suiteName} Run Logs`,
    autoArchiveDuration: 1440, // 24h
  });

  // Persist for workers (threadId + headerMessageId + label)
  const meta = {
    threadId: thread.id,
    channelId: CHANNEL_ID,
    headerMessageId: headerMessage.id,
    suiteLabel: title,
  };
  fs.writeFileSync(RUN_META_PATH, JSON.stringify(meta, null, 2));

  return { headerMessage, thread, metaPath: RUN_META_PATH };
}

export function readRunMeta() {
  try {
    return JSON.parse(fs.readFileSync(RUN_META_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export async function appendSummary({ passed, failed, skipped }) {
  const meta = readRunMeta();
  if (!meta) return;

    // ✅ Ensure client & channel are ready even if setup shut them down earlier
  await initBot();

  const header = await channel.messages.fetch(meta.headerMessageId);
  const content =
`${meta.suiteLabel}
📊 **Test Summary**
✅ Passed: ${passed}  
❌ Failed: ${failed}  
⚪ Skipped: ${skipped}`;

  await header.edit({ content });
}

export async function shutdownBot() {
  if (client) {
    await client.destroy();
    client = null;
    channel = null;
  }
}
