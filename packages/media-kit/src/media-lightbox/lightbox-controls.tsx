'use client';

import type { MediaLightboxFit, MediaLightboxLabels } from './media-lightbox';

// Re-export: lightbox-controls.test.tsx importa los tipos desde este módulo.
export type { MediaLightboxFit, MediaLightboxLabels };

export type LightboxControlsProps = {
  labels: MediaLightboxLabels;
  percent: number;
  atMin: boolean;
  atMax: boolean;
  fit: MediaLightboxFit;
  nextFit: MediaLightboxFit;
  fullscreenSupported: boolean;
  fullscreenActive: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCycleFit: () => void;
  onToggleFullscreen: () => void;
};

/**
 * Sustituye {clave} por values[clave]. Exportado para que media-lightbox reutilice la
 * misma plantilla en el aria-live del zoom (que vive fuera de esta región inertizable).
 */
export function template(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

export function LightboxControls({
  labels,
  percent,
  atMin,
  atMax,
  fit,
  nextFit,
  fullscreenSupported,
  fullscreenActive,
  onZoomIn,
  onZoomOut,
  onReset,
  onCycleFit,
  onToggleFullscreen,
}: LightboxControlsProps) {
  return (
    <div className="mk-lightbox__controls" role="group" aria-label={labels.controls}>
      <button
        type="button"
        aria-label={labels.zoomOut}
        data-mk-tooltip={labels.zoomOut}
        data-mk-tooltip-pos="above"
        disabled={atMin}
        onClick={onZoomOut}
      >
        −
      </button>
      <span className="mk-lightbox__zoom-level" aria-hidden="true">
        {percent}%
      </span>
      <button
        type="button"
        aria-label={labels.zoomIn}
        data-mk-tooltip={labels.zoomIn}
        data-mk-tooltip-pos="above"
        disabled={atMax}
        onClick={onZoomIn}
      >
        +
      </button>
      <button
        type="button"
        aria-label={labels.reset}
        data-mk-tooltip={labels.reset}
        data-mk-tooltip-pos="above"
        onClick={onReset}
      >
        ↺
      </button>
      <button
        type="button"
        aria-label={template(labels.fit, { current: fit, next: nextFit })}
        data-mk-tooltip={template(labels.fit, { current: fit, next: nextFit })}
        data-mk-tooltip-pos="above"
        onClick={onCycleFit}
      >
        {/* Glifo de ancho fijo: el significado (fit actual → siguiente) vive en el
            aria-label. Evita meter la palabra del enum en la UI (i18n) y que la píldora
            desborde a 375px al cambiar entre "contain"/"actual". */}
        ▣
      </button>
      {fullscreenSupported ? (
        <button
          type="button"
          aria-label={fullscreenActive ? labels.exitFullscreen : labels.fullscreen}
          data-mk-tooltip={fullscreenActive ? labels.exitFullscreen : labels.fullscreen}
          data-mk-tooltip-pos="above"
          onClick={onToggleFullscreen}
        >
          ⤢
        </button>
      ) : null}
    </div>
  );
}
