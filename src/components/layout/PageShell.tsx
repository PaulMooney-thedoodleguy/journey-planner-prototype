import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  fullHeight?: boolean;
  centered?: boolean;
  className?: string;
}

export default function PageShell({ children, fullHeight = false, centered = false, className = '' }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 ${fullHeight ? 'relative overflow-hidden' : ''} ${centered ? 'flex items-center justify-center' : ''} ${className}`}>
      {fullHeight ? children : (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {children}
        </div>
      )}
    </div>
  );
}
