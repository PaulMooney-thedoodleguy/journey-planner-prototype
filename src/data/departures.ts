import type { Departure, RouteStop } from '../types';

export const MOCK_DEPARTURES: Record<number, Departure[]> = {
  1: [
    { time: '14:23', destination: 'Edinburgh', platform: '0', operator: 'LNER', status: 'On time', hasLiveTracking: true, vehiclePosition: { x: 45, y: 48 }, direction: 'north' },
    { time: '14:30', destination: 'Leeds', platform: '2', operator: 'LNER', status: 'On time', hasLiveTracking: true, vehiclePosition: { x: 44, y: 47 }, direction: 'northwest' },
    { time: '14:45', destination: 'York', platform: '5', operator: 'LNER', status: 'Delayed 10 min', hasLiveTracking: false },
  ],
  3: [
    { time: '14:20', destination: 'Birmingham', platform: '8', operator: 'Avanti', status: 'On time', hasLiveTracking: true, vehiclePosition: { x: 41, y: 50 }, direction: 'northwest' },
  ],
  4: [
    { time: '14:18', destination: 'Camden Town', platform: null, operator: 'Route 46', status: 'On time', hasLiveTracking: true, vehiclePosition: { x: 44, y: 53 }, direction: 'north' },
  ],
};

export const MOCK_ROUTES: Record<string, RouteStop[]> = {
  'LNER-Edinburgh': [
    { name: 'London Kings Cross', x: 45, y: 55, type: 'train' },
    { name: 'Peterborough', x: 45, y: 45, type: 'train' },
    { name: 'York', x: 45, y: 28, type: 'train' },
    { name: 'Edinburgh', x: 45, y: 5, type: 'train' },
  ],
  'LNER-Leeds': [
    { name: 'London Kings Cross', x: 45, y: 55, type: 'train' },
    { name: 'Peterborough', x: 45, y: 45, type: 'train' },
    { name: 'Leeds', x: 42, y: 30, type: 'train' },
  ],
  'Route 46-Camden Town': [
    { name: 'Kings Cross', x: 45, y: 55, type: 'bus' },
    { name: 'Camden Town', x: 42, y: 50, type: 'bus' },
  ],
  'Avanti-Birmingham': [
    { name: 'London Euston', x: 43, y: 53, type: 'train' },
    { name: 'Birmingham', x: 38, y: 42, type: 'train' },
  ],
};

export function getServiceRoute(operator: string, destination: string): RouteStop[] {
  return MOCK_ROUTES[`${operator}-${destination}`] ?? [];
}
