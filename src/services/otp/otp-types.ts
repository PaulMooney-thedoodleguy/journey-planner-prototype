// TypeScript types for the OTP2 REST journey planner response.
// GET /otp/routers/default/plan?fromPlace=lat,lon&toPlace=lat,lon&date=YYYY-MM-DD&time=HH:MM:SS

export interface OtpPlanResponse {
  plan: { itineraries: OtpItinerary[] };
  error?: { id: number; msg: string };
}

export interface OtpItinerary {
  duration: number;   // total seconds
  startTime: number;  // unix ms
  endTime: number;    // unix ms
  transfers: number;
  legs: OtpLeg[];
}

export interface OtpLeg {
  mode: 'WALK' | 'BUS' | 'RAIL' | 'SUBWAY' | 'TRAM' | 'FERRY' | 'BICYCLE';
  from: OtpPlace;
  to: OtpPlace;
  startTime: number;       // unix ms
  endTime: number;         // unix ms
  duration: number;        // seconds
  distance?: number;       // metres
  route: { shortName: string; longName: string };
  agency: { name: string };
  intermediateStops?: OtpPlace[];
  platformCode?: string;
}

export interface OtpPlace {
  name: string;
  lat: number;
  lon: number;
  stopId?: string; // NaPTAN / GTFS stop_id
}
