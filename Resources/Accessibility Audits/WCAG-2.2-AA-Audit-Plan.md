# Accessibility Audit Plan — Journey Planner Prototype
**Standard:** WCAG 2.2 Level AA
**Date created:** 2026-02-24
**Scope:** Web (desktop + tablet) and mobile web (iOS Safari, Android Chrome)
**Author:** Paul Mooney

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope and Boundaries](#2-scope-and-boundaries)
3. [WCAG 2.2 Criteria Coverage Map](#3-wcag-22-criteria-coverage-map)
4. [Current Accessibility Baseline](#4-current-accessibility-baseline)
5. [Known Issues and Gaps](#5-known-issues-and-gaps)
6. [Audit Methodology](#6-audit-methodology)
7. [Test Phases](#7-test-phases)
8. [Assistive Technology Matrix](#8-assistive-technology-matrix)
9. [Mobile-Specific Test Cases](#9-mobile-specific-test-cases)
10. [Remediation Backlog](#10-remediation-backlog)
11. [Success Criteria and Sign-off](#11-success-criteria-and-sign-off)
12. [Audit Log Template](#12-audit-log-template)

---

## 1. Executive Summary

This document defines the accessibility audit plan for the Journey Planner Prototype — a mobile-first UK transport planning app built with React 18, TypeScript, and Tailwind CSS. The audit targets **WCAG 2.2 Level AA** conformance across all in-scope routes on both web (desktop/tablet) and mobile web (iOS Safari, Android Chrome).

The app already has a meaningful accessibility foundation: skip links, ARIA combobox patterns, GDS-style form validation, focus-visible styles, page titles, and an automated axe audit in CI. The purpose of this plan is to close the remaining gaps, establish a structured testing process, and produce a signed-off WCAG 2.2 AA conformance statement.

**Target outcome:** Zero critical/high violations, full WCAG 2.2 AA conformance, documented test evidence per criterion.

---

## 2. Scope and Boundaries

### 2.1 In-Scope Routes

| Route | Page | Notes |
|---|---|---|
| `/` | SearchPage | Journey search form + interactive map |
| `/results` | ResultsPage | Journey options list with sorting |
| `/checkout` | CheckoutPage | Passenger details form + payment |
| `/confirmation` | ConfirmationPage | Booking confirmation |
| `/tickets` | TicketWalletPage | All purchased tickets |
| `/tickets/:ticketId` | TicketDetailPage | QR code + animated ticket view |
| `/departures` | DeparturesPage | Nearby stations + departure board + live tracking |
| `/updates` | ServiceUpdatesPage | Disruption feed with severity filter |
| `*` (404) | NotFoundPage | 404 catch-all |

### 2.2 In-Scope Shared Components

- `PageShell` (skip link, landmark structure)
- `TopNav` (desktop header navigation)
- `BottomNav` (mobile fixed navigation bar)
- `BottomDrawer` (draggable/keyboard sheet)
- `JourneyCard` (results card with leg detail toggle)
- `StationAutocomplete` (ARIA 1.2 combobox)
- `MultiTicketBreakdown` (multi-modal ticket split)
- `AnimatedTicketView` (animated ticket validation view)
- `QRCodeView` (QR code display)
- `MapView` (Leaflet map with mode filter)
- `LiveTrackingMap` (vehicle tracking map)

### 2.3 Out of Scope / Exclusions

| Item | Reason |
|---|---|
| `react-leaflet` / Leaflet map container internals | Third-party HTML — Leaflet generates its own DOM; map tiles, zoom controls, and popups are not controlled by this codebase. This exclusion is already reflected in the axe CI audit. |
| `UpdatePrompt` (service worker update banner) | Low-traffic UI; assess separately if it graduates to a persistent feature |
| Real TfL / National Rail API responses | All data is mocked; dynamic content from real APIs is not in scope until integrations are built |
| Native iOS / Android app | This is a web app — native app testing is out of scope |

### 2.4 Viewport Coverage

| Context | Viewport | Device simulation |
|---|---|---|
| Mobile web | 390 × 844 (iPhone 14) | Chrome DevTools / real device |
| Tablet | 768 × 1024 (iPad mini) | Chrome DevTools |
| Desktop | 1440 × 900 | Physical screen |

---

## 3. WCAG 2.2 Criteria Coverage Map

For each WCAG 2.2 success criterion at Level A and AA this section records:
- **Status**: Pass / Fail / Partial / Not tested
- **Where to test**: Which pages/components are the primary test targets
- **Test method**: Automated (A), Manual (M), Assistive Technology (AT)

> Columns are left blank at this stage — fill in during audit execution.

### 3.1 Principle 1: Perceivable

| # | Criterion | Level | Status | Test Target | Method |
|---|---|---|---|---|---|
| 1.1.1 | Non-text Content | A | | All pages, icons, QR code, map markers | M + A |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | N/A | No audio/video content | — |
| 1.2.2 | Captions (Prerecorded) | A | N/A | No video content | — |
| 1.2.3 | Audio Description or Media Alternative | A | N/A | No video content | — |
| 1.2.4 | Captions (Live) | AA | N/A | No live audio/video | — |
| 1.2.5 | Audio Description (Prerecorded) | AA | N/A | No video content | — |
| 1.3.1 | Info and Relationships | A | | All pages — heading hierarchy, form structure, tables, landmark regions | M + A |
| 1.3.2 | Meaningful Sequence | A | | SearchPage, ResultsPage, JourneyCard leg detail | M |
| 1.3.3 | Sensory Characteristics | A | | Severity colours, transport mode colours, "Live" badges | M |
| 1.3.4 | Orientation | AA | | All pages on mobile (portrait + landscape) | M |
| 1.3.5 | Identify Input Purpose | AA | | CheckoutPage, SearchPage inputs | M + A |
| 1.4.1 | Use of Colour | A | | Severity badges, status badges, mode icons | M |
| 1.4.2 | Audio Control | A | N/A | No auto-playing audio | — |
| 1.4.3 | Contrast (Minimum) | AA | | All text on all pages; brand colours on white; white on indigo | M + A |
| 1.4.4 | Resize Text | AA | | All pages at 200% zoom | M |
| 1.4.5 | Images of Text | AA | | BrandLogo, QRCodeView | M |
| 1.4.10 | Reflow | AA | | All pages at 320px width (400% zoom equivalent) | M |
| 1.4.11 | Non-text Contrast | AA | | Focus indicators, icons, UI components (buttons, inputs, badges) | M + A |
| 1.4.12 | Text Spacing | AA | | All pages with overridden letter/word/line spacing | M |
| 1.4.13 | Content on Hover or Focus | AA | | Tooltips, map popups, departure row hover states | M |

### 3.2 Principle 2: Operable

| # | Criterion | Level | Status | Test Target | Method |
|---|---|---|---|---|---|
| 2.1.1 | Keyboard | A | | All interactive elements across all pages | M |
| 2.1.2 | No Keyboard Trap | A | | BottomDrawer, StationAutocomplete, DeparturesPage combobox | M |
| 2.1.3 | Keyboard (No Exception) | AAA | — | Out of scope (AAA) | — |
| 2.1.4 | Character Key Shortcuts | A | | All pages — check for single-key shortcuts | M |
| 2.2.1 | Timing Adjustable | A | | Any timeouts (session timeouts, auto-refresh) | M |
| 2.2.2 | Pause, Stop, Hide | A | | AnimatedTicketView, LiveTrackingMap pulse animation | M |
| 2.3.1 | Three Flashes or Below Threshold | A | | AnimatedTicketView, transition animations | M |
| 2.3.3 | Animation from Interactions | AAA | ⚠️ | AnimatedTicketView — in scope as known issue | M |
| 2.4.1 | Bypass Blocks | A | | PageShell skip link on all pages | M + A |
| 2.4.2 | Page Titled | A | | All routes — document.title check | A |
| 2.4.3 | Focus Order | A | | All pages — Tab key through all focusable elements | M |
| 2.4.4 | Link Purpose (In Context) | A | | All links (nav, confirmation CTAs, error summary links) | M |
| 2.4.6 | Headings and Labels | AA | | All pages — heading hierarchy, field labels | M |
| 2.4.7 | Focus Visible | AA | | All focusable elements — focus ring visibility | M + A |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | | BottomNav obscuring focused elements, BottomDrawer | M |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA | — | Out of scope (AAA) | — |
| 2.4.13 | Focus Appearance | AAA | — | Out of scope (AAA) | — |
| 2.5.1 | Pointer Gestures | A | | BottomDrawer drag gesture | M |
| 2.5.2 | Pointer Cancellation | A | | All buttons and interactive areas | M |
| 2.5.3 | Label in Name | A | | All buttons — visible label matches accessible name | M + A |
| 2.5.4 | Motion Actuation | A | | No motion-activated features | M |
| 2.5.7 | Dragging Movements | AA | | BottomDrawer drag — keyboard alternative required | M |
| 2.5.8 | Target Size (Minimum) | AA | | All touch targets — minimum 24×24px (WCAG 2.2 new) | M |

### 3.3 Principle 3: Understandable

| # | Criterion | Level | Status | Test Target | Method |
|---|---|---|---|---|---|
| 3.1.1 | Language of Page | A | | `<html lang="en">` attribute | M |
| 3.1.2 | Language of Parts | AA | | Operator names, station names (mostly English) | M |
| 3.2.1 | On Focus | A | | All focusable elements — no context change on focus | M |
| 3.2.2 | On Input | A | | SearchPage, CheckoutPage, DeparturesPage filters | M |
| 3.2.3 | Consistent Navigation | AA | | TopNav + BottomNav across all pages | M |
| 3.2.4 | Consistent Identification | AA | | Mode icons, severity badges, transport labels | M |
| 3.2.6 | Consistent Help | AA | | No help mechanisms present (N/A — no help UI) | M |
| 3.3.1 | Error Identification | A | | SearchPage, CheckoutPage error summary | M + A |
| 3.3.2 | Labels or Instructions | A | | All form fields — required field indicators | M |
| 3.3.3 | Error Suggestion | AA | | SearchPage, CheckoutPage — error messages give suggestions | M |
| 3.3.4 | Error Prevention (Legal, Financial) | AA | | CheckoutPage — review before submit, confirmation step | M |
| 3.3.7 | Redundant Entry | A | | CheckoutPage — no redundant re-entry required | M |
| 3.3.8 | Accessible Authentication (Minimum) | AA | | CheckoutPage — no CAPTCHA/cognitive puzzle | M |

### 3.4 Principle 4: Robust

| # | Criterion | Level | Status | Test Target | Method |
|---|---|---|---|---|---|
| 4.1.1 | Parsing | A | | HTML validation — no duplicate IDs, malformed elements | A |
| 4.1.2 | Name, Role, Value | A | | All custom widgets (combobox, drawer, toggles, buttons) | M + A |
| 4.1.3 | Status Messages | AA | | Live regions, sort announcements, departure count | M + A |

---

## 4. Current Accessibility Baseline

This section documents what the codebase already implements correctly, based on pre-audit code analysis (2026-02-24).

### 4.1 Implemented Correctly

| Feature | Implementation | WCAG Criterion |
|---|---|---|
| Skip link | `PageShell.tsx` — sr-only until focused, links to `#main-content` | 2.4.1 |
| Main landmark | `<main id="main-content" tabIndex={-1}>` in PageShell | 1.3.1, 2.4.1 |
| Navigation landmarks | `<nav aria-label="Main navigation">` in TopNav and BottomNav | 1.3.1 |
| Page titles | `usePageTitle` hook on all routes with unique, descriptive titles | 2.4.2 |
| GDS error summary | Programmatic focus on `tabIndex={-1}` error summary via `requestAnimationFrame` | 3.3.1, 3.3.3 |
| Form labels | All inputs have associated `<label htmlFor="...">` | 1.3.1, 3.3.2 |
| `aria-invalid` + `aria-describedby` | Applied to invalid fields referencing error message IDs | 4.1.2 |
| Fieldset/legend | Used for radio button groups on SearchPage | 1.3.1 |
| ARIA 1.2 combobox | `StationAutocomplete.tsx` and DeparturesPage combobox: full pattern including `aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-activedescendant`, `aria-selected` | 4.1.2 |
| Conditional `aria-controls` | Set to `undefined` when listbox is not in DOM (avoids axe `aria-valid-attr-value` violation) | 4.1.2 |
| Keyboard navigation (combobox) | ArrowUp/Down, Enter, Escape fully handled | 2.1.1 |
| Focus-visible styles | Global 3px solid outline in `index.css`; suppressed on native inputs (Tailwind ring used instead) | 2.4.7 |
| `aria-current="page"` | TopNav and BottomNav active tab indicators | 4.1.2 |
| `aria-pressed` | Sort buttons on ResultsPage | 4.1.2 |
| `aria-expanded` + `aria-controls` | JourneyCard leg detail toggle, MapView filter, BottomDrawer drag handle | 4.1.2 |
| `role="alert"` | Disruption banners in JourneyCard, form error messages | 4.1.3 |
| Live regions | `aria-live="polite" aria-atomic="true"` on ResultsPage sort announcements and DeparturesPage count | 4.1.3 |
| `aria-hidden` on decorative icons | All decorative SVG/react-icons instances | 1.1.1 |
| TopNav ticket badge label | `aria-label="${count} ticket(s)"` | 1.1.1 |
| `prefers-reduced-motion` | `index.css` drawer transition and vehicle pulse animation respects media query | 2.3.3 |
| BottomDrawer keyboard | ArrowUp/Down for snap points, Enter/Space for toggle, focus management into drawer | 2.1.1, 2.5.7 |
| Automated axe audit (CI) | Playwright + axe-core against `/`, `/tickets`, `/departures`, `/updates` | Full WCAG 2.2 AA |
| Language attribute | `<html lang="en">` should be present (verify in index.html) | 3.1.1 |

### 4.2 Existing Test Coverage

| Test file | What it covers | WCAG |
|---|---|---|
| `e2e/accessibility.spec.ts` | axe WCAG 2.2 AA audit on 4 pages | Multiple |
| `e2e/skip-link.spec.ts` | Skip link focus behaviour, focus ring visibility on BottomNav + inputs | 2.4.1, 2.4.7 |
| `e2e/page-titles.spec.ts` | `document.title` on all main routes + 404 | 2.4.2 |
| `src/__tests__/StationAutocomplete.test.tsx` | ARIA combobox roles, keyboard navigation, aria-expanded, error states | 4.1.2 |
| `src/__tests__/JourneyCard.test.tsx` | `role="alert"` on disruption banner | 4.1.3 |

---

## 5. Known Issues and Gaps

Issues identified during pre-audit code analysis, prioritised for remediation.

### 5.1 Critical — Must fix before sign-off

| ID | File | Issue | WCAG Criterion | Effort | Status |
|---|---|---|---|---|---|
| A-01 | `AnimatedTicketView.tsx` | ~~Inline CSS keyframe animations (`sf1`, `sf2`, `sf3`) defined in `<style>` tag without `@media (prefers-reduced-motion: no-preference)` wrapper.~~ **Fixed 2026-02-24** — keyframes wrapped in `@media (prefers-reduced-motion: no-preference)`; JS cycling intervals and cross-fade transitions also suppressed when motion is reduced; static clock shown instead. | 2.3.3 (Animation from Interactions) | S | **Resolved** |
| A-02 | `BottomNav.tsx` | ~~Ticket count badge has no `aria-label`.~~ **Fixed 2026-02-24** — badge marked `aria-hidden="true"`; button `aria-label` updated to `"Tickets (N)"` when tickets are present, matching the TopNav pattern. | 1.1.1 (Non-text Content) | XS | **Resolved** |

### 5.2 High — Fix in first sprint

| ID | File | Issue | WCAG Criterion | Effort | Status |
|---|---|---|---|---|---|
| A-03 | `DeparturesPage.tsx` | ~~Departure board rows without live tracking not keyboard-focusable; `role="button"` / `tabIndex` hack on `<div>`.~~ **Fixed 2026-02-24** — departure rows restructured to `<ul>/<li>`; trackable rows use a native `<button>` element (keyboard support built-in, no manual `role`/`tabIndex`/`onKeyDown` needed); non-trackable rows are `<div>` inside `<li>` (read-only — correct). | 2.1.1 (Keyboard) | S | **Resolved** |
| A-04 | `e2e/accessibility.spec.ts` | ~~axe audit only covered 4 of 9 routes.~~ **Fixed 2026-02-24** — audit expanded to all 9 routes: `/results`, `/checkout` (via full search flow), `/confirmation`, `/tickets/:ticketId` (not-found state), `/departures`, `/updates`, `/`, `/tickets`, `404`. | Multiple | S | **Resolved** |
| A-05 | `index.html` | ~~Verify `<html lang="en">` attribute.~~ **Verified 2026-02-24** — `lang="en"` already present on line 2. No change needed. | 3.1.1 (Language of Page) | XS | **Resolved (no change needed)** |

### 5.3 Medium — Fix before GA

| ID | File | Issue | WCAG Criterion | Effort | Status |
|---|---|---|---|---|---|
| A-06 | Multiple | ~~No heading hierarchy test; real violations found.~~ **Fixed 2026-02-24** — 7 code fixes: ResultsPage/CheckoutPage/ConfirmationPage `<h2>` → `<h1>`; TicketWalletPage/ServiceUpdatesPage `<h3>` → `<h2>`; TicketDetailPage gains `<h1>` in both states; QRCodeView `<h3>` → `<h2>`. `e2e/heading-hierarchy.spec.ts` added. | 1.3.1, 2.4.6 | S | **Resolved** |
| A-07 | `MapView.tsx` | ~~Filter state not communicated to AT.~~ **Fixed 2026-02-24** — `aria-pressed` on All and mode buttons; `id` on filter panel; `aria-controls` on toggle; toggle `aria-label` includes active count when a partial filter is applied. | 4.1.2 | M | **Resolved** |
| A-08 | All pages | ~~Touch target size not formally audited.~~ **Fixed 2026-02-24** — `e2e/touch-targets.spec.ts` added; runs at 390×844 mobile viewport; measures `getBoundingClientRect()` on all `button/a/input` (Leaflet and sr-only excluded); asserts ≥ 24×24 CSS px on 5 key pages. | 2.5.8 | M | **Resolved** |
| A-09 | All pages | ~~Colour contrast not formally tested.~~ **Resolved 2026-02-24 (no code change)** — axe `color-contrast` rule runs on all 9 routes via the extended A-04 audit. Focus ring (#1a65eb) = 5.12:1 ✅. Brand button (#0054e9) = 6.18:1 ✅. `text-gray-500` (#6B7280) = 4.48:1 is borderline — monitored by CI. | 1.4.3, 1.4.11 | M | **Resolved (covered by axe CI)** |
| A-10 | All pages | ~~Reflow at 320px not tested.~~ **Fixed 2026-02-24** — `e2e/reflow.spec.ts` added; runs at 320×568 viewport; checks `scrollWidth <= innerWidth + 1` on 8 pages. `/checkout` excluded (redirects without state; verified in manual Phase 4 audit). | 1.4.10 | M | **Resolved** |

### 5.4 Low — Improve before GA

| ID | File | Issue | WCAG Criterion | Effort |
|---|---|---|---|---|
| A-11 | `TicketDetailPage.tsx` / `AnimatedTicketView.tsx` | Animated ticket view shows alternating words — no mechanism to pause or stop the animation (separate from the prefers-reduced-motion fix in A-01). Consider a pause button for users who can tolerate motion but want to stop it. | 2.2.2 (Pause, Stop, Hide) | M |
| A-12 | `DeparturesPage.tsx` | Station search combobox inside DeparturesPage duplicates StationAutocomplete logic rather than reusing the component. The ARIA pattern is correctly implemented, but any future changes need to be applied twice. Not a WCAG issue but a maintenance risk. | — (code quality) | L |
| A-13 | `MultiTicketBreakdown.tsx` | Info icon SVG at line 9 may lack an accessible label. Verify that it is aria-hidden with adjacent descriptive text. | 1.1.1 | XS |
| A-14 | All pages | No screen reader test using real AT. Automated axe catches ~30% of WCAG issues; manual AT testing is required for a conformance statement. | All | L |

---

## 6. Audit Methodology

### 6.1 Testing Tiers

The audit uses three complementary tiers that together provide comprehensive coverage:

| Tier | Description | Tools | Coverage |
|---|---|---|---|
| **Tier 1 — Automated** | Run automated tools against all in-scope pages. Fast, repeatable, catches structural and rule-based issues. | axe-core (CI), Lighthouse, HTML validator | ~30–40% of WCAG issues |
| **Tier 2 — Manual keyboard** | Tab through every page, test all interactive patterns with keyboard only, verify focus order and visible focus. | Browser only (no mouse) | ~40% of WCAG issues |
| **Tier 3 — Assistive technology** | Test with screen readers on real browsers/devices. Verify announcements, live regions, error recovery, and form submission. | NVDA + Chrome (desktop), VoiceOver + Safari (iOS) | ~90%+ of WCAG issues combined with Tiers 1+2 |

### 6.2 Conformance Evaluation Approach

Follow the [Website Accessibility Conformance Evaluation Methodology (WCAG-EM)](https://www.w3.org/TR/WCAG-EM/) process:

1. **Define scope** — done in Section 2
2. **Explore the website** — done via code analysis (Section 4 baseline)
3. **Select a representative sample** — all 9 in-scope routes + 5 shared components are in scope (small app, test all)
4. **Evaluate the sample** — Tiers 1–3 per the test phases in Section 7
5. **Report** — record findings in the audit log (Section 12 template) and update criterion statuses in Section 3

### 6.3 Test Environment

| Variable | Specification |
|---|---|
| Dev server | `npm run dev` — `http://localhost:5173` |
| Mock data | `VITE_USE_MOCK_DATA=true` (default) |
| CI axe tests | `npm run test:e2e` (Playwright + axe-core) |
| Lighthouse | `npm run build && npm run preview` (production build) |
| Screen reader testing | Use production build or dev server |

---

## 7. Test Phases

### Phase 1 — Automated baseline (CI + Lighthouse)

**Goal:** Catch all rule-based violations before any manual work.

**Steps:**

1. Extend `e2e/accessibility.spec.ts` to cover all 9 in-scope routes (not just the current 4). See A-04.
2. Run `npm run test:e2e` — confirm zero axe violations on all pages.
3. Run `npm run build && npx @lhci/cli autorun` — confirm Lighthouse accessibility score ≥ 0.9.
4. Run HTML validation: feed each page's rendered HTML through the W3C Nu HTML Checker — zero errors/warnings on accessibility-relevant markup.

**Pass criteria:** Zero axe violations. Lighthouse accessibility ≥ 0.9 on all routes. Zero HTML validation errors on ARIA/landmark markup.

---

### Phase 2 — Keyboard-only navigation

**Goal:** Verify every interactive element is reachable and operable by keyboard alone.

**Test procedure for each in-scope page:**

1. Load the page. Disable mouse (or commit to not using it).
2. Press **Tab** to move forward through all focusable elements. Record the tab order.
3. Press **Shift+Tab** to move backwards — verify reverse order is logical.
4. Check every focusable element has a **visible focus indicator** (WCAG 2.4.7).
5. Check no focused element is **obscured** by the fixed BottomNav or TopNav (WCAG 2.4.11).
6. Activate each interactive element with **Enter** or **Space** as appropriate.

**Component-specific keyboard test cases:**

| Component | Action | Expected behaviour |
|---|---|---|
| Skip link (PageShell) | Press Tab from page load | Skip link becomes visible; press Enter → focus moves to `#main-content` |
| StationAutocomplete | Type 3 chars | Listbox opens; ArrowDown moves through suggestions; Enter selects; Escape closes |
| Search form (SearchPage) | Complete + submit with Enter | Form submits; if errors, focus moves to error summary |
| Sort buttons (ResultsPage) | Tab to a sort button; press Space/Enter | Active sort changes; `aria-pressed` updates; sort result announced in live region |
| JourneyCard leg detail | Tab to expand toggle; press Enter | Detail panel opens/closes; `aria-expanded` toggles |
| BottomDrawer | Tab to drag handle; press ArrowUp/Down | Drawer snaps to next/previous position |
| BottomNav tabs | Tab to each tab; press Enter | Navigate to correct page |
| Departure row (DeparturesPage, live tracking) | Tab to row; press Enter | Navigates to live tracking view |
| CheckoutPage form | Complete all fields via keyboard; submit | Submits successfully or shows error summary with focus |
| TicketDetailPage | Tab to any controls | All controls reachable; animated view has pause control (A-11) |
| MapView mode filter | Tab to filter button; open; Tab through mode options | All modes selectable by keyboard |

---

### Phase 3 — Colour contrast audit

**Goal:** Verify WCAG 1.4.3 (minimum contrast for text) and 1.4.11 (non-text contrast for UI components).

**Ratio requirements:**
- Normal text (< 18pt / < 14pt bold): **4.5:1**
- Large text (≥ 18pt / ≥ 14pt bold): **3:1**
- UI components and graphical objects: **3:1**
- Focus indicator ring: **3:1** against adjacent colours

**Colours to check:**

| Element | Foreground | Background | Minimum ratio |
|---|---|---|---|
| Body text | #111827 (gray-900) | #FFFFFF | 4.5:1 |
| Secondary text | #6B7280 (gray-500) | #FFFFFF | 4.5:1 |
| Brand nav text (active) | indigo-700 | white | 4.5:1 |
| Brand button text | #FFFFFF | indigo-600 (#4f46e5) | 4.5:1 |
| Brand button text (hover) | #FFFFFF | indigo-700 (#4338ca) | 4.5:1 |
| Error text | red-600 (#dc2626) | #FFFFFF | 4.5:1 |
| Badge text (greenest) | green text | green-50 | 4.5:1 |
| Badge text (fastest) | blue text | blue-50 | 4.5:1 |
| Badge text (cheapest) | purple text | purple-50 | 4.5:1 |
| Status "On time" | green-800 | green-100 | 4.5:1 |
| Status "Delayed" | amber-800 | amber-100 | 4.5:1 |
| Severity critical | red-800 | red-100 | 4.5:1 |
| Severity high | orange-800 | orange-100 | 4.5:1 |
| Focus ring (#1a65eb) | #1a65eb | white | 3:1 (UI component) |
| Mode icon border (train: #003078) | #003078 border | white background | 3:1 |
| BottomNav active icon | indigo-600 | white bg | 3:1 |

**Tool:** Use browser DevTools colour picker + [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or axe DevTools colour contrast panel.

---

### Phase 4 — Responsive and reflow audit

**Goal:** Verify WCAG 1.4.10 (Reflow) — no horizontal scrolling at 320px wide (equivalent to 400% zoom on a 1280px display), and no content or functionality loss.

**Steps:**

1. Set browser viewport to **320px wide**.
2. Navigate through all in-scope pages.
3. Record any elements that cause horizontal scroll.
4. Record any content or functionality that becomes unavailable.

**Key risk areas:**

| Area | Risk |
|---|---|
| BottomNav | Fixed bar may overflow at 320px |
| JourneyCard | Horizontal layout of time/mode/price may wrap badly |
| CheckoutPage grid | Two-column inputs may not stack |
| ResultsPage sort controls | Sort button row may overflow |
| TopNav (tablet/desktop) | Visible at ≥768px; hidden on mobile — verify breakpoint |
| Error summary links | Long station names in link text may wrap unexpectedly |

**Orientation:** Also test all pages in **landscape orientation on mobile** (390×844 rotated = 844×390). Verify WCAG 1.3.4 — no content locked to portrait-only orientation.

---

### Phase 5 — Screen reader testing (NVDA + Chrome, desktop)

**Goal:** Verify that all content is correctly announced, all interactions work, and error recovery is possible without visual cues.

**Setup:**
- NVDA (latest stable) + Chrome (latest stable)
- Browse mode (reading), forms mode (interaction), and application mode
- Test on the production build or `npm run dev`

**Page-by-page test script:**

#### SearchPage (`/`)
1. Navigate to page — verify page title is announced.
2. Press **H** to navigate by headings — verify logical heading hierarchy.
3. Press **R** to navigate by regions — verify `main`, `nav`, `header` landmarks.
4. Press **F** to navigate by form fields — verify all fields have descriptive labels.
5. Activate the "From" station autocomplete — type "Lon" — verify listbox opens and suggestions are announced.
6. Use ArrowDown to move through suggestions — verify each option is announced with `aria-activedescendant`.
7. Press Enter to select — verify input updates and listbox closes.
8. Complete form with invalid data — submit — verify error summary receives focus and lists errors.
9. Each error link — Tab to it, press Enter — verify focus moves to the invalid field.
10. Toggle between Map and Form views — verify the toggle button state is announced.

#### ResultsPage (`/results`)
1. Verify page title announces route.
2. Verify number of results is announced (live region).
3. Navigate to sort buttons — verify `aria-pressed` state is announced when toggled.
4. Navigate through journey cards — verify departure time, arrival, operator, price, and badges are readable.
5. Expand a journey card leg detail — verify `aria-expanded` state change is announced.
6. Verify disruption banner `role="alert"` announces immediately on render.

#### CheckoutPage (`/checkout`)
1. Verify form fields all announce label + type + required status.
2. Verify `autoComplete` values are used by NVDA (name, email, cc-number).
3. Submit with errors — verify error summary focus and all error messages are reachable by Tab.
4. Complete form and submit — verify navigation to ConfirmationPage is announced.

#### ConfirmationPage (`/confirmation`)
1. Verify booking reference and all confirmation details are announced.
2. Verify "View Tickets" and "Book Another Journey" buttons are accessible.

#### TicketWalletPage (`/tickets`)
1. Verify ticket list items are readable with all relevant information.
2. Expand multi-modal ticket breakdown — verify expanded state announced.
3. Navigate to a ticket detail page.

#### TicketDetailPage (`/tickets/:ticketId`)
1. Verify QR code area is marked `aria-hidden` — only the data list below should be read.
2. Verify animated ticket view — verify animation state and any controls are announced.
3. If a pause control exists (A-11 fix), verify it is announced and operable.

#### DeparturesPage (`/departures`)
1. Verify station search combobox announces state changes.
2. Navigate through departure list — verify all relevant departure information is read.
3. Navigate to a service with live tracking — verify the row is announced as a button.
4. Activate the row — verify navigation to live tracking is announced.

#### ServiceUpdatesPage (`/updates`)
1. Verify disruption list items include severity, line, and description.
2. Filter by severity — verify filter state change is announced (live region or re-read).

#### NotFoundPage (`/*`)
1. Verify 404 message is read.
2. Verify "Return home" link is accessible and labelled.

---

### Phase 6 — Screen reader testing (VoiceOver + Safari, iOS mobile)

**Goal:** Verify mobile-specific behaviour — touch target size, swipe navigation, form input modalities, and VoiceOver gesture interaction.

**Setup:**
- iPhone (iOS 17+) with VoiceOver enabled (Settings → Accessibility → VoiceOver)
- Safari browser
- Bluetooth keyboard optional but recommended for form testing

**Mobile-specific test cases:**

1. **Skip link** — VoiceOver + swipe to first element; verify skip link is the first interactive element; double-tap to activate; verify focus moves to main content.
2. **BottomNav** — Swipe through nav tabs; double-tap to activate; verify `aria-current` announces active page.
3. **BottomDrawer** — Swipe up on the drawer handle; verify drag snap positions are announced.
4. **StationAutocomplete** — Activate input; virtual keyboard opens; type; swipe through suggestions; double-tap to select.
5. **Touch targets (2.5.8)** — Use browser inspector to measure hit areas on all BottomNav items, small buttons, badge controls. Minimum 24×24 CSS px, with spacing from adjacent targets.
6. **Zoom at 200% (1.4.4)** — Enable Display → Text Size → largest; verify no text is clipped or truncated.
7. **Orientation** — Rotate to landscape; verify all pages remain usable (1.3.4).
8. **Motion sensitivity** — Enable Reduce Motion in iOS Settings; verify AnimatedTicketView is static.

---

### Phase 7 — Remediation verification

For each issue in the Known Issues list (Section 5), after the fix is implemented:

1. Re-run the relevant automated test(s) — confirm pass.
2. Re-run the relevant manual keyboard test — confirm pass.
3. Re-test with NVDA/VoiceOver — confirm announcement is correct.
4. Update the criterion status in Section 3 to "Pass".
5. Record the fix in the audit log (Section 12).

---

## 8. Assistive Technology Matrix

| AT | Browser | Platform | Priority | Notes |
|---|---|---|---|---|
| NVDA (latest) | Chrome (latest) | Windows 11 | **P1** | Largest AT + browser combination by UK usage |
| VoiceOver | Safari (latest) | iOS 17+ (iPhone) | **P1** | Primary mobile AT; critical for mobile-first app |
| JAWS (latest) | Chrome | Windows 11 | P2 | Common in public sector / enterprise |
| VoiceOver | Safari | macOS Sonoma | P2 | Desktop macOS users |
| TalkBack | Chrome | Android 13+ | P2 | Android mobile |
| Windows Narrator | Edge | Windows 11 | P3 | Lower usage; validate basic navigation only |

**Minimum for WCAG 2.2 AA conformance statement:** P1 combinations (NVDA + Chrome, VoiceOver + iOS Safari).

---

## 9. Mobile-Specific Test Cases

These test cases address considerations specific to the mobile web experience that are not fully covered by desktop testing.

### 9.1 Touch Target Size (WCAG 2.5.8 — new in 2.2)

WCAG 2.5.8 requires targets to be at least 24×24 CSS pixels OR have spacing such that the 24px bounding box around the target does not intersect another target's bounding box.

**Measure the following with browser DevTools or axe DevTools:**

| Element | Current size (estimate) | Pass (≥24px or spaced)? |
|---|---|---|
| BottomNav tab buttons | ~20% width × 56px height | Likely pass on height |
| TopNav icon buttons | ~40×40px | Likely pass |
| JourneyCard expand toggle | ~24×24px | Verify |
| Departure row badge | ~32×20px height | May fail |
| Filter clear/apply buttons (MapView) | ~32px | Verify |
| Radio buttons (SearchPage) | Native + label — depends on label tap area | Verify |
| Error summary links | Text-only — depends on font size | Verify |

### 9.2 Virtual Keyboard and Form Inputs

| Test | Expected |
|---|---|
| Tap station autocomplete input | Virtual keyboard opens; `inputmode` triggers correct keyboard type |
| Tap card number input (CheckoutPage) | Numeric keyboard opens (verify `inputMode="numeric"` or `type="tel"` is used) |
| Tap email input | Email keyboard opens (verify `type="email"`) |
| Long-press on station suggestion | No unexpected context menu or accidental selection |
| Autofill (iOS) | `autoComplete` attributes trigger correct iOS suggestions |

### 9.3 Pinch-to-Zoom

Verify `<meta name="viewport">` does NOT use `user-scalable=no` or `maximum-scale=1`. This blocks zoom and violates WCAG 1.4.4 on mobile.

Check `index.html` — the viewport meta should be:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 9.4 Fixed Navigation Obscuring Content (WCAG 2.4.11)

On mobile, the fixed `BottomNav` (56px) sits at the bottom. When the user tabs to an element near the bottom of the viewport:

1. Verify that focused interactive elements scroll into view above the BottomNav.
2. Verify that the BottomDrawer (when open) does not fully obscure the last interactive element in the main scroll area.

---

## 10. Remediation Backlog

Ordered by priority. All issues reference Section 5.

| Priority | ID | Description | Estimated effort | Sprint |
|---|---|---|---|---|
| ~~Critical~~ | ~~A-01~~ | ~~AnimatedTicketView: wrap keyframes in `prefers-reduced-motion`~~ | XS | ~~Sprint 1~~ | **Done 2026-02-24** |
| ~~Critical~~ | ~~A-02~~ | ~~BottomNav: add `aria-label` to ticket count badge~~ | XS | ~~Sprint 1~~ | **Done 2026-02-24** |
| ~~High~~ | ~~A-03~~ | ~~DeparturesPage: semantic departure rows~~ | S | ~~Sprint 1~~ | **Done 2026-02-24** |
| ~~High~~ | ~~A-04~~ | ~~Expand axe audit to all 9 routes~~ | S | ~~Sprint 1~~ | **Done 2026-02-24** |
| ~~High~~ | ~~A-05~~ | ~~Verify `lang="en"` in index.html~~ | XS | ~~Sprint 1~~ | **Done 2026-02-24 (already present)** |
| ~~Medium~~ | ~~A-06~~ | ~~Heading hierarchy test + code fixes~~ | S | ~~Sprint 2~~ | **Done 2026-02-24** |
| ~~Medium~~ | ~~A-07~~ | ~~MapView filter state for AT~~ | M | ~~Sprint 2~~ | **Done 2026-02-24** |
| ~~Medium~~ | ~~A-08~~ | ~~Touch target audit + test~~ | M | ~~Sprint 2~~ | **Done 2026-02-24** |
| ~~Medium~~ | ~~A-09~~ | ~~Colour contrast audit~~ | M | ~~Sprint 2~~ | **Done 2026-02-24 (covered by axe CI)** |
| ~~Medium~~ | ~~A-10~~ | ~~Reflow test at 320px~~ | M | ~~Sprint 2~~ | **Done 2026-02-24** |
| Low | A-11 | AnimatedTicketView: add a pause/stop button for users who want to halt the animation | M (2–4h) | Sprint 3 |
| Low | A-13 | MultiTicketBreakdown: verify Info icon is `aria-hidden` with adjacent descriptive text | XS (< 15 min) | Sprint 3 |
| Low | A-14 | Manual AT testing with NVDA + Chrome and VoiceOver + iOS Safari using Phase 5/6 test scripts | L (1–2 days) | Sprint 3 |

---

## 11. Success Criteria and Sign-off

### 11.1 Minimum bar for WCAG 2.2 AA conformance

All of the following must be true before the conformance statement is issued:

- [ ] Zero axe violations on all 9 in-scope routes (Phase 1 — extended audit)
- [ ] Lighthouse accessibility score ≥ 0.9 on all routes
- [ ] All WCAG 2.2 Level A and AA criteria in Section 3 have status "Pass" or documented "Not applicable" with justification
- [ ] All Critical and High issues (A-01 through A-05) are resolved and verified
- [ ] Manual keyboard test completed on all pages with zero blocking keyboard-access failures (Phase 2)
- [ ] Colour contrast verified for all colour combinations in Phase 3 (no failures)
- [ ] Reflow verified at 320px width with no horizontal scroll (Phase 4)
- [ ] Screen reader testing with NVDA + Chrome completed against all pages (Phase 5)
- [ ] Screen reader testing with VoiceOver + iOS Safari completed for mobile test cases (Phase 6)
- [ ] All fixes from the remediation backlog Sprint 1 and Sprint 2 implemented and re-verified (Phase 7)

### 11.2 Conformance statement template

Once sign-off criteria are met, the following statement can be published:

> **Accessibility Conformance Statement**
> Journey Planner Prototype — [DATE]
>
> This web application aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. The following pages have been evaluated:
> [list all routes]
>
> **Conformance status:** Fully conforms to WCAG 2.2 Level AA
> **Evaluation approach:** WCAG-EM, using automated (axe-core, Lighthouse), manual keyboard, and assistive technology testing (NVDA + Chrome, VoiceOver + iOS Safari)
> **Known limitations:** The Leaflet map container uses third-party HTML and is excluded from the scope of this conformance statement.
> **Date of last evaluation:** [DATE]
> **Feedback:** [contact mechanism]

---

## 12. Audit Log Template

Use one row per finding. Copy this table to a new file `audit-log.md` in this folder when testing begins.

```markdown
| ID | Date | Phase | Page / Component | WCAG Criterion | Severity | Description | Steps to reproduce | AT / tool | Status | Fixed in |
|---|---|---|---|---|---|---|---|---|---|---|
| F-001 | 2026-02-24 | Phase 1 | AnimatedTicketView | 2.3.3 | Critical | Animations do not respect prefers-reduced-motion | Enable prefers-reduced-motion in OS; navigate to /tickets/:ticketId; observe blobs still animate | Browser + OS setting | Open | — |
```

**Severity definitions:**

| Severity | Definition |
|---|---|
| Critical | Blocks a complete user journey for AT or keyboard users; must fix before release |
| High | Significantly impairs experience for AT or keyboard users; fix in current sprint |
| Medium | Degrades quality or fails a specific WCAG criterion; fix before GA |
| Low | Minor non-conformance or best-practice improvement; fix if time allows |

---

*Document version: 1.0 — Created 2026-02-24*
*Next review: after Sprint 2 remediation is complete*
