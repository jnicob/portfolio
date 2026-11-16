/**
 * Reads `prefers-reduced-motion` at call time (non-reactive: does not subscribe to
 * changes). Used as an initial state value (lazy initializer), not inside an
 * effect that needs to react to live user preference changes.
 * `typeof window` guards SSR/static export; `matchMedia` is optional in case a
 * test environment does not define it.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}
