import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import BrandLogo from '../icons/BrandLogo';
import OutlinedField from '../ui/OutlinedField';

type Tab = 'signin' | 'register';

export default function LoginModal() {
  const { loginModalOpen, loginModalReason, closeLoginModal, isLoggedIn, login, register } = useAuthContext();

  const [isMounted,  setIsMounted]  = useState(false);
  const [isVisible,  setIsVisible]  = useState(false);

  const [tab,          setTab]          = useState<Tab>('signin');
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const cardRef  = useRef<HTMLDivElement>(null);

  // Mount/unmount with CSS transition
  useEffect(() => {
    if (loginModalOpen) {
      setIsMounted(true);
      // Two rAFs so the browser has painted before we trigger the transition
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      );
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [loginModalOpen]);

  // Focus email input once visible
  useEffect(() => {
    if (isVisible) emailRef.current?.focus();
  }, [isVisible]);

  // Scroll lock + Escape key + focus trap
  useEffect(() => {
    if (!isMounted) return;
    document.body.style.overflow = 'hidden';
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeLoginModal(); return; }
      if (e.key !== 'Tab') return;
      const focusable = cardRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMounted, closeLoginModal]);

  // Close and reset when user logs in successfully
  useEffect(() => {
    if (isLoggedIn && loginModalOpen) closeLoginModal();
  }, [isLoggedIn, loginModalOpen, closeLoginModal]);

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
    setName('');
    // email is preserved so the user doesn't have to retype it
    setPassword('');
    setShowPassword(false);
  }

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
    // closeLoginModal is called by the isLoggedIn effect above
  }

  if (!isMounted) return null;

  return (
    // z-[3500] — above UpdatePrompt (z-[3000]), below skip link (z-[9999])
    <div
      className="fixed inset-0 z-[3500] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          transition: 'var(--modal-transition)',
          opacity: isVisible ? 1 : 0,
        }}
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* Modal card — bottom-sheet on mobile, centred card on sm+ */}
      <div
        ref={cardRef}
        className={`relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto transition-none ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1'
        }`}
        style={{ transition: 'var(--modal-transition)', transformOrigin: 'top right' }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Accessible dialog title — visually hidden, referenced by aria-labelledby */}
        <h2 id="login-modal-title" className="sr-only">
          {tab === 'signin' ? 'Sign in' : 'Create account'}
        </h2>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <BrandLogo variant="dark" />
        </div>

        {/* Context reason — shown when modal is triggered by a gated action */}
        {loginModalReason ? (
          <p className="text-sm text-center text-gray-600 mb-5 leading-snug">
            {loginModalReason}
          </p>
        ) : (
          <p className="text-sm text-center text-gray-500 mb-5">
            Create a free account to book and manage your tickets.
          </p>
        )}

        {/* Tab toggle */}
        <div className="flex rounded-full bg-gray-100 p-1 mb-6" role="tablist" aria-label="Authentication options">
          {(['signin', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
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

        {/* Error */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name — register only */}
          {tab === 'register' && (
            <OutlinedField
              id="modal-login-name"
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
            />
          )}

          <OutlinedField
            id="modal-login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            fieldRef={emailRef}
          />

          <OutlinedField
            id="modal-login-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
          />

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
              <button
                type="button"
                onClick={() => switchTab('register')}
                className="text-brand hover:text-brand-hover font-medium focus-visible:outline-none focus-visible:underline"
              >
                Create account
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className="text-brand hover:text-brand-hover font-medium focus-visible:outline-none focus-visible:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
