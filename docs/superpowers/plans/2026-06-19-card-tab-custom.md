# Card-Tab Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customize Card-Tab for private notes, tab-style category views, safer drag/drop, duplicate warnings, a warm archive theme, and removal of the weather feature.

**Architecture:** Keep the project as a single Cloudflare Worker file to preserve the original deployment model. Use small helper functions inside `workers.js`, avoid broad refactors, and add a dependency-free Node verification script for behavior checks that can run locally.

**Tech Stack:** Cloudflare Workers JavaScript, browser DOM APIs, local Node.js verification.

---

### Task 1: Add Local Verification

**Files:**
- Create: `test/customization.test.mjs`
- Modify: `workers.js`

- [x] Add a Node script that reads `workers.js` and asserts the agreed customization requirements.
- [x] Run the script before implementation and verify it fails on missing customization.
- [x] Run the script after each implementation slice.

### Task 2: Remove Weather

**Files:**
- Modify: `workers.js`
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [x] Remove the weather mini widget, modal, frontend weather code, styles, and `/api/weather/*` Worker routes.
- [x] Remove README and changelog instructions for `WEATHER_API_KEY` and `WEATHER_API_HOST`.
- [x] Verify `node --check workers.js` and `node test/customization.test.mjs`.

### Task 3: Private Notes

**Files:**
- Modify: `workers.js`

- [x] Add `privateNote` to add/edit dialogs and link objects.
- [x] Redact `privateNote` from unauthenticated `/api/getLinks` responses.
- [x] Add a logged-in note icon and modal with selectable text and copy button.
- [x] Preserve `privateNote` during drag/drop saves.
- [x] Verify syntax and customization tests.

### Task 4: Category Tab Views

**Files:**
- Modify: `workers.js`

- [x] Replace category scroll behavior with `All` plus category view switching.
- [x] Sync selected view to the URL hash and restore it on reload.
- [x] Keep settings mode compatible with `All` for cross-category management.
- [x] Verify syntax and customization tests.

### Task 5: Drag/Drop and Duplicate Warning

**Files:**
- Modify: `workers.js`

- [x] Keep drag/drop available only in settings mode.
- [x] Support category container drop targets, including empty categories.
- [x] Preserve all original link fields when saving order.
- [x] Warn when adding a duplicate normalized URL and allow the user to continue.
- [x] Verify syntax and customization tests.

### Task 6: Archive Yellow Theme

**Files:**
- Modify: `workers.js`

- [x] Add a three-state theme model: warm light, archive yellow, dark.
- [x] Keep the existing dark theme behavior while allowing the archive palette.
- [x] Verify syntax and customization tests.
