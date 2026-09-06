import { useEffect, useRef } from 'react';
import { tracker } from './tracker';

/**
 * Custom hook to manage global non-blocking visitor analytics
 */
export function useTracker() {
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // 1. Initialize tracker on mount
    tracker.initialize();

    // 2. Track initial page path
    const currentPath = window.location.pathname + window.location.hash || '/';
    lastTrackedPath.current = currentPath;

    // 3. Track hash/route changes (e.g. clicking #about, #skills, etc.)
    const handleRouteChange = () => {
      const path = window.location.pathname + window.location.hash || '/';
      if (path !== lastTrackedPath.current && !path.startsWith('/admin')) {
        lastTrackedPath.current = path;
        tracker.trackPageView(path);
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
}
