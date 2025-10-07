# Changelog

All notable changes to this project will be documented in this file.

## [2.2.4]

### Changed
- Restructured repository into **projects**:
  - **`e2e/`** for UI/browser tests (moved `globalConfig` → `e2e/globalConfig.ui.js`, `Timeouts.js`, pages & specs).
  - **`api/`** scaffold for future API tests.
- Updated `playwright.config.js` to define **projects** and point to `./e2e/tests` and `./api/tests`.
- Updated docs to show `--project=e2e|api` usage and new project tree.


---

## [2.2.3]

### Changed
- Cleaned up documentation to remove duplication:
  - `.env` configuration is now centralized in `.env.example`.
  - README.md Quick Start now points directly to `.env.example` instead of duplicating values.
  - Confirmed PROJECTVISIONS.md and USAGE.md contain only roadmap and usage details respectively.
- Ensured all markdown files (README, USAGE, PROJECTVISIONS, CHANGELOG) are in sync with v2.2.x features.

---

## [2.2.2]
- Nothing much. Just missed update in changelog

---

## [2.2.1]

### Added
- `.env.example` file with placeholders for easy setup.
- Updated README and USAGE to document `REPORT_PUBLISH` and all env vars.

### Changed
- Updated PROJECTVISIONS.md To-Do list (safe helpers marked complete).

---

## [2.2.0]

### Added
- Automatic publishing of Playwright HTML reports to **GitHub Pages** (with timestamped runs).
- Final Discord summary now includes a direct 🔗 link to the published HTML report.

---

### Changed
- Discord summary simplified: always a single final message with ✅/❌/⚪ counts + report link.

## [2.1.0]

### Added

- Generic, concise whole-test timeout message: **“Test timed-out after {N}s.”**
- Automatic pre-run cleanup of `screenshots/`, `.playwright-report/`, and `test-results/`.

### Changed

- Default per-test timeout increased to **60s** (from 30s).

---

## [2.0.0]

### Added

- Safe helpers:
  - `safeClick`
  - `safeInput`
  - `safeHover`
  - `safeNavigateToUrl`
  - `safeWaitForElementVisible`
  - `safeWaitForPageLoad`
- Automatic screenshots on all failures.
- Discord reporting:
  - Suite header with env + tags.
  - Live progress bar.
  - Per-test ✅/❌ logs.
  - Final summary with counts.
- HTML report generation (`.playwright-report`).

---

## [1.0.0]

### Added

- Initial project setup with Playwright + Discord integration.
- Suite header + thread creation in Discord.
- Manual failure logging with `markFailed`.
