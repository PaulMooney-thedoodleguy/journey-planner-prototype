import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeparturesContext } from '../../context/DeparturesContext';
import PageShell from '../../components/layout/PageShell';
import { getTransportIcon } from '../../utils/transport';

export default function DepartureBoardPage() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { nearbyStations, selectedStation, setSelectedStation, departures, isDeparturesLoading, setTrackedService } = useDeparturesContext();

  // Handle direct URL navigation — runs when stationId or station list changes
  useEffect(() => {
    if (!selectedStation || selectedStation.id !== Number(stationId)) {
      const station = nearbyStations.find(s => s.id === Number(stationId));
      if (station) setSelectedStation(station);
    }
  }, [stationId, nearbyStations, selectedStation, setSelectedStation]);

  const handleTrackService = (dep: typeof departures[0]) => {
    if (!dep.hasLiveTracking) return;
    setTrackedService(dep);
    navigate(`/departures/${stationId}/track/${encodeURIComponent(`${dep.operator}-${dep.destination}`)}`);
  };

  const platformLabel = selectedStation?.type === 'bus' ? 'Route' : 'Platform';

  return (
    <PageShell>
      <button onClick={() => navigate('/departures')} className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
        ← Back to Stations
      </button>

      {selectedStation && (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              {getTransportIcon(selectedStation.type)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{selectedStation.name}</h1>
              <p className="text-gray-600 text-sm">Live Departures</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header — 3 cols on mobile, 4 on sm+ */}
        <div className="bg-indigo-600 text-white p-3 sm:p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 text-sm font-semibold">
            <div>Time</div>
            <div>Destination</div>
            <div className="hidden sm:block">{platformLabel}</div>
            <div>Status</div>
          </div>
        </div>

        <div className="divide-y">
          {isDeparturesLoading ? (
            <div className="p-8 text-center text-gray-500">Loading departures…</div>
          ) : departures.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No departures found</div>
          ) : (
            departures.map((dep) => (
              <div
                key={`${dep.operator}-${dep.destination}-${dep.time}`}
                className={`p-3 sm:p-4 transition ${dep.hasLiveTracking ? 'hover:bg-indigo-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                onClick={() => handleTrackService(dep)}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                  <div className="font-bold text-base sm:text-lg">{dep.time}</div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">{dep.destination}</p>
                    <p className="text-sm text-gray-500 truncate">{dep.operator}</p>
                    {/* Platform shown inline on mobile only */}
                    <p className="sm:hidden text-xs font-semibold text-indigo-600 mt-0.5">
                      {dep.platform !== null ? `${platformLabel} ${dep.platform}` : ''}
                    </p>
                  </div>

                  {/* Platform column — desktop only */}
                  <div className="hidden sm:block font-semibold text-indigo-600">
                    {dep.platform !== null ? `${platformLabel} ${dep.platform}` : dep.operator}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${dep.status === 'On time' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {dep.status}
                    </span>
                    {dep.hasLiveTracking && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
