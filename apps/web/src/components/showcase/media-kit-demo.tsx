'use client';

import { useState } from 'react';
import { CompareSlider, MediaLightbox, type MediaLightboxLabels } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';
import { PortraitCompareDemo } from './portrait-compare-demo';

export type MediaKitDemoStrings = {
  beforeAfterAlt: string;
  dragCompareLabel: string;
  dragCaption: string;
  hoverCompareLabel: string;
  hoverCaption: string;
  zoomCta: string;
  lightboxLabel: string;
  resultAlt: string;
};

type Props = {
  labels: MediaLightboxLabels;
  strings: MediaKitDemoStrings;
};

export function MediaKitDemo({ labels, strings }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="flex flex-col gap-2">
          <CompareSlider
            before={<img src="/demo/photo-before.svg" alt={strings.beforeAfterAlt} />}
            after={<img src="/demo/photo-after.svg" alt="" />}
            label={strings.dragCompareLabel}
          />
          <figcaption className="text-sm text-fg-muted">{strings.dragCaption}</figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <CompareSlider
            mode="hover"
            before={<img src="/demo/photo-before.svg" alt={strings.beforeAfterAlt} />}
            after={<img src="/demo/photo-after.svg" alt="" />}
            label={strings.hoverCompareLabel}
          />
          <figcaption className="text-sm text-fg-muted">{strings.hoverCaption}</figcaption>
        </figure>
      </div>
      <PortraitCompareDemo />
      <Button variant="secondary" className="self-start" onClick={() => setOpen(true)}>
        {strings.zoomCta}
      </Button>
      <MediaLightbox
        open={open}
        onClose={() => setOpen(false)}
        label={strings.lightboxLabel}
        labels={labels}
      >
        <img src="/demo/photo-after.svg" alt={strings.resultAlt} />
      </MediaLightbox>
    </div>
  );
}
