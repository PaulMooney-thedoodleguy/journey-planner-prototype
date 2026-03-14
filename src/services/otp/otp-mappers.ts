// Pure functions: OTP2 response → app Journey / JourneyLeg types.
// No side-effects — independently unit-testable.

import type { Journey, JourneyLeg, TransportMode, PassengerType } from '../../types';
import type { OtpItinerary, OtpLeg } from './otp-types';

// ─── Mode mapping ──────────────────────────────────────────────

const OTP_MODE_MAP: Record<string, TransportMode> = {
  BUS: 'bus',
  RAIL: 'train',
  SUBWAY: 'tube',
  TRAM: 'tram',
  FERRY: 'ferry',
  WALK: 'walk',
  BICYCLE: 'cycle',
};

function mapMode(otpMode: OtpLeg['mode']): TransportMode {
  return OTP_MODE_MAP[otpMode] ?? 'train';
}

// ─── Time formatting ───────────────────────────────────────────

function formatTime(unixMs: number): string {
  return new Date(unixMs).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── CO₂ calculation ───────────────────────────────────────────
// Standard UK government emission factors (kg CO₂ per km).

const CO2_FACTOR: Partial<Record<TransportMode, number>> = {
  bus: 0.089,
  train: 0.035,
  tube: 0.028,
  tram: 0.028,
  ferry: 0.19,
  walk: 0,
  cycle: 0,
};

function calcCo2(legs: OtpLeg[]): number {
  return legs.reduce((total, leg) => {
    const mode = mapMode(leg.mode);
    const factor = CO2_FACTOR[mode] ?? 0.035;
    const distKm = (leg.distance ?? 0) / 1000;
    return total + distKm * factor;
  }, 0);
}

// ─── Passenger type price multiplier ─────────────────────────

const PASSENGER_MULTIPLIER: Record<PassengerType, number> = {
  adult: 1,
  child: 0.5,
  railcard: 0.667,
};

// ─── Leg mapper ───────────────────────────────────────────────

function mapLeg(leg: OtpLeg): JourneyLeg {
  return {
    mode: mapMode(leg.mode),
    operator: leg.agency?.name ?? 'Unknown',
    from: leg.from.name,
    to: leg.to.name,
    departure: formatTime(leg.startTime),
    arrival: formatTime(leg.endTime),
    duration: formatDuration(leg.duration),
    platform: leg.platformCode ?? undefined,
    stops: leg.intermediateStops?.length,
    intermediateStops: leg.intermediateStops?.map(s => ({
      name: s.name,
      time: s.departureTime ? formatTime(s.departureTime)
          : s.arrivalTime  ? formatTime(s.arrivalTime)
          : '',
    })),
    fromLat: leg.from.lat,
    fromLng: leg.from.lon,
    toLat: leg.to.lat,
    toLng: leg.to.lon,
  };
}

// ─── Determine overall journey type ──────────────────────────

function resolveJourneyType(legs: OtpLeg[]): TransportMode {
  const transitLegs = legs.filter(l => l.mode !== 'WALK');
  if (transitLegs.length === 0) return 'walk';
  const modes = new Set(transitLegs.map(l => l.mode));
  if (modes.size === 1) return mapMode(transitLegs[0].mode);
  return 'multimodal';
}

// ─── Itinerary mapper (exported) ──────────────────────────────

export function mapItinerary(
  itinerary: OtpItinerary,
  index: number,
  from: string,
  to: string,
  passengerType: PassengerType,
): Journey {
  const transitLegs = itinerary.legs.filter(l => l.mode !== 'WALK');
  const firstLeg = transitLegs[0] ?? itinerary.legs[0];
  const multiplier = PASSENGER_MULTIPLIER[passengerType];

  return {
    id: index + 1,
    from,
    to,
    departure: formatTime(itinerary.startTime),
    arrival: formatTime(itinerary.endTime),
    duration: formatDuration(itinerary.duration),
    changes: itinerary.transfers,
    type: resolveJourneyType(itinerary.legs),
    operator: transitLegs.length === 1
      ? (firstLeg?.agency?.name ?? 'Unknown')
      : transitLegs.length > 1
        ? 'Multiple'
        : 'Unknown',
    price: {
      // TODO: wire up TfL Fares API for London journeys; Traveline bus fares have no open source.
      single: parseFloat((2.5 * multiplier).toFixed(2)),
      return: parseFloat((4.5 * multiplier).toFixed(2)),
    },
    co2: parseFloat(calcCo2(itinerary.legs).toFixed(3)),
    legs: itinerary.legs.map(mapLeg),
  };
}
