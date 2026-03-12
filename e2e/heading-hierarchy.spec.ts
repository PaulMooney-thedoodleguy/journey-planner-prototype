/**
 * A-06 — Heading hierarchy (WCAG 1.3.1 + 2.4.6)
 *
 * Every in-scope page must have exactly one <h1> and heading levels
 * must never skip when descending (e.g. h1 → h3 without an h2 in
 * between). Ascending back through levels (h3 → h2) is permitted.
 *
 * The /checkout page is reached via the search flow because direct
 * navigation to /checkout redirects to / when no journey is selected.
 *
 * Prerequisites: dev server running at http://localhost:5173
 *   Run: npm run dev  →  npm run test:e2e
 */

import { test, expect, type Page } from '@playwright/test';

interface HeadingInfo { level: number; text: string; }

async function getHeadings(page: Page): Promise<HeadingInfo[]> {
  return page.$$eval('h1, h2, h3, h4, h5, h6', els =>
    els.map(el => ({
      level: parseInt(el.tagName[1]),
      text: (el.textContent ?? '').trim().slice(0, 60),
    }))
  );
}

function assertHeadingHierarchy(headings: HeadingInfo[], pageName: string) {
  // Every page must have exactly one h1
  const h1s = headings.filter(h => h.level === 1);
  expect(
    h1s,
    `${pageName}: expected exactly 1 <h1>, found ${h1s.length}: ${JSON.stringify(h1s)}`
  ).toHaveLength(1);

  // No level skips on the way down (h1→h3 is invalid; h3→h2 is fine)
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];
    expect(
      curr.level,
      `${pageName}: heading skip from h${prev.level} "${prev.text}" → h${curr.level} "${curr.text}"`
    ).toBeLessThanOrEqual(prev.level + 1);
  }
}

/** Navigate via the search flow to /checkout (direct nav redirects to /) */
async function navigateToCheckout(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[aria-label="Journey search"]');
  await page.fill('#from-input', 'London Kings Cross');
  await page.waitForSelector('#from-input-listbox');
  await page.click('#from-input-option-0');
  await page.fill('#to-input', 'Euston');
  await page.waitForSelector('#to-input-listbox');
  await page.click('#to-input-option-0');
  await page.click('button:has-text("Search Journeys")');
  await page.waitForURL('**/results');
  await page.waitForSelector('button:has-text("Select")');
  await page.locator('button:has-text("Select")').first().click();
  await page.waitForSelector('button:has-text("Book this journey")');
  await page.locator('button:has-text("Book this journey")').first().click();
  await page.waitForURL('**/checkout');
  await page.waitForLoadState('networkidle');
}

test.describe('Heading hierarchy — WCAG 1.3.1 + 2.4.6 (A-06)', () => {

  test('/ Search page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[aria-label="Journey search"]');
    assertHeadingHierarchy(await getHeadings(page), 'SearchPage');
  });

  test('/results Journey Results', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    assertHeadingHierarchy(await getHeadings(page), 'ResultsPage');
  });

  test('/checkout Passenger Details', async ({ page }) => {
    await navigateToCheckout(page);
    assertHeadingHierarchy(await getHeadings(page), 'CheckoutPage');
  });

  test('/confirmation Booking Confirmed', async ({ page }) => {
    await page.goto('/confirmation');
    await page.waitForLoadState('networkidle');
    assertHeadingHierarchy(await getHeadings(page), 'ConfirmationPage');
  });

  test('/tickets Ticket Wallet (empty state)', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForLoadState('networkidle');
    assertHeadingHierarchy(await getHeadings(page), 'TicketWalletPage');
  });

  test('/tickets/:ticketId Ticket Detail (not-found state)', async ({ page }) => {
    await page.goto('/tickets/not-a-real-ticket');
    await page.waitForLoadState('networkidle');
    assertHeadingHierarchy(await getHeadings(page), 'TicketDetailPage');
  });

  test('/departures Live Departures', async ({ page }) => {
    await page.goto('/departures');
    await page.waitForSelector('[aria-label="Live departures"]');
    assertHeadingHierarchy(await getHeadings(page), 'DeparturesPage');
  });

  test('/updates Service Updates', async ({ page }) => {
    await page.goto('/updates');
    await page.waitForLoadState('networkidle');
    assertHeadingHierarchy(await getHeadings(page), 'ServiceUpdatesPage');
  });

  test('/404 Not Found', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
    assertHeadingHierarchy(await getHeadings(page), 'NotFoundPage');
  });

});
