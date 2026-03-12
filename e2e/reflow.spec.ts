/**
 * A-10 — Reflow at 320 CSS pixels (WCAG 1.4.10)
 *
 * Content must be presentable at 320px viewport width without requiring
 * horizontal scrolling. 320px is the WCAG 2.2 reference width, equivalent
 * to 400% zoom on a standard 1280px display.
 *
 * The test checks document.documentElement.scrollWidth <= window.innerWidth.
 * A tolerance of 1px is allowed for sub-pixel rounding differences.
 *
 * Fixed-position elements (BottomNav, overlays) do not contribute to
 * document scroll width and are excluded naturally by the browser.
 *
 * Note: /checkout is excluded because direct navigation redirects to /
 * (no journey state). The search → results → checkout flow is verified
 * manually as part of the Phase 4 manual audit in the audit plan.
 *
 * Prerequisites: dev server running at http://localhost:5173
 *   Run: npm run dev  →  npm run test:e2e
 */

import { test, expect, type Page } from '@playwright/test';

const REFLOW_VIEWPORT = { width: 320, height: 568 };

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    // +1 accounts for sub-pixel rounding between scrollWidth (integer) and innerWidth (may be fractional)
    document.documentElement.scrollWidth > window.innerWidth + 1
  );
}

test.use({ viewport: REFLOW_VIEWPORT });

test.describe('Reflow at 320px — WCAG 1.4.10 (A-10)', () => {

  test('/ Search page — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[aria-label="Journey search"]');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on SearchPage at 320px').toBe(false);
  });

  test('/results Journey Results — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on ResultsPage at 320px').toBe(false);
  });

  test('/confirmation Booking Confirmed — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/confirmation');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on ConfirmationPage at 320px').toBe(false);
  });

  test('/tickets Ticket Wallet — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on TicketWalletPage at 320px').toBe(false);
  });

  test('/tickets/:ticketId Ticket Detail — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/tickets/not-a-real-ticket');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on TicketDetailPage at 320px').toBe(false);
  });

  test('/departures Departures — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/departures');
    await page.waitForSelector('[aria-label="Live departures"]');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on DeparturesPage at 320px').toBe(false);
  });

  test('/updates Service Updates — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/updates');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on ServiceUpdatesPage at 320px').toBe(false);
  });

  test('/404 Not Found — no horizontal scroll at 320px', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
    expect(await hasHorizontalScroll(page), 'Horizontal scroll on NotFoundPage at 320px').toBe(false);
  });

});
