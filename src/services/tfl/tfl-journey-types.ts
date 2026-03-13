// TypeScript types for the TfL Journey Planner REST API.
// Docs: https://api.tfl.gov.uk/swagger/ui/index.html#/Journey

export interface TflJourneyResponse {
  journeys?: TflJourney[];
  lines?: TflLine[];
  stopMessages?: string[];
  recommendedMaxAgeMinutes?: number;
  searchCriteria?: TflSearchCriteria;
  journeyVector?: TflJourneyVector;
}

export interface TflJourney {
  startDateTime: string;       // ISO 8601 e.g. "2026-03-13T09:00:00"
  duration: number;            // total minutes
  arrivalDateTime: string;     // ISO 8601
  legs: TflLeg[];
  fare?: TflFare;
}

export interface TflLeg {
  duration: number;            // minutes
  departureTime: string;       // ISO 8601
  arrivalTime: string;         // ISO 8601
  isDisrupted: boolean;
  hasFixedLocations: boolean;
  departurePoint: TflStopPoint;
  arrivalPoint: TflStopPoint;
  path?: TflPath;
  routeOptions?: TflRouteOption[];
  mode: TflMode;
  instruction?: TflInstruction;
}

export interface TflMode {
  id: string;    // "tube" | "bus" | "dlr" | "overground" | "elizabeth-line" | "walking" | "tram" | "river-bus" | "national-rail" | "cycle"
  name: string;
}

export interface TflStopPoint {
  naptanId?: string;
  platformName?: string;
  stopLetter?: string | null;
  commonName: string;
  lat?: number;
  lon?: number;
}

export interface TflPath {
  lineString?: string;
  stopPoints?: TflPathStop[];
  elevation?: unknown[];
}

// Intermediate stops in path.stopPoints are Identifier objects — different from TflStopPoint
export interface TflPathStop {
  id: string;
  name: string;
  uri?: string;
  type?: string;
  routeType?: string;
  status?: string;
}

export interface TflRouteOption {
  name: string;
  directions?: string[];
  lineIdentifier?: TflLineIdentifier;
}

export interface TflLineIdentifier {
  id: string;
  name: string;
  uri?: string;
  fullName?: string;
  modeName?: string;
}

export interface TflFare {
  totalCost: number;   // pence (integer)
  fares?: TflFareDetails[];
  caveats?: TflFareCaveat[];
}

export interface TflFareDetails {
  lowZone?: number;
  highZone?: number;
  cost?: number;
  chargeProfileName?: string;
  isHopperFare?: boolean;
  chargeLevel?: string;
  peak?: number;
  offPeak?: number;
}

export interface TflFareCaveat {
  text?: string;
  type?: string;
}

export interface TflInstruction {
  summary: string;
  detailed?: string;
}

export interface TflSearchCriteria {
  dateTime?: string;
  dateTimeType?: string;
}

export interface TflJourneyVector {
  from?: string;
  to?: string;
  via?: string;
  uri?: string;
}

export interface TflLine {
  id?: string;
  name?: string;
}
