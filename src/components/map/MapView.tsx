import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { MapViewProps, TransportMode } from '../../types';

// Custom DivIcon for each transport mode — no default icon needed
function stationIcon(type: TransportMode) {
  const isTrain = type === 'train';
  const border = isTrain ? '#4f46e5' : '#f97316';
  const bg     = isTrain ? '#eef2ff' : '#fff7ed';
  const svg = isTrain
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${border}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 2H8"/><path d="M12 2v5"/>
        <circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>
        <path d="M5 21l1.5-3"/><path d="M19 21l-1.5-3"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${border}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="7" width="16" height="12" rx="2"/><path d="M16 11h4l3 4v2h-7V11z"/>
        <circle cx="5.5" cy="19" r="1.5"/><circle cx="18.5" cy="19" r="1.5"/>
       </svg>`;

  return L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:8px;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.18);">${svg}</div>`,
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
    : [51.515, -0.13]; // Central London default

  return (
    <div style={{ height }} className="w-full">
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
        {markers.map(m => (
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
    </div>
  );
}
