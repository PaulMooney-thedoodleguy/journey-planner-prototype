import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ChevronRight, AlertTriangle, Leaf, Clock, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import MapView from '../../components/map/MapView';
import { getTransportIcon, getModeHex, lookupCoords } from '../../utils/transport';
import { formatDate, getTicketStatus } from '../../utils/formatting';
import { getDisruptionsService } from '../../services/transport.service';
import tflStops from '../../data/tfl-stops.json';
import { MAP_STATIONS } from '../../data/stations';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { TicketStatus } from '../../utils/formatting';
import type { PurchasedTicket, Disruption, MapMarker, MapPolyline, TransportMode } from '../../types';

const TICKET_MAP_MODES: TransportMode[] = ['train', 'tube', 'bus', 'tram', 'ferry'];

const allStopMarkers: MapMarker[] = tflStops.map(s => ({
  id: s.id,
  lat: s.lat,
  lng: s.lng,
  type: s.type as TransportMode,
  label: s.name,
}));

type GroupedItem =
  | { isGroup: true; tickets: PurchasedTicket[]; groupId: number }
  | { isGroup: false; ticket: PurchasedTicket };

function classifyItem(item: GroupedItem): TicketStatus {
  return 'ticket' in item ? getTicketStatus(item.ticket) : getTicketStatus(item.tickets[0]);
}

function StatusBadge({ status }: { status: TicketStatus }) {
  if (status === 'active') return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
      <span className="sr-only">Status: </span>Active Now
    </span>
  );
  if (status === 'today') return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand">
      <span className="sr-only">Status: </span>Today
    </span>
  );
  if (status === 'upcoming') return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
      <span className="sr-only">Status: </span>Upcoming
    </span>
  );
  return null;
}

function normalizeStation(s: string) {
  return s.toLowerCase().replace(/\b(london|station|bus stop|coach)\b/g, '').trim();
}

function findDepartureStationId(from: string): string | number | null {
  const key = normalizeStation(from);
  return MAP_STATIONS.find(s => {
    const n = normalizeStation(s.name);
    return n === key || n.includes(key) || key.includes(n);
  })?.id ?? null;
}

function getDisruptionForTicket(ticket: PurchasedTicket, disruptions: Disruption[]): Disruption | null {
  return disruptions.find(d =>
    d.operator.toLowerCase() === ticket.journey.operator.toLowerCase() ||
    d.location.toLowerCase().includes(ticket.journey.from.toLowerCase()) ||
    d.location.toLowerCase().includes(ticket.journey.to.toLowerCase())
  ) ?? null;
}

