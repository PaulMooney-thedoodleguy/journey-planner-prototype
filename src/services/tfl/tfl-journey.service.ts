// TfL Journey Planner API — implements IJourneyService using real TfL data.
// Docs: GET https://api.tfl.gov.uk/Journey/JourneyResults/{from}/to/{to}

import type { IJourneyService } from '../transport.service';
import type { Journey, JourneyLeg, JourneySearchParams, TransportMode } from '../../types';
import type { TflJourneyResponse, TflJourney, TflLeg } from './tfl-journey-types';
import { resolveStationId } from './tfl-stop-search';

const TFL_BASE = 'https://api.tfl.gov.uk';

// ─── Passenger fare multipliers ──────────────────────────────

const PASSENGER_MULTIPLIERS: Record<string, number> = {
  adult:    1.0,
  child:    0.5,
  railcard: 0.667,
};

// ─── Mode mapping ─────────────────────────────────────────────

const TFL_MODE_MAP: Record<string, TransportMode> = {
  tube:               'tube',
  bus:                'bus',
  dlr:                'train',
  overground:         'train',
  'elizabeth-line':   'train',
  'national-rail':    'train',
  walking:            'walk',
  tram:               'tram',
  'river-bus':        'ferry',
  'cable-car':        'ferry',
  cycle:              'cycle',
  cycling:            'cycle',
};

function mapMode(tflModeId: string): TransportMode {
  return TFL_MODE_MAP[tflModeId.toLowerCase()] ?? 'train';
}

// ─── CO₂ estimation ───────────────────────────────────────────
// TfL doesn't return distance; approximate using duration × assumed speed.

const CO2_KG_PER_KM: Partial<Record<TransportMode, number>> = {
  bus:   0.089,
  train: 0.035,
  tube:  0.028,
  tram:  0.029,
  ferry: 0.115,
};

const AVG_SPEED_KMH: Partial<Record<TransportMode, number>> = {
  bus:   20,
  tube:  33,
  train: 60,
  tram:  25,
  ferry: 30,
};

function estimateCo2(legs: TflLeg[]): number {
  let totalKg = 0;
  for (const leg of legs) {
    const mode = mapMode(leg.mode.id);
    const factor = CO2_KG_PER_KM[mode];
    const speed = AVG_SPEED_KMH[mode];
    if (factor && speed) {
      const distKm = (leg.duration / 60) * speed;
      totalKg += distKm * factor;
    }
  }
  return Math.round(totalKg * 10) / 10;
}

// ─── Formatting helpers ───────────────────────────────────────

function fmtTime(iso: string): string {
  // "2026-03-13T09:05:00" → "09:05"
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Dominant mode ────────────────────────────────────────────

function dominantMode(legs: TflLeg[]): TransportMode {
  const transitLegs = legs.filter(l => l.mode.id !== 'walking');
  if (transitLegs.length === 0) return 'walk';
  const modes = transitLegs.map(l => mapMode(l.mode.id));
  const unique = new Set(modes);
  if (unique.size === 1) return modes[0];
  return 'multimodal';
}

// ─── Leg mapper ───────────────────────────────────────────────

function mapLeg(leg: TflLeg): JourneyLeg {
  const mode = mapMode(leg.mode.id);
  const routeOption = leg.routeOptions?.[0];
  const lineName = routeOption?.lineIdentifier?.name ?? routeOption?.name ?? leg.mode.name;

  return {
    mode,
    operator: lineName || 'TfL',
    from: leg.departurePoint.commonName,
    to: leg.arrivalPoint.commonName,
    departure: fmtTime(leg.departureTime),
    arrival: fmtTime(leg.arrivalTime),
    duration: fmtDuration(leg.duration),
    platform: leg.departurePoint.platformName || undefined,
    stops: leg.path?.stopPoints?.length,
    intermediateStops: leg.path?.stopPoints?.map(s => ({ name: s.name, time: '' })),
    fromLat: leg.departurePoint.lat,
    fromLng: leg.departurePoint.lon,
    toLat: leg.arrivalPoint.lat,
    toLng: leg.arrivalPoint.lon,
  };
}

// ─── Journey mapper ───────────────────────────────────────────

function mapJourney(tflJourney: TflJourney, index: number, params: JourneySearchParams): Journey {
  const multiplier = PASSENGER_MULTIPLIERS[params.passengerType] ?? 1.0;
  const legs = tflJourney.legs;
  const transitLegs = legs.filter(l => l.mode.id !== 'walking');

  // TfL returns fare in pence; apply passenger multiplier
  const farePence = tflJourney.fare?.totalCost ?? 0;
  const single = Math.round((farePence / 100) * multiplier * 100) / 100;
  // Return: approximate as 1.8× single (common for London zones)
  const ret = Math.round(single * 1.8 * 100) / 100;

  const firstTransit = transitLegs[0];
  const operator =
    firstTransit?.routeOptions?.[0]?.lineIdentifier?.name ??
    firstTransit?.mode.name ??
    'TfL';

  return {
    id: index + 1,
    from: params.from,
    to: params.to,
    departure: fmtTime(tflJourney.startDateTime),
    arrival: fmtTime(tflJourney.arrivalDateTime),
    duration: fmtDuration(tflJourney.duration),
    changes: Math.max(0, transitLegs.length - 1),
    type: dominantMode(legs),
    operator,
    price: { single, return: ret },
    co2: estimateCo2(legs),
    legs: legs.map(mapLeg),
  };
}

// ─── Service class ────────────────────────────────────────────

export class TflJourneyService implements IJourneyService {
  private buildUrl(params: JourneySearchParams): string {
    const from = encodeURIComponent(params.from);
    const to = encodeURIComponent(params.to);
    const url = new URL(`${TFL_BASE}/Journey/JourneyResults/${from}/to/${to}`);

    const apiKey = import.meta.env.VITE_TFL_API_KEY;
    if (apiKey) url.searchParams.set('app_key', apiKey);

    // "YYYY-MM-DD" → "YYYYMMDD"
    url.searchParams.set('date', params.date.replace(/-/g, ''));
    // "HH:MM" → "HHMM"
    url.searchParams.set('time', params.time.replace(':', ''));
    url.searchParams.set('timeIs', 'Departing');
    url.searchParams.set('journeyPreference', 'LeastTime');

    if (params.via) url.searchParams.set('viaId', params.via);

    return url.toString();
  }

  async searchJourneys(params: JourneySearchParams): Promise<Journey[]> {
    // Pre-resolve free-text names to ICS IDs so TfL doesn't return 300 disambiguation
    const [fromId, toId, viaId] = await Promise.all([
      resolveStationId(params.from),
      resolveStationId(params.to),
      params.via ? resolveStationId(params.via) : Promise.resolve(undefined),
    ]);
    const resolvedParams = { ...params, from: fromId, to: toId, via: viaId };
    const url = this.buildUrl(resolvedParams);
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TfL Journey Planner error (${res.status}): ${text}`);
    }
    const data: TflJourneyResponse = await res.json();
    if (!data.journeys?.length) return [];
    return data.journeys.map((j, i) => mapJourney(j, i, params));
  }

  // TfL Journey Planner has no persistent journey IDs — return null.
  async getJourneyById(_id: number): Promise<Journey | null> {
    return null;
  }
}
