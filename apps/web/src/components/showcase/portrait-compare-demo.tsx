'use client';

import { CompareSlider, type CompareSliderExpand } from '@nicobehm/media-kit';

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
