import type { Departure, RouteStop } from '../types';

export const MOCK_DEPARTURES: Record<number, Departure[]> = {
  // ── Station 1: London Kings Cross ────────────────────────────────────────
  1: [
    {
      time: '14:23', destination: 'Edinburgh',  platform: '0',  operator: 'LNER',
      status: 'On time',        hasLiveTracking: true,
      vehiclePosition: { lat: 52.5695, lng: -0.2405 }, direction: 'north',
    },
    {
      time: '14:30', destination: 'Leeds',       platform: '2',  operator: 'LNER',
      status: 'On time',        hasLiveTracking: true,
      vehiclePosition: { lat: 51.9021, lng: -0.2000 }, direction: 'northwest',
    },
    {
      time: '14:45', destination: 'York',        platform: '5',  operator: 'LNER',
      status: 'Delayed 10 min', hasLiveTracking: false,
    },
    {
      time: '15:00', destination: 'Newcastle',   platform: '3',  operator: 'LNER',
      status: 'On time',        hasLiveTracking: false,
    },
    {
      time: '15:15', destination: 'Cambridge',   platform: '10', operator: 'Thameslink',
      status: 'On time',        hasLiveTracking: false,
    },
    {
      time: '15:30', destination: 'Hull',        platform: '4',  operator: 'Hull Trains',
      status: 'On time',        hasLiveTracking: false,
    },
  ],

  // ── Station 2: London St Pancras ─────────────────────────────────────────
  2: [
    {
      time: '14:25', destination: 'Paris',           platform: '1',  operator: 'Eurostar',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.4418, lng: 0.3194 }, direction: 'southeast',
    },
    {
      time: '14:40', destination: 'Nottingham',      platform: '4',  operator: 'East Midlands Railway',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '14:55', destination: 'Leicester',       platform: '3',  operator: 'East Midlands Railway',
      status: 'Delayed 7 min', hasLiveTracking: false,
    },
    {
      time: '15:10', destination: 'Derby',           platform: '4',  operator: 'East Midlands Railway',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '15:25', destination: 'Luton Airport',   platform: '6',  operator: 'Thameslink',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.5200, lng: -0.1046 }, direction: 'north',
    },
  ],

  // ── Station 3: Euston Station ─────────────────────────────────────────────
  3: [
    {
      time: '14:20', destination: 'Birmingham',  platform: '8',  operator: 'Avanti',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 52.1009, lng: -0.7594 }, direction: 'northwest',
    },
    {
      time: '14:35', destination: 'Manchester',  platform: '6',  operator: 'Avanti',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 53.0906, lng: -2.4394 }, direction: 'northwest',
    },
    {
      time: '14:50', destination: 'Liverpool',   platform: '7',  operator: 'Avanti',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '15:05', destination: 'Crewe',       platform: '5',  operator: 'London Northwestern',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '15:20', destination: 'Glasgow',     platform: '9',  operator: 'Avanti',
      status: 'Delayed 5 min', hasLiveTracking: false,
    },
  ],

  // ── Station 4: Kings Cross Bus Stop ──────────────────────────────────────
  4: [
    {
      time: '14:18', destination: 'Camden Town',      platform: null, operator: 'Route 46',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.5390, lng: -0.1426 }, direction: 'north',
    },
    {
      time: '14:22', destination: 'Angel',             platform: null, operator: 'Route 73',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '14:26', destination: 'Hackney Central',   platform: null, operator: 'Route 30',
      status: 'Delayed 3 min', hasLiveTracking: false,
    },
    {
      time: '14:30', destination: 'Camden Town',       platform: null, operator: 'Route 46',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '14:35', destination: 'Islington',         platform: null, operator: 'Route 30',
      status: 'On time',       hasLiveTracking: false,
    },
  ],

  // ── Station 5: London Victoria ────────────────────────────────────────────
  5: [
    {
      time: '14:22', destination: 'Brighton',        platform: '12', operator: 'Southern',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.4641, lng: -0.1706 }, direction: 'south',
    },
    {
      time: '14:35', destination: 'Gatwick Airport', platform: '1',  operator: 'Gatwick Express',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '14:48', destination: 'Eastbourne',      platform: '9',  operator: 'Southern',
      status: 'Delayed 8 min', hasLiveTracking: false,
    },
    {
      time: '15:00', destination: 'Ramsgate',        platform: '14', operator: 'Southeastern',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '15:12', destination: 'Brighton',        platform: '11', operator: 'Southern',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.3756, lng: -0.0988 }, direction: 'south',
    },
  ],

  // ── Station 6: Liverpool Street ───────────────────────────────────────────
  6: [
    {
      time: '14:19', destination: 'Norwich',    platform: '14', operator: 'Greater Anglia',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.7364, lng: 0.4679 }, direction: 'northeast',
    },
    {
      time: '14:28', destination: 'Ipswich',    platform: '12', operator: 'Greater Anglia',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '14:35', destination: 'Chelmsford', platform: '10', operator: 'Greater Anglia',
      status: 'On time',       hasLiveTracking: false,
    },
    {
      time: '14:42', destination: 'Southend',   platform: '7',  operator: 'c2c',
      status: 'Delayed 5 min', hasLiveTracking: false,
    },
    {
      time: '14:50', destination: 'Shenfield',  platform: null, operator: 'Elizabeth Line',
      status: 'On time',       hasLiveTracking: true,
      vehiclePosition: { lat: 51.5415, lng: -0.0042 }, direction: 'east',
    },
  ],

  // ── Station 7: Victoria Coach Station ────────────────────────────────────
  7: [
    {
      time: '14:30', destination: 'Oxford',     platform: 'Bay 12', operator: 'National Express',
      status: 'On time', hasLiveTracking: false,
    },
    {
      time: '15:00', destination: 'Birmingham', platform: 'Bay 8',  operator: 'National Express',
      status: 'On time', hasLiveTracking: false,
    },
    {
      time: '15:30', destination: 'Manchester', platform: 'Bay 15', operator: 'National Express',
      status: 'On time', hasLiveTracking: false,
    },
    {
      time: '16:00', destination: 'Bristol',    platform: 'Bay 6',  operator: 'National Express',
      status: 'On time', hasLiveTracking: false,
    },
  ],
};

