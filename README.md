# 🧪 Playwright + Discord Reporter

End-to-end testing framework powered by **Playwright** with **Discord integration** for real-time reporting and screenshots on failures.

---

## 🚀 Features

- Run Playwright E2E tests with **multi-env** support (`LOCAL` / `PROD` / `ORANGE`).
- **Discord integration**:
  - Suite headers with environment + tags.
  - Live progress bar with ✅/❌/⚪ summary.
  - Dedicated Discord **thread per run**.
  - ❌ Failures log screenshots inline.
  - Optional ✅ pass logging.
- **Tag-based filtering** (`TAGS`).
- **Safe helpers** that return booleans instead of throwing.
- **Timeouts** centralized (`short`, `standard`, `long`, `extraLong`).
- Full `.env` support for configuration.
- Always generates an **HTML report** (`npx playwright show-report`).

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
BASE_URL_ORANGE=https://opensource-demo.orangehrmlive.com/

TEST_ENV=LOCAL
THREADS=4
DISCORD_LOG_PASSED=0
```

### 2. Run All Tests

```bash
npx playwright test
```

### 3. Run Specific Environment

```bash
TEST_ENV=PROD npx playwright test
```

### 4. Run Specific Tags

```bash
TAGS='@samples' npx playwright test
```

---

## 📘 Documentation

See **[USAGE.md](./USAGE.md)** for:

- Detailed usage examples
- Safe helper reference
- Tagging strategies
- Discord reporting flow
- Upcoming enhancements

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
│   ├── Timeouts.js
├── tests/
│   ├── example.spec.js
│   ├── example2.spec.js
│   ├── sample3_orange_login.spec.js
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
