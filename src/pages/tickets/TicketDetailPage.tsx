import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, Eye, Map as MapIcon, AlertTriangle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import QRCodeView from '../../components/tickets/QRCodeView';
import AnimatedTicketView from '../../components/tickets/AnimatedTicketView';
import PageShell from '../../components/layout/PageShell';
import BottomDrawer from '../../components/layout/BottomDrawer';
import MapView from '../../components/map/MapView';
import { getRoutePolyline, getModeHex, getSeverityHex, getTransportIcon } from '../../utils/transport';
import { ROUTE_STATION_COORDS, MAP_STATIONS } from '../../data/stations';
import { MOCK_DEPARTURES } from '../../data/departures';
import { getDisruptionsService } from '../../services/transport.service';
import { formatDate } from '../../utils/formatting';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { MapMarker, Disruption } from '../../types';

const SEVERITY_CLASSES: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-900',
  high:     'bg-orange-50 border-orange-200 text-orange-900',
  medium:   'bg-yellow-50 border-yellow-200 text-yellow-900',
  low:      'bg-blue-50 border-blue-200 text-blue-900',
};

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

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { purchasedTickets, savedJourneys } = useAppContext();
  const [ticketView, setTicketView] = useState<'qr' | 'visual'>('qr');
  const [disruptionOpen, setDisruptionOpen] = useState(false);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  usePageTitle('My Ticket');

  const ticket = purchasedTickets.find(t => t.id === ticketId);

  const linkedJourney = ticket
    ? savedJourneys.find(sj =>
        sj.ticketId === ticket.id ||
        (ticket.isPartOfMultiModal && sj.ticketGroupId === ticket.multiModalGroup)
      )
    : undefined;

  useEffect(() => {
    getDisruptionsService().then(s => s.getDisruptions().then(setDisruptions));
  }, []);

  // Keep screen on while displaying QR code
  useEffect(() => {
    if (ticketView !== 'qr') return;

    let wakeLock: { release: () => Promise<void> } | null = null;

    async function acquire() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Not supported or permission denied — silent degradation
      }
    }

    acquire();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock?.release();
    };
  }, [ticketView]);

  const ticketDisruption = useMemo(() =>
    disruptions.find(d =>
      d.operator.toLowerCase() === (ticket?.journey.operator.toLowerCase() ?? '') ||
      d.location.toLowerCase().includes(ticket?.journey.from.toLowerCase() ?? '') ||
      d.location.toLowerCase().includes(ticket?.journey.to.toLowerCase() ?? '')
    ) ?? null,
    [disruptions, ticket]
  );

  const routePolyline = useMemo(() =>
    ticket?.journey.legs ? getRoutePolyline(ticket.journey.legs) : [],
    [ticket]
  );

  const routeMarkers: MapMarker[] = useMemo(() => {
    if (!ticket?.journey.legs) return [];
    return Array.from(
      new Map(
        ticket.journey.legs.flatMap(leg => [
          [leg.from, { leg, name: leg.from }],
          [leg.to,   { leg, name: leg.to   }],
        ])
      ).values()
    ).flatMap(({ leg, name }) => {
      const coord = ROUTE_STATION_COORDS[name];
      return coord ? [{ id: name, lat: coord.lat, lng: coord.lng, type: leg.mode, label: name }] : [];
    });
  }, [ticket]);

  const mapCenter = useMemo(() => {
    if (routePolyline.length >= 2) return undefined; // FitBounds handles it
    const coord = ticket ? ROUTE_STATION_COORDS[ticket.journey.from] : null;
    return coord ?? { lat: 51.515, lng: -0.13 };
  }, [ticket, routePolyline]);

  const departureStationId = ticket ? findDepartureStationId(ticket.journey.from) : null;

  // Find the best-matching departure for this ticket — operator match preferred,
  // falling back to the first live-tracking service at the station.
  const matchedDeparture = useMemo(() => {
    if (!departureStationId || !ticket) return null;
    const stationDeps = MOCK_DEPARTURES[departureStationId] ?? [];
    const ticketOp = ticket.journey.operator.toLowerCase();
    return (
      stationDeps.find(d => {
        const depOp = d.operator.toLowerCase();
        return ticketOp.includes(depOp) || depOp.includes(ticketOp);
      }) ??
      stationDeps.find(d => d.hasLiveTracking) ??
      stationDeps[0] ??
      null
    );
  }, [departureStationId, ticket]);

  if (!ticket) {
    return (
      <PageShell>
        <button onClick={() => navigate('/tickets')} className="mb-4 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2">
          ← Back to Tickets
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ticket not found</h1>
        <p className="text-gray-600">The requested ticket could not be found.</p>
      </PageShell>
    );
  }

  const severityClass = ticketDisruption
    ? (SEVERITY_CLASSES[ticketDisruption.severity] ?? SEVERITY_CLASSES.medium)
    : '';

  return (
    <PageShell fullHeight>
      <div className="absolute inset-0 lg:flex lg:flex-row">

        {/* ── Ticket details panel ─────────────────────────────────────────── */}
        <BottomDrawer aria-label="Ticket details">
          <div className="p-4 sm:p-6 pb-8">

            <button
              onClick={() => navigate('/tickets')}
              className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2 text-sm"
            >
              ← Back to Tickets
            </button>

            {/* Journey summary */}
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{ backgroundColor: 'white', border: `2px solid ${getModeHex(ticket.journey.type)}`, color: getModeHex(ticket.journey.type) }}
                className="p-2 rounded-lg shrink-0"
              >
                {getTransportIcon(ticket.journey.type, 'w-5 h-5')}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
                  {ticket.journey.from} → {ticket.journey.to}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {ticket.journey.operator} · {formatDate(ticket.date)} · {ticket.journey.departure}
                </p>
              </div>
            </div>

            {/* Disruption alert — collapsible */}
            {ticketDisruption && (
              <div className={`mb-4 rounded-xl border ${severityClass}`}>
                <button
                  onClick={() => setDisruptionOpen(v => !v)}
                  aria-expanded={disruptionOpen}
                  title={disruptionOpen ? 'Collapse disruption details' : 'Expand disruption details'}
                  className="w-full flex items-center gap-2.5 p-3 text-left"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-xs font-semibold">{ticketDisruption.title}</span>
                  {disruptionOpen
                    ? <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
                    : <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
                  }
                </button>
                {disruptionOpen && (
                  <div className="px-3 pb-3 text-xs">
                    <p className="opacity-75 leading-relaxed">{ticketDisruption.description}</p>
                    <button
                      onClick={() => navigate('/updates')}
                      className="mt-1.5 font-semibold underline underline-offset-2"
                    >
                      View service updates →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick action buttons */}
            {(departureStationId || linkedJourney) && (
              <div className="flex gap-2 mb-4">
                {departureStationId && (
                  <button
                    onClick={() => {
                      if (matchedDeparture?.hasLiveTracking) {
                        const serviceKey = encodeURIComponent(
                          `${matchedDeparture.operator}-${matchedDeparture.destination}`
                        );
                        navigate(
                          `/departures/${departureStationId}/track/${serviceKey}?ticketId=${ticket.id}`
                        );
                      } else {
                        const qs = new URLSearchParams({
                          ticketId: ticket.id,
                          depTime:  ticket.journey.departure,
                          depOp:    ticket.journey.operator,
                        });
                        navigate(`/departures/${departureStationId}?${qs}`);
                      }
                    }}
                    className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:border-brand hover:text-brand transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    {matchedDeparture?.hasLiveTracking ? 'Track Service' : 'Live Departures'}
                  </button>
                )}
                {linkedJourney && (
                  <button
                    onClick={() => navigate(`/journeys/${linkedJourney.id}`)}
                    className="flex-1 py-2.5 border-2 border-brand text-brand rounded-lg text-sm font-semibold hover:bg-brand-light transition flex items-center justify-center gap-1.5"
                  >
                    <MapIcon className="w-4 h-4" aria-hidden="true" />
                    Journey Plan
                  </button>
                )}
              </div>
            )}

            {/* Ticket display — segmented toggle + content in a single card */}
            <div className="mb-4 bg-gray-50 rounded-2xl p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                Show ticket as
              </p>
              {/* Segmented control */}
              <div
                role="tablist"
                aria-label="Ticket view"
                className="flex bg-gray-200 rounded-xl p-1 mb-3"
              >
                <button
                  role="tab"
                  aria-selected={ticketView === 'qr'}
                  onClick={() => setTicketView('qr')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                    ticketView === 'qr'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <QrCode className="w-4 h-4" aria-hidden="true" />QR Code
                </button>
                <button
                  role="tab"
                  aria-selected={ticketView === 'visual'}
                  onClick={() => setTicketView('visual')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                    ticketView === 'visual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />Visual
                </button>
              </div>

              {/* Ticket content */}
              {ticketView === 'qr' ? <QRCodeView ticket={ticket} /> : <AnimatedTicketView ticket={ticket} />}
            </div>


          </div>
        </BottomDrawer>

        {/* ── Route map ───────────────────────────────────────────────────── */}
        <div className="absolute inset-0 pb-20 lg:static lg:flex-1 lg:pb-0">
          <MapView
            markers={routeMarkers}
            center={mapCenter}
            zoom={mapCenter ? 13 : undefined}
            routePolyline={routePolyline}
            height="100%"
          />
        </div>

      </div>
    </PageShell>
  );
}
