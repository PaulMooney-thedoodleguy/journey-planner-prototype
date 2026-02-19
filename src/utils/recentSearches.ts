const STORAGE_KEY = 'journey_planner_recent_searches';
const MAX_RECENT = 5;

export interface RecentSearch {
  from: string;
  to: string;
}

export function getRecentSearches(): RecentSearch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(from: string, to: string): void {
  // Deduplicate: remove existing entry for same pair, then prepend
  const existing = getRecentSearches().filter(s => !(s.from === from && s.to === to));
  const updated = [{ from, to }, ...existing].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently ignore if localStorage is unavailable (private browsing, quota, etc.)
  }
}

export function removeRecentSearch(index: number): void {
  const existing = getRecentSearches();
  existing.splice(index, 1);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Silently ignore
  }
}
