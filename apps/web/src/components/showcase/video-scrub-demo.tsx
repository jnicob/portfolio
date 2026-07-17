'use client';

import { useEffect, useRef, useState } from 'react';
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
 *
 * Task 27 (perf, F3.6): medido en el export servido (`out/`, Playwright) que
 * `VideoScrubPreview` (paquete, `preload="metadata"`) descarga igualmente el
 * clip completo (~600 KB) nada más montar — el navegador no siempre corta la
 * conexión tras leer los átomos de metadata, y esta demo no puede tocar el
 * paquete para cambiar ese `preload`. Por eso el `<video>` real no se monta
 * hasta la primera interacción (`pointerenter`, foco o click): antes de eso
 * se muestra solo el poster como `<img loading="lazy">` en un botón — mismo
 * `aria-label`, mismas dimensiones (864×486), cero red de más. El foco se
 * reenvía a mano al widget real cuando la activación viene de teclado (el
 * `<button>` placeholder se desmonta al activarse y el navegador perdería el
 * foco si no se reclama explícitamente).
 */
export function VideoScrubDemo({ strings }: Props) {
  const [hintVisible, setHintVisible] = useState(true);
  const [activated, setActivated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  /** Solo reclama el foco tras el swap si la activación vino de teclado (no de hover). */
  const refocusAfterSwap = useRef(false);

  function activate() {
    setHintVisible(false);
    setActivated(true);
  }

  function handleFocus() {
    refocusAfterSwap.current = true;
    activate();
  }

  useEffect(() => {
    if (!activated || !refocusAfterSwap.current) return;
    refocusAfterSwap.current = false;
    containerRef.current?.querySelector<HTMLElement>('[tabindex]')?.focus({ preventScroll: true });
  }, [activated]);

  return (
    <figure className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative aspect-video w-full max-w-md"
        onPointerEnter={activate}
        onFocus={handleFocus}
      >
        {activated ? (
          <VideoScrubPreview
            src="/demo/scrub.mp4"
            poster="/demo/scrub-poster.webp"
            label={strings.label}
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            aria-label={strings.label}
            onClick={activate}
            className="block h-full w-full cursor-pointer overflow-hidden rounded-card border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <img
              src="/demo/scrub-poster.webp"
              alt=""
              width={864}
              height={486}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        )}
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
