# Changelog

All notable changes to this project will be documented in this file.

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
