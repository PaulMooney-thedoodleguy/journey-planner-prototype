import { useState, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SlidersHorizontal, X } from 'lucide-react';
import type { MapViewProps, TransportMode } from '../../types';
import ModeIcon, { ICONS } from '../icons/ModeIcon';
import { getModeHex } from '../../utils/transport';
import { MODE_CONFIG } from '../../config/brand';

/**
 * Leaflet DivIcon for a station marker.
 * Uses the same react-icons/md components as ModeIcon — single source of truth.
 * White bg + coloured border matches the card icon container style.
 */
function stationIcon(type: TransportMode) {
  const hex = getModeHex(type);
  const Icon = ICONS[type] ?? ICONS['train'];
  const svg = renderToStaticMarkup(createElement(Icon, { size: 20, color: hex }));

  return L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:8px;background:white;border:2.5px solid ${hex};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.18);">${svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

export default function MapView({
  markers = [],
  onMarkerClick,
  height = '100%',
  center,
  zoom,
}: MapViewProps) {
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [51.515, -0.13];

  // Derive unique transport modes from markers in first-seen order
  const availableModes = markers.reduce<TransportMode[]>((acc, m) => {
    if (!acc.includes(m.type)) acc.push(m.type);
    return acc;
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // All modes active by default; lazy initializer runs once on mount
  const [activeModes, setActiveModes] = useState<Set<TransportMode>>(
    () => new Set(availableModes)
  );

  const allActive = availableModes.every(m => activeModes.has(m));

  const toggleMode = (mode: TransportMode) => {
    setActiveModes(prev => {
      const next = new Set(prev);
      if (next.has(mode)) {
        if (next.size === 1) return prev; // always keep at least one mode visible
        next.delete(mode);
      } else {
        next.add(mode);
      }
      return next;
    });
  };

  const visibleMarkers = markers.filter(m => activeModes.has(m.type));

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
            icon={stationIcon(m.type)}
            eventHandlers={{ click: () => onMarkerClick?.(m.id) }}
          >
            {m.label && (
              <Popup>
                <span className="font-medium text-sm">{m.label}</span>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* ── Mode filter overlay ──────────────────────────────────────────── */}
      {showFilter && (
        <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2">

          {/* More / Close toggle */}
          <button
            onClick={() => setIsFilterOpen(v => !v)}
            aria-expanded={isFilterOpen}
            aria-label={isFilterOpen ? 'Close mode filter' : 'Filter by transport mode'}
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
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2 flex flex-col gap-1.5 min-w-[130px]">

              {/* All — activates every available mode */}
              <button
                onClick={() => setActiveModes(new Set(availableModes))}
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
                const isActive = activeModes.has(mode);

                return (
                  <button
                    key={mode}
                    onClick={() => toggleMode(mode)}
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
