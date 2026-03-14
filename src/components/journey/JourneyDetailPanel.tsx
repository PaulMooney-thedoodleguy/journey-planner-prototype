import { useState } from 'react';
import { Bookmark, AlertTriangle, ChevronDown } from 'lucide-react';
import type { Journey, TicketType, Disruption } from '../../types';
import { getTransportIcon, getModeHex } from '../../utils/transport';
import { formatPrice } from '../../utils/formatting';

interface Props {
  journey: Journey;
  ticketType: TicketType;
  disruption?: Disruption | null;
  isSaved: boolean;
  onBack: () => void;
  onBook: () => void;
  onToggleSave: () => void;
}

export default function JourneyDetailPanel({
  journey: j,
  ticketType,
  disruption,
  isSaved,
  onBack,
  onBook,
  onToggleSave,
}: Props) {
  const [expandedStops, setExpandedStops] = useState<Set<number>>(new Set());

  const toggleStops = (idx: number) => setExpandedStops(prev => {
    const next = new Set(prev);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    return next;
  });

  const co2Class = j.co2 <= 8
    ? 'bg-green-100 text-green-800'
    : j.co2 <= 12
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-orange-100 text-orange-800';

  const co2Pct = j.carCo2 && j.carCo2 > j.co2
    ? Math.round((1 - j.co2 / j.carCo2) * 100)
    : null;

  const legs = j.legs ?? [];
  const lastLeg = legs[legs.length - 1];

  return (
    <div className="p-4 sm:p-6 pb-8">

      {/* ── Back + bookmark ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2"
        >
          ← Back to results
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={isSaved ? `Unsave: ${j.from} to ${j.to}` : `Save: ${j.from} to ${j.to}`}
          title={isSaved ? `Unsave: ${j.from} to ${j.to}` : `Save: ${j.from} to ${j.to}`}
          aria-pressed={isSaved}
          className="p-1.5 rounded-md bg-white/90 shadow-sm border border-gray-200 hover:bg-white transition"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand text-brand' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* ── Journey header ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-4">
        <div
          style={{
            backgroundColor: 'white',
            border: `2px solid ${getModeHex(j.type)}`,
            color: getModeHex(j.type),
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        >
          {getTransportIcon(j.type, 'w-5 h-5')}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold leading-tight">
            {j.from} → {j.to}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            {j.departure} → {j.arrival} · {j.duration} ·{' '}
            {j.changes === 0 ? 'Direct' : `${j.changes} change${j.changes > 1 ? 's' : ''}`} · {j.operator}
          </p>

          {/* CO₂ badge */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${co2Class}`}>
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {j.co2} kg CO₂
            </span>
            {co2Pct !== null && (
              <span className="text-xs text-green-700 font-medium">{co2Pct}% less than driving</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Leg timeline ───────────────────────────────────────── */}
      {legs.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Journey details</h2>

          {legs.map((leg, i) => {
            const legHex = getModeHex(leg.mode);
            const isExpanded = expandedStops.has(i);
            return (
              <div key={i} className="flex items-stretch gap-3">
                {/* Timeline spine — dot + line connecting to next node */}
                <div className="flex flex-col items-center w-6 shrink-0">
                  <div
                    style={{ borderColor: legHex }}
                    className="w-3 h-3 rounded-full border-2 bg-white mt-1 shrink-0"
                  />
                  {/* Spine always continues — connects to next leg or final arrival dot */}
                  <div className="w-px bg-gray-200 flex-1 my-1" />
                </div>

                {/* Leg info */}
                <div className="flex-1 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {leg.departure} <span className="text-gray-400 font-normal">·</span> {leg.from}
                    </p>
                    {leg.platform && (
                      <span
                        style={{ color: legHex, backgroundColor: `${legHex}1a` }}
                        className="text-xs font-semibold px-2 py-1 rounded shrink-0"
                      >
                        Plat. {leg.platform}
                      </span>
                    )}
                  </div>

                  {/* Operator row */}
                  <div className="flex items-center gap-2 my-1 text-xs text-gray-500">
                    <div
                      style={{ backgroundColor: 'white', border: `1.5px solid ${legHex}`, color: legHex }}
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    >
                      {getTransportIcon(leg.mode, 'w-3 h-3')}
                    </div>
                    <span>{leg.operator}</span>
                    <span>·</span>
                    <span>{leg.duration}</span>
                    {leg.stops !== undefined && leg.stops > 0 && (
                      <><span>·</span><span>{leg.stops} stop{leg.stops !== 1 ? 's' : ''}</span></>
                    )}
                  </div>

                  {/* Intermediate stops — collapsed by default */}
                  {leg.intermediateStops && leg.intermediateStops.length > 0 && (
                    <div className="mt-1">
                      <button
                        onClick={() => toggleStops(i)}
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
                              {stop.time && <span className="font-medium tabular-nums text-gray-700 shrink-0">{stop.time}</span>}
                              <span>{stop.name}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Final arrival node */}
          {lastLeg && (
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center w-6 shrink-0">
                <div
                  style={{ borderColor: getModeHex(lastLeg.mode) }}
                  className="w-3 h-3 rounded-full border-2 bg-white mt-1 shrink-0"
                />
              </div>
              <p className="text-sm font-semibold mt-0.5">
                {lastLeg.arrival} <span className="text-gray-400 font-normal">·</span> {lastLeg.to}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Disruption warning ─────────────────────────────────── */}
      {disruption && (disruption.severity === 'critical' || disruption.severity === 'high') && (
        <div
          role="alert"
          className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2.5 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">{disruption.title}</p>
            <p className="text-xs text-yellow-700 mt-0.5">{disruption.description}</p>
          </div>
        </div>
      )}

      {/* ── Book CTA ───────────────────────────────────────────── */}
      <button
        onClick={onBook}
        className="w-full py-4 bg-niq-teal text-white rounded-xl font-semibold text-base hover:bg-niq-teal-dark transition flex items-center justify-center gap-3"
      >
        Book this journey
        <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
          {formatPrice(j.price[ticketType])}
        </span>
      </button>
    </div>
  );
}
