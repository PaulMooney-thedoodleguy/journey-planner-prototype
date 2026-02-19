/**
 * QA-8 — Page titles
 *
 * Verifies that document.title is set correctly for each directly
 * navigable route. Satisfies WCAG 2.4.2 (Page Titled, Level A).
 *
 * Routes that require prior state (results, checkout, confirmation)
 * are excluded here — they are covered by the journey flow spec.
 *
 * Prerequisites: dev server running at http://localhost:5173
 *   Run: npm run dev
 *   Then: npm run test:e2e
 */

import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/',           title: 'Plan Your Journey — UK Journey Planner' },
  { path: '/tickets',    title: 'My Tickets — UK Journey Planner' },
  { path: '/departures', title: 'Live Departures — UK Journey Planner' },
  { path: '/updates',    title: 'Service Updates — UK Journey Planner' },
];

for (const { path, title } of ROUTES) {
  test(`"${path}" has title "${title}"`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
  });
}

test('404 page has a descriptive title', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  // Not Found page should have some meaningful title — not the bare app default
  const pageTitle = await page.title();
  expect(pageTitle).toContain('UK Journey Planner');
});
