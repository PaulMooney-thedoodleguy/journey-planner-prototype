import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, Eye, Map } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import QRCodeView from '../../components/tickets/QRCodeView';
import AnimatedTicketView from '../../components/tickets/AnimatedTicketView';
import PageShell from '../../components/layout/PageShell';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { purchasedTickets, savedJourneys } = useAppContext();
  const [ticketView, setTicketView] = useState<'qr' | 'visual'>('qr');

  const ticket = purchasedTickets.find(t => t.id === ticketId);

  const linkedJourney = ticket
    ? savedJourneys.find(sj =>
        sj.ticketId === ticket.id ||
        (ticket.isPartOfMultiModal && sj.ticketGroupId === ticket.multiModalGroup)
      )
    : undefined;

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

  if (!ticket) {
    return (
      <PageShell>
        <button onClick={() => navigate('/tickets')} className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2">
          ← Back to Tickets
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ticket not found</h1>
        <p className="text-gray-600">The requested ticket could not be found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/tickets')} className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2">
          ← Back to Tickets
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-4">
          {ticket.services ? ticket.services[0] : `${ticket.journey.from} to ${ticket.journey.to}`}
        </h1>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setTicketView('qr')}
            className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${ticketView === 'qr' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <QrCode className="w-5 h-5" />QR Code
          </button>
          <button
            onClick={() => setTicketView('visual')}
            className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${ticketView === 'visual' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <Eye className="w-5 h-5" />Visual Validation
          </button>
        </div>

        {linkedJourney && (
          <button
            onClick={() => navigate(`/journeys/${linkedJourney.id}`)}
            className="w-full py-3 border-2 border-brand text-brand rounded-lg font-semibold hover:bg-brand-light transition flex items-center justify-center gap-2 mb-6"
          >
            <Map className="w-5 h-5" aria-hidden="true" />
            View Journey Plan
          </button>
        )}

        {ticketView === 'qr' ? <QRCodeView ticket={ticket} /> : <AnimatedTicketView ticket={ticket} />}
      </div>
    </PageShell>
  );
}
