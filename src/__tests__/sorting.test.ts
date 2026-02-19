/**
 * QA-6 — Results sorting
 *
 * Tests the three sort comparators used by ResultsPage:
 *   Fastest  → ascending by getDurationMins
 *   Cheapest → ascending by price[ticketType]
 *   Greenest → ascending by co2
 *
 * Uses the real MOCK_JOURNEYS fixture so the assertion values are tied to
 * the actual data and will catch unintended mock data changes.
 */

import { describe, it, expect } from 'vitest';
import { MOCK_JOURNEYS } from '../data/journeys';
import { getDurationMins } from '../utils/transport';

const sortByFastest = () =>
  [...MOCK_JOURNEYS].sort((a, b) => getDurationMins(a.duration) - getDurationMins(b.duration));

const sortByCheapest = (ticketType: 'single' | 'return') =>
  [...MOCK_JOURNEYS].sort((a, b) => a.price[ticketType] - b.price[ticketType]);

const sortByGreenest = () =>
  [...MOCK_JOURNEYS].sort((a, b) => a.co2 - b.co2);

describe('Results sorting — Fastest', () => {
  it('returns results in ascending duration order', () => {
    const sorted = sortByFastest();
    const minutes = sorted.map(j => getDurationMins(j.duration));
    for (let i = 0; i < minutes.length - 1; i++) {
      expect(minutes[i]).toBeLessThanOrEqual(minutes[i + 1]);
    }
  });

  it('places the LNER direct train first (2h 15m)', () => {
    const sorted = sortByFastest();
    expect(sorted[0].operator).toBe('LNER');
    expect(getDurationMins(sorted[0].duration)).toBe(135); // 2h 15m
  });

  it('places the National Express coach last (5h 30m)', () => {
    const sorted = sortByFastest();
    expect(sorted[sorted.length - 1].operator).toBe('National Express');
    expect(getDurationMins(sorted[sorted.length - 1].duration)).toBe(330); // 5h 30m
  });
});

describe('Results sorting — Cheapest (single)', () => {
  it('returns results in ascending price order', () => {
    const sorted = sortByCheapest('single');
    const prices = sorted.map(j => j.price.single);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  it('places the National Express coach first (£25.50)', () => {
    const sorted = sortByCheapest('single');
    expect(sorted[0].operator).toBe('National Express');
    expect(sorted[0].price.single).toBe(25.50);
  });

  it('places the LNER direct train last (£65.50)', () => {
    const sorted = sortByCheapest('single');
    expect(sorted[sorted.length - 1].operator).toBe('LNER');
    expect(sorted[sorted.length - 1].price.single).toBe(65.50);
  });
});

describe('Results sorting — Cheapest (return)', () => {
  it('returns results in ascending return-price order', () => {
    const sorted = sortByCheapest('return');
    const prices = sorted.map(j => j.price.return);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });
});

describe('Results sorting — Greenest', () => {
  it('returns results in ascending CO₂ order', () => {
    const sorted = sortByGreenest();
    const co2 = sorted.map(j => j.co2);
    for (let i = 0; i < co2.length - 1; i++) {
      expect(co2[i]).toBeLessThanOrEqual(co2[i + 1]);
    }
  });

  it('places journey 4 (multimodal, 7.8 kg) first', () => {
    const sorted = sortByGreenest();
    expect(sorted[0].id).toBe(4);
    expect(sorted[0].co2).toBe(7.8);
  });

  it('places the National Express coach last (18.5 kg)', () => {
    const sorted = sortByGreenest();
    expect(sorted[sorted.length - 1].operator).toBe('National Express');
    expect(sorted[sorted.length - 1].co2).toBe(18.5);
  });
});

describe('getDurationMins helper', () => {
  it('parses "2h 15m" as 135 minutes', () => {
    expect(getDurationMins('2h 15m')).toBe(135);
  });

  it('parses "5h 30m" as 330 minutes', () => {
    expect(getDurationMins('5h 30m')).toBe(330);
  });

  it('parses "50m" (no hours) as 50 minutes', () => {
    expect(getDurationMins('50m')).toBe(50);
  });
});
