import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Search } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import MapView from '../../components/map/MapView';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import StationAutocomplete from '../../components/journey/StationAutocomplete';
import { MAP_STATIONS } from '../../data/stations';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../../utils/recentSearches';
import type { JourneySearchParams, MapMarker, PassengerType } from '../../types';

/*
 * Z-index stacking order on this page:
 *   map tiles (z-auto)
 *   → BottomDrawer panel (z-1100)
 *   → UpdatePrompt (z-3000)
 *   → skip link focused (z-9999)
 *
 * BottomNav is fixed at z-50 (hidden on lg+ via lg:hidden).
 * On desktop (lg+) the BottomDrawer becomes a static left panel inside
 * the lg:flex container; the map fills the remaining right side.
 */

const mapMarkers: MapMarker[] = MAP_STATIONS.map(s => ({
  id: s.id,
  lat: s.lat ?? 51.515,
  lng: s.lng ?? -0.13,
  type: s.type,
  label: s.name,
}));

const PASSENGER_LABELS: Record<PassengerType, string> = {
  adult:    'Adult',
  child:    'Child (50% off)',
  railcard: 'Railcard (1/3 off)',
};

export default function SearchPage() {
  const navigate = useNavigate();
  const { searchParams, submitSearch, isSearching, searchError } = useJourneyContext();
  usePageTitle('Plan Your Journey');

  const [localParams, setLocalParams] = useState<JourneySearchParams>({ ...searchParams });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());

  // Ref for programmatic focus on GDS error summary (WCAG 3.3.1)
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof JourneySearchParams, value: string) => {
    setLocalParams(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const swapLocations = () => {
    setLocalParams(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

  // Sets date and time to the current moment, rounded up to the next 5-minute boundary.
  // Uses local time components (not toISOString) to avoid UTC day-shift for UK users.
  const setNow = () => {
    const now = new Date();
    const rounded = new Date(Math.ceil(now.getTime() / (5 * 60_000)) * (5 * 60_000));
    const y  = rounded.getFullYear();
    const mo = String(rounded.getMonth() + 1).padStart(2, '0');
    const d  = String(rounded.getDate()).padStart(2, '0');
    const h  = String(rounded.getHours()).padStart(2, '0');
    const mi = String(rounded.getMinutes()).padStart(2, '0');
    updateField('date', `${y}-${mo}-${d}`);
    updateField('time', `${h}:${mi}`);
  };

  const applyRecentSearch = (from: string, to: string) => {
    setLocalParams(prev => ({ ...prev, from, to }));
    setFormErrors(prev => { const n = { ...prev }; delete n.from; delete n.to; return n; });
  };

  const dismissRecentSearch = (index: number) => {
    removeRecentSearch(index);
    setRecentSearches(getRecentSearches());
  };

  // Map is always visible behind the drawer — no showMap guard needed.
  // Tapping a station marker populates the "To" field.
  const handleMapStationSelect = (stationId: string | number) => {
    const station = MAP_STATIONS.find(s => s.id === stationId);
    if (station) updateField('to', station.name);
  };

  const handleSearch = async () => {
    const errors: Record<string, string> = {};
    if (!localParams.from.trim()) errors.from = 'Please enter a departure location';
    if (!localParams.to.trim()) errors.to = 'Please select a destination';
    if (!localParams.date) errors.date = 'Please select a date';
    if (!localParams.time) errors.time = 'Please select a time';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Defer focus until after React has re-rendered the error summary into the DOM
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    const ok = await submitSearch(localParams);
    if (ok) {
      addRecentSearch(localParams.from, localParams.to);
      setRecentSearches(getRecentSearches());
      navigate('/results');
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent focus:outline-none ${formErrors[field] ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <PageShell fullHeight>
      {/*
       * Desktop (lg+): flex row — BottomDrawer becomes the left panel (420px),
       *   map fills the remaining right side.
       * Mobile: BottomDrawer is fixed above the BottomNav; this div is just a
       *   positioned container for the absolute-positioned map layer.
       */}
      <div className="absolute inset-0 lg:flex lg:flex-row">

        {/* Search form — mobile: draggable bottom sheet; desktop: static left panel */}
        <BottomDrawer aria-label="Journey search">
          <div className="p-4 sm:p-6 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <Train className="w-8 h-8 text-brand" />
              <h1 className="text-3xl font-bold text-gray-900">Plan Your Journey</h1>
            </div>

            <div className="space-y-6">
              {/* GDS-style error summary — appears at top of form, receives focus on submit failure (WCAG 3.3.1) */}
              {Object.keys(formErrors).length > 0 && (
                <div
                  ref={errorSummaryRef}
                  aria-labelledby="error-summary-title"
                  tabIndex={-1}
                  className="bg-red-50 border border-red-400 rounded-lg p-4"
                >
                  <h2 id="error-summary-title" className="text-sm font-semibold text-red-800 mb-2">There is a problem</h2>
                  <ul className="space-y-1">
                    {Object.entries(formErrors).map(([field, msg]) => (
                      <li key={field}>
                        <a href={`#${field}-input`} className="text-sm text-red-700 underline hover:text-red-900">
                          {msg}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* From */}
              <div>
                <label htmlFor="from-input" className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="flex gap-2">
                  <StationAutocomplete
                    id="from-input"
                    value={localParams.from}
                    onChange={v => updateField('from', v)}
                    placeholder="e.g. London Kings Cross"
                    errorId={formErrors.from ? 'from-error' : undefined}
                    hasError={!!formErrors.from}
                    inputClassName={inputClass('from')}
                  />
                  <button onClick={swapLocations} aria-label="Swap departure and destination" className="bg-brand-light hover:bg-brand-light text-brand p-3 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
                {formErrors.from && <p id="from-error" role="alert" className="text-red-600 text-xs mt-1">{formErrors.from}</p>}
              </div>

              {/* To */}
              <div>
                <label htmlFor="to-input" className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <StationAutocomplete
                  id="to-input"
                  value={localParams.to}
                  onChange={v => updateField('to', v)}
                  placeholder="e.g. Manchester Piccadilly"
                  errorId={formErrors.to ? 'to-error' : undefined}
                  hasError={!!formErrors.to}
                  inputClassName={inputClass('to')}
                />
                {formErrors.to && <p id="to-error" role="alert" className="text-red-600 text-xs mt-1">{formErrors.to}</p>}
              </div>

              {/* Recent searches — shown below the To field when history exists */}
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Recent</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center bg-gray-100 rounded-lg text-xs text-gray-700 pl-3 pr-1 py-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => applyRecentSearch(s.from, s.to)}
                          className="hover:text-brand transition mr-1"
                        >
                          {s.from} → {s.to}
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissRecentSearch(i)}
                          aria-label={`Remove recent search: ${s.from} to ${s.to}`}
                          className="text-gray-400 hover:text-red-500 transition p-0.5 rounded leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time — "Use current time" shortcut resets to now rounded to next 5 mins */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="date-input" className="text-sm font-medium text-gray-700">Date & Time</label>
                  <button
                    type="button"
                    onClick={setNow}
                    className="text-xs text-brand hover:text-brand-hover font-medium transition"
                  >
                    Use current time
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      id="date-input"
                      type="date"
                      value={localParams.date}
                      onChange={e => updateField('date', e.target.value)}
                      aria-describedby={formErrors.date ? 'date-error' : undefined}
                      aria-invalid={!!formErrors.date}
                      className={inputClass('date')}
                    />
                    {formErrors.date && <p id="date-error" role="alert" className="text-red-600 text-xs mt-1">{formErrors.date}</p>}
                  </div>
                  <div>
                    <label htmlFor="time-input" className="sr-only">Time</label>
                    <input
                      id="time-input"
                      type="time"
                      value={localParams.time}
                      onChange={e => updateField('time', e.target.value)}
                      aria-describedby={formErrors.time ? 'time-error' : undefined}
                      aria-invalid={!!formErrors.time}
                      className={inputClass('time')}
                    />
                    {formErrors.time && <p id="time-error" role="alert" className="text-red-600 text-xs mt-1">{formErrors.time}</p>}
                  </div>
                </div>
              </div>

              {/* Ticket Type — fieldset/legend for screen reader group context (WCAG 1.3.1) */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</legend>
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
              </fieldset>

              {/* Passenger Type — fieldset/legend for screen reader group context (WCAG 1.3.1) */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="block text-sm font-medium text-gray-700 mb-2">Passenger Type</legend>
                <div className="flex flex-wrap gap-4">
                  {(Object.keys(PASSENGER_LABELS) as PassengerType[]).map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input type="radio" value={type}
                        checked={localParams.passengerType === type}
                        onChange={() => updateField('passengerType', type)}
                        className="mr-2" />
                      <span className="text-sm">{PASSENGER_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {searchError && (
                <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {searchError}
                </p>
              )}

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-brand text-white py-4 rounded-lg font-semibold hover:bg-brand-hover transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Search className="w-5 h-5" />
                {isSearching ? 'Searching…' : 'Search Journeys'}
              </button>
            </div>
          </div>
        </BottomDrawer>

        {/* Map — mobile: absolute full-screen background; desktop: fills remaining right side */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          <MapView
            markers={mapMarkers}
            onMarkerClick={handleMapStationSelect}
            height="100%"
          />
        </div>

      </div>
    </PageShell>
  );
}
