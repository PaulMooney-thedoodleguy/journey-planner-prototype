import type { OperatorTicket } from '../../types';
import { formatPrice } from '../../utils/formatting';

export default function MultiTicketBreakdown({ tickets }: { tickets: OperatorTicket[] }) {
  return (
    <div className="border-t border-gray-100 px-4 pt-3 pb-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
        {tickets.length} tickets required
      </p>
      <div className="divide-y divide-gray-100">
        {tickets.map(t => (
          <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base leading-none shrink-0">{t.logo}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{t.operator}</p>
                {t.services.map(s => (
                  <p key={s} className="text-xs text-gray-500 truncate">{s}</p>
                ))}
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(t.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
