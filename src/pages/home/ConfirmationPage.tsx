import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import PageShell from '../../components/layout/PageShell';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { passengerDetails, resetJourney } = useJourneyContext();

  const handleBookAnother = () => {
    resetJourney();
    navigate('/');
  };

  return (
    <PageShell centered>
      <div className="max-w-2xl w-full p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Your ticket has been sent to {passengerDetails.email || 'your email address'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/tickets')}
              className="flex-1 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              View Tickets
            </button>
            <button
              onClick={handleBookAnother}
              className="flex-1 bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
