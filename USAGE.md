# 📘 Usage Guide — E2E Playwright → Discord Reporter

> **Version**: v1.0.0  
> **Purpose**: Automated Playwright tests + Discord integration for real-time reporting.

---

## 1️⃣ Running Tests

### Run All Tests (Default)
```bash
npx playwright test
```

### Run on PROD
```bash
TEST_ENV=PROD npx playwright test
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
TAGS='@samples' npx playwright test           # run all @samples tests
TAGS='@pos1|@neg2' npx playwright test       # run specific tags
TAGS='(?!.*@secret)' npx playwright test     # run everything except @secret
```

---

## 2️⃣ Environment Setup

### `.env`
```env
DISCORD_BOT_TOKEN=your_token
DISCORD_CHANNEL_ID=your_channel

BASE_URL_LOCAL=https://example.com
BASE_URL_PROD=https://playwright.dev

TEST_ENV=LOCAL
DISCORD_LOG_PASSED=0
```

- `TEST_ENV`: sets which base URL to test (`LOCAL` / `PROD`).
- `DISCORD_LOG_PASSED=1` → logs ✅ passes to Discord.
- Defaults to **LOCAL** if not set.

---

## 3️⃣ Discord Reporting Flow

### What Happens During a Test Run
1. **Suite Start** → Posts header message (`TEST_ENV | tags`).
2. **Thread Creation** → All test logs go here.
3. **Per Test**:
   - `markPassed()` → ✅ *(optional, controlled by env)*.
   - `markFailed()` → ❌ *(always posted)*.
4. **Summary Update** → Appended to header at end of run.

---

## 4️⃣ Helper Functions

### `markPassed(reason?)`
Marks test as passed and optionally posts ✅ to Discord.

```js
markPassed();
markPassed('All checks passed successfully');
```

---

### `markFailed(reason)`
Marks test as failed, posts ❌, and **stops test immediately**.

```js
if (!(await safeWaitForElementVisible(page, '#loginBtn'))) {
  markFailed('Login button not found');
}
```

---

## 5️⃣ Tagging Best Practices

- Use **one primary tag** per suite:  
  `@samples`, `@login`, `@regression`
- Add **secondary tags** freely for filtering:
  - `@critical`
  - `@secret`
  - `@api`
- Tags can be stacked:
```js
test.describe('positive @samples @regression @critical', () => { ... });
```

---

## 6️⃣ Project Structure

```
e2e-project/
├── helpers/
│   ├── discord/
│   │   ├── discordBot.js         # Discord client
│   │   ├── discordReporter.js    # Playwright custom reporter
│   │   ├── discordSetup.js       # Posts header + creates thread
│   ├── testUtils.js              # markPassed / markFailed + wait helpers
├── tests/
│   ├── example.spec.js           # Sample test suite (4 tests)
│   ├── example2.spec.js          # Second suite (4 tests)
├── .env
├── globalConfig.js               # Per-worker setup + flush
├── playwright.config.js          # Core Playwright config
├── package.json
└── README.md
```

---

## 7️⃣ Upcoming Enhancements
- 📌 Attach screenshots + trace files to Discord ❌ failures.
- 📌 Integrate CI/CD (e.g. GitHub Actions).
- 📌 Add richer suite summaries.

---

## 8️⃣ Changelog
- **v1.0.0** — Initial project setup with:
  - Discord integration
  - Sample tests (`example.spec.js` + `example2.spec.js`)
  - Multi-env + tag filtering
  - Clean failure reporting
