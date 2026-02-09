import { useState, useEffect } from 'react';
import { parseHash, type Route } from '../utils/hashRoutes';

/**
 * Hook that tracks the current route based on window.location.hash
 * Subscribes to hashchange events for browser Back/Forward support
 */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    // Listen for hash changes (browser back/forward, manual hash updates)
    window.addEventListener('hashchange', handleHashChange);

    // Also check on mount in case hash changed before mount
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return route;
}
