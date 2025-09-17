// test for OrangeHRM
import { test, expect } from '../globalConfig.js';
import OrangeLoginPage from '../pages/OrangeLogin.page.js';
import {
  setCurrentTestTitle,
  markPassed,
  markFailed,
  safeClick,
  safeWaitForElementVisible,
} from '../helpers/testUtils.js';

const ORANGE_USER = process.env.ORANGE_USER || 'Admin';
const ORANGE_PASS = process.env.ORANGE_PASS || 'admin123';

test.beforeEach(async ({}, testInfo) => {
  setCurrentTestTitle(testInfo.title);
});

test.describe('@orange OrangeHRM Login', () => {
  test('positive: login with valid credentials', async ({ page }) => {
    const login = new OrangeLoginPage(page);
    await login.open();
    await login.login(ORANGE_USER, ORANGE_PASS);
    await login.isOnDashboard();
    markPassed('Successfully logged in and saw dashboard');
  });

  test('negative: invalid credentials show error', async ({ page }) => {
    const login = new OrangeLoginPage(page);
    await login.open();
    await login.login('wronguser', 'wrongpass');
    await login.hasError();
    markPassed('Error message displayed for invalid credentials');
  });

  test('logout from dashboard', async ({ page }) => {
    // Login
    const login = new OrangeLoginPage(page);
    await login.open();
    await login.login(ORANGE_USER, ORANGE_PASS);
    await login.isOnDashboard();

    // Logout using selectors defined in the page object
    if (!(await safeWaitForElementVisible(page, login.userMenuTrigger)))
      markFailed(`HOWEVER User menu not visible on page.`);
    await safeClick(page, login.userMenuTrigger);

    if (!(await safeWaitForElementVisible(page, login.logoutItem)))
      markFailed(`HOWEVER Logout button not visible in dropdown menu.`);
    await safeClick(page, login.logoutItem);

    // Verify we’re back on the login screen
    if (!(await safeWaitForElementVisible(page, login.username)))
      markFailed(`Login form not visible after logout.`);
    markPassed('Successfully logged out and returned to login page');
  });
});
