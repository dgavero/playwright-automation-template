import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from '@playwright/test';

const testEnv = (process.env.TEST_ENV || 'LOCAL').toUpperCase();

// Select URL based on TEST_ENV
let baseURL;
if (testEnv === 'PROD') {
  baseURL = process.env.BASE_URL_PROD;
} else {
  baseURL = process.env.BASE_URL_LOCAL;
}

// 🔹 Fail fast if the URL is missing
if (!baseURL) {
  throw new Error(
    `❌ Missing baseURL for TEST_ENV=${testEnv}. Please set ${
      testEnv === 'PROD' ? 'BASE_URL_PROD' : 'BASE_URL_LOCAL'
    } in your .env`
  );
}

const tags = process.env.TAGS || '';
const threads = parseInt(process.env.THREADS || '4', 10);

export default defineConfig({
  testDir: './tests',
  globalSetup: './helpers/discord/discordSetup.js',
  reporter: [
    ['list'],
    ['./helpers/discord/discordReporter.js'],
  ],
  use: {
    baseURL, // ✅ Dynamic baseURL based on TEST_ENV
    headless: true,
  },
  workers: threads,
  grep: tags ? new RegExp(tags) : undefined,
});
