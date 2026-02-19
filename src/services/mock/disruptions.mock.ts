import type { IDisruptionsService } from '../transport.service';
import type { Disruption } from '../../types';
import { MOCK_DISRUPTIONS } from '../../data/disruptions';

export class MockDisruptionsService implements IDisruptionsService {
  async getDisruptions(): Promise<Disruption[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_DISRUPTIONS;
  }
}
