import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Search } from 'lucide-react';
import { useDeparturesContext } from '../../context/DeparturesContext';
import MapView from '../../components/map/MapView';
import LiveTrackingMap from '../../components/departures/LiveTrackingMap';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import { getTransportIcon, getModeContainerClasses } from '../../utils/transport';
import { MOCK_DEPARTURES, getServiceRoute } from '../../data/departures';
import { MAP_STATIONS } from '../../data/stations';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { MapMarker, Station, Departure } from '../../types';

/*
 * Z-index stacking order on this page:
 *   map tiles (z-auto)
 *   → BottomDrawer panel (z-1100)
 *   → UpdatePrompt (z-3000)
 *   → skip link focused (z-9999)
 *
 * BottomNav is fixed at z-50 (hidden on lg+ via lg:hidden in BottomNav).
 * On desktop (lg+) the BottomDrawer becomes a static left panel.
 */

type DepartureView = 'stations' | 'board' | 'tracking';

// Three-position drawer for stations and departure board views.
const DEPARTURES_SNAP_POINTS = [
  { vh: 0.12, label: 'Collapsed'  },
  { vh: 0.50, label: 'Half open'  },
  { vh: 0.92, label: 'Expanded'   },
];

// Single locked position for tracking view — shows only the compact service strip.
// One snap point means the drawer cannot be resized.
const TRACKING_SNAP_POINTS = [
  { vh: 0.20, label: 'Live tracking info' },
];

