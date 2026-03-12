/**
 * DO-3 — Axe accessibility audit (WCAG 2.2 AA)
 *
 * Runs axe-core against every in-scope page and asserts zero violations
 * at wcag2a, wcag2aa, and wcag21aa tag levels. The Leaflet map
 * container is excluded on map-heavy pages — it is third-party
 * rendered HTML that we cannot control.
 *
 * Pages requiring navigation state (/checkout) are reached by
 * walking through the search flow rather than direct URL navigation,
 * because CheckoutPage redirects to / when no journey is selected.
 *
 * Prerequisites: dev server running at http://localhost:5173
 *   Run: npm run dev  →  npm run test:e2e
 */

import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Format axe violations into a readable error message for CI logs */
function describeViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations.map(v =>
    `[${v.impact}] ${v.id}: ${v.description}\n  ` +
    v.nodes.slice(0, 3).map(n => n.html).join('\n  ')
  ).join('\n\n');
}

/**
 * Navigate through search → select first journey result, ending on /checkout.
 * Used by the checkout axe test since direct navigation to /checkout redirects
 * to / when no journey is selected.
 */
async function navigateToCheckout(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[aria-label="Journey search"]');

  // Fill From station and select first autocomplete suggestion
  await page.fill('#from-input', 'London Kings Cross');
  await page.waitForSelector('#from-input-listbox');
  await page.click('#from-input-option-0');

  // Fill To station and select first autocomplete suggestion
  await page.fill('#to-input', 'Euston');
  await page.waitForSelector('#to-input-listbox');
  await page.click('#to-input-option-0');

  // Submit the search
  await page.click('button:has-text("Search Journeys")');
  await page.waitForURL('**/results');

  // Select the first journey to proceed to checkout
  await page.waitForSelector('button:has-text("Select")');
  await page.locator('button:has-text("Select")').first().click();
  await page.waitForURL('**/checkout');
  await page.waitForLoadState('networkidle');
}

test.describe('Accessibility audit — WCAG 2.2 AA (DO-3)', () => {

  test('/ Search page — no axe violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[aria-label="Journey search"]');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.leaflet-container') // Leaflet third-party map — excluded
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/results Journey Results — no axe violations (map excluded)', async ({ page }) => {
    await page.goto('/results');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.leaflet-container')
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/checkout Passenger Details — no axe violations', async ({ page }) => {
    await navigateToCheckout(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/confirmation Booking Confirmed — no axe violations', async ({ page }) => {
    await page.goto('/confirmation');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/tickets Ticket Wallet — no axe violations', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/tickets/:ticketId Ticket Detail — no axe violations (not-found state)', async ({ page }) => {
    await page.goto('/tickets/not-a-real-ticket');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/departures Departures — no axe violations (map excluded)', async ({ page }) => {
    await page.goto('/departures');
    await page.waitForSelector('[aria-label="Live departures"]');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.leaflet-container')
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/updates Service Updates — no axe violations', async ({ page }) => {
    await page.goto('/updates');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

  test('/404 Not Found page — no axe violations', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, describeViolations(results.violations)).toHaveLength(0);
  });

});
