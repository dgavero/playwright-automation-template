// tests/example.spec.js
import { test } from '../globalConfig.js';
import { markPassed, markFailed, waitForElementVisible } from '../helpers/testUtils.js';

const isProd = (process.env.TEST_ENV || 'LOCAL').toUpperCase() === 'PROD';

test.describe('positive @samples', () => {
  test('positive test case 1 @pos1', async ({ page }) => {
    await page.goto('/');

    // Both example.com & playwright.dev have an <h1>
    if (!(await waitForElementVisible(page, 'h1', { timeout: 7000 }))) {
      markFailed('Main heading <h1> is not visible');
    }

    markPassed();
  });

  test('positive test case 2 @pos2', async ({ page }) => {
    await page.goto('/');

    // Pick a homepage CTA that exists per env
    const ctaSelector = isProd
      ? 'text=/Get started/i'          // playwright.dev
      : 'text=/More information/i';    // example.com

    if (!(await waitForElementVisible(page, ctaSelector, { timeout: 7000 }))) {
      markFailed(`Expected homepage CTA not visible (${ctaSelector})`);
    }

    markPassed();
  });
});

test.describe('negative @samples', () => {
  test('negative test case 1 @neg1', async ({ page }) => {
    await page.goto('/');

    // Intentionally fail: element should NOT exist
    if (!(await waitForElementVisible(page, 'text=Totally Not There', { timeout: 2000 }))) {
      markFailed('Expected element not found.');
    }

    // (We never reach here; test fails above)
    markPassed();
  });

  test('negative test case 2 @neg2', async ({ page }) => {
    await page.goto('/');

    // Intentionally fail: wrong title expectation for both envs
    if (!(await waitForElementVisible(page, 'text=/This String Will Not Appear Anywhere/i', { timeout: 2000 }))) {
      markFailed('Page title did not match expected value.');
    }

    // (We never reach here; test fails above)
    markPassed();
  });
});
