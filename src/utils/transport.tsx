import { Train, Bus, Navigation } from 'lucide-react';
import type { TransportMode, Severity } from '../types';

export function getTransportIcon(type: TransportMode) {
  if (type === 'train') return <Train className="w-5 h-5" />;
  if (type === 'bus') return <Bus className="w-5 h-5" />;
  if (type === 'tube') return <Navigation className="w-5 h-5" />;
  if (type === 'multimodal') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
  return <Navigation className="w-5 h-5" />;
}

export function getSeverityColor(sev: Severity): string {
  const map: Record<Severity, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return map[sev] ?? 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getSeverityBadge(sev: Severity): string {
  const map: Record<Severity, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };
  return map[sev] ?? 'bg-gray-500';
}

export function getDirectionRotation(dir: string): number {
  const dirs: Record<string, number> = {
    north: 0, northeast: 45, east: 90, southeast: 135,
    south: 180, southwest: 225, west: 270, northwest: 315,
  };
  return dirs[dir] ?? 0;
}

export function getDurationMins(duration: string): number {
  const match = duration.match(/(?:(\d+)h\s*)?(\d+)m/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0');
  const mins = parseInt(match[2] ?? '0');
  return hours * 60 + mins;
}
