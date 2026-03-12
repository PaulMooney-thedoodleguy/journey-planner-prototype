import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import PageShell from '../../components/layout/PageShell';
import StationAutocomplete from '../../components/journey/StationAutocomplete';
import { usePageTitle } from '../../hooks/usePageTitle';

const RAILCARD_OPTIONS: { value: NonNullable<import('../../types').UserProfile['defaultRailcard']>; label: string }[] = [
  { value: 'none',    label: 'None' },
  { value: '16-25',   label: '16–25 Railcard' },
  { value: 'network', label: 'Network Railcard' },
  { value: 'senior',  label: 'Senior Railcard' },
];

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, updateProfile, clearAllData, openLoginModal } = useAuthContext();
  const { resetAppData } = useAppContext();
  usePageTitle('My Account');

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [homeStation, setHomeStation] = useState('');
  const [railcard, setRailcard]     = useState<NonNullable<import('../../types').UserProfile['defaultRailcard']>>('none');
  const [saved, setSaved]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If not logged in, go home and open the login modal
  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal();
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, openLoginModal]);

  // Populate form from user profile
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setHomeStation(user.homeStation ?? '');
      setRailcard(user.defaultRailcard ?? 'none');
    }
  }, [user]);

  if (!user) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name, email, homeStation: homeStation || undefined, defaultRailcard: railcard });
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  }

  function handleSignOut() {
    logout();
    navigate('/');
  }

  function handleDeleteEverything() {
    clearAllData();   // clears localStorage + auth state
    resetAppData();   // resets in-memory tickets + saved journeys
    navigate('/');
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent focus:outline-none';

  return (
    <PageShell>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-brand hover:text-brand-hover font-medium text-sm flex items-center gap-2 focus-visible:outline-none focus-visible:underline"
      >
        ← Back
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 mb-6">
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-lg font-bold flex-shrink-0"
        >
          {user.name[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-2xl mx-auto mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-5">Your Account</h1>

        <form onSubmit={handleSave} noValidate className="space-y-5">
          <fieldset>
            <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile</legend>

            <div className="space-y-4">
              <div>
                <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="account-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="account-home-station" className="block text-sm font-medium text-gray-700 mb-1.5">Home station</label>
                <StationAutocomplete
                  id="account-home-station"
                  value={homeStation}
                  onChange={setHomeStation}
                  placeholder="Search stations…"
                />
              </div>

              <div>
                <label htmlFor="account-railcard" className="block text-sm font-medium text-gray-700 mb-1.5">Default railcard</label>
                <select
                  id="account-railcard"
                  value={railcard}
                  onChange={e => setRailcard(e.target.value as typeof railcard)}
                  className={`${inputClass} bg-white`}
                >
                  {RAILCARD_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            className="w-full bg-niq-teal text-white py-3 rounded-lg font-semibold hover:bg-niq-teal-dark transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Session */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-2xl mx-auto mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Session</h2>
        <button
          onClick={handleSignOut}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Sign out
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-2xl mx-auto mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Prototype reset</h2>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full border border-red-400 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            Clear all data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              This deletes all tickets, saved journeys and your account. Cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEverything}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Delete everything
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
