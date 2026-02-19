import type { IDisruptionsService } from '../transport.service';
import type { Disruption } from '../../types';
import { MOCK_DISRUPTIONS } from '../../data/disruptions';

export class MockDisruptionsService implements IDisruptionsService {
  async getDisruptions(): Promise<Disruption[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_DISRUPTIONS;
  }

  async getDisruptionsForRoute(from: string, to: string, operator: string): Promise<Disruption[]> {
    await new Promise(r => setTimeout(r, 100));
    const opLower = operator.toLowerCase();
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    return MOCK_DISRUPTIONS.filter(d => {
      const locLower = d.location.toLowerCase();
      return (
        d.operator.toLowerCase() === opLower ||
        locLower.includes(fromLower) ||
        locLower.includes(toLower)
      );
    });
  }
}
