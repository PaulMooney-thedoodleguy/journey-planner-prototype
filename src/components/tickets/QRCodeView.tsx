import { useMemo } from 'react';
import { QrCode } from 'lucide-react';
import type { PurchasedTicket } from '../../types';
import { formatDate } from '../../utils/formatting';

export default function QRCodeView({ ticket }: { ticket: PurchasedTicket }) {
  // Deterministic pattern seeded from the ticket reference — stable across re-renders
  const cells = useMemo(() => {
    let h = 0;
    for (let i = 0; i < ticket.reference.length; i++) {
      h = (Math.imul(31, h) + ticket.reference.charCodeAt(i)) | 0;
    }
    return Array.from({ length: 64 }, (_, i) => ((h * (i + 1) * 2654435761) >>> 0) % 2 === 0);
  }, [ticket.reference]);

  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Scan to Validate</h3>
        <p className="text-gray-600 text-sm">Reference: {ticket.reference}</p>
      </div>
      <div className="bg-gray-100 rounded-xl p-8 mb-6 flex items-center justify-center">
        <div className="w-64 h-64 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center relative">
          <div className="grid grid-cols-8 gap-1 w-full h-full p-4">
            {cells.map((isBlack, i) => (
              <div key={i} className={isBlack ? 'bg-black' : 'bg-white'} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-2 rounded">
              <QrCode className="w-8 h-8 text-brand" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between pb-2 border-b">
          <span className="text-gray-600">Passenger</span>
          <span className="font-semibold">{ticket.passenger}</span>
        </div>
        {ticket.services ? (
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-600">Service</span>
            <span className="font-semibold">{ticket.services[0]}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-gray-600">From</span>
              <span className="font-semibold">{ticket.journey.from}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-gray-600">To</span>
              <span className="font-semibold">{ticket.journey.to}</span>
            </div>
          </>
        )}
        <div className="flex justify-between pb-2 border-b">
          <span className="text-gray-600">Date</span>
          <span className="font-semibold">{formatDate(ticket.date)}</span>
        </div>
        <div className="flex justify-between pb-2 border-b">
          <span className="text-gray-600">Operator</span>
          <span className="font-semibold">{ticket.operator ?? ticket.journey.operator}</span>
        </div>
      </div>
    </div>
  );
}
