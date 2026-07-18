'use client';

import { SpotlightReveal } from '@nicobehm/media-kit';

/**
 * Design review F3.6 T21 ("assets demos"): las 4 demos de arriba (drag, hover, modos
 * de comparación) ya usaban la misma foto de paisaje entre sí — el spotlight repetía
 * esa foto una 5ª vez. Usa en su lugar un asset de la galería de ejemplos IA (T8):
 * el retrato neón (`apps/web/src/data/gallery.ts`, id `nbp-retrato-neon`, 1200×1608 —
 * dimensiones reales del asset, sin recorte/CLS). Igual que las demos de arriba, el
 * spotlight deriva su lado "antes" (B/N) con `filter: grayscale(1)` sobre este mismo
 * bitmap — cero peso extra, mismo patrón.
 */
const PORTRAIT_SRC = '/demo/gallery/nbp-retrato-neon.webp';
/** Variante HD (T14) de la galería: sirve pantallas grandes/retina vía srcSet. */
const PORTRAIT_SRC_SET = `${PORTRAIT_SRC} 1200w, /demo/gallery/nbp-retrato-neon-hd.webp 2560w`;
/** Figure a ancho completo del contenido (sin grid), en cualquier breakpoint. */
const FULL_WIDTH_SIZES = '(min-width: 1024px) 1000px, calc(100vw - 3rem)';

export type SpotlightDemoStrings = {
  /** Nombre accesible del área interactiva del spotlight. */
  label: string;
  /** Alt del lado "base" (ReactNode con `filter: grayscale(1)`). */
  baseAlt: string;
  /** Badge superpuesto en el lado base. */
  baseBadge: string;
  /** Badge superpuesto en el lado reveal. */
  revealBadge: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: SpotlightDemoStrings };

/**
 * Lupa que revela color bajo el puntero (spec B4, F3.6): un único bitmap (el retrato
 * neón de la galería T8, no la foto de paisaje que ya repiten las demos de arriba) —
 * el lado "base" (B/N) deriva del mismo bitmap con `filter: grayscale(1)`, cero
 * assets extra (mismo patrón que la colorización de las demos de arriba, T11).
 */
export function SpotlightDemo({ strings }: Props) {
  return (
    <figure className="flex flex-col gap-2">
      <SpotlightReveal
        base={
          <img
            src={PORTRAIT_SRC}
            srcSet={PORTRAIT_SRC_SET}
            sizes={FULL_WIDTH_SIZES}
            alt={strings.baseAlt}
            width={1200}
            height={1608}
            loading="lazy"
            style={{ filter: 'grayscale(1)' }}
          />
        }
        reveal={
          <img
            src={PORTRAIT_SRC}
            srcSet={PORTRAIT_SRC_SET}
            sizes={FULL_WIDTH_SIZES}
            alt=""
            width={1200}
            height={1608}
            loading="lazy"
          />
        }
        label={strings.label}
        overlayLabels={{ base: strings.baseBadge, reveal: strings.revealBadge }}
      />
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
