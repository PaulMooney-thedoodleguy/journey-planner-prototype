import { useState } from 'react';
import { Clock, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import type { Journey, TicketType, Disruption } from '../../types';
import { getTransportIcon } from '../../utils/transport';
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

  return (
    <div className={`border-2 rounded-lg p-4 sm:p-6 hover:shadow-md transition ${borderClass}`}>
      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-2">
        {isGreenest && (
          <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm">Greenest</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Lowest CO₂</span>
          </div>
        )}
        {isFastest && (
          <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-sm">Fastest</span>
          </div>
        )}
        {isCheapest && (
          <div className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-sm">Cheapest</span>
          </div>
        )}
      </div>

      {/* Card body — stacks vertically on mobile, side-by-side on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">

        {/* Left: operator + journey times */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-brand-light rounded-lg text-brand shrink-0">{getTransportIcon(j.type)}</div>
            <div className="min-w-0">
              <p className="font-semibold text-base sm:text-lg truncate">{j.operator}</p>
              <p className="text-sm text-gray-500">
                {j.type === 'train' ? 'Train' : j.type === 'bus' ? 'Coach' : 'Multi-modal'}
              </p>
            </div>
          </div>

          {/* Times row */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="shrink-0">
              <p className="text-xl sm:text-2xl font-bold">{j.departure}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none">{j.from}</p>
            </div>
            <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
              <div className="h-px bg-gray-300 flex-1" />
              <div className="text-center shrink-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">{j.duration}</p>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {j.changes === 0 ? 'Direct' : `${j.changes} change${j.changes > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="h-px bg-gray-300 flex-1" />
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl sm:text-2xl font-bold">{j.arrival}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none">{j.to}</p>
            </div>
          </div>
        </div>

        {/* Right: CO2 + price + button */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right sm:ml-6 sm:shrink-0 gap-3 sm:gap-0">
          {/* Price + CO2 group */}
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-1 sm:mb-2 ${j.co2 <= 8 ? 'bg-green-100 text-green-800' : j.co2 <= 12 ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold">{j.co2} kg CO₂</span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">{ticketType === 'single' ? 'Single' : 'Return'}</p>
            <p className="text-2xl sm:text-3xl font-bold text-brand">{formatPrice(j.price[ticketType])}</p>
          </div>

          <button
            onClick={() => onSelect(j)}
            className="shrink-0 px-5 py-2 sm:mt-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition flex items-center gap-1.5"
          >
            Select <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-ticket breakdown */}
      {j.requiresMultipleTickets && j.tickets && (
        <MultiTicketBreakdown tickets={j.tickets} />
      )}

      {/* Leg detail toggle — only shown when legs data is available */}
      {j.legs && j.legs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
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
                  <div className={`flex-1 pb-3 ${i < j.legs!.length - 1 ? '' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {leg.departure} <span className="text-gray-500 font-normal">·</span> {leg.from}
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
                          {leg.arrival} <span className="text-gray-500 font-normal">·</span> {leg.to}
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

      {/* Disruption warning — only shown for critical/high severity affecting this journey */}
      {disruption && (disruption.severity === 'critical' || disruption.severity === 'high') && (
        <div
          role="alert"
          className="mt-3 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2.5 flex items-start gap-2"
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
