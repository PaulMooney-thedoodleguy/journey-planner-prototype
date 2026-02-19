import type { Journey, JourneySearchParams, Station, Departure, Disruption } from '../types';

// ─── Service interfaces ───────────────────────────────────────
// Real TfL / National Rail implementations will satisfy these same contracts.

export interface IJourneyService {
  searchJourneys(params: JourneySearchParams): Promise<Journey[]>;
  getJourneyById(id: number): Promise<Journey | null>;
}

export interface IDeparturesService {
  getNearbyStations(): Promise<Station[]>;
  getDepartures(stationId: number): Promise<Departure[]>;
}

export interface IDisruptionsService {
  getDisruptions(): Promise<Disruption[]>;
  getDisruptionsForRoute(from: string, to: string, operator: string): Promise<Disruption[]>;
}

// ─── Factory functions ────────────────────────────────────────
// Default to mock data unless explicitly disabled.
// Swap the commented branches when TfL / National Rail is ready.

const useMock = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export async function getJourneyService(): Promise<IJourneyService> {
  if (useMock) {
    const { MockJourneyService } = await import('./mock/journey.mock');
    return new MockJourneyService();
  }
  // TODO: Wire up TfL + National Rail GTFS here
  // const { TflJourneyService } = await import('./tfl/journey.tfl');
  // return new TflJourneyService();
  throw new Error('Real journey service not yet implemented');
}

export async function getDeparturesService(): Promise<IDeparturesService> {
  if (useMock) {
    const { MockDeparturesService } = await import('./mock/departures.mock');
    return new MockDeparturesService();
  }
  // TODO: Wire up TfL real-time departures here
  throw new Error('Real departures service not yet implemented');
}

export async function getDisruptionsService(): Promise<IDisruptionsService> {
  if (useMock) {
    const { MockDisruptionsService } = await import('./mock/disruptions.mock');
    return new MockDisruptionsService();
  }
  // TODO: Wire up TfL / National Rail disruptions feed here
  throw new Error('Real disruptions service not yet implemented');
}
