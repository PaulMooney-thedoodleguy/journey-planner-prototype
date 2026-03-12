/**
 * A-08 — Touch target size (WCAG 2.5.8)
 *
 * Every visible interactive element (button, link, input) must have a
 * target size of at least 24×24 CSS pixels. This is the new minimum
 * introduced in WCAG 2.2 — not the older 44×44 recommendation.
 *
 * Tests run at a mobile viewport (390×844) where touch targets matter
 * most and where the smallest elements are most likely to appear.
 *
 * Exclusions:
 *   - Elements inside .leaflet-container (third-party map controls)
 *   - Elements with the Tailwind sr-only class (skip links, screen-reader
 *     utilities — these are deliberately clipped to 1×1 px when unfocused
 *     and expand to full size on focus, which satisfies WCAG 2.5.8)
 *
 * Prerequisites: dev server running at http://localhost:5173
 *   Run: npm run dev  →  npm run test:e2e
 */

import { test, expect, type Page } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const MIN_TARGET_PX = 24;

interface TargetInfo { tag: string; label: string; width: number; height: number; }

/**
 * Returns all visible interactive elements that fall below the 24×24 minimum.
 * Runs entirely inside the browser via $$eval so getBoundingClientRect()
 * returns rendered CSS pixel values.
 */
async function getFailingTargets(page: Page): Promise<TargetInfo[]> {
  return page.$$eval(
    'button, a[href], input',
    (els, min) =>
      (els as HTMLElement[])
        .filter(el => !el.closest('.leaflet-container'))  // exclude map controls
        .filter(el => !el.classList.contains('sr-only'))  // exclude intentionally hidden utilities
        .map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 50),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .filter(el => el.width > 0 && el.height > 0)           // visible only
        .filter(el => el.width < min || el.height < min),      // failing the minimum
    MIN_TARGET_PX
  );
}

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Touch target size — WCAG 2.5.8 (A-08)', () => {

  test('/ Search page — all targets ≥ 24×24 px', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[aria-label="Journey search"]');
    const failing = await getFailingTargets(page);
    expect(failing, `Targets below 24×24 px:\n${JSON.stringify(failing, null, 2)}`).toHaveLength(0);
  });

  test('/results Journey Results — all targets ≥ 24×24 px', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    const failing = await getFailingTargets(page);
    expect(failing, `Targets below 24×24 px:\n${JSON.stringify(failing, null, 2)}`).toHaveLength(0);
  });

  test('/tickets Ticket Wallet — all targets ≥ 24×24 px', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForLoadState('networkidle');
    const failing = await getFailingTargets(page);
    expect(failing, `Targets below 24×24 px:\n${JSON.stringify(failing, null, 2)}`).toHaveLength(0);
  });

  test('/departures Departures — all targets ≥ 24×24 px (map excluded)', async ({ page }) => {
    await page.goto('/departures');
    await page.waitForSelector('[aria-label="Live departures"]');
    const failing = await getFailingTargets(page);
    expect(failing, `Targets below 24×24 px:\n${JSON.stringify(failing, null, 2)}`).toHaveLength(0);
  });

  test('/updates Service Updates — all targets ≥ 24×24 px', async ({ page }) => {
    await page.goto('/updates');
    await page.waitForLoadState('networkidle');
    const failing = await getFailingTargets(page);
    expect(failing, `Targets below 24×24 px:\n${JSON.stringify(failing, null, 2)}`).toHaveLength(0);
  });

});
