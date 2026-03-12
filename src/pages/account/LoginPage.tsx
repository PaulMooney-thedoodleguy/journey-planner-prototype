import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import PageShell from '../../components/layout/PageShell';
import BrandLogo from '../../components/icons/BrandLogo';
import { usePageTitle } from '../../hooks/usePageTitle';

type Tab = 'signin' | 'register';

export default function LoginPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isLoggedIn, login, register } = useAuthContext();

  const [tab, setTab]               = useState<Tab>('signin');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const title = tab === 'signin' ? 'Sign In' : 'Create Account';
  usePageTitle(title);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigate('/account', { replace: true });
  }, [isLoggedIn, navigate]);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tab === 'signin') {
      const err = login(email, password);
      if (err) { setError(err); return; }
    } else {
      const err = register(name, email, password);
      if (err) { setError(err); return; }
    }

    navigate(from, { replace: true });
  }

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  }

  return (
    <PageShell centered>
      <div className="w-full max-w-sm mx-auto">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <BrandLogo />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Tab toggle */}
          <div className="flex rounded-full bg-gray-100 p-1 mb-6" role="tablist" aria-label="Authentication options">
            {(['signin', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  tab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {tab === 'register' && (
              <div>
                <label htmlFor="login-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Alex Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent focus:outline-none"
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="alex@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-niq-teal text-white py-3 rounded-lg font-semibold hover:bg-niq-teal-dark transition mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {tab === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-4">
            {tab === 'signin' ? (
              <>No account?{' '}
                <button onClick={() => switchTab('register')} className="text-brand hover:text-brand-hover font-medium focus-visible:outline-none focus-visible:underline">
                  Create account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchTab('signin')} className="text-brand hover:text-brand-hover font-medium focus-visible:outline-none focus-visible:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
