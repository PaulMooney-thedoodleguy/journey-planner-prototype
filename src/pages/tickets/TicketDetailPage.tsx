import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import QRCodeView from '../../components/tickets/QRCodeView';
import AnimatedTicketView from '../../components/tickets/AnimatedTicketView';
import PageShell from '../../components/layout/PageShell';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { purchasedTickets } = useAppContext();
  const [ticketView, setTicketView] = useState<'qr' | 'visual'>('qr');

  const ticket = purchasedTickets.find(t => t.id === ticketId);

  if (!ticket) {
    return (
      <PageShell>
        <button onClick={() => navigate('/tickets')} className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2">
          ← Back to Tickets
        </button>
        <p className="text-gray-600">Ticket not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/tickets')} className="mb-4 text-brand hover:text-brand-hover font-medium flex items-center gap-2">
          ← Back to Tickets
        </button>

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

        {ticketView === 'qr' ? <QRCodeView ticket={ticket} /> : <AnimatedTicketView ticket={ticket} />}
      </div>
    </PageShell>
  );
}