export const MOCK_ROUTES: Record<string, RouteStop[]> = {
  // ── Kings Cross routes ───────────────────────────────────────────────────
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
  'LNER-York': [
    { name: 'London Kings Cross', lat: 51.5309, lng: -0.1233, type: 'train' },
    { name: 'Stevenage',          lat: 51.9021, lng: -0.2000, type: 'train' },
    { name: 'Peterborough',       lat: 52.5695, lng: -0.2405, type: 'train' },
    { name: 'Grantham',           lat: 52.9127, lng: -0.6447, type: 'train' },
    { name: 'York',               lat: 53.9591, lng: -1.0927, type: 'train' },
  ],
  'LNER-Newcastle': [
    { name: 'London Kings Cross', lat: 51.5309, lng: -0.1233, type: 'train' },
    { name: 'Peterborough',       lat: 52.5695, lng: -0.2405, type: 'train' },
    { name: 'Doncaster',          lat: 53.5228, lng: -1.1332, type: 'train' },
    { name: 'Newcastle',          lat: 54.9783, lng: -1.6178, type: 'train' },
  ],
  'Thameslink-Cambridge': [
    { name: 'London Kings Cross', lat: 51.5309, lng: -0.1233, type: 'train' },
    { name: 'Finsbury Park',      lat: 51.5642, lng: -0.1069, type: 'train' },
    { name: 'Stevenage',          lat: 51.9021, lng: -0.2000, type: 'train' },
    { name: 'Cambridge',          lat: 52.1946, lng:  0.1372, type: 'train' },
  ],
  'Hull Trains-Hull': [
    { name: 'London Kings Cross', lat: 51.5309, lng: -0.1233, type: 'train' },
    { name: 'Doncaster',          lat: 53.5228, lng: -1.1332, type: 'train' },
    { name: 'Beverley',           lat: 53.8415, lng: -0.4334, type: 'train' },
    { name: 'Hull',               lat: 53.7449, lng: -0.3413, type: 'train' },
  ],

  // ── St Pancras routes ────────────────────────────────────────────────────
  'Eurostar-Paris': [
    { name: 'London St Pancras', lat: 51.5320, lng: -0.1271, type: 'train' },
    { name: 'Ebbsfleet',         lat: 51.4418, lng:  0.3194, type: 'train' },
    { name: 'Paris Gare du Nord',lat: 48.8797, lng:  2.3550, type: 'train' },
  ],
  'East Midlands Railway-Nottingham': [
    { name: 'London St Pancras', lat: 51.5320, lng: -0.1271, type: 'train' },
    { name: 'Luton',             lat: 51.8793, lng: -0.4159, type: 'train' },
    { name: 'Leicester',         lat: 52.6358, lng: -1.1257, type: 'train' },
    { name: 'Nottingham',        lat: 52.9400, lng: -1.1431, type: 'train' },
  ],
  'East Midlands Railway-Leicester': [
    { name: 'London St Pancras', lat: 51.5320, lng: -0.1271, type: 'train' },
    { name: 'Luton',             lat: 51.8793, lng: -0.4159, type: 'train' },
    { name: 'Leicester',         lat: 52.6358, lng: -1.1257, type: 'train' },
  ],
  'East Midlands Railway-Derby': [
    { name: 'London St Pancras', lat: 51.5320, lng: -0.1271, type: 'train' },
    { name: 'Leicester',         lat: 52.6358, lng: -1.1257, type: 'train' },
    { name: 'Derby',             lat: 52.9166, lng: -1.4754, type: 'train' },
  ],
  'Thameslink-Luton Airport': [
    { name: 'London St Pancras', lat: 51.5320, lng: -0.1271, type: 'train' },
    { name: 'Farringdon',        lat: 51.5200, lng: -0.1046, type: 'train' },
    { name: 'Luton Airport',     lat: 51.8710, lng: -0.3930, type: 'train' },
  ],

  // ── Euston routes ────────────────────────────────────────────────────────
  'Avanti-Birmingham': [
    { name: 'London Euston',  lat: 51.5282, lng: -0.1337, type: 'train' },
    { name: 'Milton Keynes',  lat: 52.0409, lng: -0.7594, type: 'train' },
    { name: 'Birmingham',     lat: 52.4775, lng: -1.8993, type: 'train' },
  ],
  'Avanti-Manchester': [
    { name: 'London Euston',       lat: 51.5282, lng: -0.1337, type: 'train' },
    { name: 'Milton Keynes',       lat: 52.0409, lng: -0.7594, type: 'train' },
    { name: 'Crewe',               lat: 53.0906, lng: -2.4394, type: 'train' },
    { name: 'Manchester Piccadilly',lat: 53.4773, lng: -2.2309, type: 'train' },
  ],
  'Avanti-Liverpool': [
    { name: 'London Euston',       lat: 51.5282, lng: -0.1337, type: 'train' },
    { name: 'Crewe',               lat: 53.0906, lng: -2.4394, type: 'train' },
    { name: 'Liverpool Lime Street',lat: 53.4084, lng: -2.9916, type: 'train' },
  ],
  'London Northwestern-Crewe': [
    { name: 'London Euston',    lat: 51.5282, lng: -0.1337, type: 'train' },
    { name: 'Watford Junction', lat: 51.6658, lng: -0.3964, type: 'train' },
    { name: 'Rugby',            lat: 52.3677, lng: -1.2632, type: 'train' },
    { name: 'Crewe',            lat: 53.0906, lng: -2.4394, type: 'train' },
  ],
  'Avanti-Glasgow': [
    { name: 'London Euston',    lat: 51.5282, lng: -0.1337, type: 'train' },
    { name: 'Crewe',            lat: 53.0906, lng: -2.4394, type: 'train' },
    { name: 'Preston',          lat: 53.7632, lng: -2.7028, type: 'train' },
    { name: 'Glasgow Central',  lat: 55.8579, lng: -4.2573, type: 'train' },
  ],

  // ── Kings Cross Bus Stop routes ──────────────────────────────────────────
  'Route 46-Camden Town': [
    { name: 'Kings Cross Bus Stop', lat: 51.5302, lng: -0.1205, type: 'bus' },
    { name: 'Euston',               lat: 51.5282, lng: -0.1337, type: 'bus' },
    { name: 'Camden Town',          lat: 51.5393, lng: -0.1426, type: 'bus' },
  ],
  'Route 73-Angel': [
    { name: 'Kings Cross Bus Stop', lat: 51.5302, lng: -0.1205, type: 'bus' },
    { name: 'Russell Square',       lat: 51.5229, lng: -0.1230, type: 'bus' },
    { name: 'Angel',                lat: 51.5326, lng: -0.1057, type: 'bus' },
  ],
  'Route 30-Hackney Central': [
    { name: 'Kings Cross Bus Stop', lat: 51.5302, lng: -0.1205, type: 'bus' },
    { name: 'Angel',                lat: 51.5326, lng: -0.1057, type: 'bus' },
    { name: 'Dalston Junction',     lat: 51.5462, lng: -0.0754, type: 'bus' },
    { name: 'Hackney Central',      lat: 51.5456, lng: -0.0556, type: 'bus' },
  ],
  'Route 30-Islington': [
    { name: 'Kings Cross Bus Stop', lat: 51.5302, lng: -0.1205, type: 'bus' },
    { name: 'Angel',                lat: 51.5326, lng: -0.1057, type: 'bus' },
    { name: 'Islington',            lat: 51.5362, lng: -0.1035, type: 'bus' },
  ],

  // ── London Victoria routes ────────────────────────────────────────────────
  'Southern-Brighton': [
    { name: 'London Victoria',  lat: 51.4952, lng: -0.1441, type: 'train' },
    { name: 'Clapham Junction', lat: 51.4641, lng: -0.1706, type: 'train' },
    { name: 'Gatwick Airport',  lat: 51.1565, lng: -0.1608, type: 'train' },
    { name: 'Brighton',         lat: 50.8291, lng: -0.1415, type: 'train' },
  ],
  'Gatwick Express-Gatwick Airport': [
    { name: 'London Victoria', lat: 51.4952, lng: -0.1441, type: 'train' },
    { name: 'East Croydon',    lat: 51.3756, lng: -0.0988, type: 'train' },
    { name: 'Gatwick Airport', lat: 51.1565, lng: -0.1608, type: 'train' },
  ],
  'Southern-Eastbourne': [
    { name: 'London Victoria',  lat: 51.4952, lng: -0.1441, type: 'train' },
    { name: 'Clapham Junction', lat: 51.4641, lng: -0.1706, type: 'train' },
    { name: 'Haywards Heath',   lat: 51.0052, lng: -0.1025, type: 'train' },
    { name: 'Eastbourne',       lat: 50.7671, lng:  0.2833, type: 'train' },
  ],
  'Southeastern-Ramsgate': [
    { name: 'London Victoria', lat: 51.4952, lng: -0.1441, type: 'train' },
    { name: 'Chatham',         lat: 51.3879, lng:  0.5261, type: 'train' },
    { name: 'Faversham',       lat: 51.3133, lng:  0.8909, type: 'train' },
    { name: 'Ramsgate',        lat: 51.3357, lng:  1.4059, type: 'train' },
  ],

  // ── Liverpool Street routes ───────────────────────────────────────────────
  'Greater Anglia-Norwich': [
    { name: 'Liverpool Street', lat: 51.5178, lng: -0.0823, type: 'train' },
    { name: 'Chelmsford',       lat: 51.7364, lng:  0.4679, type: 'train' },
    { name: 'Colchester',       lat: 51.8959, lng:  0.8974, type: 'train' },
    { name: 'Ipswich',          lat: 52.0548, lng:  1.1549, type: 'train' },
    { name: 'Norwich',          lat: 52.6266, lng:  1.3092, type: 'train' },
  ],
  'Greater Anglia-Ipswich': [
    { name: 'Liverpool Street', lat: 51.5178, lng: -0.0823, type: 'train' },
    { name: 'Chelmsford',       lat: 51.7364, lng:  0.4679, type: 'train' },
    { name: 'Colchester',       lat: 51.8959, lng:  0.8974, type: 'train' },
    { name: 'Ipswich',          lat: 52.0548, lng:  1.1549, type: 'train' },
  ],
  'Greater Anglia-Chelmsford': [
    { name: 'Liverpool Street', lat: 51.5178, lng: -0.0823, type: 'train' },
    { name: 'Stratford',        lat: 51.5415, lng: -0.0042, type: 'train' },
    { name: 'Chelmsford',       lat: 51.7364, lng:  0.4679, type: 'train' },
  ],
  'c2c-Southend': [
    { name: 'Liverpool Street',   lat: 51.5178, lng: -0.0823, type: 'train' },
    { name: 'Barking',            lat: 51.5395, lng:  0.0807, type: 'train' },
    { name: 'Basildon',           lat: 51.5718, lng:  0.4570, type: 'train' },
    { name: 'Southend Victoria',  lat: 51.5454, lng:  0.7089, type: 'train' },
  ],
  'Elizabeth Line-Shenfield': [
    { name: 'Liverpool Street', lat: 51.5178, lng: -0.0823, type: 'train' },
    { name: 'Stratford',        lat: 51.5415, lng: -0.0042, type: 'train' },
    { name: 'Harold Wood',      lat: 51.5824, lng:  0.2286, type: 'train' },
    { name: 'Shenfield',        lat: 51.6246, lng:  0.3237, type: 'train' },
  ],

  // ── Victoria Coach Station routes ─────────────────────────────────────────
  'National Express-Oxford': [
    { name: 'Victoria Coach Station',  lat: 51.4961, lng: -0.1476, type: 'bus' },
    { name: 'Oxford Gloucester Green', lat: 51.7536, lng: -1.2555, type: 'bus' },
  ],
  'National Express-Birmingham': [
    { name: 'Victoria Coach Station',   lat: 51.4961, lng: -0.1476, type: 'bus' },
    { name: 'Coventry',                 lat: 52.4077, lng: -1.5055, type: 'bus' },
    { name: 'Birmingham Coach Station', lat: 52.4750, lng: -1.8900, type: 'bus' },
  ],
  'National Express-Manchester': [
    { name: 'Victoria Coach Station',   lat: 51.4961, lng: -0.1476, type: 'bus' },
    { name: 'Birmingham Coach Station', lat: 52.4750, lng: -1.8900, type: 'bus' },
    { name: 'Manchester Chorlton St',   lat: 53.4798, lng: -2.2341, type: 'bus' },
  ],
  'National Express-Bristol': [
    { name: 'Victoria Coach Station',  lat: 51.4961, lng: -0.1476, type: 'bus' },
    { name: 'Swindon',                 lat: 51.5553, lng: -1.7857, type: 'bus' },
    { name: 'Bristol Marlborough St',  lat: 51.4541, lng: -2.5980, type: 'bus' },
  ],
};

export function getServiceRoute(operator: string, destination: string): RouteStop[] {
  return MOCK_ROUTES[`${operator}-${destination}`] ?? [];
}
