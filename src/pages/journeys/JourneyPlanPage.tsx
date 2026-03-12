import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Map as MapIcon, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import MapView from '../../components/map/MapView';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatDate } from '../../utils/formatting';
import { getTransportIcon, getModeHex, getRoutePolyline } from '../../utils/transport';
import { ROUTE_STATION_COORDS } from '../../data/stations';
import type { JourneyLeg, MapMarker, PurchasedTicket } from '../../types';

export default function JourneyPlanPage() {
  const { savedJourneyId } = useParams();
  const navigate = useNavigate();
  const { savedJourneys, purchasedTickets } = useAppContext();
  usePageTitle('Journey Plan');

  const savedJourney = savedJourneys.find(sj => sj.id === savedJourneyId);

  if (!savedJourney) {
    return (
      <PageShell>
        <button onClick={() => navigate('/')} className="mb-4 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2">
          ← Back to Search
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Journey not found</h1>
        <p className="text-gray-600">This saved journey could not be found.</p>
      </PageShell>
    );
  }

  const journey = savedJourney.journeyData;
  const isMultiModal = !!savedJourney.ticketGroupId;

  const relatedTickets: PurchasedTicket[] = isMultiModal
    ? purchasedTickets.filter(t => t.multiModalGroup === savedJourney.ticketGroupId)
    : savedJourney.ticketId
      ? purchasedTickets.filter(t => t.id === savedJourney.ticketId)
      : [];

  const singleTicket = !isMultiModal && relatedTickets.length > 0 ? relatedTickets[0] : null;

  const ticketForLeg = (leg: JourneyLeg): PurchasedTicket | null => {
    if (!isMultiModal) return null;
    return relatedTickets.find(t => t.operator === leg.operator) ?? null;
  };

  const mode = savedJourney.type ?? 'train';
  const modeHex = getModeHex(mode);
  const noTicketModes = new Set(['walk', 'cycle']);

  const [expandedStops, setExpandedStops] = useState<Set<number>>(new Set());
  const toggleStops = (idx: number) => setExpandedStops(prev => {
    const next = new Set(prev);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    return next;
  });

  // Build route polyline + waypoint markers from journey legs
  const routePolyline = journey?.legs ? getRoutePolyline(journey.legs) : [];

  const routeMarkers: MapMarker[] = journey?.legs
    ? Array.from(
        new Map(
          journey.legs.flatMap(leg => [
            [leg.from, { leg, name: leg.from }],
            [leg.to,   { leg, name: leg.to   }],
          ])
        ).values()
      ).flatMap(({ leg, name }) => {
        const coord = ROUTE_STATION_COORDS[name];
        return coord ? [{ id: name, lat: coord.lat, lng: coord.lng, type: leg.mode, label: name }] : [];
      })
    : [];

  return (
    <PageShell fullHeight>
      <div className="absolute inset-0 lg:flex lg:flex-row">

        {/* Detail panel — mobile: draggable bottom sheet; desktop: static left panel */}
        <BottomDrawer aria-label="Journey plan">
          <div className="p-4 sm:p-6 pb-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2"
            >
              ← Back
            </button>

            {/* Journey header card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="rounded-lg flex items-center justify-center w-10 h-10 shrink-0"
                  style={{ backgroundColor: 'white', border: `2px solid ${modeHex}`, color: modeHex }}
                  aria-hidden="true"
                >
                  {getTransportIcon(mode, 'w-5 h-5')}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {savedJourney.from} → {savedJourney.to}
                  </h1>
                  {savedJourney.date && (
                    <p className="text-sm text-gray-500">
                      {formatDate(savedJourney.date)}
                      {savedJourney.departure && ` · ${savedJourney.departure}`}
                      {savedJourney.arrival && ` → ${savedJourney.arrival}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Journey meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                {savedJourney.duration && <span>{savedJourney.duration}</span>}
                {savedJourney.changes === 0 && <span>Direct</span>}
                {savedJourney.changes != null && savedJourney.changes > 0 && (
                  <span>{savedJourney.changes} change{savedJourney.changes !== 1 ? 's' : ''}</span>
                )}
                {savedJourney.operator && <span>{savedJourney.operator}</span>}
              </div>

              {/* Single-ticket CTA */}
              {singleTicket && (
                <Link
                  to={`/tickets/${singleTicket.id}`}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-brand text-brand font-semibold hover:bg-brand-light transition text-sm"
                >
                  <MapIcon className="w-4 h-4" aria-hidden="true" />
                  View Ticket
                </Link>
              )}
            </div>

            {/* Leg timeline */}
            {journey?.legs && journey.legs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Journey legs</h2>
                <div className="relative">
                  {/* Vertical spine — spans full height of the list */}
                  <div className="absolute left-[14px] top-5 bottom-5 w-0.5 bg-gray-200" aria-hidden="true" />

                  <ol className="space-y-0">
                    {journey.legs.map((leg, idx) => {
                      const legTicket = ticketForLeg(leg);
                      const legModeHex = getModeHex(leg.mode);
                      const isWalkOrCycle = noTicketModes.has(leg.mode);
                      const isExpanded = expandedStops.has(idx);

                      return (
                        <li key={idx} className="relative pl-10">
                          {/* Mode-coloured dot */}
                          <div
                            className="absolute left-[9px] top-1.5 w-3 h-3 rounded-full border-2 bg-white"
                            style={{ borderColor: legModeHex }}
                            aria-hidden="true"
                          />

                          <div className="pb-5">
                            <p className="text-sm font-semibold text-gray-900">
                              <span className="text-gray-500 mr-2">{leg.departure}</span>
                              {leg.from}
                              {leg.platform && (
                                <span className="ml-1 text-xs text-gray-500">(Plat. {leg.platform})</span>
                              )}
                            </p>

                            <div className="flex items-center gap-2 my-2">
                              <div
                                className="rounded-md flex items-center justify-center w-7 h-7 shrink-0"
                                style={{ backgroundColor: 'white', border: `2px solid ${legModeHex}`, color: legModeHex }}
                                aria-hidden="true"
                              >
                                {getTransportIcon(leg.mode, 'w-4 h-4')}
                              </div>
                              <span className="text-sm text-gray-600">
                                {leg.operator}
                                {leg.duration && ` · ${leg.duration}`}
                                {leg.stops != null && leg.stops > 0 && ` · ${leg.stops} stop${leg.stops !== 1 ? 's' : ''}`}
                              </span>

                              {legTicket && (
                                <Link
                                  to={`/tickets/${legTicket.id}`}
                                  className="ml-auto text-xs font-medium text-brand hover:text-brand-hover flex items-center gap-1 border border-brand rounded-md px-2 py-1 hover:bg-brand-light transition"
                                >
                                  <MapIcon className="w-3 h-3" aria-hidden="true" />
                                  Ticket
                                </Link>
                              )}
                              {isWalkOrCycle && (
                                <span className="ml-auto text-xs text-gray-400 italic">No ticket needed</span>
                              )}
                            </div>

                            {/* Intermediate stops — collapsed by default */}
                            {leg.intermediateStops && leg.intermediateStops.length > 0 && (
                              <div className="mt-1">
                                <button
                                  onClick={() => toggleStops(idx)}
                                  aria-expanded={isExpanded}
                                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
                                >
                                  <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                                  {isExpanded ? 'Hide' : 'Show'} {leg.intermediateStops.length} intermediate stop{leg.intermediateStops.length !== 1 ? 's' : ''}
                                </button>
                                {isExpanded && (
                                  <ul className="mt-1.5 space-y-1 pl-2 border-l-2 border-gray-100 ml-1">
                                    {leg.intermediateStops.map((stop, si) => (
                                      <li key={si} className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                        {stop}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}

                    {/* Final arrival stop — always has its own dot */}
                    {(() => {
                      const lastLeg = journey.legs![journey.legs!.length - 1];
                      const lastHex = getModeHex(lastLeg.mode);
                      return (
                        <li className="relative pl-10">
                          <div
                            className="absolute left-[9px] top-1.5 w-3 h-3 rounded-full border-2 bg-white"
                            style={{ borderColor: lastHex }}
                            aria-hidden="true"
                          />
                          <p className="text-sm font-semibold text-gray-900">
                            <span className="text-gray-500 mr-2">{lastLeg.arrival}</span>
                            {lastLeg.to}
                          </p>
                        </li>
                      );
                    })()}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </BottomDrawer>

        {/* Map — shows route polyline when legs have known coordinates */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          <MapView
            markers={routeMarkers}
            routePolyline={routePolyline}
            height="100%"
          />
        </div>

      </div>
    </PageShell>
  );
}