export default function DeparturesPage() {
  const { stationId, serviceKey } = useParams<{ stationId?: string; serviceKey?: string }>();
  const navigate = useNavigate();

  const {
    nearbyStations,
    selectedStation,
    setSelectedStation,
    departures,
    isDeparturesLoading,
    trackedService,
    setTrackedService,
  } = useDeparturesContext();

  // Derive the initial view from the URL so back-button and deep links work.
  const initialView: DepartureView =
    serviceKey ? 'tracking' : stationId ? 'board' : 'stations';

  const [view, setView] = useState<DepartureView>(initialView);

  // Track whether we've already hydrated from the URL on first mount.
  const hydratedRef = useRef(false);

  // ── Station search state ──────────────────────────────────────────────────

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHighlightedIndex, setSearchHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchListboxRef = useRef<HTMLUListElement>(null);

  const searchResults =
    searchQuery.length >= 2
      ? MAP_STATIONS.filter(s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8)
      : [];
  const isSearchDropdownVisible = isSearchOpen && searchResults.length > 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchOpen(true);
    setSearchHighlightedIndex(-1);
  };

  const handleSearchSelect = (station: typeof MAP_STATIONS[number]) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setSearchHighlightedIndex(-1);
    handleSelectStation(station);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchDropdownVisible) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchHighlightedIndex(i => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && searchHighlightedIndex >= 0) {
      e.preventDefault();
      handleSearchSelect(searchResults[searchHighlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchHighlightedIndex(-1);
    }
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!searchListboxRef.current?.contains(e.relatedTarget as Node)) {
      setIsSearchOpen(false);
      setSearchHighlightedIndex(-1);
    }
  };

  // Dynamic page title reflects the active view.
  const pageTitle =
    view === 'tracking' && trackedService
      ? `Live: ${trackedService.operator} to ${trackedService.destination}`
      : view === 'board' && selectedStation
      ? `${selectedStation.name} Departures`
      : 'Live Departures';
  usePageTitle(pageTitle);

  // ── URL hydration ─────────────────────────────────────────────────────────
  // Runs once nearbyStations is populated and when URL params change.
  // Avoids re-hydrating on every context update after the first mount.
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!stationId || nearbyStations.length === 0) return;

    const station = nearbyStations.find(s => s.id === Number(stationId));
    if (!station) return;

    hydratedRef.current = true;

    if (!selectedStation || selectedStation.id !== station.id) {
      setSelectedStation(station);
    }

    if (serviceKey) {
      const stationDeps = MOCK_DEPARTURES[station.id] ?? [];
      const dep = stationDeps.find(
        d => encodeURIComponent(`${d.operator}-${d.destination}`) === serviceKey
      );
      if (dep) {
        setTrackedService(dep);
        setView('tracking');
      } else {
        setView('board');
      }
    } else {
      setView('board');
    }
  }, [stationId, serviceKey, nearbyStations]);
  // Intentionally omitting selectedStation/setSelectedStation/setTrackedService
  // from deps — they are stable refs and including them causes re-hydration loops.

  // ── Station selection ─────────────────────────────────────────────────────

  const handleSelectStation = async (station: Station) => {
    await setSelectedStation(station);
    setView('board');
    navigate(`/departures/${station.id}`);
  };

  const handleMarkerClick = (id: string | number) => {
    const station = nearbyStations.find(s => s.id === id);
    if (station) handleSelectStation(station);
  };

  // ── Back to stations ──────────────────────────────────────────────────────

  const handleBackToStations = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setSearchHighlightedIndex(-1);
    setView('stations');
    setSelectedStation(null);
    navigate('/departures');
  };

  // ── Service tracking ──────────────────────────────────────────────────────

  const handleTrackService = (dep: Departure) => {
    if (!dep.hasLiveTracking || !selectedStation) return;
    setTrackedService(dep);
    const key = encodeURIComponent(`${dep.operator}-${dep.destination}`);
    setView('tracking');
    navigate(`/departures/${selectedStation.id}/track/${key}`);
  };

  const handleBackToBoard = () => {
    setTrackedService(null);
    setView('board');
    if (selectedStation) {
      navigate(`/departures/${selectedStation.id}`);
    } else {
      navigate('/departures');
    }
  };

  // ── Map markers ───────────────────────────────────────────────────────────

  const stationMarkers: MapMarker[] = nearbyStations
    .filter((s): s is Station & { lat: number; lng: number } =>
      s.lat !== undefined && s.lng !== undefined
    )
    .map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      type: s.type,
      label: s.name,
    }));

  // ── Tracking map data ─────────────────────────────────────────────────────

  const trackingRoute =
    trackedService && view === 'tracking'
      ? getServiceRoute(trackedService.operator, trackedService.destination)
      : [];

  // ── Derived UI ────────────────────────────────────────────────────────────

  const platformLabel = selectedStation?.type === 'bus' ? 'Route' : 'Platform';

  return (
    <PageShell fullHeight>
      {/*
       * Desktop (lg+): flex row — BottomDrawer becomes the left panel (420px),
       *   map fills the remaining right side.
       * Mobile: BottomDrawer is fixed above the BottomNav; this div is just a
       *   positioned container for the absolute-positioned map layer.
       */}
      <div className="absolute inset-0 lg:flex lg:flex-row">

        {/*
         * BottomDrawer — key forces a remount (and snap reset) when switching
         * between the departures panel and the compact tracking strip.
         *
         * 'departures' key: 3-position drawer, starts at half.
         * 'tracking'   key: locked single position (peek), shows service strip.
         */}
        <BottomDrawer
          key={view === 'tracking' ? 'tracking' : 'departures'}
          snapPoints={view === 'tracking' ? TRACKING_SNAP_POINTS : DEPARTURES_SNAP_POINTS}
          defaultSnapIndex={view === 'tracking' ? 0 : 1}
          aria-label={
            view === 'tracking' && trackedService
              ? `Live tracking: ${trackedService.operator} to ${trackedService.destination}`
              : 'Live departures'
          }
        >

          {/* ── Tracking strip ──────────────────────────────────────────── */}
          {view === 'tracking' && trackedService && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToBoard}
                  className="shrink-0 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-1 transition-colors"
                  aria-label="Back to departure board"
                >
                  ← Back
                </button>

                <div className="w-px h-8 bg-gray-200 shrink-0" aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">{trackedService.operator}</p>
                  <p className="font-semibold text-sm truncate">{trackedService.destination}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-bold text-base">{trackedService.time}</p>
                  {trackedService.platform !== null && (
                    <p className="text-xs text-gray-500">
                      {platformLabel} {trackedService.platform}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Stations view ────────────────────────────────────────────── */}
          {view === 'stations' && (
            <>
              <div className="px-4 pt-2 pb-3 border-b border-gray-100">

                {/* Station search — ARIA 1.2 combobox pattern */}
                <div className="relative mb-3">
                  <div
                    role="combobox"
                    aria-expanded={isSearchDropdownVisible}
                    aria-haspopup="listbox"
                    aria-owns={isSearchDropdownVisible ? "station-search-listbox" : undefined}
                  >
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        ref={searchInputRef}
                        id="station-search"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                        onBlur={handleSearchBlur}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search stations…"
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-controls={isSearchDropdownVisible ? "station-search-listbox" : undefined}
                        aria-activedescendant={
                          searchHighlightedIndex >= 0
                            ? `station-search-option-${searchHighlightedIndex}`
                            : undefined
                        }
                        className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent focus:outline-none w-full text-sm"
                      />
                    </div>
                  </div>

                  {isSearchDropdownVisible && (
                    <ul
                      ref={searchListboxRef}
                      id="station-search-listbox"
                      role="listbox"
                      aria-label="Station suggestions"
                      className="absolute z-[2100] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto"
                    >
                      {searchResults.map((station, i) => {
                        const isHighlighted = i === searchHighlightedIndex;
                        return (
                          <li
                            key={station.id}
                            id={`station-search-option-${i}`}
                            role="option"
                            aria-selected={isHighlighted}
                            onMouseDown={() => handleSearchSelect(station)}
                            className={`px-4 py-3 cursor-pointer flex items-center gap-3 ${
                              isHighlighted ? 'bg-brand text-white' : 'hover:bg-brand-light'
                            }`}
                          >
                            <span className={isHighlighted ? 'text-white' : 'text-brand'}>
                              {getTransportIcon(station.type)}
                            </span>
                            <span className="text-sm flex-1">{station.name}</span>
                            <span className={`text-xs capitalize ${isHighlighted ? 'text-white/70' : 'text-gray-400'}`}>
                              {station.type}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-brand shrink-0" aria-hidden="true" />
                  <h1 className="text-xl font-bold text-gray-900">Live Departures</h1>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Nearby stations and stops</span>
                </div>
              </div>

              <div className="px-4 py-3 space-y-2">
                {nearbyStations.map(station => {
                  const stationDeps = MOCK_DEPARTURES[station.id] ?? [];
                  const hasLive = stationDeps.some(d => d.hasLiveTracking);
                  return (
                    <button
                      key={station.id}
                      onClick={() => handleSelectStation(station)}
                      className="w-full text-left border border-gray-200 rounded-xl p-3.5 hover:border-brand hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-tint focus:border-transparent"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`shrink-0 p-2 ${getModeContainerClasses(station.type)} rounded-lg`}>
                            {getTransportIcon(station.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{station.name}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm text-gray-500 capitalize">
                                {station.type}{station.distance ? ` • ${station.distance}` : ''}
                              </p>
                              {hasLive && (
                                <span className="flex items-center gap-1 text-xs text-green-800 font-semibold">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                                  Live tracking
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Board view ────────────────────────────────────────────────── */}
          {view === 'board' && (
            <>
              <div className="px-4 pt-2 pb-3 border-b border-gray-100">
                <button
                  onClick={handleBackToStations}
                  className="text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-1 mb-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-tint rounded"
                >
                  ← Back to Stations
                </button>

                {selectedStation && (
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 p-2 ${getModeContainerClasses(selectedStation.type)} rounded-lg`}>
                      {getTransportIcon(selectedStation.type)}
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-lg font-bold truncate">{selectedStation.name}</h1>
                      <p className="text-sm text-gray-500">Live Departures</p>
                    </div>
                  </div>
                )}
              </div>

              {/* sr-only aria-live region — WCAG 4.1.3 */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {isDeparturesLoading
                  ? 'Loading departures…'
                  : departures.length === 0
                  ? 'No departures found'
                  : `${departures.length} departure${departures.length !== 1 ? 's' : ''} listed`}
              </div>

              {/* Column header */}
              <div className="bg-brand text-white px-4 py-2.5 sticky top-0">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs font-semibold uppercase tracking-wide">
                  <div>Time</div>
                  <div>Destination</div>
                  <div className="hidden sm:block">{platformLabel}</div>
                  <div>Status</div>
                </div>
              </div>

              {/* Departure rows */}
              <div className="divide-y">
                {isDeparturesLoading ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Loading departures…
                  </div>
                ) : departures.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No departures found
                  </div>
                ) : (
                  departures.map(dep => (
                    <div
                      key={`${dep.operator}-${dep.destination}-${dep.time}`}
                      onClick={() => handleTrackService(dep)}
                      role={dep.hasLiveTracking ? 'button' : undefined}
                      tabIndex={dep.hasLiveTracking ? 0 : undefined}
                      onKeyDown={
                        dep.hasLiveTracking
                          ? e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleTrackService(dep);
                              }
                            }
                          : undefined
                      }
                      aria-label={
                        dep.hasLiveTracking
                          ? `Track ${dep.operator} to ${dep.destination}, departs ${dep.time}, ${dep.status}`
                          : undefined
                      }
                      className={`px-4 py-3 transition-colors ${
                        dep.hasLiveTracking
                          ? 'hover:bg-brand-light cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-tint'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-center">
                        <div className="font-bold text-base">{dep.time}</div>

                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{dep.destination}</p>
                          <p className="text-xs text-gray-500 truncate">{dep.operator}</p>
                          {/* Platform chip — mobile only */}
                          <span className="sm:hidden inline-block mt-1 text-xs font-semibold text-brand bg-brand-light px-2 py-0.5 rounded">
                            {dep.platform !== null ? `${platformLabel} ${dep.platform}` : 'TBA'}
                          </span>
                        </div>

                        {/* Platform — desktop only */}
                        <div className="hidden sm:block font-semibold text-brand text-sm">
                          {dep.platform !== null ? `${platformLabel} ${dep.platform}` : '—'}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              dep.status === 'On time'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {dep.status}
                          </span>
                          {dep.hasLiveTracking && (
                            <span className="flex items-center gap-1 text-xs text-green-800 font-semibold">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        </BottomDrawer>

        {/* Map — mobile: absolute full-screen background; desktop: fills remaining right side */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          {view === 'tracking' && trackedService && selectedStation ? (
            <LiveTrackingMap
              route={trackingRoute}
              vehiclePosition={trackedService.vehiclePosition}
              direction={trackedService.direction}
              stationName={selectedStation.name}
              stationType={selectedStation.type}
              height="100%"
            />
          ) : (
            <MapView
              markers={stationMarkers}
              onMarkerClick={handleMarkerClick}
              height="100%"
              zoom={13}
            />
          )}
        </div>

      </div>
    </PageShell>
  );
}
