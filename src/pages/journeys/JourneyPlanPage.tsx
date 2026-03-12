import { useNavigate, useParams, Link } from 'react-router-dom';
import { Map } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PageShell from '../../components/layout/PageShell';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatDate, getLegStatus } from '../../utils/formatting';
import { getTransportIcon, getModeHex } from '../../utils/transport';
import type { JourneyLeg, PurchasedTicket } from '../../types';

export default function JourneyPlanPage() {
  const { savedJourneyId } = useParams();
  const navigate = useNavigate();
  const { savedJourneys, purchasedTickets } = useAppContext();
  usePageTitle('Journey Plan');

  const savedJourney = savedJourneys.find(sj => sj.id === savedJourneyId);

  if (!savedJourney) {
    return (
      <PageShell>
        <Link to="/" className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2">
          ← Back to Search
        </Link>
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

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2"
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
              <Map className="w-4 h-4" aria-hidden="true" />
              View Ticket
            </Link>
          )}
        </div>

        {/* Leg timeline — only when journey data with legs is available */}
        {journey?.legs && journey.legs.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Journey legs</h2>
            <div className="relative">
              {/* Vertical line connecting dots */}
              <div className="absolute left-[17px] top-5 bottom-5 w-0.5 bg-gray-200" aria-hidden="true" />

              <ol className="space-y-0">
                {journey.legs.map((leg, idx) => {
                  const legStatus = getLegStatus(leg, savedJourney.date ?? '');
                  const legTicket = ticketForLeg(leg);
                  const legModeHex = getModeHex(leg.mode);
                  const isWalkOrCycle = noTicketModes.has(leg.mode);

                  return (
                    <li key={idx} className="relative pl-10">
                      {/* Status dot */}
                      <div className="absolute left-0 top-1" aria-hidden="true">
                        {legStatus === 'past' && (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs font-bold">✓</span>
                          </div>
                        )}
                        {legStatus === 'active' && (
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                          </div>
                        )}
                        {legStatus === 'upcoming' && (
                          <div className="w-9 h-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Leg content */}
                      <div className="pb-6">
                        {/* Departure station */}
                        <p className="text-sm font-semibold text-gray-900">
                          <span className="text-gray-500 mr-2">{leg.departure}</span>
                          {leg.from}
                          {leg.platform && (
                            <span className="ml-1 text-xs text-gray-500">(Plat. {leg.platform})</span>
                          )}
                        </p>

                        {/* Leg mode row */}
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
                            {leg.stops != null && ` · ${leg.stops} stop${leg.stops !== 1 ? 's' : ''}`}
                          </span>

                          {/* Per-leg ticket button (multimodal only) */}
                          {legTicket && (
                            <Link
                              to={`/tickets/${legTicket.id}`}
                              className="ml-auto text-xs font-medium text-brand hover:text-brand-hover flex items-center gap-1 border border-brand rounded-md px-2 py-1 hover:bg-brand-light transition"
                            >
                              <Map className="w-3 h-3" aria-hidden="true" />
                              Ticket
                            </Link>
                          )}
                          {isWalkOrCycle && (
                            <span className="ml-auto text-xs text-gray-400 italic">No ticket needed</span>
                          )}
                        </div>

                        {/* Arrival station — only on the last leg's row */}
                        {idx === journey.legs!.length - 1 && (
                          <p className="text-sm font-semibold text-gray-900">
                            <span className="text-gray-500 mr-2">{leg.arrival}</span>
                            {leg.to}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
