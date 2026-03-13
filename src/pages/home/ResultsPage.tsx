import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Info, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import { useAppContext } from '../../context/AppContext';
import JourneyCard from '../../components/journey/JourneyCard';
import JourneyDetailPanel from '../../components/journey/JourneyDetailPanel';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import MapView from '../../components/map/MapView';
import { getDurationMins, getRoutePolyline } from '../../utils/transport';
import { getDisruptionsService } from '../../services/transport.service';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ROUTE_STATION_COORDS } from '../../data/stations';
import tflStops from '../../data/tfl-stops.json';
import type { Journey, Disruption, MapMarker } from '../../types';

type SortOption = 'departs' | 'fastest' | 'cheapest' | 'greenest';

const SORT_LABELS: Record<SortOption, string> = {
  departs: 'Departs soonest',
  fastest: 'Fastest',
  cheapest: 'Cheapest',
  greenest: 'Greenest',
};

const mapMarkers: MapMarker[] = tflStops.map(s => ({
  id: s.id,
  lat: s.lat,
  lng: s.lng,
  type: s.type as import('./../../types').TransportMode,
  label: s.name,
}));

export default function ResultsPage() {
  const navigate = useNavigate();
  const { journeyResults, searchParams, setSelectedJourney } = useJourneyContext();
  const { savedJourneys, addSavedJourney, removeSavedJourney } = useAppContext();

  const [expandedJourney, setExpandedJourney] = useState<Journey | null>(null);

  const getSavedId = (j: Journey): string | undefined =>
    savedJourneys.find(sj => sj.journeyData?.id === j.id && sj.date === searchParams.date)?.id;

  const handleSaveToggle = (j: Journey) => {
    const id = getSavedId(j);
    if (id) {
      removeSavedJourney(id);
    } else {
      addSavedJourney({
        id: crypto.randomUUID(),
        from: j.from,
        to: j.to,
        date: searchParams.date,
        departure: j.departure,
        arrival: j.arrival,
        duration: j.duration,
        type: j.type,
        operator: j.operator,
        changes: j.changes,
        order: Date.now(),
        savedAt: new Date().toISOString(),
        journeyData: j,
      });
    }
  };

  const handleExpand = (journey: Journey) => setExpandedJourney(journey);

  const handleBook = (journey: Journey) => {
    setSelectedJourney(journey);
    navigate('/checkout');
  };

  usePageTitle('Journey Results');

  const [sortBy, setSortBy] = useState<SortOption>('departs');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close the sort dropdown when the user clicks outside it
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);

  // Fetch all disruptions once — match to individual journeys when rendering
  useEffect(() => {
    getDisruptionsService()
      .then(svc => svc.getDisruptions())
      .then(setDisruptions)
      .catch(() => {}); // non-critical; silently ignore if unavailable
  }, []);

  // Pick exactly one winner per badge.
  // If multiple journeys tie on the primary criterion, prefer the one that also
  // wins on a secondary criterion (e.g. fastest-but-also-greenest beats plain fastest).
  // Falls back to the first tied candidate if secondaries don't break the tie.
  const pickWinner = (
    results: Journey[],
    primary: (j: Journey) => number,
    secondaries: Array<(j: Journey) => number>,
  ): number | null => {
    if (!results.length) return null;
    const best = Math.min(...results.map(primary));
    let candidates = results.filter(j => primary(j) === best);
    for (const sec of secondaries) {
      if (candidates.length === 1) break;
      const bestSec = Math.min(...candidates.map(sec));
      const narrowed = candidates.filter(j => sec(j) === bestSec);
      if (narrowed.length < candidates.length) candidates = narrowed;
    }
    return candidates[0].id;
  };

  const price    = (j: Journey) => j.price[searchParams.ticketType];
  const duration = (j: Journey) => getDurationMins(j.duration);
  const co2      = (j: Journey) => j.co2;

  const fastestId  = pickWinner(journeyResults, duration, [co2, price]);
  const cheapestId = pickWinner(journeyResults, price,    [co2, duration]);
  const greenestId = pickWinner(journeyResults, co2,      [duration, price]);

  // Sort a copy — badges always reflect the full set so sort order doesn't change badge assignment
  const sortedResults = [...journeyResults].sort((a, b) => {
    switch (sortBy) {
      case 'fastest':  return getDurationMins(a.duration) - getDurationMins(b.duration);
      case 'cheapest': return a.price[searchParams.ticketType] - b.price[searchParams.ticketType];
      case 'greenest': return a.co2 - b.co2;
      default:         return 0; // departs: preserve original mock order (departure time order)
    }
  });

  const getDisruptionForJourney = (journey: Journey): Disruption | null =>
    disruptions.find(d =>
      d.operator.toLowerCase() === journey.operator.toLowerCase() ||
      d.location.toLowerCase().includes(journey.from.toLowerCase()) ||
      d.location.toLowerCase().includes(journey.to.toLowerCase())
    ) ?? null;

  // Parse date as local time (append T00:00 to avoid UTC → local day shift)
  const displayDate = searchParams.date
    ? new Date(searchParams.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  // Centre the map on the origin station when coordinates are available
  const originStation = tflStops.find(
    s => s.name.toLowerCase() === searchParams.from.toLowerCase()
  );
  const mapCenter = originStation?.lat != null && originStation?.lng != null
    ? { lat: originStation.lat, lng: originStation.lng }
    : undefined;

  // Route polyline — computed from expanded journey's legs
  const routePolyline = expandedJourney?.legs
    ? getRoutePolyline(expandedJourney.legs)
    : [];

  // Waypoint markers for the selected journey, deduped by station name.
  // Prefer explicit leg coordinates (from real API); fall back to ROUTE_STATION_COORDS for mock data.
  const routeMarkers: MapMarker[] = expandedJourney?.legs
    ? Array.from(
        new Map(
          expandedJourney.legs.flatMap(leg => [
            [leg.from, { leg, name: leg.from, lat: leg.fromLat, lng: leg.fromLng }],
            [leg.to,   { leg, name: leg.to,   lat: leg.toLat,   lng: leg.toLng   }],
          ])
        ).values()
      ).flatMap(({ leg, name, lat, lng }) => {
        const coord = (lat && lng) ? { lat, lng } : ROUTE_STATION_COORDS[name];
        return coord ? [{ id: name, lat: coord.lat, lng: coord.lng, type: leg.mode, label: name }] : [];
      })
    : mapMarkers;

  return (
    <PageShell fullHeight>
      {/*
       * Desktop (lg+): flex row — BottomDrawer becomes the left panel (420px),
       *   map fills the remaining right side.
       * Mobile: BottomDrawer is fixed above the BottomNav; this div is just a
       *   positioned container for the absolute-positioned map layer.
       */}
      <div className="absolute inset-0 lg:flex lg:flex-row">

        {/* Results list / detail panel — mobile: draggable bottom sheet; desktop: static left panel */}
        <BottomDrawer
          key={expandedJourney ? 'detail' : 'list'}
          aria-label={expandedJourney ? 'Journey detail' : 'Journey results'}
        >
          {expandedJourney ? (
            <JourneyDetailPanel
              journey={expandedJourney}
              ticketType={searchParams.ticketType}
              disruption={getDisruptionForJourney(expandedJourney)}
              isSaved={!!getSavedId(expandedJourney)}
              onBack={() => setExpandedJourney(null)}
              onBook={() => handleBook(expandedJourney)}
              onToggleSave={() => handleSaveToggle(expandedJourney)}
            />
          ) : (
            <div className="p-4 sm:p-6 pb-8">
              <button
                onClick={() => navigate('/')}
                className="mb-4 py-1 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2"
              >
                ← Back to Search
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Available Journeys</h1>
                {journeyResults.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Eco-friendly options highlighted</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                {searchParams.from} → {searchParams.to} • {displayDate}
              </p>

              {/* Sort control — only shown when there are results to sort */}
              {journeyResults.length > 0 && (
                <div ref={sortRef} className="relative mb-6 inline-block">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                    aria-label={`Sort by: ${SORT_LABELS[sortBy]}`}
                    onClick={() => setSortOpen(o => !o)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 transition ${
                      sortOpen ? 'border-brand ring-2 ring-brand ring-offset-0' : 'border-gray-200 hover:border-brand'
                    }`}
                  >
                    <ArrowUpDown className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    {SORT_LABELS[sortBy]}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {sortOpen && (
                    <ul
                      role="listbox"
                      aria-label="Sort journeys by"
                      className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                    >
                      {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => {
                        const isSelected = sortBy === opt;
                        return (
                          <li
                            key={opt}
                            role="option"
                            aria-selected={isSelected}
                            onMouseDown={() => { setSortBy(opt); setSortOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm transition ${
                              isSelected ? 'bg-brand text-white' : 'text-gray-700 hover:bg-brand-light'
                            }`}
                          >
                            {SORT_LABELS[opt]}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* sr-only aria-live region — announces result count and active sort to screen readers */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {sortedResults.length > 0
                  ? `${sortedResults.length} journey${sortedResults.length !== 1 ? 's' : ''} available, sorted by ${SORT_LABELS[sortBy]}`
                  : ''}
              </div>

              {journeyResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-lg font-medium mb-2">No journeys found</p>
                  <p className="text-sm mb-6">Try adjusting your search or selecting a different date.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-niq-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-niq-teal-dark transition"
                  >
                    Back to Search
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedResults.map(j => (
                    <div key={j.id} className="relative">
                      <JourneyCard
                        journey={j}
                        ticketType={searchParams.ticketType}
                        isGreenest={j.id === greenestId}
                        isFastest={j.id === fastestId}
                        isCheapest={j.id === cheapestId}
                        onSelect={handleExpand}
                        disruption={getDisruptionForJourney(j)}
                      />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleSaveToggle(j); }}
                        aria-label={getSavedId(j) ? `Unsave: ${j.from} to ${j.to}` : `Save: ${j.from} to ${j.to}`}
                        title={getSavedId(j) ? `Unsave: ${j.from} to ${j.to}` : `Save: ${j.from} to ${j.to}`}
                        aria-pressed={!!getSavedId(j)}
                        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/90 shadow-sm border border-gray-200 hover:bg-white transition"
                      >
                        <Bookmark className={`w-4 h-4 ${getSavedId(j) ? 'fill-brand text-brand' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </BottomDrawer>

        {/* Map — mobile: absolute full-screen background; desktop: fills remaining right side.
            When a journey is expanded, FitBounds inside MapView handles centering. */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          <MapView
            markers={expandedJourney ? routeMarkers : mapMarkers}
            center={expandedJourney ? undefined : mapCenter}
            routePolyline={routePolyline}
            height="100%"
          />
        </div>

      </div>
    </PageShell>
  );
}
