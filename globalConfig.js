// globalConfig.js
import { test as base, expect } from '@playwright/test';
import { setCurrentTestTitle, flushReports } from './helpers/testUtils.js';

export const test = base.extend({});

test.beforeEach(async ({ page }, testInfo) => {
  setCurrentTestTitle(testInfo.title);
  console.log(
    `🌐 Testing against: ${process.env.TEST_ENV || 'LOCAL'} (${page.context()._options.baseURL})`
  );
});

// ✅ Flush Discord posts at worker end
test.afterAll(async () => {
  await flushReports();
});

export { expect };
