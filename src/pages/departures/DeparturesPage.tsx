import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Search } from 'lucide-react';
import { useDeparturesContext } from '../../context/DeparturesContext';
import MapView from '../../components/map/MapView';
import LiveTrackingMap from '../../components/departures/LiveTrackingMap';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import { getTransportIcon, getModeHex } from '../../utils/transport';
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

// Three positions for tracking view: compact peek / route visible / full.
const TRACKING_SNAP_POINTS = [
  { vh: 0.28, label: 'Collapsed'    },
  { vh: 0.65, label: 'Route visible' },
  { vh: 0.92, label: 'Full route'   },
];

export default function DeparturesPage() {
  const { stationId, serviceKey } = useParams<{ stationId?: string; serviceKey?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Context passed from TicketDetailPage — highlight the relevant departure row
  // and offer a direct back-link to the originating ticket.
  const fromTicketId  = searchParams.get('ticketId');
  const highlightTime = searchParams.get('depTime');
  const highlightOp   = searchParams.get('depOp')?.toLowerCase() ?? '';

  const highlightedRowRef = useRef<HTMLLIElement>(null);

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

  // Scroll the highlighted row into view once the board is rendered.
  useEffect(() => {
    if (view === 'board' && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, departures.length]);

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
      ? `${trackedService.hasLiveTracking ? 'Live: ' : ''}${trackedService.operator} to ${trackedService.destination}`
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
    if (!selectedStation) return;
    setTrackedService(dep);
    const key = encodeURIComponent(`${dep.operator}-${dep.destination}`);
    setView('tracking');
    const qs = fromTicketId ? `?ticketId=${fromTicketId}` : '';
    navigate(`/departures/${selectedStation.id}/track/${key}${qs}`);
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

  // ── Tracking: vehicle and boarding stop indices ───────────────────────────

  // Index of the route stop nearest to the vehicle's current position.
  const vehicleStopIndex = useMemo((): number => {
    if (!trackedService?.vehiclePosition || trackingRoute.length === 0) return -1;
    const vp = trackedService.vehiclePosition;
    let minSq = Infinity;
    let nearest = 0;
    trackingRoute.forEach((stop, i) => {
      const sq = (stop.lat - vp.lat) ** 2 + (stop.lng - vp.lng) ** 2;
      if (sq < minSq) { minSq = sq; nearest = i; }
    });
    return nearest;
  }, [trackedService?.vehiclePosition, trackingRoute]);

  // Index of the stop that matches the selected station (where the user wants to board).
  const boardingStopIndex = useMemo((): number => {
    if (!selectedStation || trackingRoute.length === 0) return -1;
    const name = selectedStation.name.toLowerCase();
    return trackingRoute.findIndex(s => {
      const sn = s.name.toLowerCase();
      return sn === name || sn.includes(name) || name.includes(sn);
    });
  }, [selectedStation, trackingRoute]);

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
          defaultSnapIndex={view === 'tracking' ? 1 : 1}
          aria-label={
            view === 'tracking' && trackedService
              ? `${trackedService.hasLiveTracking ? 'Live tracking: ' : 'Service info: '}${trackedService.operator} to ${trackedService.destination}`
              : 'Live departures'
          }
        >

          {/* ── Tracking panel ──────────────────────────────────────────── */}
          {view === 'tracking' && trackedService && selectedStation && (
            <div className="px-4 sm:px-6 pb-6">

              {/* Top bar: back + LIVE badge */}
              <div className="flex items-center gap-3 pt-3 pb-4">
                <button
                  onClick={fromTicketId
                    ? () => navigate(`/tickets/${fromTicketId}`)
                    : handleBackToBoard}
                  className="shrink-0 text-brand hover:text-brand-hover font-medium text-sm transition-colors"
                  aria-label={fromTicketId ? 'Back to ticket' : 'Back to departure board'}
                  title={fromTicketId ? 'Back to ticket' : 'Back to departure board'}
                >
                  {fromTicketId ? '← Back to Ticket' : '← Back'}
                </button>
                <div className="flex-1" />
                {trackedService.hasLiveTracking && (
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live</span>
                  </div>
                )}
              </div>

              {/* Service header */}
              <div className="flex items-start gap-3 pb-4 mb-4 border-b border-gray-100">
                <div
                  style={{ backgroundColor: 'white', border: `2px solid ${getModeHex(selectedStation.type)}`, color: getModeHex(selectedStation.type) }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {getTransportIcon(selectedStation.type, 'w-5 h-5')}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base leading-tight">
                    {trackingRoute[0]?.name ?? selectedStation.name} → {trackedService.destination}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{trackedService.operator}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="font-bold text-sm">{trackedService.time}</span>
                    {trackedService.platform !== null && (
                      <span
                        style={{ color: getModeHex(selectedStation.type), backgroundColor: `${getModeHex(selectedStation.type)}1a` }}
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                      >
                        {platformLabel} {trackedService.platform}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      !trackedService.hasLiveTracking
                        ? 'bg-gray-100 text-gray-500'
                        : trackedService.status === 'On time'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {trackedService.hasLiveTracking ? trackedService.status : 'Scheduled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route timeline */}
              {trackingRoute.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Full Route
                  </h2>
                  {trackingRoute.map((stop, idx) => {
                    const isLast = idx === trackingRoute.length - 1;
                    const phase: 'past' | 'vehicle' | 'upcoming' =
                      vehicleStopIndex === -1  ? 'upcoming' :
                      idx < vehicleStopIndex   ? 'past'     :
                      idx === vehicleStopIndex ? 'vehicle'  : 'upcoming';
                    const isBoarding = idx === boardingStopIndex;
                    const isPast     = phase === 'past';
                    const isVehicle  = phase === 'vehicle';

                    const dotFillClass =
                      isVehicle  ? 'bg-green-500 border-green-400'                                  :
                      isBoarding ? 'bg-brand border-brand ring-2 ring-brand/25'                    :
                      isPast     ? 'bg-gray-100 border-gray-300'                                    :
                                   'bg-white border-gray-300';

                    const nameClass =
                      isVehicle  ? 'text-sm font-semibold text-green-700'  :
                      isBoarding ? 'text-sm font-semibold text-brand'      :
                      isPast     ? 'text-sm text-gray-400'                 :
                                   'text-sm text-gray-700';

                    return (
                      <div key={idx} className="flex items-stretch gap-3">

                        {/* Spine + dot */}
                        <div className="flex flex-col items-center w-5 shrink-0">
                          {isVehicle ? (
                            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-400 animate-pulse mt-0.5 shrink-0" />
                          ) : (
                            <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${dotFillClass}`}>
                              {isPast && <span className="text-[7px] text-gray-400 leading-none">✓</span>}
                            </div>
                          )}
                          {!isLast && (
                            <div className={`w-px flex-1 my-0.5 ${isVehicle ? 'bg-green-200' : 'bg-gray-200'}`} />
                          )}
                        </div>

                        {/* Stop name + badges */}
                        <div className="flex-1 pb-3 flex items-start justify-between gap-2 min-w-0">
                          <span className={nameClass}>{stop.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {isVehicle && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                                Vehicle here
                              </span>
                            )}
                            {isBoarding && (
                              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                isPast
                                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                                  : 'text-brand bg-brand-light border-brand'
                              }`}>
                                {isPast ? 'Departed' : 'Board here'}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ── Stations view ────────────────────────────────────────────── */}
          {view === 'stations' && (
            <>
              <div className="px-4 sm:px-6 pt-2 pb-3 border-b border-gray-100">

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
                  <h1 className="text-2xl font-bold text-gray-900">Live Departures</h1>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Nearby stations and stops</span>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-3 space-y-2">
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
                          <div
                            style={{ backgroundColor: 'white', border: `2px solid ${getModeHex(station.type)}`, color: getModeHex(station.type) }}
                            className="shrink-0 p-2 rounded-lg"
                          >
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
              <div className="px-4 sm:px-6 pt-2 pb-3 border-b border-gray-100">
                <button
                  onClick={fromTicketId
                    ? () => navigate(`/tickets/${fromTicketId}`)
                    : handleBackToStations}
                  className="text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-1 mb-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-tint rounded"
                >
                  {fromTicketId ? '← Back to Ticket' : '← Back to Stations'}
                </button>

                {selectedStation && (
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: 'white', border: `2px solid ${getModeHex(selectedStation.type)}`, color: getModeHex(selectedStation.type) }}
                      className="shrink-0 p-2 rounded-lg"
                    >
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

              {/* Departure cards */}
              <ul className="px-4 sm:px-6 py-3 space-y-2 list-none">
                {isDeparturesLoading ? (
                  <li className="py-8 text-center text-gray-500 text-sm">
                    Loading departures…
                  </li>
                ) : departures.length === 0 ? (
                  <li className="py-8 text-center text-gray-500 text-sm">
                    No departures found
                  </li>
                ) : (
                  departures.map(dep => {
                    const isYourService = !!highlightTime &&
                      dep.time === highlightTime &&
                      dep.operator.toLowerCase() === highlightOp;

                    const isBus = selectedStation!.type === 'bus';
                    const serviceTitle = isBus
                      ? `${dep.operator} · Heading to ${dep.destination}`
                      : `${selectedStation!.name} to ${dep.destination}`;

                    const modeHex = getModeHex(selectedStation!.type);
                    const statusClass = !dep.hasLiveTracking
                      ? 'bg-gray-100 text-gray-500'
                      : dep.status === 'On time'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800';

                    return (
                      <li
                        key={`${dep.operator}-${dep.destination}-${dep.time}`}
                        ref={isYourService ? highlightedRowRef : undefined}
                      >
                        <button
                          onClick={() => handleTrackService(dep)}
                          aria-label={dep.hasLiveTracking
                            ? `Track ${serviceTitle}, departs ${dep.time}, ${dep.status}`
                            : `View service info: ${serviceTitle}, departs ${dep.time}, Scheduled`}
                          title={dep.hasLiveTracking
                            ? `Track ${serviceTitle}`
                            : `View service info: ${serviceTitle}`}
                          className={`w-full text-left rounded-xl border bg-white p-3.5 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-tint ${
                            isYourService
                              ? 'border-brand bg-brand-light/30'
                              : 'border-gray-200 hover:border-brand'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Mode icon */}
                            <div
                              style={{ backgroundColor: 'white', border: `2px solid ${modeHex}`, color: modeHex }}
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              aria-hidden="true"
                            >
                              {getTransportIcon(selectedStation!.type, 'w-4 h-4')}
                            </div>

                            {/* Main content */}
                            <div className="flex-1 min-w-0">
                              {/* Destination + time */}
                              <div className="flex items-baseline justify-between gap-3">
                                <p className="font-bold text-base leading-tight truncate text-gray-900">
                                  {serviceTitle}
                                </p>
                                <p className="font-bold text-lg shrink-0 tabular-nums text-gray-900">
                                  {dep.time}
                                </p>
                              </div>

                              {/* Operator + platform */}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {!isBus && <p className="text-sm text-gray-500">{dep.operator}</p>}
                                {dep.platform !== null && (
                                  <span
                                    style={{ color: modeHex, backgroundColor: `${modeHex}1a` }}
                                    className="text-xs font-semibold px-2 py-0.5 rounded"
                                  >
                                    {platformLabel} {dep.platform}
                                  </span>
                                )}
                              </div>

                              {/* Status + badges */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                                  {dep.hasLiveTracking ? dep.status : 'Scheduled'}
                                </span>
                                {dep.hasLiveTracking && (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                                    Live
                                  </span>
                                )}
                                {isYourService && (
                                  <span className="inline-flex items-center text-xs font-bold text-brand border border-brand bg-white px-2 py-0.5 rounded-full">
                                    Your service
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
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
