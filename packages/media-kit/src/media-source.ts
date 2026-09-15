/**
 * Media model with optional HD variant (C3): allows compare-slider and
 * media-lightbox to decide, based on screen size/density, whether to serve the
 * base image or a higher-resolution version (`fullSrc`) — without coupling that
 * decision to React components. Pure module, no React dependencies.
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
 * Strict criterion (spec C3): screens < 1024 css px (mobile) NEVER load
 * HD, even if their dpr puts them above the effective threshold. The dpr is capped at 2x
 * to avoid over-serving desktops/tablets with dpr 3+.
 */
export function shouldUseFullSrc(screenWidth: number, devicePixelRatio: number): boolean {
  if (screenWidth < 1024) return false;
  return screenWidth * Math.min(devicePixelRatio, 2) >= FULL_SRC_MIN_EFFECTIVE_WIDTH;
}

/** Selects the URL for fullscreen based on the current screen (SSR-safe: no window → src). */
export function pickFullscreenSrc(source: MediaSource): string {
  if (!source.fullSrc) return source.src;
  if (typeof window === 'undefined') return source.src;
  const screenWidth = window.screen.width;
  const devicePixelRatio = window.devicePixelRatio;
  return shouldUseFullSrc(screenWidth, devicePixelRatio) ? source.fullSrc : source.src;
}

// Module-level: preload idempotency across calls (does not repeat the same URL).
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
