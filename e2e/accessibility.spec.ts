/**
 * DO-3 — Axe accessibility audit (WCAG 2.2 AA)
 *
 * Runs axe-core against every main page and asserts zero violations
 * at wcag2a, wcag2aa, and wcag21aa tag levels. The Leaflet map
 * container is excluded on map-heavy pages — it is third-party
 * rendered HTML that we cannot control.
 *
 * Prerequisites: dev server running at http://localhost:5173
 *   Run: npm run dev  →  npm run test:e2e
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Format axe violations into a readable error message for CI logs */
function describeViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations.map(v =>
    `[${v.impact}] ${v.id}: ${v.description}\n  ` +
    v.nodes.slice(0, 3).map(n => n.html).join('\n  ')
  ).join('\n\n');
}

test.describe('Accessibility audit — WCAG 2.2 AA (DO-3)', () => {

  test('/ Search page — no axe violations', async ({ page }) => {
    await page.goto('/');
    // Wait for the drawer content to be present
    await page.waitForSelector('[aria-label="Journey search"]');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.leaflet-container') // Leaflet third-party map — excluded
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

});
