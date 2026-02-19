import { Clock, ChevronRight } from 'lucide-react';
import type { Journey, TicketType } from '../../types';
import { getTransportIcon } from '../../utils/transport';
import { formatPrice } from '../../utils/formatting';
import MultiTicketBreakdown from './MultiTicketBreakdown';

interface JourneyCardProps {
  journey: Journey;
  ticketType: TicketType;
  isGreenest: boolean;
  isFastest: boolean;
  isCheapest: boolean;
  onSelect: (j: Journey) => void;
}

export default function JourneyCard({ journey: j, ticketType, isGreenest, isFastest, isCheapest, onSelect }: JourneyCardProps) {
  const borderClass = isGreenest
    ? 'border-green-500 bg-green-50/50'
    : isFastest
    ? 'border-blue-500 bg-blue-50/50'
    : isCheapest
    ? 'border-purple-500 bg-purple-50/50'
    : 'border-gray-200 hover:border-indigo-500';

  return (
    <div className={`border-2 rounded-lg p-6 hover:shadow-md transition ${borderClass}`}>
      {/* Badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        {isGreenest && (
          <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm">Greenest</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Lowest CO₂</span>
          </div>
        )}
        {isFastest && (
          <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm">Fastest</span>
          </div>
        )}
        {isCheapest && (
          <div className="flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-sm">Cheapest</span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">{getTransportIcon(j.type)}</div>
            <div>
              <p className="font-semibold text-lg">{j.operator}</p>
              <p className="text-sm text-gray-500">
                {j.type === 'train' ? 'Train' : j.type === 'bus' ? 'Coach' : 'Multi-modal'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div><p className="text-2xl font-bold">{j.departure}</p><p className="text-sm text-gray-600">{j.from}</p></div>
            <div className="flex-1 flex items-center gap-2">
              <div className="h-px bg-gray-300 flex-1" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{j.duration}</p>
                <p className="text-xs text-gray-500">{j.changes === 0 ? 'Direct' : `${j.changes} change${j.changes > 1 ? 's' : ''}`}</p>
              </div>
              <div className="h-px bg-gray-300 flex-1" />
            </div>
            <div><p className="text-2xl font-bold">{j.arrival}</p><p className="text-sm text-gray-600">{j.to}</p></div>
          </div>
        </div>

        <div className="text-right ml-6">
          <div className="mb-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-2 ${j.co2 <= 8 ? 'bg-green-100 text-green-800' : j.co2 <= 12 ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold">{j.co2} kg CO₂</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">{ticketType === 'single' ? 'Single' : 'Return'}</p>
          <p className="text-3xl font-bold text-indigo-600">{formatPrice(j.price[ticketType])}</p>
          <button
            onClick={() => onSelect(j)}
            className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            Select <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {j.requiresMultipleTickets && j.tickets && (
        <MultiTicketBreakdown tickets={j.tickets} />
      )}
    </div>
  );
}
