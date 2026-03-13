// OTP2 journey service — implements IJourneyService via the OpenTripPlanner 2 REST API.
// Activated when VITE_USE_MOCK_DATA=false.

import type { IJourneyService } from '../transport.service';
import type { Journey, JourneySearchParams } from '../../types';
import type { OtpPlanResponse } from './otp-types';
import { mapItinerary } from './otp-mappers';
import { resolveStationCoord } from '../tfl/tfl-stop-search';

export class OtpJourneyService implements IJourneyService {
  private get baseUrl(): string {
    return import.meta.env.VITE_OTP_API_URL ?? 'http://localhost:8080';
  }

  async searchJourneys(params: JourneySearchParams): Promise<Journey[]> {
    // 1. Resolve station names → "lat,lon" strings
    const resolvePromises: Promise<string>[] = [
      resolveStationCoord(params.from),
      resolveStationCoord(params.to),
    ];
    if (params.via) resolvePromises.push(resolveStationCoord(params.via));

    const coords = await Promise.all(resolvePromises);
    const [fromCoord, toCoord, viaCoord] = coords;

    // 2. Build OTP2 query URL
    const url = new URL(`${this.baseUrl}/otp/routers/default/plan`);
    url.searchParams.set('fromPlace', fromCoord);
    url.searchParams.set('toPlace', toCoord);
    url.searchParams.set('date', params.date);           // "YYYY-MM-DD"
    url.searchParams.set('time', `${params.time}:00`);  // "HH:MM:SS"
    url.searchParams.set('numItineraries', '5');
    url.searchParams.set('mode', 'TRANSIT,WALK');
    if (viaCoord) url.searchParams.set('intermediatePlaces', viaCoord);

    // 3. Fetch
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`OTP2 request failed (${res.status})`);
    const data: OtpPlanResponse = await res.json();
    if (data.error) throw new Error(data.error.msg);

    // 4. Map itineraries → Journey[]
    return data.plan.itineraries.map((it, i) =>
      mapItinerary(it, i, params.from, params.to, params.passengerType)
    );
  }

  // OTP2 doesn't persist itineraries by ID — return null (UI handles this gracefully).
  async getJourneyById(_id: number): Promise<Journey | null> {
    return null;
  }
}
