import { useState, useEffect } from 'react';
import { AlertTriangle, Info, MapPin } from 'lucide-react';
import { getDisruptionsService } from '../../services/transport.service';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import MapView from '../../components/map/MapView';
import { getSeverityColor, getSeverityBadge, getSeverityHex } from '../../utils/transport';
import ModeFilter from '../../components/ui/ModeFilter';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Disruption, MapMarker, MapPolyline, MapCircle, Severity, TransportMode } from '../../types';

const SEVERITIES: Array<'all' | Severity> = ['all', 'critical', 'high', 'medium', 'low'];

const DISRUPTION_MODES: TransportMode[] = ['train', 'tube', 'bus', 'tram', 'ferry'];
const STORAGE_KEY = 'updates-active-modes';

function loadActiveModes(): Set<TransportMode> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as TransportMode[];
      const valid = arr.filter(m => DISRUPTION_MODES.includes(m));
      if (valid.length > 0) return new Set(valid);
    }
  } catch { /* ignore */ }
  return new Set<TransportMode>(DISRUPTION_MODES);
}

// Zoom out enough to show England when no disruption is selected
const DEFAULT_CENTER = { lat: 52.5, lng: -1.5 };
const DEFAULT_ZOOM   = 7;

/** Map affectedRadius (metres) to a sensible zoom level. */
function radiusToZoom(metres: number): number {
  if (metres <  1500) return 14;
  if (metres <  4000) return 13;
  if (metres <  8000) return 12;
  if (metres < 20000) return 11;
  return 10;
}

