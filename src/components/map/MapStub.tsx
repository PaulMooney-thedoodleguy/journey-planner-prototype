import { Train, Bus } from 'lucide-react';
import type { MapViewProps } from '../../types';

export default function MapStub({ markers = [], onMarkerClick, height = '100%' }: MapViewProps) {
  return (
    <div className="relative w-full bg-gray-100" style={{ height }}>
      {/* Grid lines */}
      <div className="absolute inset-0">
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(y => (
          <div key={`h${y}`} className="absolute w-full border-t-2 border-gray-300" style={{ top: `${y}%` }} />
        ))}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => (
          <div key={`v${x}`} className="absolute h-full border-l-2 border-gray-300" style={{ left: `${x}%` }} />
        ))}
        <div className="absolute bg-green-200 rounded-lg opacity-40"
          style={{ top: '15%', left: '20%', width: '15%', height: '20%' }} />
        <div className="absolute bg-blue-300 opacity-50"
          style={{ top: '70%', left: 0, width: '100%', height: '3%', transform: 'rotate(-2deg)' }} />
      </div>

      <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded text-xs font-semibold text-gray-700">
        Central London
      </div>

      {markers.map(m => (
        <div
          key={m.id}
          onClick={() => onMarkerClick?.(m.id)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform duration-200"
          style={{ left: `${m.lng}%`, top: `${m.lat}%` }}
        >
          <div className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center bg-white border-2 ${
            m.type === 'train' ? 'border-indigo-600 hover:bg-indigo-50' : 'border-orange-500 hover:bg-orange-50'
          }`}>
            {m.type === 'train'
              ? <Train className="w-5 h-5 text-indigo-600" />
              : <Bus className="w-5 h-5 text-orange-500" />}
          </div>
          {m.label && (
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg text-xs font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10">
              {m.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
