import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-[3000] bg-brand text-white rounded-xl shadow-lg p-4 flex items-center justify-between gap-3"
    >
      <p className="text-sm font-medium">A new version is available.</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 bg-white text-brand font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brand-light transition"
      >
        Update
      </button>
    </div>
  );
}
