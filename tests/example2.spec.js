// tests/example2.spec.js
import { test } from '../globalConfig.js';
import { markPassed, markFailed, waitForElementVisible } from '../helpers/testUtils.js';

const isProd = (process.env.TEST_ENV || 'LOCAL').toUpperCase() === 'PROD';

/* ---------- POSITIVE ---------- */
test.describe('positive 2 @samples', () => {
  test('positive test case 3 @pos1', async ({ page }) => {
    await page.goto('/');

    // Both example.com & playwright.dev have an <h1>
    if (!(await waitForElementVisible(page, 'h1', { timeout: 7000 }))) {
      markFailed('Main heading <h1> is not visible');
    }

    markPassed();
  });

  test('positive test case 4 @pos2', async ({ page }) => {
    await page.goto('/');

    // Env-specific CTA that should exist
    const ctaSelector = isProd
      ? 'text=/Get started/i'          // playwright.dev
      : 'text=/More information/i';    // example.com

    if (!(await waitForElementVisible(page, ctaSelector, { timeout: 7000 }))) {
      markFailed(`Expected homepage CTA not visible (${ctaSelector})`);
    }

    markPassed();
  });
});

/* ---------- NEGATIVE (intentional fails) ---------- */
test.describe('negative 2 @samples2', () => {
  test('negative test case 3 @neg1', async ({ page }) => {
    await page.goto('/');

    // Intentionally fail: element should NOT exist
    if (!(await waitForElementVisible(page, 'text=Absolutely Missing', { timeout: 2000 }))) {
      markFailed('Expected element not found.');
    }

    // never reached
    markPassed();
  });

  test('negative test case 4 @neg2', async ({ page }) => {
    await page.goto('/');

    // Intentionally fail: improbable text
    if (!(await waitForElementVisible(page, 'text=/This Should Not Exist/i', { timeout: 2000 }))) {
      markFailed('Page content did not match expected value.');
    }

    // never reached
    markPassed();
  });
});
