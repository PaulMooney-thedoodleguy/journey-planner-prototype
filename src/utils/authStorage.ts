import type { UserProfile } from '../types';

const USER_KEY  = 'journey_planner_user';
const USERS_KEY = 'journey_planner_users';

export function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* storage full or unavailable */ }
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
}

export function loadUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { /* ignore */ }
}

export function clearAllAppData(): void {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem('journey_planner_tickets');
    localStorage.removeItem('journey_planner_saved_journeys');
  } catch { /* ignore */ }
}
