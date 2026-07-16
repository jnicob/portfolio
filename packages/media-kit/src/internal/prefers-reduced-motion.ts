/**
 * Lee `prefers-reduced-motion` en tiempo de llamada (no reactivo: no se suscribe a
 * cambios). Usado como valor inicial de estado (lazy initializer), no dentro de un
 * effect que necesite reaccionar a que el usuario cambie la preferencia en vivo.
 * `typeof window` guarda SSR/static export; `matchMedia` es opcional por si un
 * entorno de test no lo define.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}
