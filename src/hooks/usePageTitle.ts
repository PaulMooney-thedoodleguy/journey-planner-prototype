import { useEffect } from 'react';

const APP_NAME = 'UK Journey Planner';

/**
 * Sets document.title on mount and resets it on unmount.
 * Satisfies WCAG 2.4.2 (Page Titled — Level A).
 *
 * Usage: usePageTitle('Plan Your Journey')
 * Result: "Plan Your Journey — UK Journey Planner"
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}
