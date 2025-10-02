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

Create a `.env` file in the project root. Example:

```env
# --- Discord ---
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
DISCORD_LOG_PASSED=0   # Set to 1 if you want passed tests also logged
REPORT_PUBLISH=1       # Set to 0 to skip publishing reports (useful offline)

# --- Environment ---
TEST_ENV=LOCAL         # LOCAL | ORANGE | PROD
THREADS=4              # number of workers

# --- Base URLs ---
BASE_URL_LOCAL=https://example.com
BASE_URL_ORANGE=https://opensource-demo.orangehrmlive.com/
BASE_URL_PROD=https://playwright.dev
```
See `.env.example` for a full template with placeholders.

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
