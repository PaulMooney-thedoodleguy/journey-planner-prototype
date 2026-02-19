import type { IJourneyService } from '../transport.service';
import type { Journey, JourneySearchParams } from '../../types';
import { MOCK_JOURNEYS } from '../../data/journeys';

export class MockJourneyService implements IJourneyService {
  async searchJourneys(_params: JourneySearchParams): Promise<Journey[]> {
    // Simulate network latency — catches loading-state issues early
    await new Promise(r => setTimeout(r, 400));
    return MOCK_JOURNEYS;
  }
}
