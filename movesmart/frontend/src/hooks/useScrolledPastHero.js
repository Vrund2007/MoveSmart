// hooks/useScrolledPastHero.js
// Returns true once the user has scrolled past a given pixel threshold (default: 100vh).
// Used by Navbar to switch from transparent to solid.
// Build this hook now so future sections don't require rework — per the prompt's instruction.
import { useState, useEffect } from 'react';

/**
 * @param {number} threshold — scroll offset in px at which to switch state.
 *   Defaults to window.innerHeight (= 100vh) so the nav goes solid exactly
 *   when the hero scrolls out of view.
 */
export function useScrolledPastHero(threshold = null) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const getThreshold = () => threshold ?? window.innerHeight;

    function onScroll() {
      setScrolled(window.scrollY > getThreshold());
    }

    // Set initial state immediately (handles refresh-at-scroll-position edge case)
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
