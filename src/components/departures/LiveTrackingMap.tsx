import { Train, Bus, Navigation, MapPin } from 'lucide-react';
import type { RouteStop, TransportMode } from '../../types';
import { getDirectionRotation } from '../../utils/transport';

interface LiveTrackingMapProps {
  route: RouteStop[];
  vehiclePosition?: { x: number; y: number };
  direction?: string;
  stationName: string;
  stationType: TransportMode;
  height?: string;
}

function StopIcon({ type, isCurrent }: { type: TransportMode; isCurrent: boolean }) {
  if (isCurrent) return <MapPin className="w-5 h-5 text-white" />;
  if (type === 'train') return <Train className="w-5 h-5 text-indigo-600" />;
  if (type === 'bus') return <Bus className="w-5 h-5 text-orange-500" />;
  return <Navigation className="w-5 h-5 text-indigo-600" />;
}

export default function LiveTrackingMap({
  route, vehiclePosition, direction, stationName, stationType, height = '500px',
}: LiveTrackingMapProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height }}>
      <div className="relative w-full h-full bg-gray-100">
        {/* Grid */}
        <div className="absolute inset-0">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(y => (
            <div key={`h${y}`} className="absolute w-full border-t-2 border-gray-300" style={{ top: `${y}%` }} />
          ))}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => (
            <div key={`v${x}`} className="absolute h-full border-l-2 border-gray-300" style={{ left: `${x}%` }} />
          ))}
        </div>

        {/* Route polyline */}
        {route.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <polyline
              points={route.map(s => `${s.x}%,${s.y}%`).join(' ')}
              fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray="8,4"
            />
          </svg>
        )}

        {/* Station stops */}
        {route.map((stop, idx) => {
          const isCurrent = stop.name === stationName;
          return (
            <div key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${stop.x}%`, top: `${stop.y}%`, zIndex: 10 }}
            >
              <div className={isCurrent ? 'scale-125' : ''}>
                <div className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center border-2 ${
                  isCurrent ? 'bg-green-500 border-green-600 ring-4 ring-green-300'
                    : stop.type === 'train' ? 'bg-white border-indigo-600'
                    : 'bg-white border-orange-500'
                }`}>
                  <StopIcon type={stop.type} isCurrent={isCurrent} />
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {stop.name}{isCurrent && <span className="text-green-600 ml-1">📍</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live vehicle marker */}
        {vehiclePosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${vehiclePosition.x}%`, top: `${vehiclePosition.y}%`, zIndex: 20 }}
          >
            <style>{`@keyframes pulse-ring{0%{transform:scale(0.8);opacity:1}50%{transform:scale(1.2);opacity:0.7}100%{transform:scale(0.8);opacity:1}}`}</style>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 bg-blue-500 rounded-full opacity-30"
                style={{ animation: 'pulse-ring 2s ease-in-out infinite' }} />
              <div className="w-12 h-12 bg-blue-600 rounded-full shadow-xl flex items-center justify-center relative z-10 ring-4 ring-white">
                {stationType === 'train' ? <Train className="w-7 h-7 text-white" />
                  : stationType === 'bus' ? <Bus className="w-7 h-7 text-white" />
                  : <Navigation className="w-7 h-7 text-white" />}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  style={{ boxShadow: '0 0 10px rgba(34,197,94,0.8)' }} />
              </div>
              {direction && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: '-24px', left: '50%',
                    transform: `translateX(-50%) rotate(${getDirectionRotation(direction)}deg)`,
                    transformOrigin: 'center 30px', zIndex: 30,
                  }}
                >
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderBottom: '18px solid white',
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                  }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
