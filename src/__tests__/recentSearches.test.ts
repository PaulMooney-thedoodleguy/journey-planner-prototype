/**
 * recentSearches utility — unit tests
 *
 * Tests the localStorage-backed recent searches utility:
 *   ✓ Returns empty array when storage is empty
 *   ✓ addRecentSearch stores and retrieves entries
 *   ✓ Entries are prepended (newest first)
 *   ✓ Deduplicates exact from+to pairs
 *   ✓ Caps at MAX_RECENT (5) entries
 *   ✓ removeRecentSearch removes by index
 *   ✓ Handles corrupt storage gracefully
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../utils/recentSearches';

const KEY = 'journey_planner_recent_searches';

beforeEach(() => {
  localStorage.clear();
});

describe('getRecentSearches', () => {
  it('returns an empty array when storage is empty', () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it('returns an empty array when storage contains invalid JSON', () => {
    localStorage.setItem(KEY, 'not-json');
    expect(getRecentSearches()).toEqual([]);
  });
});

describe('addRecentSearch', () => {
  it('stores a search entry', () => {
    addRecentSearch('London Kings Cross', 'Manchester Piccadilly');
    const searches = getRecentSearches();
    expect(searches).toHaveLength(1);
    expect(searches[0]).toEqual({ from: 'London Kings Cross', to: 'Manchester Piccadilly' });
  });

  it('prepends new entries (newest first)', () => {
    addRecentSearch('London Kings Cross', 'Edinburgh');
    addRecentSearch('Bristol Temple Meads', 'Birmingham New Street');
    const searches = getRecentSearches();
    expect(searches[0].from).toBe('Bristol Temple Meads');
    expect(searches[1].from).toBe('London Kings Cross');
  });

  it('deduplicates an existing from+to pair before prepending', () => {
    addRecentSearch('London Kings Cross', 'Manchester Piccadilly');
    addRecentSearch('Bristol Temple Meads', 'Birmingham');
    // Add the first pair again
    addRecentSearch('London Kings Cross', 'Manchester Piccadilly');
    const searches = getRecentSearches();
    // Should be 2 entries, not 3
    expect(searches).toHaveLength(2);
    expect(searches[0].from).toBe('London Kings Cross');
  });

  it('caps storage at 5 entries', () => {
    for (let i = 0; i < 7; i++) {
      addRecentSearch(`Station ${i}`, `Destination ${i}`);
    }
    expect(getRecentSearches()).toHaveLength(5);
  });

  it('keeps the 5 most recent entries after capping', () => {
    for (let i = 0; i < 7; i++) {
      addRecentSearch(`Station ${i}`, `Destination ${i}`);
    }
    const searches = getRecentSearches();
    // Entries 2–6 should be present (indices shift because newest first)
    expect(searches[0].from).toBe('Station 6');
    expect(searches[4].from).toBe('Station 2');
  });
});

describe('removeRecentSearch', () => {
  it('removes the entry at the given index', () => {
    addRecentSearch('A', 'B');
    addRecentSearch('C', 'D');
    addRecentSearch('E', 'F');
    // Array is [E→F, C→D, A→B]; remove index 1 (C→D)
    removeRecentSearch(1);
    const searches = getRecentSearches();
    expect(searches).toHaveLength(2);
    expect(searches[0].from).toBe('E');
    expect(searches[1].from).toBe('A');
  });

  it('handles removing the only entry', () => {
    addRecentSearch('London', 'Edinburgh');
    removeRecentSearch(0);
    expect(getRecentSearches()).toHaveLength(0);
  });

  it('does nothing when index is out of range', () => {
    addRecentSearch('London', 'Edinburgh');
    removeRecentSearch(5); // out of range
    expect(getRecentSearches()).toHaveLength(1);
  });
});
