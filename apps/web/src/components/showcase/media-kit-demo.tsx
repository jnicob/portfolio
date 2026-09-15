'use client';

import { useState } from 'react';
import {
  CompareSlider,
  type CompareSliderExpand,
  type MediaLightboxLabels,
} from '@nicobehm/media-kit';
import { PortraitCompareDemo } from './portrait-compare-demo';

/**
 * Perf (T30/qa-B1): landscape.webp is 1600×900 (113 KB), well above the actual
 * rendered width on mobile — below `md` this grid becomes a single column, so each
 * `<img>` measures around the content width (not half a grid). The ~840w variant
 * (46 KB) lets the browser choose based on the actual rendered width, instead of
 * always downloading the full asset.
 */
const LANDSCAPE_SRC_SET = '/demo/landscape-840.webp 840w, /demo/landscape.webp 1600w';
/** Image width based on viewport. */
const GRID_SIZES = '(min-width: 768px) calc(100vw - 4rem), calc(100vw - 3rem)';

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
  const [hoverMode, setHoverMode] = useState(true);

  const expand: CompareSliderExpand = {
    lightboxLabel: strings.compareLightboxLabel,
    buttonLabel: strings.fullScreen,
    lightboxLabels: labels,
  };

  const mode = hoverMode ? 'hover' : 'drag';
  const label = hoverMode ? strings.hoverCompareLabel : strings.dragCompareLabel;
  const caption = hoverMode ? strings.hoverCaption : strings.dragCaption;

  return (
    <div className="flex flex-col gap-4">
      <figure className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <label className="hidden items-center gap-2 text-sm text-fg-muted cursor-pointer [@media(hover:hover)]:flex">
            <input
              type="checkbox"
              checked={hoverMode}
              onChange={(e) => setHoverMode(e.target.checked)}
              className="rounded border-border text-accent focus:ring-ring"
            />
            <span>{strings.hoverCompareLabel}</span>
          </label>
        </div>
        <CompareSlider
          key={mode}
          mode={mode}
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
          label={label}
          expand={expand}
        />
        <figcaption className="text-sm text-fg-muted">{caption}</figcaption>
      </figure>
      <PortraitCompareDemo
        beforeAlt={strings.portraitBeforeAlt}
        compareLabel={strings.portraitCompareLabel}
        caption={strings.portraitCaption}
        expand={expand}
      />
    </div>
  );
}
