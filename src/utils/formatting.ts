import type { PurchasedTicket, JourneyLeg } from '../types';

export function formatDate(isoDate: string): string {
  // Append T00:00 so the date is parsed as local midnight, not UTC midnight.
  // Without this, new Date('2026-02-18') is UTC 00:00 which displays as
  // Feb 17 for users in timezones west of UTC (e.g. BST after clocks change).
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB');
}

export function formatPrice(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function generateReference(): string {
  return 'UK' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export type TicketStatus = 'active' | 'today' | 'upcoming' | 'past';

export type LegStatus = 'past' | 'active' | 'upcoming';

export function getLegStatus(leg: JourneyLeg, date: string): LegStatus {
  if (!date) return 'upcoming';
  const [y, m, d] = date.split('-').map(Number);
  const legDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  legDate.setHours(0, 0, 0, 0);

  if (legDate < today) return 'past';
  if (legDate > today) return 'upcoming';

  // Same day — compare against leg times
  const now = new Date();
  const [depH, depM] = leg.departure.split(':').map(Number);
  const [arrH, arrM] = leg.arrival.split(':').map(Number);
  const dep = new Date(); dep.setHours(depH, depM, 0, 0);
  const arr = new Date(); arr.setHours(arrH, arrM, 0, 0);

  if (now >= dep && now <= arr) return 'active';
  if (now < dep) return 'upcoming';
  return 'past';
}

export function getTicketStatus(ticket: PurchasedTicket): TicketStatus {
  const [y, m, d] = ticket.date.split('-').map(Number);
  const ticketDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  ticketDate.setHours(0, 0, 0, 0);

  if (ticketDate < today) return 'past';
  if (ticketDate > today) return 'upcoming';

  // Same day — check departure/arrival
  const now = new Date();
  const [depH, depM] = ticket.journey.departure.split(':').map(Number);
  const [arrH, arrM] = ticket.journey.arrival.split(':').map(Number);
  const dep = new Date(); dep.setHours(depH, depM, 0, 0);
  const arr = new Date(); arr.setHours(arrH, arrM, 0, 0);

  if (now >= dep && now <= arr) return 'active';
  if (now < dep) return 'today';
  return 'past';
}
