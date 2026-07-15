'use client';

import {
  CompareSlider,
  type CompareSliderExpand,
  type MediaLightboxLabels,
} from '@nicobehm/media-kit';
import { PortraitCompareDemo } from './portrait-compare-demo';

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
            before={<img src="/demo/photo-before.svg" alt={strings.beforeAfterAlt} />}
            after={<img src="/demo/photo-after.svg" alt="" />}
            label={strings.dragCompareLabel}
            expand={expand}
          />
          <figcaption className="text-sm text-fg-muted">{strings.dragCaption}</figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <CompareSlider
            mode="hover"
            before={<img src="/demo/photo-before.svg" alt={strings.beforeAfterAlt} />}
            after={<img src="/demo/photo-after.svg" alt="" />}
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
