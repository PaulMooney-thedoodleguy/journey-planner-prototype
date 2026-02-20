import { useState } from 'react';
import { Clock, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import type { Journey, TicketType, Disruption } from '../../types';
import { getTransportIcon, getModeHex } from '../../utils/transport';
import { formatPrice } from '../../utils/formatting';
import MultiTicketBreakdown from './MultiTicketBreakdown';

interface JourneyCardProps {
  journey: Journey;
  ticketType: TicketType;
  isGreenest: boolean | null;
  isFastest: boolean | null;
  isCheapest: boolean | null;
  onSelect: (j: Journey) => void;
  disruption?: Disruption | null;
}

export default function JourneyCard({ journey: j, ticketType, isGreenest, isFastest, isCheapest, onSelect, disruption }: JourneyCardProps) {
  const [showLegs, setShowLegs] = useState(false);

  const borderClass = isGreenest
    ? 'border-green-500 bg-green-50/50'
    : isFastest
    ? 'border-blue-500 bg-blue-50/50'
    : isCheapest
    ? 'border-purple-500 bg-purple-50/50'
    : 'border-gray-200 hover:border-brand';

  const co2Class = j.co2 <= 8
    ? 'bg-green-100 text-green-800'
    : j.co2 <= 12
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-orange-100 text-orange-800';

  const co2Pct = j.carCo2 && j.carCo2 > j.co2
    ? Math.round((1 - j.co2 / j.carCo2) * 100)
    : null;

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition hover:shadow-md ${borderClass}`}>

      {/* ── Badges ─────────────────────────────────────────────────────── */}
      {(isGreenest || isFastest || isCheapest) && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {isGreenest && (
            <span className="inline-flex items-center gap-1.5 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Greenest
              <span className="bg-white/25 px-1.5 py-0.5 rounded text-xs">Lowest CO₂</span>
            </span>
          )}
          {isFastest && (
            <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Fastest
            </span>
          )}
          {isCheapest && (
            <span className="inline-flex items-center gap-1.5 bg-purple-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cheapest
            </span>
          )}
        </div>
      )}

      {/* ── Times row ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 flex items-center justify-between gap-2">
        {/* Departure – Arrival */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl font-bold tabular-nums">{j.departure}</span>
          <span className="text-gray-400 font-light text-lg">–</span>
          <span className="text-2xl font-bold tabular-nums">{j.arrival}</span>
        </div>
        {/* Duration */}
        <span className="text-sm font-semibold text-gray-600 shrink-0">{j.duration}</span>
      </div>

      {/* ── Station names ───────────────────────────────────────────────── */}
      <div className="px-4 pt-0.5 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 truncate">{j.from}</span>
        <span className="text-xs text-gray-500 shrink-0">
          {j.changes === 0 ? 'Direct' : `${j.changes} change${j.changes > 1 ? 's' : ''}`}
        </span>
        <span className="text-xs text-gray-500 truncate text-right">{j.to}</span>
      </div>

      {/* ── Operator row ────────────────────────────────────────────────── */}
      <div className="px-4 pt-2.5 pb-3 flex items-center gap-2.5">
        {/* Map-marker style: light tinted bg + coloured border + coloured icon */}
        <div
          style={{
            backgroundColor: `${getModeHex(j.type)}1a`,
            border: `2px solid ${getModeHex(j.type)}`,
            color: getModeHex(j.type),
          }}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        >
          {getTransportIcon(j.type, 'w-5 h-5')}
        </div>
        <span className="text-sm font-semibold text-gray-800 truncate">{j.operator}</span>
        <span className="text-xs text-gray-400 shrink-0">
          {j.type === 'train' ? 'Train' : j.type === 'bus' ? 'Coach' : 'Multi-modal'}
        </span>
      </div>

      {/* ── Footer: CO2 + price + Select ───────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-3">

        {/* CO2 badge + savings */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md text-xs font-semibold ${co2Class}`}>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {j.co2} kg CO₂
          </span>
          {co2Pct !== null && (
            <span className="text-xs text-green-700 font-medium">{co2Pct}% less than driving</span>
          )}
        </div>

        {/* Price + Select */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-400 leading-none mb-0.5">
              {ticketType === 'single' ? 'Single' : 'Return'}
            </p>
            <p className="text-xl font-bold text-brand leading-none">
              {formatPrice(j.price[ticketType])}
            </p>
          </div>
          <button
            onClick={() => onSelect(j)}
            className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition flex items-center gap-1"
          >
            Select <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Multi-ticket breakdown ──────────────────────────────────────── */}
      {j.requiresMultipleTickets && j.tickets && (
        <MultiTicketBreakdown tickets={j.tickets} />
      )}

      {/* ── Leg detail toggle ───────────────────────────────────────────── */}
      {j.legs && j.legs.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowLegs(v => !v)}
            aria-expanded={showLegs}
            aria-controls={`legs-${j.id}`}
            className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover font-medium transition"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showLegs ? 'rotate-180' : ''}`} />
            {showLegs ? 'Hide journey details' : 'Show journey details'}
          </button>

          {showLegs && (
            <div id={`legs-${j.id}`} className="mt-3 space-y-0">
              {j.legs.map((leg, i) => (
                <div key={i} className="flex items-stretch gap-3">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center w-6 shrink-0">
                    <div className="w-3 h-3 rounded-full border-2 border-brand bg-white mt-1 shrink-0" />
                    {i < j.legs!.length - 1 && (
                      <div className="w-px bg-gray-200 flex-1 my-1" />
                    )}
                  </div>

                  {/* Leg info */}
                  <div className="flex-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {leg.departure} <span className="text-gray-400 font-normal">·</span> {leg.from}
                        </p>
                        <div className="flex items-center gap-2 my-1 text-xs text-gray-500">
                          <span className="text-brand">{getTransportIcon(leg.mode)}</span>
                          <span>{leg.operator}</span>
                          <span>·</span>
                          <span>{leg.duration}</span>
                          {leg.stops !== undefined && leg.stops > 0 && (
                            <><span>·</span><span>{leg.stops} stop{leg.stops !== 1 ? 's' : ''}</span></>
                          )}
                        </div>
                        <p className="text-sm font-semibold">
                          {leg.arrival} <span className="text-gray-400 font-normal">·</span> {leg.to}
                        </p>
                      </div>
                      {leg.platform && (
                        <span className="text-xs font-semibold text-brand bg-brand-light px-2 py-1 rounded shrink-0">
                          Plat. {leg.platform}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Disruption warning ──────────────────────────────────────────── */}
      {disruption && (disruption.severity === 'critical' || disruption.severity === 'high') && (
        <div
          role="alert"
          className="mx-4 mb-3 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2.5 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">{disruption.title}</p>
            <p className="text-xs text-yellow-700 mt-0.5">{disruption.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
