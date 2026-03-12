import { createElement, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import type { RouteStop, TransportMode } from '../../types';
import { ICONS } from '../icons/ModeIcon';
import { getModeHex } from '../../utils/transport';

interface LiveTrackingMapProps {
  route: RouteStop[];
  vehiclePosition?: { lat: number; lng: number };
  direction?: string;
  stationName: string;
  stationType: TransportMode;
  height?: string;
}

// Auto-fit map to show the full route on mount/change
function FitRoute({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 13);
    }
  }, [map, positions]);
  return null;
}

// Cache icons by key to avoid repeated renderToStaticMarkup calls
const _stopIconCache  = new Map<string, L.DivIcon>();
const _vehicleIconCache = new Map<string, L.DivIcon>();

function stopIcon(stop: RouteStop, currentStationName: string) {
  const isCurrent = stop.name === currentStationName;
  const hex       = getModeHex(stop.type);
  const cacheKey  = `${stop.type}:${hex}:${isCurrent}`;
  if (_stopIconCache.has(cacheKey)) return _stopIconCache.get(cacheKey)!;

  const bg     = isCurrent ? '#22c55e' : 'white';
  const border = isCurrent ? '#16a34a' : hex;
  const ring   = isCurrent
    ? 'box-shadow:0 0 0 4px rgba(34,197,94,0.35),0 2px 8px rgba(0,0,0,0.2)'
    : 'box-shadow:0 2px 6px rgba(0,0,0,0.15)';

  // "You are here" — location pin instead of mode icon
  const svg = isCurrent
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>`
    : renderToStaticMarkup(createElement(ICONS[stop.type] ?? ICONS['train'], { size: 18, color: border }));

  const icon = L.divIcon({
    html: `<div style="width:34px;height:34px;border-radius:8px;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;${ring};">${svg}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -22],
  });
  _stopIconCache.set(cacheKey, icon);
  return icon;
}

function vehicleIcon(type: TransportMode) {
  if (_vehicleIconCache.has(type)) return _vehicleIconCache.get(type)!;

  const hex = getModeHex(type);
  const svg = renderToStaticMarkup(createElement(ICONS[type] ?? ICONS['train'], { size: 22, color: 'white' }));

  const icon = L.divIcon({
    html: `
      <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
        <div class="vehicle-pulse-ring" style="position:absolute;inset:0;background:${hex}47;border-radius:50%;"></div>
        <div style="width:40px;height:40px;background:${hex};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.3);border:3px solid white;position:relative;z-index:1;">
          ${svg}
          <div style="position:absolute;top:-2px;right:-2px;width:11px;height:11px;background:#4ade80;border-radius:50%;border:2px solid white;"></div>
        </div>
      </div>`,
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -30],
  });
  _vehicleIconCache.set(type, icon);
  return icon;
}

export default function LiveTrackingMap({
  route,
  vehiclePosition,
  stationName,
  stationType,
  height = 'min(500px, calc(100vh - 280px))',
}: LiveTrackingMapProps) {
  const positions: [number, number][] = route.map(s => [s.lat, s.lng]);
  const defaultCenter: [number, number] = positions[0] ?? [52.5, -1.5];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline */}
        {positions.length > 1 && (
          <Polyline positions={positions} color={getModeHex(stationType)} weight={3} dashArray="10 5" />
        )}

        {/* Stop markers */}
        {route.map((stop, idx) => (
          <Marker
            key={idx}
            position={[stop.lat, stop.lng]}
            icon={stopIcon(stop, stationName)}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <span className="font-medium text-sm">
                {stop.name}
                {stop.name === stationName && ' — You are here'}
              </span>
            </Tooltip>
            <Popup>
              <span className="font-medium text-sm">
                {stop.name}
                {stop.name === stationName && ' 📍 You are here'}
              </span>
            </Popup>
          </Marker>
        ))}

        {/* Live vehicle marker */}
        {vehiclePosition && (
          <Marker
            position={[vehiclePosition.lat, vehiclePosition.lng]}
            icon={vehicleIcon(stationType)}
            zIndexOffset={1000}
          >
            <Tooltip direction="top" offset={[0, -28]} opacity={1}>
              <span className="font-medium text-sm text-green-700">Live vehicle position</span>
            </Tooltip>
            <Popup>
              <span className="font-medium text-sm text-green-600">🟢 Live vehicle position</span>
            </Popup>
          </Marker>
        )}

        {/* Auto-fit to route */}
        <FitRoute positions={positions} />
      </MapContainer>
    </div>
  );
}