export default function TicketWalletPage() {
  const navigate = useNavigate();
  const { purchasedTickets } = useAppContext();
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [pastOpen, setPastOpen] = useState(true);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  usePageTitle('My Tickets');

  useEffect(() => {
    getDisruptionsService().then(s => s.getDisruptions().then(setDisruptions));
  }, []);

  const grouped = useMemo(() => {
    const result: GroupedItem[] = [];
    const processedGroups = new Set<number>();
    purchasedTickets.forEach(ticket => {
      if (ticket.isPartOfMultiModal && ticket.multiModalGroup != null) {
        if (!processedGroups.has(ticket.multiModalGroup)) {
          processedGroups.add(ticket.multiModalGroup);
          const groupTickets = purchasedTickets.filter(t => t.multiModalGroup === ticket.multiModalGroup);
          result.push({ isGroup: true, tickets: groupTickets, groupId: ticket.multiModalGroup });
        }
      } else {
        result.push({ isGroup: false, ticket });
      }
    });
    const todayActive = result.filter(i => ['active', 'today'].includes(classifyItem(i)));
    const upcoming    = result.filter(i => classifyItem(i) === 'upcoming');
    const past        = result.filter(i => classifyItem(i) === 'past');
    return { todayActive, upcoming, past };
  }, [purchasedTickets]);

  // Next departure today — for the hero card
  const { nextTicket, nextStationId } = useMemo(() => {
    const todayTickets = purchasedTickets.filter(t => {
      const s = getTicketStatus(t);
      return s === 'today' || s === 'active';
    });
    if (!todayTickets.length) return { nextTicket: null, nextStationId: null };
    const ticket = [...todayTickets].sort((a, b) =>
      a.journey.departure.localeCompare(b.journey.departure)
    )[0];
    return { nextTicket: ticket, nextStationId: findDepartureStationId(ticket.journey.from) };
  }, [purchasedTickets]);

  // Journey plan map data for the next/current ticket
  const journeyMapPolylines: MapPolyline[] = useMemo(() => {
    if (!nextTicket?.journey.legs) return [];
    return nextTicket.journey.legs.map((leg, i) => {
      const from = (leg.fromLat && leg.fromLng)
        ? { lat: leg.fromLat, lng: leg.fromLng }
        : lookupCoords(leg.from);
      const to = (leg.toLat && leg.toLng)
        ? { lat: leg.toLat, lng: leg.toLng }
        : lookupCoords(leg.to);
      const points = [from, to].filter(Boolean) as { lat: number; lng: number }[];
      return { id: i, points, color: getModeHex(leg.mode), weight: 5 };
    }).filter(p => p.points.length >= 2);
  }, [nextTicket]);

  const journeyMapMarkers: MapMarker[] = useMemo(() => {
    if (!nextTicket?.journey.legs) return [];
    return Array.from(
      new Map(
        nextTicket.journey.legs.flatMap(leg => [
          [leg.from, { leg, name: leg.from }],
          [leg.to,   { leg, name: leg.to   }],
        ])
      ).values()
    ).flatMap(({ leg, name }) => {
      const coord = (leg.fromLat && leg.from === name && leg.fromLng)
        ? { lat: leg.fromLat, lng: leg.fromLng }
        : (leg.toLat && leg.to === name && leg.toLng)
        ? { lat: leg.toLat, lng: leg.toLng }
        : lookupCoords(name);
      return coord ? [{ id: name, lat: coord.lat, lng: coord.lng, type: leg.mode, label: name }] : [];
    });
  }, [nextTicket]);

  // CO₂ saved vs driving across all tickets
  const co2Stats = useMemo(() => {
    const train = purchasedTickets.reduce((sum, t) => sum + (t.journey.co2 ?? 0), 0);
    const car   = purchasedTickets.reduce((sum, t) => sum + (t.journey.carCo2 ?? t.journey.co2 * 4), 0);
    return { train, car, saved: Math.max(0, car - train) };
  }, [purchasedTickets]);

  function renderItem(item: GroupedItem) {
    if (item.isGroup) {
      const isExpanded = expandedGroup === item.groupId;
      const first = item.tickets[0];
      const status = getTicketStatus(first);
      const disruption = getDisruptionForTicket(first, disruptions);
      return (
        <div key={`group-${item.groupId}`} className="border-2 border-brand rounded-xl p-6 bg-brand-light">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-brand-light rounded-lg">
              <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-lg text-content-primary">Multi-Modal Journey</p>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm text-brand">{item.tickets.length} tickets required</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div><p className="text-sm text-gray-500">From</p><p className="font-semibold">{first.journey.from}</p></div>
            <div><p className="text-sm text-gray-500">To</p><p className="font-semibold">{first.journey.to}</p></div>
            <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{formatDate(first.date)}</p></div>
            <div><p className="text-sm text-gray-500">Departure</p><p className="font-semibold">{first.journey.departure}</p></div>
          </div>

          {disruption && (
            <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span><span className="font-semibold">Disruption: </span>{disruption.title}</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {item.tickets.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: `${t.operatorColor}20`, border: `2px solid ${t.operatorColor}` }}>
                <span className="text-lg">{t.operatorLogo}</span>
                <span className="font-semibold" style={{ color: t.operatorColor }}>{t.operator}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setExpandedGroup(isExpanded ? null : item.groupId)}
            className="w-full bg-niq-teal text-white py-3 rounded-lg font-semibold hover:bg-niq-teal-dark transition flex items-center justify-center gap-2">
            {isExpanded ? 'Hide Individual Tickets' : 'View Individual Tickets'}
            <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          {isExpanded && (
            <div className="mt-4 space-y-3 pt-4 border-t border-brand-light">
              {item.tickets.map(t => (
                <div key={t.id}
                  className="border-2 rounded-xl p-4 bg-white hover:shadow-md transition cursor-pointer"
                  style={{ borderColor: t.operatorColor }}
                  onClick={() => navigate(`/tickets/${t.id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-2xl" style={{ backgroundColor: `${t.operatorColor}20` }}>{t.operatorLogo}</div>
                      <div>
                        <p className="font-semibold" style={{ color: t.operatorColor }}>{t.operator}</p>
                        <p className="text-xs text-gray-500">Ref: {t.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Ticket {t.ticketNumber}/{t.totalTickets}</p>
                      <button className="mt-2 px-4 py-2 text-white text-sm rounded-xl hover:opacity-90 transition" style={{ backgroundColor: t.operatorColor }}>View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if ('ticket' in item) {
      const t = item.ticket;
      const status = getTicketStatus(t);
      const disruption = getDisruptionForTicket(t, disruptions);
      return (
        <div key={t.id} className="border-2 rounded-xl p-6 hover:shadow-md transition cursor-pointer border-gray-200"
          onClick={() => navigate(`/tickets/${t.id}`)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  style={{ backgroundColor: 'white', border: `2px solid ${getModeHex(t.journey.type)}`, color: getModeHex(t.journey.type) }}
                  className="p-2 rounded-lg"
                >{getTransportIcon(t.journey.type)}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-lg">{t.journey.operator}</p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-sm text-gray-500">Ref: {t.reference}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">From</p><p className="font-semibold">{t.journey.from}</p></div>
                <div><p className="text-sm text-gray-500">To</p><p className="font-semibold">{t.journey.to}</p></div>
                <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{formatDate(t.date)}</p></div>
                <div><p className="text-sm text-gray-500">Departure</p><p className="font-semibold">{t.journey.departure}</p></div>
              </div>
              {disruption && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><span className="font-semibold">Disruption: </span>{disruption.title}</span>
                </div>
              )}
            </div>
            <button className="px-6 py-2 bg-niq-teal text-white rounded-xl hover:bg-niq-teal-dark transition ml-4 shrink-0">View</button>
          </div>
        </div>
      );
    }
  }

  return (
    <PageShell fullHeight>
      <div className="absolute inset-0 lg:flex lg:flex-row">
        <BottomDrawer className="!bg-white/80 backdrop-blur-md" aria-label="My Tickets">
        <div className="p-4 sm:p-6 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-6 h-6 text-brand" />
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        </div>

        {/* Stats bar */}
        {purchasedTickets.length > 0 && (
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 border-b border-gray-100 pb-4">
            <span className="font-medium text-gray-700">{purchasedTickets.length} journey{purchasedTickets.length !== 1 ? 's' : ''}</span>
            {co2Stats.saved > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-green-700 font-medium">
                  <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
                  {co2Stats.saved.toFixed(1)} kg CO₂ saved vs driving
                </span>
              </>
            )}
          </div>
        )}

        {purchasedTickets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No tickets yet</h2>
            <p className="text-gray-500 mb-6">Your purchased tickets will appear here</p>
            <button onClick={() => navigate('/')}
              className="bg-niq-teal text-white px-8 py-3 rounded-lg font-semibold hover:bg-niq-teal-dark transition">
              Plan a Journey
            </button>
          </div>
        ) : (
          <>
            {/* ── Next departure hero ─────────────────────────────────────── */}
            {nextTicket && (
              <div className="mb-6 rounded-xl p-4 bg-gradient-to-br from-brand to-brand-hover text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 opacity-80" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    {getTicketStatus(nextTicket) === 'active' ? 'Currently travelling' : 'Next departure'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    style={{ backgroundColor: 'white', color: getModeHex(nextTicket.journey.type) }}
                    className="p-2 rounded-lg shrink-0"
                  >
                    {getTransportIcon(nextTicket.journey.type, 'w-5 h-5')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base leading-tight truncate">
                      {nextTicket.journey.from} → {nextTicket.journey.to}
                    </p>
                    <p className="text-sm opacity-90 mt-0.5">
                      {nextTicket.journey.operator} · {nextTicket.journey.departure}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/tickets/${nextTicket.id}`); }}
                    className="flex-1 py-2 bg-white text-brand rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    View Ticket
                  </button>
                  {nextStationId && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/departures/${nextStationId}`); }}
                      className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      Live Departures
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Ticket sections ─────────────────────────────────────────── */}
            {grouped.todayActive.length > 0 && (
              <section role="region" aria-label="Today and active tickets" className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today & Active</h2>
                {grouped.todayActive.map(item => renderItem(item))}
              </section>
            )}

            {grouped.upcoming.length > 0 && (
              <section role="region" aria-label="Upcoming tickets" className="space-y-4 mt-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Upcoming</h2>
                {grouped.upcoming.map(item => renderItem(item))}
              </section>
            )}

            {grouped.past.length > 0 && (
              <section role="region" aria-label="Past journeys" className="mt-6">
                <button
                  onClick={() => setPastOpen(o => !o)}
                  aria-expanded={pastOpen}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 hover:text-gray-700 transition"
                >
                  Past Journeys ({grouped.past.length})
                  <ChevronRight className={`w-4 h-4 transition-transform ${pastOpen ? 'rotate-90' : ''}`} />
                </button>
                {pastOpen && <div className="space-y-4">{grouped.past.map(item => renderItem(item))}</div>}
              </section>
            )}

            {/* ── CO₂ summary ─────────────────────────────────────────────── */}
            {co2Stats.saved > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-sm font-semibold text-green-800">Carbon footprint</span>
                </div>
                <p className="text-2xl font-bold text-green-700 mb-0.5">{co2Stats.saved.toFixed(1)} kg CO₂ saved</p>
                <p className="text-sm text-green-600 mb-4">
                  vs driving across {purchasedTickets.length} journey{purchasedTickets.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="w-16 shrink-0 font-medium">By train</span>
                    <div className="flex-1 bg-white/70 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.max(2, (co2Stats.train / co2Stats.car) * 100)}%` }}
                      />
                    </div>
                    <span className="w-14 text-right font-medium">{co2Stats.train.toFixed(1)} kg</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="w-16 shrink-0 font-medium">By car</span>
                    <div className="flex-1 bg-white/70 rounded-full h-2 overflow-hidden">
                      <div className="bg-gray-400 h-2 rounded-full w-full" />
                    </div>
                    <span className="w-14 text-right font-medium">{co2Stats.car.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Plan another journey CTA ─────────────────────────────────── */}
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full py-3 border-2 border-brand text-brand rounded-xl font-semibold hover:bg-brand-light transition flex items-center justify-center gap-2"
            >
              Plan another journey
            </button>
          </>
        )}
        </div>
        </BottomDrawer>
        <div className="flex-1 relative">
          {nextTicket ? (
            // Active/upcoming ticket — show only journey route stops + coloured leg lines
            <MapView
              markers={journeyMapMarkers}
              polylines={journeyMapPolylines}
              showBusStops={false}
              height="100%"
              onViewDepartures={(id) => navigate(`/departures/${id}`)}
            />
          ) : (
            // No active ticket — show all stops exactly like Journey Planner
            <MapView
              markers={allStopMarkers}
              filterModes={TICKET_MAP_MODES}
              height="100%"
              destinationLabel="Plan a journey"
              onSetDestination={name => navigate('/', { state: { to: name } })}
              onViewDepartures={(id) => navigate(`/departures/${id}`)}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
