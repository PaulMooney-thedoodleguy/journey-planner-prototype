import type { Station } from '../types';

export const NEARBY_STATIONS: Station[] = [
  { id: 1, name: 'London Kings Cross',      type: 'train', distance: '0.2 miles', lat: 51.5309, lng: -0.1233 },
  { id: 2, name: 'London St Pancras',       type: 'train', distance: '0.3 miles', lat: 51.5320, lng: -0.1271 },
  { id: 3, name: 'Euston Station',          type: 'train', distance: '0.5 miles', lat: 51.5282, lng: -0.1337 },
  { id: 4, name: 'Kings Cross Bus Stop',    type: 'bus',   distance: '0.1 miles', lat: 51.5302, lng: -0.1205 },
  { id: 5, name: 'London Victoria',         type: 'train', distance: '1.4 miles', lat: 51.4952, lng: -0.1441 },
  { id: 6, name: 'Liverpool Street',        type: 'train', distance: '1.2 miles', lat: 51.5178, lng: -0.0823 },
  { id: 7, name: 'Victoria Coach Station',  type: 'bus',   distance: '1.5 miles', lat: 51.4961, lng: -0.1476 },
];

export const MAP_STATIONS: Station[] = [
  { id: 1, name: 'London Kings Cross',      type: 'train', lat: 51.5309, lng: -0.1233 },
  { id: 2, name: 'London St Pancras',       type: 'train', lat: 51.5320, lng: -0.1271 },
  { id: 3, name: 'Euston Station',          type: 'train', lat: 51.5282, lng: -0.1337 },
  { id: 4, name: 'Kings Cross Bus Stop',    type: 'bus',   lat: 51.5302, lng: -0.1205 },
  { id: 5, name: 'London Victoria',         type: 'train', lat: 51.4952, lng: -0.1441 },
  { id: 6, name: 'Liverpool Street',        type: 'train', lat: 51.5178, lng: -0.0823 },
  { id: 7, name: 'Victoria Coach Station',  type: 'bus',   lat: 51.4961, lng: -0.1476 },
];

export const ROUTE_STATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'London Kings Cross':            { lat: 51.5309, lng: -0.1233 },
  'Kings Cross St. Pancras':       { lat: 51.5315, lng: -0.1234 },
  'Kings Cross':                   { lat: 51.5309, lng: -0.1233 },
  'Manchester Piccadilly':         { lat: 53.4773, lng: -2.2309 },
  'Manchester Coach Station':      { lat: 53.4807, lng: -2.2340 },
  'Birmingham New Street':         { lat: 52.4781, lng: -1.8989 },
  'London Euston':                 { lat: 51.5282, lng: -0.1337 },
  'Euston':                        { lat: 51.5282, lng: -0.1337 },
  'London Victoria':               { lat: 51.4952, lng: -0.1441 },
  'London Victoria Coach Station': { lat: 51.4952, lng: -0.1441 },
  'Liverpool Street':              { lat: 51.5178, lng: -0.0823 },
  'Crewe':                         { lat: 53.0906, lng: -2.4394 },
  'Cambridge':                     { lat: 52.1946, lng:  0.1372 },
};
