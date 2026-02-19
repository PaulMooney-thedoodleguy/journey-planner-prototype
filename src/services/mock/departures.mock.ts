import type { IDeparturesService } from '../transport.service';
import type { Station, Departure } from '../../types';
import { NEARBY_STATIONS } from '../../data/stations';
import { MOCK_DEPARTURES } from '../../data/departures';

export class MockDeparturesService implements IDeparturesService {
  async getNearbyStations(): Promise<Station[]> {
    await new Promise(r => setTimeout(r, 200));
    return NEARBY_STATIONS;
  }

  async getDepartures(stationId: number): Promise<Departure[]> {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_DEPARTURES[stationId] ?? [];
  }
}
