import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  fullHeight?: boolean;
  centered?: boolean;
  className?: string;
}

export default function PageShell({ children, fullHeight = false, centered = false, className = '' }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-surface ${fullHeight ? 'relative overflow-hidden' : ''} ${className}`}>
      {/* Skip link — visually hidden until focused (WCAG 2.4.1 Bypass Blocks) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:font-bold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {fullHeight ? (
        // lg:top-16 shifts the map+drawer content below the 64px TopNav on desktop.
        // tabIndex={-1} allows the skip link to move focus here programmatically (WCAG 2.4.1)
        <main id="main-content" tabIndex={-1} className="absolute inset-0 lg:top-16 focus:outline-none">
          {children}
        </main>
      ) : centered ? (
        <main id="main-content" tabIndex={-1} className="flex items-center justify-center min-h-screen pb-20 lg:pt-16 focus:outline-none">
          {children}
        </main>
      ) : (
        <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 lg:pt-20 focus:outline-none">
          {children}
        </main>
      )}
    </div>
  );
}
