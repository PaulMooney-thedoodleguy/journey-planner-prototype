import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PageShell from '../../components/layout/PageShell';
import { getTransportIcon } from '../../utils/transport';
import { formatDate } from '../../utils/formatting';
import type { PurchasedTicket } from '../../types';

export default function TicketWalletPage() {
  const navigate = useNavigate();
  const { purchasedTickets } = useAppContext();
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  // Group multi-modal tickets together — memoised so it only reruns when tickets change
  const grouped = useMemo(() => {
    const result: Array<{ isGroup: true; tickets: PurchasedTicket[]; groupId: number } | { isGroup: false; ticket: PurchasedTicket }> = [];
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
    return result;
  }, [purchasedTickets]);

  return (
    <PageShell>
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        </div>

        {purchasedTickets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets yet</h3>
            <p className="text-gray-500 mb-6">Your purchased tickets will appear here</p>
            <button onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Plan a Journey
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(item => {
              if (item.isGroup) {
                const isExpanded = expandedGroup === item.groupId;
                const first = item.tickets[0];
                return (
                  <div key={`group-${item.groupId}`} className="border-2 border-indigo-600 rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-indigo-900">Multi-Modal Journey</p>
                        <p className="text-sm text-indigo-600">{item.tickets.length} tickets required</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div><p className="text-sm text-gray-500">From</p><p className="font-semibold">{first.journey.from}</p></div>
                      <div><p className="text-sm text-gray-500">To</p><p className="font-semibold">{first.journey.to}</p></div>
                      <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{formatDate(first.date)}</p></div>
                      <div><p className="text-sm text-gray-500">Departure</p><p className="font-semibold">{first.journey.departure}</p></div>
                    </div>
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
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                      {isExpanded ? 'Hide Individual Tickets' : 'View Individual Tickets'}
                      <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="mt-4 space-y-3 pt-4 border-t border-indigo-200">
                        {item.tickets.map(t => (
                          <div key={t.id}
                            className="border-2 rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer"
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
                                <button className="mt-2 px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition" style={{ backgroundColor: t.operatorColor }}>View</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                const t = item.ticket;
                return (
                  <div key={t.id} className="border-2 rounded-lg p-6 hover:shadow-md transition cursor-pointer border-gray-200"
                    onClick={() => navigate(`/tickets/${t.id}`)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">{getTransportIcon(t.journey.type)}</div>
                          <div>
                            <p className="font-semibold text-lg">{t.journey.operator}</p>
                            <p className="text-sm text-gray-500">Ref: {t.reference}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-sm text-gray-500">From</p><p className="font-semibold">{t.journey.from}</p></div>
                          <div><p className="text-sm text-gray-500">To</p><p className="font-semibold">{t.journey.to}</p></div>
                          <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{formatDate(t.date)}</p></div>
                          <div><p className="text-sm text-gray-500">Departure</p><p className="font-semibold">{t.journey.departure}</p></div>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">View</button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
