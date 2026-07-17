'use client';

import { VideoScrubPreview } from '@nicobehm/media-kit';

export type VideoScrubDemoStrings = {
  /** Nombre accesible del área interactiva de scrub. */
  label: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: VideoScrubDemoStrings };

/**
 * Preview de vídeo recorrible con el puntero (o con flechas, en foco), spec B4
 * / F3.6. Clip real de 864×486 (16:9 exacto — Task 10): `aspect-video` reserva
 * el espacio con la proporción correcta sin esperar a que cargue la metadata,
 * evitando layout shift (mismo objetivo que `width`/`height` en `<img>`).
 */
export function VideoScrubDemo({ strings }: Props) {
  return (
    <figure className="flex flex-col gap-2">
      <VideoScrubPreview
        src="/demo/scrub.mp4"
        poster="/demo/scrub-poster.webp"
        label={strings.label}
        className="aspect-video w-full max-w-md"
      />
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
