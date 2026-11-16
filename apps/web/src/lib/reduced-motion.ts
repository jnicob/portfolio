/**
 * Reads `prefers-reduced-motion` at call time (non-reactive: does not subscribe to
 * changes). Used as an initial state value (lazy initializer), not inside an
 * effect that needs to react when the user changes the preference live.
 * `typeof window` guards SSR/static export; `matchMedia` is optional in case a
 * test environment does not define it.
 *
 * Intentional duplicate of `packages/media-kit/src/internal/prefers-reduced-motion.ts`:
 * that is internal package API and is not imported from the app.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}
