import type { OperatorTicket } from '../../types';
import { formatPrice } from '../../utils/formatting';

export default function MultiTicketBreakdown({ tickets }: { tickets: OperatorTicket[] }) {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-sm text-yellow-800">Multiple Tickets Required</p>
            <p className="text-xs text-yellow-700 mt-1">
              This journey requires {tickets.length} separate tickets from different operators
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Required Tickets:</p>
      <div className="space-y-2">
        {tickets.map(t => (
          <div key={t.id} className="border-2 rounded-lg p-3" style={{ borderColor: t.color }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${t.color}20` }}>
                  {t.logo}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: t.color }}>{t.operator}</p>
                  {t.services.map(s => <p key={s} className="text-xs text-gray-600">{s}</p>)}
                </div>
              </div>
              <p className="text-lg font-bold" style={{ color: t.color }}>{formatPrice(t.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
