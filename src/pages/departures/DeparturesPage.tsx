import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { useDeparturesContext } from '../../context/DeparturesContext';
import PageShell from '../../components/layout/PageShell';
import { getTransportIcon } from '../../utils/transport';
import { MOCK_DEPARTURES } from '../../data/departures';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function DeparturesPage() {
  const navigate = useNavigate();
  const { nearbyStations, setSelectedStation } = useDeparturesContext();
  usePageTitle('Live Departures');

  const handleStationClick = async (station: typeof nearbyStations[0]) => {
    await setSelectedStation(station);
    navigate(`/departures/${station.id}`);
  };

  return (
    <PageShell>
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-8 h-8 text-brand" />
          <h1 className="text-3xl font-bold text-gray-900">Live Departures</h1>
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Nearby Stations & Stops</span>
          </div>
        </div>
        <div className="space-y-3">
          {nearbyStations.map(station => {
            const stationDeps = MOCK_DEPARTURES[station.id] ?? [];
            const hasLive = stationDeps.some(d => d.hasLiveTracking);
            return (
              <div
                key={station.id}
                onClick={() => handleStationClick(station)}
                className="border border-gray-200 rounded-lg p-4 hover:border-brand hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-light rounded-lg text-brand">
                      {getTransportIcon(station.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{station.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 capitalize">{station.type} • {station.distance}</p>
                        {hasLive && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live tracking available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
