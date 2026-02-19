import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Search, MapPin } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import MapView from '../../components/map/MapView';
import PageShell from '../../components/layout/PageShell';
import { MAP_STATIONS } from '../../data/stations';
import type { JourneySearchParams, MapMarker } from '../../types';

const mapMarkers: MapMarker[] = MAP_STATIONS.map(s => ({
  id: s.id,
  lat: s.y ?? 50,
  lng: s.x ?? 50,
  type: s.type,
  label: s.name,
}));

export default function SearchPage() {
  const navigate = useNavigate();
  const { searchParams, setSearchParams, submitSearch, isSearching, searchError } = useJourneyContext();

  const [localParams, setLocalParams] = useState<JourneySearchParams>({ ...searchParams });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showMap, setShowMap] = useState(false);
  const [isFormAnimating, setIsFormAnimating] = useState(false);

  const updateField = (field: keyof JourneySearchParams, value: string) => {
    setLocalParams(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const swapLocations = () => {
    setLocalParams(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const handleToggleMap = () => {
    if (!showMap) {
      setIsFormAnimating(true);
      setTimeout(() => { setShowMap(true); setIsFormAnimating(false); }, 300);
    } else {
      setShowMap(false);
    }
  };

  const handleMapStationSelect = (stationId: string | number) => {
    const station = MAP_STATIONS.find(s => s.id === stationId);
    if (station) {
      updateField('to', station.name);
      setShowMap(false);
    }
  };

  const handleSearch = async () => {
    const errors: Record<string, string> = {};
    if (!localParams.from.trim()) errors.from = 'Please enter a departure location';
    if (!localParams.to.trim()) errors.to = 'Please select a destination';
    if (!localParams.date) errors.date = 'Please select a date';
    if (!localParams.time) errors.time = 'Please select a time';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const ok = await submitSearch(localParams);
    if (ok) navigate('/results');
  };

  const inputClass = (field: string) =>
    `flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${formErrors[field] ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <PageShell fullHeight>
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
        @keyframes scaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0); } }
        .form-enter { animation: scaleIn 0.3s ease-out forwards; }
        .form-exit { animation: scaleOut 0.3s ease-in forwards; }
      `}</style>

      {/* Map background */}
      <div className="absolute inset-0 pb-20 overflow-hidden">
        <MapView
          markers={mapMarkers}
          onMarkerClick={handleMapStationSelect}
          height="100%"
        />
        <div className="absolute bottom-24 left-4 z-50">
          <button
            onClick={handleToggleMap}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-indigo-700 transition cursor-pointer flex items-center gap-2"
          >
            {showMap || isFormAnimating
              ? <><Search className="w-5 h-5" />Show Form</>
              : <><MapPin className="w-5 h-5" />View Map</>}
          </button>
        </div>
      </div>

      {/* Journey Planner Form */}
      {(!showMap || isFormAnimating) && (
        <div className={`fixed inset-0 flex items-center justify-center z-30 pb-20 px-4 sm:px-6 ${isFormAnimating ? 'form-exit' : 'form-enter'}`}>
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Train className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">Plan Your Journey</h1>
              </div>

              <div className="space-y-6">
                {/* From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={localParams.from}
                      onChange={e => updateField('from', e.target.value)}
                      placeholder="e.g. London Kings Cross"
                      className={inputClass('from')}
                    />
                    <button onClick={swapLocations} aria-label="Swap departure and destination" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-3 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                  {formErrors.from && <p className="text-red-600 text-xs mt-1">{formErrors.from}</p>}
                </div>

                {/* To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={localParams.to}
                      onChange={e => updateField('to', e.target.value)}
                      placeholder="e.g. Manchester Piccadilly"
                      className={inputClass('to')}
                    />
                    <button onClick={handleToggleMap} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition flex items-center gap-2">
                      <MapPin className="w-5 h-5" /><span className="text-sm font-medium">Map</span>
                    </button>
                  </div>
                  {formErrors.to && <p className="text-red-600 text-xs mt-1">{formErrors.to}</p>}
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input type="date" value={localParams.date}
                        onChange={e => updateField('date', e.target.value)}
                        className={inputClass('date').replace('flex-1 ', '')} />
                      {formErrors.date && <p className="text-red-600 text-xs mt-1">{formErrors.date}</p>}
                    </div>
                    <div>
                      <input type="time" value={localParams.time}
                        onChange={e => updateField('time', e.target.value)}
                        className={inputClass('time').replace('flex-1 ', '')} />
                      {formErrors.time && <p className="text-red-600 text-xs mt-1">{formErrors.time}</p>}
                    </div>
                  </div>
                </div>

                {/* Ticket Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
                  <div className="flex gap-4">
                    {(['single', 'return'] as const).map(type => (
                      <label key={type} className="flex items-center cursor-pointer capitalize">
                        <input type="radio" value={type}
                          checked={localParams.ticketType === type}
                          onChange={() => updateField('ticketType', type)}
                          className="mr-2" />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                {searchError && (
                  <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {searchError}
                  </p>
                )}

                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Search className="w-5 h-5" />
                  {isSearching ? 'Searching…' : 'Search Journeys'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
