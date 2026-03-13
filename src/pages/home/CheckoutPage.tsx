import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useJourneyContext } from '../../context/JourneyContext';
import { useAuthContext } from '../../context/AuthContext';
import PageShell from '../../components/layout/PageShell';
import OutlinedField from '../../components/ui/OutlinedField';
import { formatPrice } from '../../utils/formatting';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { selectedJourney, searchParams, passengerDetails, setPassengerDetails, completePayment } = useJourneyContext();
  const { user } = useAuthContext();
  const [cardNumber, setCardNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  usePageTitle('Passenger Details');

  // Maps internal field keys to their input element IDs for error summary links
  const fieldToId: Record<string, string> = {
    name: 'name-input',
    email: 'email-input',
    cardNumber: 'card-input',
  };

  useEffect(() => {
    if (!selectedJourney) navigate('/');
  }, [selectedJourney, navigate]);

  // Pre-fill from logged-in user profile (only when fields are empty)
  useEffect(() => {
    if (user && !passengerDetails.name && !passengerDetails.email) {
      setPassengerDetails({ name: user.name, email: user.email });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedJourney) return null;

  const updatePassenger = (field: string, value: string) => {
    setPassengerDetails({ ...passengerDetails, [field]: value });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const updateCard = (value: string) => {
    setCardNumber(value);
    if (errors.cardNumber) setErrors(prev => { const n = { ...prev }; delete n.cardNumber; return n; });
  };

  const handlePayment = (e?: React.FormEvent) => {
    e?.preventDefault();
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
    if (Object.keys(newErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    completePayment(searchParams.ticketType);
    navigate('/confirmation');
  };

  return (
    <PageShell>
      <button onClick={() => navigate('/results')} className="mb-4 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2">
        ← Back to Results
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Passenger Details</h1>
        {/* GDS-style error summary — receives focus on submit failure (WCAG 3.3.1) */}
        {Object.keys(errors).length > 0 && (
          <div
            ref={errorSummaryRef}
            aria-labelledby="checkout-error-summary-title"
            tabIndex={-1}
            className="bg-red-50 border border-red-400 rounded-lg p-4 mb-6"
          >
            <h2 id="checkout-error-summary-title" className="text-sm font-semibold text-red-800 mb-2">There is a problem</h2>
            <ul className="space-y-1">
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  <a href={`#${fieldToId[field] ?? field}`} className="text-sm text-red-700 underline hover:text-red-900">
                    {msg}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* form element enables Enter-to-submit and correct screen reader semantics (WCAG 4.1.2) */}
        <form onSubmit={handlePayment} noValidate className="space-y-6">
          <div>
            <OutlinedField
              id="name-input"
              label="Full Name"
              type="text"
              value={passengerDetails.name}
              onChange={v => updatePassenger('name', v)}
              autoComplete="name"
              errorId={errors.name ? 'name-error' : undefined}
              hasError={!!errors.name}
            />
            {errors.name && <p id="name-error" role="alert" className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <OutlinedField
              id="email-input"
              label="Email"
              type="email"
              value={passengerDetails.email}
              onChange={v => updatePassenger('email', v)}
              autoComplete="email"
              errorId={errors.email ? 'email-error' : undefined}
              hasError={!!errors.email}
            />
            {errors.email && <p id="email-error" role="alert" className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <OutlinedField
              id="card-input"
              label="Card Number"
              type="text"
              value={cardNumber}
              onChange={updateCard}
              maxLength={19}
              autoComplete="cc-number"
              inputMode="numeric"
              errorId={errors.cardNumber ? 'card-error' : undefined}
              hasError={!!errors.cardNumber}
            />
            {errors.cardNumber && <p id="card-error" role="alert" className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-niq-teal text-white py-4 rounded-lg font-semibold hover:bg-niq-teal-dark transition flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Pay {formatPrice(selectedJourney.price[searchParams.ticketType])}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
