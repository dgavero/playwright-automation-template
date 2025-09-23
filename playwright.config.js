/**
 * Playwright config with environment-driven setup + Discord integration.
 * - Selects baseURL dynamically based on TEST_ENV (.env values).
 * - Posts run header + summary to Discord (via globalSetup + reporter).
 * - Supports optional TAGS filtering and configurable THREADS concurrency.
 */

import dotenv from 'dotenv';
import { defineConfig } from '@playwright/test';

dotenv.config(); // Load .env file into process.env

// Normalize TEST_ENV (default to LOCAL)
const testEnv = (process.env.TEST_ENV || 'LOCAL').toUpperCase();

// Select URL based on TEST_ENV
let baseURL;
if (testEnv === 'PROD') {
  baseURL = process.env.BASE_URL_PROD;
} else if (testEnv === 'ORANGE') {
  baseURL = process.env.BASE_URL_ORANGE;
} else {
  baseURL = process.env.BASE_URL_LOCAL;
}

// 🔹 Fail fast if the URL is missing
if (!baseURL) {
  throw new Error(
    `❌ Missing baseURL for TEST_ENV=${testEnv}. Please set ${
      testEnv === 'PROD'
        ? 'BASE_URL_PROD'
        : testEnv === 'ORANGE'
          ? 'BASE_URL_ORANGE'
          : 'BASE_URL_LOCAL'
    } in your .env`
  );
}

// Optional filters from env
const tags = process.env.TAGS || ''; // e.g., "smoke|samples"
const threads = parseInt(process.env.THREADS || '4', 10); // Default to 4 threads

export default defineConfig({
  // Where Playwright looks for tests
  testDir: './tests',

  // 🔹 Global setup: posts the Discord header + thread before tests
  globalSetup: './helpers/discord/discordSetup.js',

  // 🔹 Reporters:
  // - list: console output
  // - discordReporter: live updates + final summary in Discord
  reporter: [['list'], ['./helpers/discord/discordReporter.js']],
  use: {
    baseURL, // ✅ Dynamic baseURL based on TEST_ENV
    headless: false, // Always run headless in CI
  },
  workers: threads, // Concurrency controlled by THREADS env

  // Optional tag filtering: run only tests matching TAGS/grep
  grep: tags ? new RegExp(tags) : undefined,
});
