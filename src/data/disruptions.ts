import type { Disruption } from '../types';

export const MOCK_DISRUPTIONS: Disruption[] = [
  {
    id: 1,
    severity: 'critical',
    title: 'West Coast Main Line - Major Disruption',
    location: 'Between London Euston and Birmingham',
    description: 'Overhead wire damage causing severe delays. Rail replacement buses in operation.',
    operator: 'Avanti West Coast',
    updated: '2 hours ago',
    lat: 52.408,
    lng: -1.510,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5282, lng: -0.1337 }, // London Euston
      { lat: 52.0406, lng: -0.7594 }, // Milton Keynes
      { lat: 52.3719, lng: -1.2644 }, // Rugby
      { lat: 52.4081, lng: -1.5106 }, // Coventry
      { lat: 52.4781, lng: -1.8989 }, // Birmingham New Street
    ],
    affectedStops: [
      { name: 'London Euston',      lat: 51.5282, lng: -0.1337 },
      { name: 'Milton Keynes',      lat: 52.0406, lng: -0.7594 },
      { name: 'Rugby',              lat: 52.3719, lng: -1.2644 },
      { name: 'Coventry',           lat: 52.4081, lng: -1.5106 },
      { name: 'Birmingham New St',  lat: 52.4781, lng: -1.8989 },
    ],
    affectedRadius: 18000,
  },
  {
    id: 2,
    severity: 'high',
    title: 'Northern Line - Part Closure',
    location: 'Between Camden Town and Edgware',
    description: 'Signal failure. Services running with delays of up to 15 minutes.',
    operator: 'TfL',
    updated: '30 minutes ago',
    lat: 51.539,
    lng: -0.143,
    mode: 'tube',
    affectedRoute: [
      { lat: 51.5392, lng: -0.1426 }, // Camden Town
      { lat: 51.5552, lng: -0.1588 }, // Brent Cross
      { lat: 51.5745, lng: -0.1589 }, // Hendon Central
      { lat: 51.5942, lng: -0.1749 }, // Edgware
    ],
    affectedStops: [
      { name: 'Camden Town',    lat: 51.5392, lng: -0.1426 },
      { name: 'Brent Cross',    lat: 51.5552, lng: -0.1588 },
      { name: 'Hendon Central', lat: 51.5745, lng: -0.1589 },
      { name: 'Edgware',        lat: 51.5942, lng: -0.1749 },
    ],
    affectedRadius: 5500,
  },
  {
    id: 3,
    severity: 'medium',
    title: 'LNER Services - Minor Delays',
    location: 'London Kings Cross',
    description: 'Earlier incident now resolved. Some services running up to 10 minutes late.',
    operator: 'LNER',
    updated: '1 hour ago',
    lat: 51.5309,
    lng: -0.1233,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5309, lng: -0.1233 }, // Kings Cross
      { lat: 52.5735, lng: -0.2408 }, // Peterborough
      { lat: 53.9590, lng: -1.0815 }, // York
    ],
    affectedStops: [
      { name: 'Kings Cross',    lat: 51.5309, lng: -0.1233 },
      { name: 'Peterborough',   lat: 52.5735, lng: -0.2408 },
      { name: 'York',           lat: 53.9590, lng: -1.0815 },
    ],
    affectedRadius: 1800,
  },
  {
    id: 4,
    severity: 'medium',
    title: 'TransPennine Express - Engineering Works',
    location: 'Between Manchester Piccadilly and Leeds',
    description: 'Planned engineering works this weekend. Reduced timetable in operation.',
    operator: 'TransPennine Express',
    updated: '3 hours ago',
    lat: 53.545,
    lng: -1.547,
    mode: 'train',
    affectedRoute: [
      { lat: 53.4773, lng: -2.2309 }, // Manchester Piccadilly
      { lat: 53.4084, lng: -2.1575 }, // Stockport
      { lat: 53.5450, lng: -1.5469 }, // Huddersfield
      { lat: 53.7949, lng: -1.5490 }, // Leeds
    ],
    affectedStops: [
      { name: 'Manchester Piccadilly', lat: 53.4773, lng: -2.2309 },
      { name: 'Stockport',            lat: 53.4084, lng: -2.1575 },
      { name: 'Huddersfield',         lat: 53.5450, lng: -1.5469 },
      { name: 'Leeds',                lat: 53.7949, lng: -1.5490 },
    ],
    affectedRadius: 12000,
  },
  {
    id: 5,
    severity: 'low',
    title: 'Greater Manchester Metrolink - Minor Delays',
    location: 'Manchester City Centre',
    description: 'Minor congestion on the Altrincham and Bury lines. Expect delays of up to 5 minutes.',
    operator: 'Metrolink',
    updated: '15 minutes ago',
    lat: 53.4808,
    lng: -2.2426,
    mode: 'tram',
    affectedRoute: [
      { lat: 53.4808, lng: -2.2426 }, // Piccadilly Gardens
      { lat: 53.4842, lng: -2.2440 }, // Market Street
      { lat: 53.4879, lng: -2.2353 }, // Victoria
      { lat: 53.4791, lng: -2.2479 }, // St Peter's Square
    ],
    affectedStops: [
      { name: 'Piccadilly Gardens', lat: 53.4808, lng: -2.2426 },
      { name: 'Market Street',      lat: 53.4842, lng: -2.2440 },
      { name: 'Victoria',           lat: 53.4879, lng: -2.2353 },
      { name: "St Peter's Square",  lat: 53.4791, lng: -2.2479 },
    ],
    affectedRadius: 900,
  },
];
