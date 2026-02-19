import type { PurchasedTicket } from '../types';

const STORAGE_KEY = 'journey_planner_tickets';

export function loadTickets(): PurchasedTicket[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PurchasedTicket[]) : [];
  } catch {
    return [];
  }
}

export function saveTickets(tickets: PurchasedTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch { /* silently ignore */ }
}
