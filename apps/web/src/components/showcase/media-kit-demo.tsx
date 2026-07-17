'use client';

import {
  CompareSlider,
  type CompareSliderExpand,
  type MediaLightboxLabels,
} from '@nicobehm/media-kit';
import { PortraitCompareDemo } from './portrait-compare-demo';

/**
 * Perf (T30/qa-B1): landscape.webp es 1600×900 (113 KB), muy por encima del ancho real
 * renderizado en mobile — bajo `md` este grid pasa a una sola columna, así que cada
 * `<img>` mide en torno al ancho del contenido (no medio grid). La variante ~840w
 * (46 KB) deja al navegador elegir según el ancho renderizado real, en vez de
 * descargar siempre el asset completo.
 */
const LANDSCAPE_SRC_SET = '/demo/landscape-840.webp 840w, /demo/landscape.webp 1600w';
/** Dos columnas desde `md` (grid gap-4): cada imagen ocupa ~50% menos el gap; una sola columna debajo. */
const GRID_SIZES = '(min-width: 768px) calc(50vw - 2rem), calc(100vw - 3rem)';

export type MediaKitDemoStrings = {
  beforeAfterAlt: string;
  dragCompareLabel: string;
  dragCaption: string;
  hoverCompareLabel: string;
  hoverCaption: string;
  fullScreen: string;
  compareLightboxLabel: string;
  portraitBeforeAlt: string;
  portraitCompareLabel: string;
  portraitCaption: string;
};

type Props = {
  labels: MediaLightboxLabels;
  strings: MediaKitDemoStrings;
};

export function MediaKitDemo({ labels, strings }: Props) {
  const expand: CompareSliderExpand = {
    lightboxLabel: strings.compareLightboxLabel,
    buttonLabel: strings.fullScreen,
    lightboxLabels: labels,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="flex flex-col gap-2">
          <CompareSlider
            before={
              <img
                src="/demo/landscape.webp"
                srcSet={LANDSCAPE_SRC_SET}
                sizes={GRID_SIZES}
                alt={strings.beforeAfterAlt}
                width={1600}
                height={900}
                loading="lazy"
                style={{ filter: 'saturate(0.12) contrast(0.92) brightness(0.96)' }}
              />
            }
            after={
              <img
                src="/demo/landscape.webp"
                srcSet={LANDSCAPE_SRC_SET}
                sizes={GRID_SIZES}
                alt=""
                width={1600}
                height={900}
                loading="lazy"
              />
            }
            label={strings.dragCompareLabel}
            expand={expand}
          />
          <figcaption className="text-sm text-fg-muted">{strings.dragCaption}</figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <CompareSlider
            mode="hover"
            before={
              <img
                src="/demo/landscape.webp"
                srcSet={LANDSCAPE_SRC_SET}
                sizes={GRID_SIZES}
                alt={strings.beforeAfterAlt}
                width={1600}
                height={900}
                loading="lazy"
                style={{ filter: 'saturate(0.12) contrast(0.92) brightness(0.96)' }}
              />
            }
            after={
              <img
                src="/demo/landscape.webp"
                srcSet={LANDSCAPE_SRC_SET}
                sizes={GRID_SIZES}
                alt=""
                width={1600}
                height={900}
                loading="lazy"
              />
            }
            label={strings.hoverCompareLabel}
            expand={expand}
          />
          <figcaption className="text-sm text-fg-muted">{strings.hoverCaption}</figcaption>
        </figure>
      </div>
      <PortraitCompareDemo
        beforeAlt={strings.portraitBeforeAlt}
        compareLabel={strings.portraitCompareLabel}
        caption={strings.portraitCaption}
        expand={expand}
      />
    </div>
  );
}
