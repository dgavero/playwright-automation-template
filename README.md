# 🎭 Playwright Automation Template

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
- Test-level timeout defaults to **60s** (configurable).
- Pre-run cleanup of reports/screenshots/test-results.
- Auto-publish HTML reports to GitHub Pages with direct link in Discord summary.

---

## 📦 Installation

```bash
npm install
```

---

## 🛠 Quick Start

### 1. Configure `.env`
Copy `.env.example` to `.env` and fill in your values.


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

> Looking for version history? See **[CHANGELOG.md](./CHANGELOG.md)**.

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
│   ├──
│   ├──
│   ├──
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
