import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import type { RouteStop, TransportMode } from '../../types';

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

function stopIcon(stop: RouteStop, currentStationName: string) {
  const isCurrent = stop.name === currentStationName;
  const isTrain   = stop.type === 'train';
  const bg        = isCurrent ? '#22c55e' : 'white';
  const border    = isCurrent ? '#16a34a' : (isTrain ? '#4f46e5' : '#f97316');
  const ring      = isCurrent ? 'box-shadow:0 0 0 4px rgba(34,197,94,0.35),0 2px 8px rgba(0,0,0,0.2)' : 'box-shadow:0 2px 6px rgba(0,0,0,0.15)';

  const svg = isCurrent
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>`
    : isTrain
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${border}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 2H8"/><path d="M12 2v5"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${border}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="16" height="12" rx="2"/><path d="M16 11h4l3 4v2h-7V11z"/><circle cx="5.5" cy="19" r="1.5"/><circle cx="18.5" cy="19" r="1.5"/></svg>`;

  return L.divIcon({
    html: `<div style="width:34px;height:34px;border-radius:8px;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;${ring};">${svg}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -22],
  });
}

function vehicleIcon(type: TransportMode) {
  const svg = type === 'train'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 2H8"/><path d="M12 2v5"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></svg>`
    : type === 'bus'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="16" height="12" rx="2"/><path d="M16 11h4l3 4v2h-7V11z"/><circle cx="5.5" cy="19" r="1.5"/><circle cx="18.5" cy="19" r="1.5"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3,11 22,2 13,21 11,13 3,11"/></svg>`;

  return L.divIcon({
    html: `
      <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
        <div class="vehicle-pulse-ring" style="position:absolute;inset:0;background:rgba(37,99,235,0.28);border-radius:50%;"></div>
        <div style="width:40px;height:40px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.3);border:3px solid white;position:relative;z-index:1;">
          ${svg}
          <div style="position:absolute;top:-2px;right:-2px;width:11px;height:11px;background:#4ade80;border-radius:50%;border:2px solid white;"></div>
        </div>
      </div>`,
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -30],
  });
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
          <Polyline positions={positions} color="#4f46e5" weight={3} dashArray="10 5" />
        )}

        {/* Stop markers */}
        {route.map((stop, idx) => (
          <Marker
            key={idx}
            position={[stop.lat, stop.lng]}
            icon={stopIcon(stop, stationName)}
          >
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
