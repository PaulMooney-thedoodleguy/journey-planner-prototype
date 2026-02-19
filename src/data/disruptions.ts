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
  },
  {
    id: 2,
    severity: 'high',
    title: 'Northern Line - Part Closure',
    location: 'Between Camden Town and Edgware',
    description: 'Signal failure. Services running with delays of up to 15 minutes.',
    operator: 'TfL',
    updated: '30 minutes ago',
  },
  {
    id: 3,
    severity: 'medium',
    title: 'LNER Services - Minor Delays',
    location: 'London Kings Cross',
    description: 'Earlier incident now resolved. Some services running up to 10 minutes late.',
    operator: 'LNER',
    updated: '1 hour ago',
  },
];
