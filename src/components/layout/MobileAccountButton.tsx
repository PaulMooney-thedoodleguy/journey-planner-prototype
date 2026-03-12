import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

/**
 * Fixed floating account button for mobile (hidden on lg+).
 * Logged in:    coloured circle showing user initial → /account
 * Not logged in: plain circle with User icon → login modal
 */
export default function MobileAccountButton() {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuthContext();

  if (user) {
    return (
      <button
        onClick={() => navigate('/account')}
        aria-label={`My account: ${user.name}`}
        className="fixed top-3 right-3 z-[1600] lg:hidden w-9 h-9 rounded-full bg-brand text-white font-bold text-sm flex items-center justify-center shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        {user.name[0].toUpperCase()}
      </button>
    );
  }

  return (
    <button
      onClick={() => openLoginModal()}
      aria-label="Sign in"
      className="fixed top-3 right-3 z-[1600] lg:hidden w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <User className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
