import type { SavedJourney } from '../types';

const STORAGE_KEY = 'journey_planner_saved_journeys';

export function loadSavedJourneys(): SavedJourney[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as SavedJourney[]) : [];
  } catch {
    return [];
  }
}

export function saveSavedJourneys(journeys: SavedJourney[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
  } catch { /* silently ignore */ }
}
