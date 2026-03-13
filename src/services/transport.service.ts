import type { Journey, JourneySearchParams, Station, Departure, Disruption } from '../types';

// ─── Service interfaces ───────────────────────────────────────
// Real TfL / National Rail implementations will satisfy these same contracts.

export interface IJourneyService {
  searchJourneys(params: JourneySearchParams): Promise<Journey[]>;
  getJourneyById(id: number): Promise<Journey | null>;
}

export interface IDeparturesService {
  getNearbyStations(): Promise<Station[]>;
  getDepartures(stationId: string | number): Promise<Departure[]>;
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
  // TfL Journey Planner API — active when VITE_USE_MOCK_DATA=false
  const { TflJourneyService } = await import('./tfl/tfl-journey.service');
  return new TflJourneyService();
}

export async function getDeparturesService(): Promise<IDeparturesService> {
  if (useMock) {
    const { MockDeparturesService } = await import('./mock/departures.mock');
    return new MockDeparturesService();
  }
  const { TflDeparturesService } = await import('./tfl/tfl-departures.service');
  return new TflDeparturesService();
}

export async function getDisruptionsService(): Promise<IDisruptionsService> {
  if (useMock) {
    const { MockDisruptionsService } = await import('./mock/disruptions.mock');
    return new MockDisruptionsService();
  }
  // TODO: Wire up TfL / National Rail disruptions feed here
  throw new Error('Real disruptions service not yet implemented');
}
