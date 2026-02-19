import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import PageShell from '../../components/layout/PageShell';
import { formatPrice } from '../../utils/formatting';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { selectedJourney, searchParams, passengerDetails, setPassengerDetails, completePayment } = useJourneyContext();
  const [cardNumber, setCardNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedJourney) navigate('/');
  }, [selectedJourney, navigate]);

  if (!selectedJourney) return null;

  const updatePassenger = (field: string, value: string) => {
    setPassengerDetails({ ...passengerDetails, [field]: value });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const updateCard = (value: string) => {
    setCardNumber(value);
    if (errors.cardNumber) setErrors(prev => { const n = { ...prev }; delete n.cardNumber; return n; });
  };

  const handlePayment = () => {
    const newErrors: Record<string, string> = {};
    if (!passengerDetails.name.trim()) newErrors.name = 'Please enter your full name';
    if (!passengerDetails.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(passengerDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Please enter your card number';
    } else if (cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    completePayment(searchParams.ticketType);
    navigate('/confirmation');
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors[field] ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <PageShell>
      <button onClick={() => navigate('/results')} className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
        ← Back to Results
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" value={passengerDetails.name}
              onChange={e => updatePassenger('name', e.target.value)}
              placeholder="John Smith" className={fieldClass('name')} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={passengerDetails.email}
              onChange={e => updatePassenger('email', e.target.value)}
              placeholder="john.smith@example.com" className={fieldClass('email')} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input type="text" value={cardNumber}
              onChange={e => updateCard(e.target.value)}
              placeholder="1234 5678 9012 3456" maxLength={19} className={fieldClass('cardNumber')} />
            {errors.cardNumber && <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>}
          </div>
          <button onClick={handlePayment}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay {formatPrice(selectedJourney.price[searchParams.ticketType])}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
