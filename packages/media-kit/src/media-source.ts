/**
 * Modelo de medio con variante HD opcional (C3): permite que compare-slider y
 * media-lightbox decidan, según el tamaño/densidad de pantalla, si sirven la
 * imagen base o una versión de mayor resolución (`fullSrc`) — sin acoplar esa
 * decisión a los componentes de React. Módulo puro, sin dependencias de React.
 */
export type MediaSource = { src: string; fullSrc?: string; alt: string };

export function isMediaSource(value: unknown): value is MediaSource {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.src !== 'string' || typeof candidate.alt !== 'string') return false;
  if (candidate.fullSrc !== undefined && typeof candidate.fullSrc !== 'string') return false;
  return true;
}

/** C3: pantalla efectiva (css px × dpr, dpr capado a 2x) ≥ umbral → merece el asset HD. */
export const FULL_SRC_MIN_EFFECTIVE_WIDTH = 2000;

/**
 * Criterio cerrado (spec C3): pantallas < 1024 css px (móviles) NUNCA cargan el
 * HD, aunque su dpr las lleve por encima del umbral efectivo. El dpr se capa a 2x
 * para no sobre-servir a desktops/tablets con dpr 3+.
 */
export function shouldUseFullSrc(screenWidth: number, devicePixelRatio: number): boolean {
  if (screenWidth < 1024) return false;
  return screenWidth * Math.min(devicePixelRatio, 2) >= FULL_SRC_MIN_EFFECTIVE_WIDTH;
}

/** Elige la URL para fullscreen según la pantalla actual (SSR-safe: sin window → src). */
export function pickFullscreenSrc(source: MediaSource): string {
  if (!source.fullSrc) return source.src;
  if (typeof window === 'undefined') return source.src;
  const screenWidth = window.screen.width;
  const devicePixelRatio = window.devicePixelRatio;
  return shouldUseFullSrc(screenWidth, devicePixelRatio) ? source.fullSrc : source.src;
}

// Módulo-level: idempotencia de la precarga entre llamadas (no repite la misma URL).
const preloadedUrls = new Set<string>();

/** Precarga los fullSrc que la pantalla justifica (new Image()). Idempotente. */
export function preloadFullSources(sources: readonly MediaSource[]): void {
  if (typeof window === 'undefined') return;
  const screenWidth = window.screen.width;
  const devicePixelRatio = window.devicePixelRatio;
  if (!shouldUseFullSrc(screenWidth, devicePixelRatio)) return;
  for (const source of sources) {
    if (!source.fullSrc || preloadedUrls.has(source.fullSrc)) continue;
    preloadedUrls.add(source.fullSrc);
    const image = new Image();
    image.src = source.fullSrc;
  }
}
