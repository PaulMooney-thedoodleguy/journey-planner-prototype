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
