import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Clock, Wallet, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const tabs = [
  { path: '/', label: 'Planner', icon: Navigation, exact: true },
  { path: '/departures', label: 'Departures', icon: Clock, exact: false },
  { path: '/tickets', label: 'Tickets', icon: Wallet, exact: false },
  { path: '/updates', label: 'Updates', icon: AlertTriangle, exact: false },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { purchasedTickets } = useAppContext();

  const isActive = (tab: typeof tabs[0]) =>
    tab.exact ? pathname === tab.path : pathname.startsWith(tab.path);

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto grid grid-cols-4 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center py-3 px-2 cursor-pointer relative ${active ? 'text-indigo-600' : 'text-gray-600'}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.path === '/tickets' && purchasedTickets.length > 0 && (
                <div className="absolute top-1 right-1/4 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {purchasedTickets.length}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
