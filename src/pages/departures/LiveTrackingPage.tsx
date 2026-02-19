import { useNavigate, useParams } from 'react-router-dom';
import { useDeparturesContext } from '../../context/DeparturesContext';
import LiveTrackingMap from '../../components/departures/LiveTrackingMap';
import PageShell from '../../components/layout/PageShell';
import { getServiceRoute } from '../../data/departures';

export default function LiveTrackingPage() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { selectedStation, trackedService } = useDeparturesContext();

  if (!trackedService || !selectedStation) {
    return (
      <PageShell>
        <button onClick={() => navigate(`/departures/${stationId}`)} className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
          ← Back to Departures
        </button>
        <p className="text-gray-600">Service data unavailable. Please select a service from the departures board.</p>
      </PageShell>
    );
  }

  const route = getServiceRoute(trackedService.operator, trackedService.destination);

  return (
    <PageShell>
      <button onClick={() => navigate(`/departures/${stationId}`)} className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
        ← Back to Departures
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Live Tracking</h1>
              <p className="text-gray-600 text-sm">{trackedService.operator} to {trackedService.destination}</p>
            </div>
          </div>
          <div className="text-right">
            {trackedService.platform && <p className="text-sm text-gray-500">Platform {trackedService.platform}</p>}
            <p className="text-lg font-bold">{trackedService.time}</p>
          </div>
        </div>
      </div>

      <LiveTrackingMap
        route={route}
        vehiclePosition={trackedService.vehiclePosition}
        direction={trackedService.direction}
        stationName={selectedStation.name}
        stationType={selectedStation.type}
        height="min(500px, calc(100vh - 280px))"
      />
    </PageShell>
  );
}
