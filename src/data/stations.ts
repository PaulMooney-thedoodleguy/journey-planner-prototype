import type { Station } from '../types';

export const NEARBY_STATIONS: Station[] = [
  { id: 1, name: 'London Kings Cross', type: 'train', distance: '0.2 miles' },
  { id: 2, name: 'London St Pancras', type: 'train', distance: '0.3 miles' },
  { id: 3, name: 'Euston Station', type: 'train', distance: '0.5 miles' },
  { id: 4, name: 'Kings Cross Bus Stop', type: 'bus', distance: '0.1 miles' },
];

export const MAP_STATIONS: Station[] = [
  { id: 1, name: 'London Kings Cross',  type: 'train', lat: 51.5309, lng: -0.1233 },
  { id: 2, name: 'London St Pancras',   type: 'train', lat: 51.5320, lng: -0.1271 },
  { id: 3, name: 'Euston Station',      type: 'train', lat: 51.5282, lng: -0.1337 },
  { id: 4, name: 'London Victoria',     type: 'train', lat: 51.4952, lng: -0.1441 },
  { id: 5, name: 'Liverpool Street',    type: 'train', lat: 51.5178, lng: -0.0823 },
  { id: 6, name: 'Kings Cross Bus Stop',type: 'bus',   lat: 51.5302, lng: -0.1205 },
  { id: 7, name: 'Victoria Coach',      type: 'bus',   lat: 51.4961, lng: -0.1476 },
];
