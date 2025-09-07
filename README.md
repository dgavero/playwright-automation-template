# 🧪 E2E Playwright → Discord Reporter

End-to-end testing framework powered by **Playwright** with **Discord integration** for real-time reporting.

---

## 🚀 Features
- Run Playwright E2E tests with **multi-env** support (`LOCAL` / `PROD`).
- **Discord integration**:
  - Suite headers with environment + filters.
  - Dedicated Discord **thread per run**.
  - ❌ Failure messages posted immediately.
  - Optional ✅ pass logging.
  - Summary auto-updated at end of run.
- **Tag-based filtering** → run only what matters.
- Boolean helpers for quick element checks.
- Full `.env` support for configuration.

---

## 📦 Installation
```bash
npm install
```

---

## 🛠 Quick Start

### 1. Configure `.env`
```env
DISCORD_BOT_TOKEN=your_token
DISCORD_CHANNEL_ID=your_channel

BASE_URL_LOCAL=https://example.com
BASE_URL_PROD=https://playwright.dev

TEST_ENV=LOCAL
DISCORD_LOG_PASSED=0
```

---

### 2. Run All Tests
```bash
npx playwright test
```

---

### 3. Run Specific Environments
```bash
TEST_ENV=PROD npx playwright test
```

---

### 4. Run Specific Tags
```bash
TAGS='@samples' npx playwright test
TAGS='@pos1|@neg2' npx playwright test
```

---

## 📘 Full Documentation
See **[USAGE.md](./USAGE.md)** for:
- Detailed usage examples
- Tagging strategies
- Discord integration behavior
- Advanced options

---

## 🧩 Project Structure
```
e2e-project/
├── helpers/
│   ├── discord/
│   │   ├── discordBot.js
│   │   ├── discordReporter.js
│   │   ├── discordSetup.js
│   ├── testUtils.js
├── tests/
│   ├── example.spec.js
│   ├── example2.spec.js
├── .env
├── globalConfig.js
├── playwright.config.js
├── package.json
├── README.md
└── USAGE.md
```

---

## 📄 License
MIT — Use, modify, and enjoy 🚀
