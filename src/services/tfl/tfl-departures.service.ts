import type { IDeparturesService } from '../transport.service';
import type { Station, Departure, TransportMode } from '../../types';

interface TflStopPoint {
  naptanId: string;
  commonName: string;
  lat: number;
  lon: number;
  modes: string[];
}

interface TflArrival {
  timeToStation: number;
  destinationName?: string;
  towards?: string;
  platformName?: string;
  lineName: string;
  lineId?: string;
  direction?: string;
}

export class TflDeparturesService implements IDeparturesService {
  private readonly apiKey = import.meta.env.VITE_TFL_API_KEY ?? '';

  async getNearbyStations(): Promise<Station[]> {
    const { lat, lng } = await this.getPosition();
    const data = await fetch(
      `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lng}&radius=800` +
      `&modes=tube,dlr,overground,elizabeth-line,national-rail,bus` +
      `&stopTypes=NaptanMetroStation,NaptanRailStation,NaptanPublicBusCoachTram` +
      `&returnLines=false&app_key=${this.apiKey}`
    ).then(r => r.json());
    return ((data.stopPoints ?? []) as TflStopPoint[]).slice(0, 12).map(s => ({
      id: s.naptanId,
      name: s.commonName,
      type: this.mapMode(s.modes),
      lat: s.lat,
      lng: s.lon,
    }));
  }

  async getDepartures(stationId: string | number): Promise<Departure[]> {
    const res = await fetch(
      `https://api.tfl.gov.uk/StopPoint/${stationId}/Arrivals?app_key=${this.apiKey}`
    );
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.message ?? data?.exceptionType ?? `HTTP ${res.status}`;
      throw new Error(`TfL Arrivals API error: ${msg}`);
    }
    if (!Array.isArray(data)) {
      throw new Error(`TfL Arrivals API returned unexpected response: ${JSON.stringify(data).slice(0, 120)}`);
    }
    // Deduplicate: keep only the soonest arrival per distinct service
    // (same line + destination + direction = same service, many approaching vehicles)
    const seen = new Set<string>();
    const deduped = data
      .sort((a, b) => a.timeToStation - b.timeToStation)
      .filter(a => {
        const key = `${a.lineId ?? a.lineName}|${a.destinationName ?? a.towards ?? ''}|${a.direction ?? ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);

    return deduped.map(a => ({
        time: this.toHHMM(a.timeToStation),
        destination: a.destinationName ?? a.towards ?? 'Unknown',
        platform: a.platformName || null,
        operator: a.lineName,
        status: this.toStatus(a.timeToStation),
        hasLiveTracking: true,
        direction: a.direction,
        lineId: a.lineId,
      }));
  }

  private toHHMM(seconds: number): string {
    const d = new Date(Date.now() + seconds * 1000);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  private toStatus(seconds: number): string {
    if (seconds < 60) return 'Due';
    const m = Math.round(seconds / 60);
    return `${m} min${m === 1 ? '' : 's'}`;
  }

  private mapMode(modes: string[]): TransportMode {
    if (modes.includes('tube') || modes.includes('dlr')) return 'tube';
    if (
      modes.includes('overground') ||
      modes.includes('elizabeth-line') ||
      modes.includes('national-rail')
    ) return 'train';
    return 'bus';
  }

  private async getPosition(): Promise<{ lat: number; lng: number }> {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
      );
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return { lat: 51.515, lng: -0.13 };
    }
  }
}
