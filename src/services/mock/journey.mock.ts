import type { IJourneyService } from '../transport.service';
import type { Journey, JourneySearchParams } from '../../types';
import { MOCK_JOURNEYS } from '../../data/journeys';

const PASSENGER_MULTIPLIERS: Record<string, number> = {
  adult:    1.0,
  child:    0.5,    // ~50% of adult fare
  railcard: 0.667,  // standard UK railcard: 1/3 off
};

export class MockJourneyService implements IJourneyService {
  async getJourneyById(id: number): Promise<Journey | null> {
    await new Promise(r => setTimeout(r, 150));
    return MOCK_JOURNEYS.find(j => j.id === id) ?? null;
  }

  async searchJourneys(params: JourneySearchParams): Promise<Journey[]> {
    // Simulate network latency — catches loading-state issues early
    await new Promise(r => setTimeout(r, 400));

    const multiplier = PASSENGER_MULTIPLIERS[params.passengerType] ?? 1.0;
    if (multiplier === 1.0) return MOCK_JOURNEYS;

    // Apply pricing multiplier; round to nearest penny
    return MOCK_JOURNEYS.map(j => ({
      ...j,
      price: {
        single: Math.round(j.price.single * multiplier * 100) / 100,
        return: Math.round(j.price.return * multiplier * 100) / 100,
      },
    }));
  }
}
