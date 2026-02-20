import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Clock, Wallet, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import BrandLogo from '../icons/BrandLogo';
import { BRAND_META } from '../../config/brand';

const tabs = [
  { path: '/',           label: 'Planner',    icon: Navigation,    exact: true  },
  { path: '/departures', label: 'Departures', icon: Clock,         exact: false },
  { path: '/tickets',    label: 'Tickets',    icon: Wallet,        exact: false },
  { path: '/updates',    label: 'Updates',    icon: AlertTriangle, exact: false },
];

/**
 * TopNav — desktop-only fixed header bar (hidden on mobile via `hidden lg:flex`).
 *
 * Sits at z-50, h-16 (64px). PageShell's fullHeight main uses `lg:top-16` to
 * start below this header; standard/centered mains add `lg:pt-20` / `lg:pt-16`.
 */
export default function TopNav() {
  const { pathname } = useLocation();
  const navigate    = useNavigate();
  const { purchasedTickets } = useAppContext();

  const isActive = (tab: typeof tabs[0]) =>
    tab.exact ? pathname === tab.path : pathname.startsWith(tab.path);

  return (
    <header
      aria-label="Site header"
      className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-brand z-50 items-center px-6 shadow-md"
    >
      {/* ── Brand logo ──────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/')}
        aria-label={`${BRAND_META.appName} home`}
        className="flex items-center gap-2.5 mr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand rounded-lg"
      >
        <BrandLogo />
      </button>

      {/* ── Nav links ───────────────────────────────────────────────────── */}
      <nav aria-label="Main navigation" className="flex items-center gap-1">
        {tabs.map(tab => {
          const Icon   = tab.icon;
          const active = isActive(tab);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              aria-current={active ? 'page' : undefined}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-brand
                ${active
                  ? 'bg-brand-hover text-white'
                  : 'text-white hover:bg-white/10'}
              `}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}

              {/* Ticket count badge */}
              {tab.path === '/tickets' && purchasedTickets.length > 0 && (
                <span
                  aria-label={`${purchasedTickets.length} ticket${purchasedTickets.length !== 1 ? 's' : ''}`}
                  className="absolute -top-1 -right-1 bg-white text-brand text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {purchasedTickets.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
