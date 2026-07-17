'use client';

import { CompareSlider, type CompareSliderExpand } from '@nicobehm/media-kit';

/** Perf (T30/qa-B1): ver el mismo comentario en media-kit-demo.tsx — variante ~840w. */
const PORTRAIT_SRC_SET = '/demo/portrait-840.webp 840w, /demo/portrait.webp 1600w';
/** Figure a ancho completo del contenido (sin grid), en cualquier breakpoint. */
const FULL_WIDTH_SIZES = '(min-width: 1024px) 1000px, calc(100vw - 3rem)';

type Props = {
  /** Alt del lado "antes" (ReactNode con filter grayscale). */
  beforeAlt: string;
  /** Nombre accesible del divisor. */
  compareLabel: string;
  /** Texto del figcaption, traducido. */
  caption: string;
  /** CTA de expand del slider (botón overlay + compare-lightbox interno). */
  expand: CompareSliderExpand;
};

/**
 * Demo color/B-N: un único bitmap; el lado "antes" deriva el blanco y negro con
 * `filter: grayscale(1)` (ReactNode, cero peso extra). El lado "después" es un
 * `MediaSource` con `fullSrc` HD (T14): el compare-lightbox interno (`expand`,
 * T15) sirve el asset de alta resolución cuando la pantalla lo justifica.
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