export default function ServiceUpdatesPage() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | Severity>('all');
  const [activeModes, setActiveModes] = useState<Set<TransportMode>>(loadActiveModes);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  usePageTitle('Service Updates');

  const handleModeChange = (next: Set<TransportMode>) => setActiveModes(next);

  // Persist mode filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...activeModes]));
  }, [activeModes]);

  useEffect(() => {
    getDisruptionsService().then(s => s.getDisruptions().then(setDisruptions));
  }, []);

  const filtered = disruptions.filter(d => {
    const matchesSev = severity === 'all' || d.severity === severity;
    const matchesMode = activeModes.has(d.mode ?? 'train');
    const q = search.toLowerCase();
    const matchesSearch = !q
      || d.title.toLowerCase().includes(q)
      || d.location.toLowerCase().includes(q)
      || d.operator.toLowerCase().includes(q);
    return matchesSev && matchesMode && matchesSearch;
  });

  const selectedDisruption = disruptions.find(d => d.id === selectedId) ?? null;

  // Map center/zoom — radius-derived zoom when disruption selected; England overview otherwise
  const mapCenter = selectedDisruption?.lat && selectedDisruption?.lng
    ? { lat: selectedDisruption.lat, lng: selectedDisruption.lng }
    : DEFAULT_CENTER;
  const mapZoom = selectedDisruption
    ? radiusToZoom(selectedDisruption.affectedRadius ?? 5000)
    : DEFAULT_ZOOM;

  // All disruption markers filtered by active modes (used when nothing is selected).
  // Icons use mode colours; severity is conveyed by the list cards, circles, and polylines.
  const allDisruptionMarkers: MapMarker[] = disruptions
    .filter(d => d.lat != null && d.lng != null && activeModes.has(d.mode ?? 'train'))
    .map(d => ({
      id:    d.id,
      lat:   d.lat!,
      lng:   d.lng!,
      type:  d.mode ?? 'train',
      label: d.title,
    }));

  // When a disruption is selected, show affected-stop markers + the main pin
  const activeMarkers: MapMarker[] = selectedDisruption
    ? [
        // Affected stop markers
        ...(selectedDisruption.affectedStops ?? []).map(s => ({
          id:    `stop-${selectedDisruption.id}-${s.name}`,
          lat:   s.lat,
          lng:   s.lng,
          type:  selectedDisruption.mode ?? 'train' as const,
          label: s.name,
        })),
        // Keep the main disruption pin too (so it stays visible)
        ...(selectedDisruption.lat != null ? [{
          id:    selectedDisruption.id,
          lat:   selectedDisruption.lat!,
          lng:   selectedDisruption.lng!,
          type:  selectedDisruption.mode ?? 'train' as const,
          label: selectedDisruption.title,
        }] : []),
      ]
    : allDisruptionMarkers;

  // Dashed severity-coloured polyline for the affected route
  const activePolylines: MapPolyline[] = selectedDisruption?.affectedRoute?.length
    ? [{
        id:     `route-${selectedDisruption.id}`,
        points: selectedDisruption.affectedRoute,
        color:  getSeverityHex(selectedDisruption.severity),
        weight: 4,
        dashed: true,
      }]
    : [];

  // Semi-transparent circle for the affected area
  const activeCircles: MapCircle[] = selectedDisruption?.lat != null && selectedDisruption?.affectedRadius
    ? [{
        id:     `area-${selectedDisruption.id}`,
        lat:    selectedDisruption.lat!,
        lng:    selectedDisruption.lng!,
        radius: selectedDisruption.affectedRadius,
        color:  getSeverityHex(selectedDisruption.severity),
      }]
    : [];

  const handleCardClick = (id: number) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleMarkerClick = (id: string | number) => {
    setSelectedId(prev => (prev === id ? null : id as number));
  };

  const severityButtonClass = (sev: typeof SEVERITIES[0]) => {
    if (severity !== sev) return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200';
    if (sev === 'all')      return 'bg-brand text-white border-brand';
    if (sev === 'critical') return 'bg-red-500 text-white border-red-500';
    if (sev === 'high')     return 'bg-orange-500 text-white border-orange-500';
    if (sev === 'medium')   return 'bg-yellow-500 text-white border-yellow-500';
    return 'bg-blue-500 text-white border-blue-500';
  };

  return (
    <PageShell fullHeight>
      <div className="absolute inset-0 lg:flex lg:flex-row">

        {/* Updates panel */}
        <BottomDrawer aria-label="Service updates">
          <div className="p-4 sm:p-6 pb-8">

            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle className="w-6 h-6 text-brand shrink-0" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900">Service Updates</h1>
            </div>

            {/* Search */}
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by location, operator…"
              className="w-full px-4 py-2.5 mb-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-tint focus:border-transparent"
              aria-label="Search disruptions"
            />

            {/* Severity filter */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Severity</p>
              <div
                role="group"
                aria-label="Filter by severity"
                className="flex gap-2 flex-wrap"
              >
                {SEVERITIES.map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    aria-pressed={severity === sev}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${severityButtonClass(sev)}`}
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode filter */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mode</p>
              <ModeFilter
                availableModes={DISRUPTION_MODES}
                activeModes={activeModes}
                onChange={handleModeChange}
              />
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-500">No disruptions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(d => {
                  const isSelected = selectedId === d.id;
                  const severityHex = getSeverityHex(d.severity);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleCardClick(d.id)}
                      aria-pressed={isSelected}
                      className={`w-full text-left border-2 rounded-xl p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isSelected
                          ? 'shadow-md'
                          : 'hover:shadow-sm'
                      } ${getSeverityColor(d.severity)}`}
                      style={isSelected ? { borderColor: severityHex } : {}}
                    >
                      <div className="flex items-start gap-3">
                        {/* Severity dot */}
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${getSeverityBadge(d.severity)}`}
                          aria-hidden="true"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h2 className="font-bold text-sm leading-snug">{d.title}</h2>
                            <span
                              className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-white/60 shrink-0"
                              style={{ color: severityHex }}
                            >
                              {d.severity}
                            </span>
                          </div>

                          <p className="text-xs font-medium flex items-center gap-1 mb-1.5 opacity-80">
                            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {d.location}
                          </p>

                          <p className="text-xs mb-2 leading-relaxed">{d.description}</p>

                          <div className="flex items-center justify-between text-xs opacity-70">
                            <span className="font-medium">{d.operator}</span>
                            <span>Updated {d.updated}</span>
                          </div>
                        </div>
                      </div>

                      {/* "Shown on map" indicator when selected */}
                      {isSelected && d.lat && (
                        <div className="mt-2 pt-2 border-t border-current/20 flex items-center gap-1.5 text-xs font-medium opacity-80">
                          <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                          Showing on map
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </BottomDrawer>

        {/* Map — severity markers + affected route/area overlays on selection */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          <MapView
            markers={activeMarkers}
            filterModes={DISRUPTION_MODES}
            center={mapCenter}
            zoom={mapZoom}
            polylines={activePolylines}
            circles={activeCircles}
            onMarkerClick={handleMarkerClick}
            height="100%"
          />
        </div>

      </div>
    </PageShell>
  );
}
