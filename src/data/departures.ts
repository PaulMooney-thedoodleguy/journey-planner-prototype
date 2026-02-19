import type { Departure, RouteStop } from '../types';

export const MOCK_DEPARTURES: Record<number, Departure[]> = {
  1: [
    { time: '14:23', destination: 'Edinburgh', platform: '0', operator: 'LNER', status: 'On time', hasLiveTracking: true,
      vehiclePosition: { lat: 52.57, lng: -0.24 }, direction: 'north' },
    { time: '14:30', destination: 'Leeds', platform: '2', operator: 'LNER', status: 'On time', hasLiveTracking: true,
      vehiclePosition: { lat: 52.57, lng: -0.24 }, direction: 'northwest' },
    { time: '14:45', destination: 'York', platform: '5', operator: 'LNER', status: 'Delayed 10 min', hasLiveTracking: false },
  ],
  3: [
    { time: '14:20', destination: 'Birmingham', platform: '8', operator: 'Avanti', status: 'On time', hasLiveTracking: true,
      vehiclePosition: { lat: 52.10, lng: -1.03 }, direction: 'northwest' },
  ],
  4: [
    { time: '14:18', destination: 'Camden Town', platform: null, operator: 'Route 46', status: 'On time', hasLiveTracking: true,
      vehiclePosition: { lat: 51.534, lng: -0.126 }, direction: 'north' },
  ],
};

export const MOCK_ROUTES: Record<string, RouteStop[]> = {
  'LNER-Edinburgh': [
    { name: 'London Kings Cross', lat: 51.5309, lng: -0.1233, type: 'train' },
    { name: 'Peterborough',       lat: 52.5695, lng: -0.2405, type: 'train' },
    { name: 'York',               lat: 53.9591, lng: -1.0927, type: 'train' },
    { name: 'Edinburgh',          lat: 55.9521, lng: -3.1895, type: 'train' },
  ],
  'LNER-Leeds': [
    { name: 'London Kings Cross', lat: 51.5309, lng: -0.1233, type: 'train' },
    { name: 'Peterborough',       lat: 52.5695, lng: -0.2405, type: 'train' },
    { name: 'Leeds',              lat: 53.7956, lng: -1.5490, type: 'train' },
  ],
  'Route 46-Camden Town': [
    { name: 'Kings Cross',  lat: 51.5309, lng: -0.1233, type: 'bus' },
    { name: 'Camden Town', lat: 51.5390, lng: -0.1426, type: 'bus' },
  ],
  'Avanti-Birmingham': [
    { name: 'London Euston',  lat: 51.5282, lng: -0.1337, type: 'train' },
    { name: 'Milton Keynes',  lat: 52.0409, lng: -0.7594, type: 'train' },
    { name: 'Birmingham',     lat: 52.4775, lng: -1.8993, type: 'train' },
  ],
};

export function getServiceRoute(operator: string, destination: string): RouteStop[] {
  return MOCK_ROUTES[`${operator}-${destination}`] ?? [];
}
