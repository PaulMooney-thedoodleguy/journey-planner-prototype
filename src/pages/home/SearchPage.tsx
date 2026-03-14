import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, Search, MapPin, Plus, Minus } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import { useAppContext } from '../../context/AppContext';
import MapView from '../../components/map/MapView';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import StationAutocomplete from '../../components/journey/StationAutocomplete';
import OutlinedField from '../../components/ui/OutlinedField';
import ModeFilter from '../../components/ui/ModeFilter';
import SavedJourneyCard from '../../components/journey/SavedJourneyCard';
import tflStops from '../../data/tfl-stops.json';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../../utils/recentSearches';
import type { JourneySearchParams, MapMarker, PassengerType, TransportMode } from '../../types';

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

const mapMarkers: MapMarker[] = tflStops.map(s => ({
  id: s.id,
  lat: s.lat,
  lng: s.lng,
  type: s.type as import('../../types').TransportMode,
  label: s.name,
}));

const JOURNEY_MODES: TransportMode[] = ['train', 'tube', 'bus', 'tram', 'ferry'];
const SEARCH_MODES_KEY = 'search-active-modes';

function loadSearchModes(): Set<TransportMode> {
  try {
    const stored = localStorage.getItem(SEARCH_MODES_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as TransportMode[];
      const valid = arr.filter(m => JOURNEY_MODES.includes(m));
      if (valid.length > 0) return new Set(valid);
    }
  } catch { /* ignore */ }
  return new Set<TransportMode>(JOURNEY_MODES);
}

const PASSENGER_LABELS: Record<PassengerType, string> = {
  adult:    'Adult',
  child:    'Child (50% off)',
  railcard: 'Railcard (1/3 off)',
};

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchParams, submitSearch, isSearching, searchError } = useJourneyContext();
  const { savedJourneys, removeSavedJourney, reorderSavedJourney } = useAppContext();
  usePageTitle('Plan Your Journey');

  const [localParams, setLocalParams] = useState<JourneySearchParams>({ ...searchParams });
  const [showVia, setShowVia] = useState(!!searchParams.via);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const [activeModes, setActiveModes] = useState<Set<TransportMode>>(loadSearchModes);

  // Pre-populate destination from router state (e.g. "Plan a journey" from map popup)
  useEffect(() => {
    const to = (location.state as { to?: string } | null)?.to;
    if (to) setLocalParams(prev => ({ ...prev, to }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist mode selection
  useEffect(() => {
    localStorage.setItem(SEARCH_MODES_KEY, JSON.stringify([...activeModes]));
  }, [activeModes]);

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
              <Navigation className="w-6 h-6 text-brand" aria-hidden="true" />
              <h1 className="text-xl font-bold text-gray-900">Plan Your Journey</h1>
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
                <div className="flex gap-2">
                  <StationAutocomplete
                    id="from-input"
                    label="From"
                    value={localParams.from}
                    onChange={v => updateField('from', v)}
                    errorId={formErrors.from ? 'from-error' : undefined}
                    hasError={!!formErrors.from}
                  />
                  <button onClick={swapLocations} aria-label="Swap departure and destination" title="Swap departure and destination" className="bg-brand-light hover:bg-brand-light text-brand p-3 rounded-lg transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
                {formErrors.from && <p id="from-error" role="alert" className="text-red-600 text-xs mt-1">{formErrors.from}</p>}
              </div>

              {/* Via — shown between From and To when toggled on */}
              {showVia && (
                <div>
                  <div className="flex gap-2">
                    <StationAutocomplete
                      id="via-input"
                      label="Via (optional)"
                      value={localParams.via ?? ''}
                      onChange={v => updateField('via', v)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowVia(false);
                        setLocalParams(prev => ({ ...prev, via: '' }));
                      }}
                      aria-label="Remove via stop"
                      title="Remove via stop"
                      className="bg-brand-light hover:bg-brand-light text-brand p-3 rounded-lg transition-colors shrink-0"
                    >
                      <Minus className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* To */}
              <div>
                <div className="flex gap-2">
                  <StationAutocomplete
                    id="to-input"
                    label="To"
                    value={localParams.to}
                    onChange={v => updateField('to', v)}
                    errorId={formErrors.to ? 'to-error' : undefined}
                    hasError={!!formErrors.to}
                  />
                  {!showVia && (
                    <button
                      type="button"
                      onClick={() => setShowVia(true)}
                      aria-label="Add via stop"
                      title="Add via stop"
                      className="bg-brand-light hover:bg-brand-light text-brand p-3 rounded-lg transition-colors shrink-0"
                    >
                      <Plus className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
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
                          title={`Remove recent search: ${s.from} to ${s.to}`}
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Date &amp; Time</span>
                  <button
                    type="button"
                    onClick={setNow}
                    className="text-xs text-brand hover:text-brand-hover font-medium transition py-1 min-h-[24px]"
                  >
                    Use current time
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <OutlinedField
                      id="date-input"
                      label="Date"
                      type="date"
                      value={localParams.date}
                      onChange={v => updateField('date', v)}
                      errorId={formErrors.date ? 'date-error' : undefined}
                      hasError={!!formErrors.date}
                    />
                    {formErrors.date && <p id="date-error" role="alert" className="text-red-600 text-xs mt-1">{formErrors.date}</p>}
                  </div>
                  <div>
                    <OutlinedField
                      id="time-input"
                      label="Time"
                      type="time"
                      value={localParams.time}
                      onChange={v => updateField('time', v)}
                      errorId={formErrors.time ? 'time-error' : undefined}
                      hasError={!!formErrors.time}
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
                        className="mr-2 w-6 h-6" />
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
                        className="mr-2 w-6 h-6" />
                      <span className="text-sm">{PASSENGER_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Transport modes */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Transport modes</span>
                <ModeFilter
                  availableModes={JOURNEY_MODES}
                  activeModes={activeModes}
                  onChange={setActiveModes}
                />
              </div>

              {searchError && (
                <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {searchError}
                </p>
              )}

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-niq-teal text-white py-4 rounded-lg font-semibold hover:bg-niq-teal-dark transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Search className="w-5 h-5" />
                {isSearching ? 'Searching…' : 'Search Journeys'}
              </button>
            </div>
          </div>

          {savedJourneys.length > 0 && (
            <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand" aria-hidden="true" />
                My Journeys
              </h2>
              <div className="space-y-2">
                {[...savedJourneys]
                  .sort((a, b) => a.order - b.order)
                  .map((sj, idx, arr) => (
                    <SavedJourneyCard
                      key={sj.id}
                      savedJourney={sj}
                      hasTicket={!!(sj.ticketId || sj.ticketGroupId)}
                      isFirst={idx === 0}
                      isLast={idx === arr.length - 1}
                      onMoveUp={() => reorderSavedJourney(sj.id, 'up')}
                      onMoveDown={() => reorderSavedJourney(sj.id, 'down')}
                      onDelete={() => removeSavedJourney(sj.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </BottomDrawer>

        {/* Map — mobile: absolute full-screen background; desktop: fills remaining right side */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          <MapView
            markers={mapMarkers}
            filterModes={JOURNEY_MODES}
            showBusStops={activeModes.has('bus')}
            activeModes={activeModes}
            onModeChange={setActiveModes}
            onSetDestination={(name) => updateField('to', name)}
            onViewDepartures={(id) => navigate(`/departures/${id}`)}
            height="100%"
          />
        </div>

      </div>
    </PageShell>
  );
}
