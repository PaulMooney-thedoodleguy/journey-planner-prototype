import ModeIcon from '../components/icons/ModeIcon';
import { MODE_CONFIG } from '../config/brand';
import type { TransportMode, Severity } from '../types';

export function getTransportIcon(type: TransportMode, className = 'w-5 h-5') {
  return <ModeIcon mode={type} className={className} />;
}

export function getModeContainerClasses(type: TransportMode): string {
  const cfg = MODE_CONFIG[type as keyof typeof MODE_CONFIG];
  if (!cfg) return 'bg-brand-light text-brand';
  return `${cfg.bgClass} ${cfg.textClass}`;
}

/** Returns the raw hex colour for a transport mode, used for inline-style icon containers. */
export function getModeHex(type: TransportMode): string {
  const cfg = MODE_CONFIG[type as keyof typeof MODE_CONFIG];
  return cfg?.hex ?? '#374151';
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
