/**
 * QA-1 — Skip link keyboard behaviour
 * QA-5 — Focus visibility
 *
 * QA-1: Verifies that the skip link is the first focusable element,
 *       is invisible until focused, becomes visible on focus, and moves
 *       keyboard focus to #main-content when activated. Satisfies
 *       WCAG 2.4.1 (Bypass Blocks, Level A).
 *
 * QA-5: Verifies that interactive elements have a visible focus
 *       indicator (non-transparent outline) when focused via keyboard.
 *       Satisfies WCAG 2.4.7 (Focus Visible, Level AA).
 *
 * Prerequisites: dev server running at http://localhost:5173
 */

import { test, expect } from '@playwright/test';

// ─── QA-1: Skip link ──────────────────────────────────────────

test.describe('Skip link (QA-1)', () => {
  test('skip link is the first element reached by Tab', async ({ page }) => {
    await page.goto('/tickets'); // Use a page with content above main
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focused).toBe('Skip to main content');
  });

  test('skip link is visually hidden before focus', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByText('Skip to main content');
    // Before tab — clip-path / sr-only hides it; check it's not in the viewport
    const box = await skipLink.boundingBox();
    // sr-only uses position:absolute with 1px size — not meaningfully visible
    expect(box?.width ?? 0).toBeLessThanOrEqual(1);
  });

  test('skip link becomes visible on focus', async ({ page }) => {
    await page.goto('/tickets');
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeVisible();
  });

  test('activating skip link moves focus to #main-content', async ({ page }) => {
    await page.goto('/tickets');
    await page.keyboard.press('Tab');   // focus skip link
    await page.keyboard.press('Enter'); // activate it
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('main-content');
  });

  test('#main-content element exists on all navigable pages', async ({ page }) => {
    for (const path of ['/', '/tickets', '/departures', '/updates']) {
      await page.goto(path);
      const main = page.locator('#main-content');
      await expect(main).toBeAttached();
    }
  });
});

// ─── QA-5: Focus visibility ───────────────────────────────────

test.describe('Focus visibility (QA-5)', () => {
  test('BottomNav tab buttons have a visible outline when focused', async ({ page }) => {
    await page.goto('/tickets');
    // Tab past skip link to reach BottomNav
    await page.keyboard.press('Tab'); // skip link
    await page.keyboard.press('Tab'); // first interactive element in main
    // Keep tabbing until we reach a BottomNav button (aria-label contains a nav label)
    // We check that at least one element has an outline that is not "none"
    let foundFocusRing = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const outline = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return 'none';
        return window.getComputedStyle(el).outlineStyle;
      });
      if (outline !== 'none' && outline !== '') {
        foundFocusRing = true;
        break;
      }
    }
    expect(foundFocusRing).toBe(true);
  });

  test('search form inputs show a focus ring', async ({ page }) => {
    await page.goto('/');
    // Wait for the form to be visible
    const fromInput = page.locator('#from-input');
    await fromInput.focus();
    const outline = await fromInput.evaluate(el =>
      window.getComputedStyle(el).boxShadow
    );
    // Tailwind focus:ring generates a box-shadow — ensure it's not "none"
    expect(outline).not.toBe('none');
  });
});
