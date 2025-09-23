# 📘 Usage Guide — E2E Playwright + Discord Reporter

> **Version**: v2.0.0  
> **Purpose**: Automated Playwright tests + Discord integration for real-time reporting with screenshots on failure.

---

## 1️⃣ Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run on a Specific Environment

```bash
TEST_ENV=PROD npx playwright test
TEST_ENV=ORANGE npx playwright test
```

### Filter by Tags

Tag tests with `@tags` in `describe` or `test` titles:

```js
test.describe('positive @samples @regression', () => {
  test('positive test case 1 @pos1', async ({ page }) => { ... });
});
```

Examples:

```bash
TAGS='@samples' npx playwright test        # run all @samples tests
TAGS='@pos1|@neg2' npx playwright test    # run specific tags
TAGS='(?!.*@secret)' npx playwright test  # run everything except @secret
```

---

## 2️⃣ Environment Setup

### `.env`

```env
DISCORD_BOT_TOKEN=your_token
DISCORD_CHANNEL_ID=your_channel

BASE_URL_LOCAL=https://example.com
BASE_URL_PROD=https://playwright.dev
BASE_URL_ORANGE=https://opensource-demo.orangehrmlive.com/

TEST_ENV=LOCAL
THREADS=4
DISCORD_LOG_PASSED=0
```

- `TEST_ENV`: Which base URL to test (`LOCAL` / `PROD` / `ORANGE`).
- `THREADS`: Concurrency (workers). Defaults to **4** if not set.
- `DISCORD_LOG_PASSED=1`: Logs ✅ passes. Default `0` (log only failures).
- Defaults to **LOCAL** if not set.

---

## 3️⃣ Discord Reporting Flow

### What Happens During a Run

1. **Suite Start**
   - Posts header message (`🧪 End2End Test Suite: ENV | tags`).
   - Creates a dedicated thread for test logs.
   - Shows `0% [0/N]` progress bar + empty summary.

2. **While Running**
   - Each test updates the live header with:
     - Progress bar (`▰▱▱▱▱`)
     - Percentage done
     - Running summary:
       ```
       📊 Test Summary
       ✅ Passed: 2
       ❌ Failed: 1
       ⚪ Skipped: 0
       ```

3. **Per-Test**
   - `markPassed()` → ✅ optional (only if DISCORD_LOG_PASSED=1).
   - `markFailed(reason)` → ❌ always posted, with screenshot attached.

4. **Final Summary**
   - Header replaced with final counts.
   - Adds static line (for now):
     ```
     🔗 More details on the test result can be checked here:
     <Playwright report link>
     ```

---

## 4️⃣ Helper Functions

### `markPassed(reason?)`

Logs ✅ to Discord (if enabled).

```js
markPassed();
markPassed('All checks passed successfully');
```

### `markFailed(reason)`

Logs ❌ to Discord with a screenshot and stops test immediately.

```js
if (!(await safeWaitForElementVisible(page, '#loginBtn'))) {
  markFailed('Login button not found');
}
```

---

## 5️⃣ Safe Helpers

All return `true/false` instead of throwing.  
If `false`, call `markFailed()` with your human context.

- `safeClick(page, selector, { timeout })`
- `safeInput(page, selector, text, { timeout, delay })`
- `safeHover(page, selector, { timeout })`
- `safeWaitForElementVisible(page, selector, { timeout })`
- `safeNavigateToUrl(page, url, { timeout })`
- `safeWaitForPageLoad(page, url, { timeout })`
- `safeScreenshot(page)` (internal, used on failures)

Timeouts default to `Timeouts.standard` (15s).  
Override with `Timeouts.short`, `long`, `extraLong`.

---

## 6️⃣ Project Structure

```
e2e-project/
├── helpers/
│   ├── discord/
│   │   ├── discordBot.js         # Discord client
│   │   ├── discordReporter.js    # Custom Playwright reporter
│   │   ├── discordSetup.js       # Posts header + creates thread
│   ├── testUtils.js              # markPassed/markFailed + safe helpers
│   ├── Timeouts.js               # Global timeout values
├── tests/
│   ├── example.spec.js           # Sample test suite
│   ├── example2.spec.js
│   ├── sample3_orange_login.spec.js
├── .env
├── globalConfig.js               # Hooks (beforeEach/afterEach/afterAll)
├── playwright.config.js          # Core Playwright config
├── package.json
├── README.md
└── USAGE.md
```

---

## 7️⃣ Upcoming Enhancements

- 🔗 Attach real Playwright report link in final Discord summary.
- 📸 Element-level screenshots.
- 🔄 Retry strategy for flaky tests.
- ⚙️ CI/CD integration (upload HTML report as artifact).
- ➕ More safe helpers (`safeSelect`, `safeCheck`).

---

## 8️⃣ Changelog

- **v2.0.0**
  - Added safe helpers.
  - Added automatic screenshots on failures.
  - Added HTML reporter integration.
  - Improved Discord summary (progress bar + counts).
- **v1.0.0**
  - Initial project setup with Discord integration + sample tests.
