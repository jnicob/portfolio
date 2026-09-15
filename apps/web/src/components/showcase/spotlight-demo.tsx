'use client';

import { SpotlightReveal } from '@nicobehm/media-kit';

/**
 * Design review F3.6 T21 ("assets demos"): the 4 demos above (drag, hover, comparison
 * modes) already shared the same landscape photo — the spotlight was repeating
 * that photo a 5th time. Use instead an asset from the AI examples gallery (T8):
 * the neon portrait (`apps/web/src/data/gallery.ts`, id `nbp-retrato-neon`, 1200×1608 —
 * actual asset dimensions, no cropping/CLS). Just like the demos above, the
 * spotlight derives its "before" side (B&W) with `filter: grayscale(1)` over this same
 * bitmap — zero extra weight, same pattern.
 */
const PORTRAIT_SRC = '/demo/gallery/nbp-retrato-neon.webp';
/** HD variant (T14) from the gallery: serves large/retina screens via srcSet. */
const PORTRAIT_SRC_SET = `${PORTRAIT_SRC} 1200w, /demo/gallery/nbp-retrato-neon-hd.webp 2560w`;
/**
 * Fix design review T25 (I2): at full content width, the 3:4 portrait
 * rendered at 896×1201px — ≈2.4× taller than neighboring demos (scrub
 * 896×504, comparisons ≈500px) and broke the vertical rhythm of the section.
 * The container now restricts to `max-w-md` (≈448px wide → ≈600px high in
 * 3:4), so `sizes` reflects that cap instead of full width.
 */
const PORTRAIT_SIZES = '(min-width: 28rem) 28rem, calc(100vw - 3rem)';

export type SpotlightDemoStrings = {
  /** Accessible name of the spotlight interactive area. */
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
 * Magnifier revealing color under the pointer (spec B4, F3.6): a single bitmap (the neon
 * portrait from gallery T8, not the landscape photo that the demos above already repeat) —
 * the "base" side (B&W) derives from the same bitmap with `filter: grayscale(1)`, zero
 * extra assets (same pattern as the colorization in the demos above, T11).
 */
export function SpotlightDemo({ strings }: Props) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="mx-auto w-full max-w-md">
        <SpotlightReveal
          base={
            <img
              src={PORTRAIT_SRC}
              srcSet={PORTRAIT_SRC_SET}
              sizes={PORTRAIT_SIZES}
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
              sizes={PORTRAIT_SIZES}
              alt=""
              width={1200}
              height={1608}
              loading="lazy"
            />
          }
          label={strings.label}
          overlayLabels={{ base: strings.baseBadge, reveal: strings.revealBadge }}
        />
      </div>
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
