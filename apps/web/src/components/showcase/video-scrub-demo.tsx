'use client';

import { useState } from 'react';
import { VideoScrubPreview } from '@nicobehm/media-kit';
import { Badge } from '@/components/ui/badge';

export type VideoScrubDemoStrings = {
  /** Nombre accesible del área interactiva de scrub. */
  label: string;
  /**
   * Hint visual decorativo (`aria-hidden`) que explica la interacción y
   * desaparece en la primera interacción real. El nombre accesible del área
   * ya viene de `label`/`figcaption`, así que el hint no necesita anunciarse.
   */
  hint: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: VideoScrubDemoStrings };

/**
 * Preview de vídeo recorrible con el puntero (o con flechas, en foco), spec B4
 * / F3.6. Clip real de 864×486 (16:9 exacto — Task 10): `aspect-video` reserva
 * el espacio con la proporción correcta sin esperar a que cargue la metadata,
 * evitando layout shift (mismo objetivo que `width`/`height` en `<img>`).
 *
 * Task 26: diagnóstico en navegador confirmó que el scrub (puntero + teclado)
 * funciona correctamente; el feedback de usuario era de affordance, no un bug
 * — nada en el vídeo en reposo comunicaba que era interactivo. El hint
 * (icono + copy corto) desaparece en la primera interacción (`pointerenter` o
 * foco por teclado) y no vuelve a mostrarse.
 */
export function VideoScrubDemo({ strings }: Props) {
  const [hintVisible, setHintVisible] = useState(true);

  return (
    <figure className="flex flex-col gap-2">
      <div
        className="relative aspect-video w-full max-w-md"
        onPointerEnter={() => setHintVisible(false)}
        onFocus={() => setHintVisible(false)}
      >
        <VideoScrubPreview
          src="/demo/scrub.mp4"
          poster="/demo/scrub-poster.webp"
          label={strings.label}
          className="h-full w-full"
        />
        {hintVisible && (
          <Badge
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit gap-1.5"
          >
            <ScrubHintIcon />
            {strings.hint}
          </Badge>
        )}
      </div>
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}

/** Icono decorativo (flechas ↔) que refuerza el cursor `ew-resize` del scrub. */
function ScrubHintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 8l-4 4 4 4" />
      <path d="M16 8l4 4-4 4" />
      <path d="M2 12h20" />
    </svg>
  );
}
