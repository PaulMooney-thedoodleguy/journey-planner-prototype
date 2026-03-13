// TfL StopPoint Search API — resolves free-text station names to coordinates
// and provides live suggestions for the StationAutocomplete dropdown.
//
// Docs: https://api.tfl.gov.uk/StopPoint/Search/{query}

import type { TransportMode } from '../../types';

const TFL_BASE = 'https://api.tfl.gov.uk';
const MODES = 'tube,bus,dlr,overground,elizabeth-line';

function getApiKey(): string {
  return import.meta.env.VITE_TFL_API_KEY ?? '';
}

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${TFL_BASE}${path}`);
  const key = getApiKey();
  if (key) url.searchParams.set('app_key', key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

// Maps TfL mode strings to app TransportMode.
function resolveMode(modes: string[]): TransportMode {
  if (modes.includes('tube')) return 'tube';
  if (modes.includes('dlr') || modes.includes('overground') || modes.includes('elizabeth-line')) return 'train';
  if (modes.includes('bus')) return 'bus';
  return 'train';
}

// ─── Types ────────────────────────────────────────────────────

export interface StationSuggestion {
  id: string;
  name: string;
  type: TransportMode;
  lat: number;
  lng: number;
}

// ─── resolveStationCoord ──────────────────────────────────────
// Resolves a free-text station name to "lat,lon" (used by OTP2).

export async function resolveStationCoord(name: string): Promise<string> {
  const url = buildUrl(`/StopPoint/Search/${encodeURIComponent(name)}`, { modes: MODES });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TfL StopPoint Search failed (${res.status})`);
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match = data.matches?.[0] as any;
  if (!match) throw new Error(`Station not found: ${name}`);
  return `${match.lat},${match.lon}`;
}

// ─── resolveStationId ─────────────────────────────────────────
// Resolves a free-text station name to a TfL ICS ID (e.g. "1000129")
// that the Journey Planner API accepts unambiguously.

export async function resolveStationId(name: string): Promise<string> {
  const url = buildUrl(`/StopPoint/Search/${encodeURIComponent(name)}`, { modes: MODES });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TfL StopPoint Search failed (${res.status})`);
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match = data.matches?.[0] as any;
  if (!match) throw new Error(`Station not found: ${name}`);
  // icsId is the canonical identifier accepted by /Journey/JourneyResults
  return (match.icsId as string) ?? (match.id as string);
}

// ─── searchStations ───────────────────────────────────────────
// Returns up to 8 suggestions for the StationAutocomplete dropdown.

export async function searchStations(query: string): Promise<StationSuggestion[]> {
  if (query.length < 2) return [];
  const url = buildUrl(`/StopPoint/Search/${encodeURIComponent(query)}`, { modes: MODES });
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.matches ?? []).slice(0, 8).map((m: any) => ({
    id: m.id as string,
    name: m.name as string,
    type: resolveMode((m.modes ?? []) as string[]),
    lat: m.lat as number,
    lng: m.lon as number,
  }));
}
