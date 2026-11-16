'use client';

import { CompareSlider, type CompareSliderExpand } from '@nicobehm/media-kit';

/** Perf (T30/qa-B1): see the same comment in media-kit-demo.tsx — ~840w variant. */
const PORTRAIT_SRC_SET = '/demo/portrait-840.webp 840w, /demo/portrait.webp 1600w';
/** Full-content-width figure (no grid), at any breakpoint. */
const FULL_WIDTH_SIZES = '(min-width: 1024px) 1000px, calc(100vw - 3rem)';

type Props = {
  /** Alt text for the "before" side (ReactNode with grayscale filter). */
  beforeAlt: string;
  /** Accessible name of the divider. */
  compareLabel: string;
  /** Translated figcaption text. */
  caption: string;
  /** Slider expand CTA (overlay button + internal compare-lightbox). */
  expand: CompareSliderExpand;
};

/**
 * Color/B&W demo: a single bitmap; the "before" side derives black and white with
 * `filter: grayscale(1)` (ReactNode, zero extra overhead). The "after" side is a
 * `MediaSource` with HD `fullSrc` (T14): the internal compare-lightbox (`expand`,
 * T15) serves the high-resolution asset when the screen justifies it.
 */
export function PortraitCompareDemo({ beforeAlt, compareLabel, caption, expand }: Props) {
  return (
    <figure className="flex flex-col gap-2">
      <CompareSlider
        before={
          <img
            src="/demo/portrait.webp"
            srcSet={PORTRAIT_SRC_SET}
            sizes={FULL_WIDTH_SIZES}
            alt={beforeAlt}
            width={1600}
            height={900}
            loading="lazy"
            style={{ filter: 'grayscale(1)' }}
          />
        }
        after={{ src: '/demo/portrait.webp', fullSrc: '/demo/portrait-hd.webp', alt: '' }}
        label={compareLabel}
        expand={expand}
      />
      <figcaption className="text-sm text-fg-muted">{caption}</figcaption>
    </figure>
  );
}
