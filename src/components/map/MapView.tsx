import { useState, createElement, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, Circle, useMap } from 'react-leaflet';
import { SlidersHorizontal, X } from 'lucide-react';
import type { MapViewProps, TransportMode } from '../../types';
import ModeIcon, { ICONS } from '../icons/ModeIcon';
import { getModeHex } from '../../utils/transport';
import { MODE_CONFIG } from '../../config/brand';

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) map.fitBounds(points, { padding: [60, 60] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(points)]);
  return null;
}

/** Re-centres the map when center or zoom changes after initial mount. */
function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.25 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center[0], center[1], zoom]);
  return null;
}

/**
 * Leaflet DivIcon for a station marker — cached by type+colour to avoid
 * repeated renderToStaticMarkup calls when markers are re-rendered.
 */
const _iconCache = new Map<string, L.DivIcon>();

function stationIcon(type: TransportMode, colorOverride?: string) {
  const hex = colorOverride ?? getModeHex(type);
  const cacheKey = `${type}:${hex}`;
  if (_iconCache.has(cacheKey)) return _iconCache.get(cacheKey)!;

  const Icon = ICONS[type] ?? ICONS['train'];
  const svg = renderToStaticMarkup(createElement(Icon, { size: 20, color: hex }));

  const icon = L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:8px;background:white;border:2.5px solid ${hex};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.18);">${svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
  _iconCache.set(cacheKey, icon);
  return icon;
}

export default function MapView({
  markers = [],
  filterModes,
  activeModes: externalActiveModes,
  onModeChange,
  onMarkerClick,
  height = '100%',
  center,
  zoom,
  routePolyline = [],
  polylines = [],
  circles = [],
}: MapViewProps) {
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [51.515, -0.13];

  // When filterModes is provided, always show those modes in the filter UI.
  // Otherwise derive from whichever types are present in the marker data.
  const availableModes: TransportMode[] = filterModes ?? markers.reduce<TransportMode[]>((acc, m) => {
    if (!acc.includes(m.type)) acc.push(m.type);
    return acc;
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── Controlled vs uncontrolled ──────────────────────────────────────────
  // When activeModes + onModeChange are provided (controlled), the map filter
  // reads and writes that external state — keeping it in sync with the panel.
  // When not provided (uncontrolled), internal userDisabledModes is used.
  const isControlled = externalActiveModes !== undefined;

  const [userDisabledModes, setUserDisabledModes] = useState<Set<TransportMode>>(new Set());

  // effectiveActiveModes: external Set in controlled mode; derived Set otherwise
  const effectiveActiveModes: Set<TransportMode> = isControlled
    ? externalActiveModes
    : new Set(availableModes.filter(m => !userDisabledModes.has(m)));

  const allActive = availableModes.length > 0 && availableModes.every(m => effectiveActiveModes.has(m));

  const toggleMode = (mode: TransportMode) => {
    const next = new Set(effectiveActiveModes);
    if (next.has(mode)) {
      if (next.size === 1) return; // always keep at least one mode visible
      next.delete(mode);
    } else {
      next.add(mode);
    }
    if (isControlled) {
      onModeChange?.(next);
    } else {
      setUserDisabledModes(new Set(availableModes.filter(m => !next.has(m))));
    }
  };

  const handleSelectAll = () => {
    if (isControlled) {
      onModeChange?.(new Set(availableModes));
    } else {
      setUserDisabledModes(new Set());
    }
  };

  const visibleMarkers = markers.filter(m => effectiveActiveModes.has(m.type));

  // Only render the filter control when there are 2+ distinct modes in the data
  const showFilter = availableModes.length > 1;

  return (
    <div style={{ height }} className="w-full relative">

      {/* ── Leaflet map ──────────────────────────────────────────────────── */}
      <MapContainer
        center={mapCenter}
        zoom={zoom ?? 13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visibleMarkers.map(m => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={stationIcon(m.type, m.color)}
            title={m.label ?? m.type}
            eventHandlers={{ click: () => onMarkerClick?.(m.id) }}
          >
            {m.label && (
              <>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <span className="font-medium text-sm">{m.label}</span>
                </Tooltip>
                <Popup>
                  <span className="font-medium text-sm">{m.label}</span>
                </Popup>
              </>
            )}
          </Marker>
        ))}
        {/* Disruption area circles */}
        {circles.map(c => (
          <Circle
            key={c.id}
            center={[c.lat, c.lng]}
            radius={c.radius}
            pathOptions={{
              color: c.color,
              fillColor: c.color,
              fillOpacity: 0.10,
              weight: 1.5,
              opacity: 0.4,
              dashArray: '4 4',
            }}
          />
        ))}

        {/* Disruption / extra overlay polylines */}
        {polylines.map(pl => (
          <Polyline
            key={pl.id}
            positions={pl.points.map(p => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: pl.color,
              weight: pl.weight ?? 4,
              opacity: 0.75,
              dashArray: pl.dashed ? '8 6' : undefined,
            }}
          />
        ))}

        {/* Journey route polyline (brand colour, solid) */}
        {routePolyline.length >= 2 ? (
          <>
            <FitBounds points={routePolyline.map(p => [p.lat, p.lng] as [number, number])} />
            <Polyline
              positions={routePolyline.map(p => [p.lat, p.lng] as [number, number])}
              pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.85 }}
            />
          </>
        ) : (
          <SetView center={mapCenter} zoom={zoom ?? 13} />
        )}
      </MapContainer>

      {/* ── Mode filter overlay ──────────────────────────────────────────── */}
      {showFilter && routePolyline.length === 0 && (
        <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2">

          {/* More / Close toggle */}
          <button
            onClick={() => setIsFilterOpen(v => !v)}
            aria-expanded={isFilterOpen}
            aria-controls="map-mode-filter-panel"
            aria-label={
              isFilterOpen
                ? 'Close mode filter'
                : allActive
                ? 'Filter by transport mode'
                : `Filter by transport mode (${effectiveActiveModes.size} of ${availableModes.length} active)`
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            {isFilterOpen
              ? <X className="w-4 h-4" aria-hidden="true" />
              : <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            }
            <span>{isFilterOpen ? 'Close' : 'More'}</span>
          </button>

          {/* Expanded filter panel */}
          {isFilterOpen && (
            <div
              id="map-mode-filter-panel"
              className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2 flex flex-col gap-1.5 min-w-[130px]"
            >
              {/* All — activates every available mode */}
              <button
                onClick={handleSelectAll}
                aria-pressed={allActive}
                className={`flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
                  allActive
                    ? 'bg-brand text-white border-brand'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                All
              </button>

              {/* One toggle button per mode present in the marker data */}
              {availableModes.map(mode => {
                const hex = getModeHex(mode);
                const label = MODE_CONFIG[mode as keyof typeof MODE_CONFIG]?.label ?? mode;
                const isActive = effectiveActiveModes.has(mode);

                return (
                  <button
                    key={mode}
                    onClick={() => toggleMode(mode)}
                    aria-pressed={isActive}
                    style={isActive ? {
                      backgroundColor: 'white',
                      borderColor: hex,
                      color: hex,
                    } : {}}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
                      isActive
                        ? ''
                        : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <ModeIcon mode={mode} className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
