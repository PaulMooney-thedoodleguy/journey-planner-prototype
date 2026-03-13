import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Search, CalendarDays } from 'lucide-react';
import { useDeparturesContext } from '../../context/DeparturesContext';
import MapView from '../../components/map/MapView';
import LiveTrackingMap from '../../components/departures/LiveTrackingMap';
import TimetablePanel from '../../components/departures/TimetablePanel';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import { getTransportIcon, getModeHex } from '../../utils/transport';
import { MOCK_DEPARTURES, getServiceRoute, getRouteTimetable } from '../../data/departures';
import { MAP_STATIONS } from '../../data/stations';
import tflStops from '../../data/tfl-stops.json';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { MapMarker, Station, Departure, TransportMode, RouteStop, RouteTimetable, TimetableStop } from '../../types';

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

type DepartureView = 'stations' | 'board' | 'tracking' | 'timetable';

// ── TfL Timetable API types ───────────────────────────────────────────────────

interface TflTimetableInterval { stopId: string; timeToArrival: number; }
interface TflTimetableResponse {
  timetable?: {
    routes?: Array<{ stationIntervals: Array<{ id: string; intervals: TflTimetableInterval[] }> }>;
    // TfL uses arbitrary keys (period/day codes) — never rely on "All"
    departures?: Record<string, Array<{ stationIntervalId: string; time: string }>>;
  };
  stations?: Array<{ id: string; name: string }>;
}

// TfL canonical line IDs used by Route/Sequence and Timetable endpoints.
// Some lines (e.g. Elizabeth line) return a hex UUID as lineId in the Arrivals
// API, which those endpoints reject. We map the human-readable lineName instead.
const TFL_LINE_ID_MAP: Record<string, string> = {
  'elizabeth line':       'elizabeth-line',
  'london overground':    'overground',
  'tfl rail':             'elizabeth-line',
  'bakerloo':             'bakerloo',
  'central':              'central',
  'circle':               'circle',
  'district':             'district',
  'hammersmith & city':   'hammersmith-city',
  'jubilee':              'jubilee',
  'metropolitan':         'metropolitan',
  'northern':             'northern',
  'piccadilly':           'piccadilly',
  'victoria':             'victoria',
  'waterloo & city':      'waterloo-city',
  'dlr':                  'dlr',
};

/** Returns the canonical TfL line ID safe to use with Route/Sequence and Timetable. */
function canonicalLineId(lineId: string, operator: string): string {
  // Hex-only strings of 12+ chars are internal UUIDs — derive from line name instead
  if (/^[0-9a-f]{12,}$/i.test(lineId)) {
    const key = operator.toLowerCase();
    return TFL_LINE_ID_MAP[key] ?? key.replace(/\s+/g, '-').replace(/&/g, 'and');
  }
  return lineId;
}

function stripStationSuffix(name: string): string {
  return name
    .replace(/ Underground Station$/i, '')
    .replace(/ (Rail|DLR|Overground) Station$/i, '')
    .replace(/ Station$/i, '');
}

function ttMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function ttAdd(t: string, mins: number): string {
  const total = ttMins(t) + Math.round(mins);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Secondary name lookup: NaPTAN id → human-readable name from local tfl-stops.json.
// Covers stops that TfL's Timetable API omits from its own stations[] array.
const TFLSTOPS_NAME = new Map(tflStops.map(s => [s.id as string, s.name]));

// TfL's /Timetable endpoint returns stationIntervals (time offsets between stops)
// but the departures dictionary is always empty. We compute times from the live
// prediction time at the boarding stop + the offset delta for each route stop.
function buildTflTimetable(
  ttData: TflTimetableResponse,
  route: RouteStop[],
  selectedTime: string,   // live predicted arrival at boarding stop
  boardingName: string,
): { timetable: RouteTimetable; stopTimes: string[] } {
  const empty = { timetable: { stopNames: [], departureTimes: [], stops: [], selectedServiceIndex: 0 }, stopTimes: route.map(() => '') };

  const stationIntervalSets = ttData.timetable?.routes?.[0]?.stationIntervals ?? [];
  console.debug('[TfL Timetable] interval sets:', stationIntervalSets.length, '| departures keys:', Object.keys(ttData.timetable?.departures ?? {}));
  if (stationIntervalSets.length === 0) return empty;

  const stationsMap = new Map((ttData.stations ?? []).map(s => [s.id, stripStationSuffix(s.name)]));
  const boardingLower = boardingName.toLowerCase();

  // Pick the interval set that contains the boarding stop (fall back to first)
  const bestSet = stationIntervalSets.find(si =>
    si.intervals.some(iv => {
      const name = (stationsMap.get(iv.stopId) ?? '').toLowerCase();
      return name.includes(boardingLower) || boardingLower.includes(name);
    })
  ) ?? stationIntervalSets[0];

  const ttStops = bestSet.intervals.map(iv => ({
    name: stationsMap.get(iv.stopId) ?? TFLSTOPS_NAME.get(iv.stopId) ?? stripStationSuffix(iv.stopId),
    offsetMins: iv.timeToArrival,
  }));
  if (ttStops.length === 0) return empty;

  // Time offset of the boarding stop (0 if stop is the first/origin stop)
  const boardingOffset = ttStops.find(s => {
    const sn = s.name.toLowerCase();
    return sn.includes(boardingLower) || boardingLower.includes(sn);
  })?.offsetMins ?? 0;

  // Each stop's scheduled time = live prediction at boarding + (stopOffset - boardingOffset)
  const stops: TimetableStop[] = ttStops.map(s => ({
    name: s.name,
    times: [ttAdd(selectedTime, s.offsetMins - boardingOffset)],
  }));

  // Route timeline: try to match each route stop to a timetable stop by name
  const stopTimes = route.map(rs => {
    const rn = rs.name.toLowerCase();
    const match = ttStops.find(s => {
      const sn = s.name.toLowerCase();
      return sn === rn || sn.includes(rn) || rn.includes(sn);
    });
    return match !== undefined ? ttAdd(selectedTime, match.offsetMins - boardingOffset) : '';
  });

  console.debug('[TfL Timetable] stops:', ttStops.length, '| boardingOffset:', boardingOffset, '| stopTimes with data:', stopTimes.filter(Boolean).length);

  return {
    timetable: {
      stopNames: ttStops.map(s => s.name),
      departureTimes: [ttAdd(selectedTime, (ttStops[0]?.offsetMins ?? 0) - boardingOffset)],
      stops,
      selectedServiceIndex: 0,
    },
    stopTimes,
  };
}

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
    departuresError,
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
    view === 'timetable' && trackedService
      ? `Timetable: ${trackedService.operator} to ${trackedService.destination}`
      : view === 'tracking' && trackedService
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
    if (!stationId) return;

    const station: Station | undefined =
      nearbyStations.find(s => String(s.id) === stationId) ??
      (() => {
        const t = tflStops.find(s => String(s.id) === stationId);
        return t ? { id: t.id, name: t.name, type: t.type as TransportMode, lat: t.lat, lng: t.lng } : undefined;
      })();
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
    try {
      await setSelectedStation(station);
    } catch {
      // error is stored in context's departuresError; still switch to board
    }
    setView('board');
    navigate(`/departures/${station.id}`);
  };

  const handleMarkerClick = (id: string | number) => {
    handleViewDepartures(id);
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

  const allStopMarkers: MapMarker[] = tflStops.map(s => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    type: s.type as TransportMode,
    label: s.name,
  }));

  // ── Map-centre-aware station list ─────────────────────────────────────────
  // Updated on map moveend via onCenterChange; derives the 12 nearest TfL
  // stops from tflStops.json so the list always reflects the visible map area.

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 51.515, lng: -0.13 });

  const nearbyFromMap = useMemo<Station[]>(() => {
    const { lat: cLat, lng: cLng } = mapCenter;
    return [...tflStops]
      .map(s => ({ s, d2: (s.lat - cLat) ** 2 + (s.lng - cLng) ** 2 }))
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, 12)
      .map(({ s }) => ({ id: s.id, name: s.name, type: s.type as TransportMode, lat: s.lat, lng: s.lng }));
  }, [mapCenter]);

  // ── View departures handler ───────────────────────────────────────────────
  // Receives id from onMarkerClick, and id+name+type from popup onViewDepartures.
  // Falls back to constructing a minimal Station when the ID isn't in any
  // local JSON (e.g. bus stops from bus-stops.json / live TfL bus layer).

  const handleViewDepartures = (id: string | number, name?: string, type?: TransportMode) => {
    const fromNearby = nearbyStations.find(s => String(s.id) === String(id));
    if (fromNearby) { handleSelectStation(fromNearby); return; }
    const t = tflStops.find(s => String(s.id) === String(id));
    if (t) { handleSelectStation({ id: t.id, name: t.name, type: t.type as TransportMode, lat: t.lat, lng: t.lng }); return; }
    // Unknown stop (bus-stops.json / live TfL layer) — use popup-provided info
    if (name) handleSelectStation({ id, name, type: type ?? 'bus' });
  };

  // ── Route for the tracked service ────────────────────────────────────────
  // In real mode: fetch stop sequence from TfL /Line/{id}/Route/Sequence/{dir}.
  // In mock mode: look up in MOCK_ROUTES via getServiceRoute().

  const [liveRoute, setLiveRoute] = useState<RouteStop[]>([]);
  const [routeStopTimes, setRouteStopTimes] = useState<string[]>([]);
  const [liveTimetable, setLiveTimetable] = useState<RouteTimetable | null>(null);

  useEffect(() => {
    if (!trackedService) {
      setLiveRoute([]); setRouteStopTimes([]); setLiveTimetable(null);
      return;
    }

    if (!trackedService.lineId) {
      // Mock mode — use hardcoded route data; timetable from mock generator
      setLiveRoute(getServiceRoute(trackedService.operator, trackedService.destination));
      setRouteStopTimes([]);
      setLiveTimetable(null);
      return;
    }

    // Real TfL mode — fetch route sequence then timetable
    const dir = trackedService.direction === 'inbound' ? 'inbound' : 'outbound';
    const apiKey = import.meta.env.VITE_TFL_API_KEY ?? '';
    const mode = selectedStation?.type ?? 'tube';
    // Resolve canonical line ID — some lines (e.g. Elizabeth line) return a hex
    // UUID from the Arrivals API which Route/Sequence and Timetable reject.
    const lineId = canonicalLineId(trackedService.lineId, trackedService.operator);
    const depTime = trackedService.time;
    const boardingName = selectedStation?.name ?? '';

    (async () => {
      // ── 1. Route sequence ────────────────────────────────────────────────
      let route: RouteStop[] = [];
      let firstStopId: string | undefined;
      try {
        const seqData = await fetch(
          `https://api.tfl.gov.uk/Line/${lineId}/Route/Sequence/${dir}?app_key=${apiKey}`
        ).then(r => r.json()) as {
          stopPointSequences?: Array<{
            stopPoint: Array<{ id: string; topMostParentId?: string; name: string; lat: number; lon: number }>;
          }>;
        };

        const sequences = seqData.stopPointSequences ?? [];
        if (sequences.length === 0) { setLiveRoute([]); return; }

        const stationLower = boardingName.toLowerCase();
        const best = sequences.find(seq =>
          seq.stopPoint.some(s => {
            const sn = stripStationSuffix(s.name).toLowerCase();
            return sn.includes(stationLower) || stationLower.includes(sn);
          })
        ) ?? sequences[0];

        route = best.stopPoint.map(s => ({
          name: stripStationSuffix(s.name), lat: s.lat, lng: s.lon, type: mode,
        }));
        setLiveRoute(route);

        const firstStop = best.stopPoint[0];
        firstStopId = firstStop?.topMostParentId ?? firstStop?.id;
        console.debug('[TfL Route] stops:', route.length, '| firstStopId:', firstStopId);
      } catch (err) {
        console.error('[TfL Route] fetch failed:', err);
        setLiveRoute([]); setRouteStopTimes([]); setLiveTimetable(null);
        return;
      }

      // ── 2. Timetable — rail only, failure does not clear the route ──────
      if (mode === 'bus' || !firstStopId) { setRouteStopTimes([]); setLiveTimetable(null); return; }

      try {
        const ttData: TflTimetableResponse = await fetch(
          `https://api.tfl.gov.uk/Line/${lineId}/Timetable/${firstStopId}?app_key=${apiKey}`
        ).then(r => r.json());

        const { timetable: built, stopTimes } = buildTflTimetable(ttData, route, depTime, boardingName);
        console.debug('[TfL Timetable] built:', built.departureTimes.length, 'services |', stopTimes.filter(Boolean).length, 'stop times');
        setLiveTimetable(built.departureTimes.length > 0 ? built : null);
        setRouteStopTimes(stopTimes);
      } catch (err) {
        console.error('[TfL Timetable] fetch failed:', err);
        // Route is still visible — just no times
        setRouteStopTimes([]); setLiveTimetable(null);
      }
    })();
  }, [trackedService, selectedStation?.name, selectedStation?.type]);

  const trackingRoute = (view === 'tracking' || view === 'timetable') ? liveRoute : [];

  // ── Clock — ticks every 30 s so inferred vehicle position stays current ───
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Tracking: vehicle and boarding stop indices ───────────────────────────

  // Boarding stop index must be computed first — effectiveStopTimes uses it
  // to anchor estimated times at the right position in the route.
  const boardingStopIndex = useMemo((): number => {
    if (!selectedStation || trackingRoute.length === 0) return -1;
    const name = selectedStation.name.toLowerCase();
    return trackingRoute.findIndex(s => {
      const sn = s.name.toLowerCase();
      return sn === name || sn.includes(name) || name.includes(sn);
    });
  }, [selectedStation, trackingRoute]);

  // Effective stop times: real TfL interval data when available, otherwise
  // estimated at 2 min/stop anchored at the BOARDING STOP.
  // trackedService.time is the ETA at the boarding stop (from TfL Arrivals),
  // not the departure time from stop 0 — so we count back to stop 0 first.
  const effectiveStopTimes = useMemo((): string[] => {
    if (routeStopTimes.filter(Boolean).length >= 2) return routeStopTimes;
    const dep = trackedService?.time ?? '';
    if (!dep || trackingRoute.length === 0) return routeStopTimes;
    const [h, m] = dep.split(':').map(Number);
    const depMins = h * 60 + (m || 0);
    const anchor = boardingStopIndex >= 0 ? boardingStopIndex : 0;
    return trackingRoute.map((_, i) => {
      const mins = ((depMins + (i - anchor) * 2) % 1440 + 1440) % 1440;
      return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    });
  }, [routeStopTimes, trackedService?.time, trackingRoute, boardingStopIndex]);

  // Index of the route stop the vehicle is currently at / has just passed.
  // Converts the stop-time sequence to absolute minutes to handle midnight
  // crossings (e.g. 23:59 → 00:01 must be +2 min, not −1438 min).
  const vehicleStopIndex = useMemo((): number => {
    if (trackingRoute.length === 0) return -1;

    // Real GPS position takes priority
    if (trackedService?.vehiclePosition) {
      const vp = trackedService.vehiclePosition;
      let minSq = Infinity; let nearest = 0;
      trackingRoute.forEach((stop, i) => {
        const sq = (stop.lat - vp.lat) ** 2 + (stop.lng - vp.lng) ** 2;
        if (sq < minSq) { minSq = sq; nearest = i; }
      });
      return nearest;
    }

    if (effectiveStopTimes.length === 0) return -1;

    // Build absolute-minute values, adding 1440 whenever the sequence wraps midnight
    let offset = 0;
    let prevSm = -1;
    const absMins = effectiveStopTimes.map(t => {
      if (!t) return -1;
      const [hh, mm] = t.split(':').map(Number);
      let sm = hh * 60 + (mm || 0);
      if (prevSm >= 0 && sm < prevSm - 120) offset += 1440;
      sm += offset;
      prevSm = sm;
      return sm;
    });

    // If the schedule starts late at night but it's now early morning, add 24 h
    let nowMins = now.getHours() * 60 + now.getMinutes();
    const firstAbs = absMins.find(v => v >= 0) ?? 0;
    if (firstAbs >= 22 * 60 && nowMins < 6 * 60) nowMins += 1440;

    let last = -1;
    absMins.forEach((sm, i) => { if (sm >= 0 && sm <= nowMins) last = i; });
    return last;
  }, [trackedService?.vehiclePosition, trackingRoute, effectiveStopTimes, now]);

  // Vehicle position for the map: real GPS or the inferred stop's coordinates.
  const vehicleMapPosition = useMemo(() => {
    if (trackedService?.vehiclePosition) return trackedService.vehiclePosition;
    if (vehicleStopIndex >= 0 && trackingRoute[vehicleStopIndex]) {
      const s = trackingRoute[vehicleStopIndex];
      return { lat: s.lat, lng: s.lng };
    }
    return undefined;
  }, [trackedService?.vehiclePosition, vehicleStopIndex, trackingRoute]);

  // ── Timetable (derived when tracking a service) ───────────────────────────

  // Real mode: use live TfL timetable; mock mode: generate from ROUTE_CONFIG
  const timetable =
    trackedService && (view === 'timetable' || view === 'tracking')
      ? (trackedService.lineId
          ? liveTimetable
          : getRouteTimetable(trackedService.operator, trackedService.destination, trackedService.time))
      : null;

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
         * BottomDrawer — no key, so it never unmounts during view transitions.
         * Snap points swap in-place; the drawer smoothly resizes to the new
         * position without producing a grey flash between views.
         */}
        <BottomDrawer
          snapPoints={view === 'tracking' || view === 'timetable' ? TRACKING_SNAP_POINTS : DEPARTURES_SNAP_POINTS}
          defaultSnapIndex={1}
          aria-label={
            view === 'timetable' && trackedService
              ? `Timetable: ${trackedService.operator} to ${trackedService.destination}`
              : view === 'tracking' && trackedService
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

              {/* Timetable action */}
              {trackedService.lineId ? (
                // Real TfL mode: link out to TfL website (single-service only, no full grid)
                <div className="mb-4">
                  <a
                    href={`https://tfl.gov.uk/tube/timetable/${canonicalLineId(trackedService.lineId, trackedService.operator)}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80"
                    style={{ borderColor: getModeHex(selectedStation.type), color: getModeHex(selectedStation.type) }}
                  >
                    <CalendarDays className="w-4 h-4" aria-hidden="true" />
                    View full timetable on TfL ↗
                  </a>
                </div>
              ) : timetable ? (
                // Mock mode: open the in-app timetable viewer
                <div className="mb-4">
                  <button
                    onClick={() => setView('timetable')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition hover:opacity-80"
                    style={{ borderColor: getModeHex(selectedStation.type), color: getModeHex(selectedStation.type) }}
                  >
                    <CalendarDays className="w-4 h-4" aria-hidden="true" />
                    See timetable
                  </button>
                </div>
              ) : null}

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

                        {/* Stop name + time + badges */}
                        <div className="flex-1 pb-3 flex items-start justify-between gap-2 min-w-0">
                          <span className={nameClass}>{stop.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {/* Scheduled time at this stop */}
                            {effectiveStopTimes[idx] && (
                              <span className={`text-xs tabular-nums font-medium ${
                                isPast    ? 'text-gray-400 line-through' :
                                isVehicle ? 'text-green-700 font-semibold' :
                                isBoarding ? 'font-bold' :
                                            'text-gray-500'
                              }`}
                              style={isBoarding && !isPast ? { color: getModeHex(selectedStation!.type) } : undefined}
                              >
                                {effectiveStopTimes[idx]}
                              </span>
                            )}
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

          {/* ── Timetable panel ─────────────────────────────────────────── */}
          {view === 'timetable' && trackedService && selectedStation && timetable && (
            <TimetablePanel
              timetable={timetable}
              operator={trackedService.operator}
              destination={trackedService.destination}
              stationType={selectedStation.type}
              boardingStopName={selectedStation.name}
              onBack={() => setView('tracking')}
            />
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
                {nearbyFromMap.map(station => {
                  const stationDeps = MOCK_DEPARTURES[station.id as number] ?? [];
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
                ) : departuresError ? (
                  <li className="py-8 text-center text-sm">
                    <p className="text-red-600 font-medium mb-1">Failed to load departures</p>
                    <p className="text-gray-500 text-xs break-all px-4">{departuresError}</p>
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

                    const serviceTitle = `${dep.operator} to ${dep.destination}`;

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
          {(view === 'tracking' || view === 'timetable') && trackedService && selectedStation ? (
            <LiveTrackingMap
              route={trackingRoute}
              vehiclePosition={vehicleMapPosition}
              direction={trackedService.direction}
              stationName={selectedStation.name}
              stationType={selectedStation.type}
              height="100%"
            />
          ) : (
            <MapView
              markers={allStopMarkers}
              showBusStops
              showPopups={false}
              onViewDepartures={handleViewDepartures}
              onMarkerClick={handleMarkerClick}
              onCenterChange={setMapCenter}
              height="100%"
              zoom={13}
            />
          )}
        </div>

      </div>
    </PageShell>
  );
}
