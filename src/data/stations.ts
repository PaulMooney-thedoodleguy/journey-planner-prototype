import type { Station } from '../types';

export const NEARBY_STATIONS: Station[] = [
  { id: 1, name: 'London Kings Cross', type: 'train', distance: '0.2 miles' },
  { id: 2, name: 'London St Pancras', type: 'train', distance: '0.3 miles' },
  { id: 3, name: 'Euston Station', type: 'train', distance: '0.5 miles' },
  { id: 4, name: 'Kings Cross Bus Stop', type: 'bus', distance: '0.1 miles' },
];

// x = lng equivalent (left %), y = lat equivalent (top %) for the CSS map stub
export const MAP_STATIONS: Station[] = [
  { id: 1, name: 'London Kings Cross', type: 'train', x: 45, y: 55 },
  { id: 2, name: 'London St Pancras', type: 'train', x: 46, y: 56 },
  { id: 3, name: 'Euston Station', type: 'train', x: 43, y: 53 },
  { id: 4, name: 'London Victoria', type: 'train', x: 44, y: 68 },
  { id: 5, name: 'Liverpool Street', type: 'train', x: 52, y: 58 },
  { id: 6, name: 'Kings Cross Bus Stop', type: 'bus', x: 45, y: 54 },
  { id: 7, name: 'Victoria Coach', type: 'bus', x: 44, y: 69 },
];
