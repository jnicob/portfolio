'use client';

import type { MediaLightboxFit, MediaLightboxLabels } from './media-lightbox';

// Re-export: lightbox-controls.test.tsx importa los tipos desde este módulo.
export type { MediaLightboxFit, MediaLightboxLabels };

export type LightboxControlsProps = {
  labels: MediaLightboxLabels;
  percent: number;
  /** Valor debounced para el aria-live (anuncia el final del gesto, no cada tick). */
  announcedPercent: number;
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
  onClose: () => void;
};

function template(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

export function LightboxControls({
  labels,
  percent,
  announcedPercent,
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
  onClose,
}: LightboxControlsProps) {
  return (
    <div className="mk-lightbox__controls" role="group" aria-label={labels.controls}>
      <button type="button" aria-label={labels.zoomOut} disabled={atMin} onClick={onZoomOut}>
        −
      </button>
      <span className="mk-lightbox__zoom-level" aria-hidden="true">
        {percent}%
      </span>
      <span className="mk-visually-hidden" aria-live="polite">
        {template(labels.zoomLevel, { percent: announcedPercent })}
      </span>
      <button type="button" aria-label={labels.zoomIn} disabled={atMax} onClick={onZoomIn}>
        +
      </button>
      <button type="button" aria-label={labels.reset} onClick={onReset}>
        ↺
      </button>
      <button
        type="button"
        aria-label={template(labels.fit, { current: fit, next: nextFit })}
        onClick={onCycleFit}
      >
        {nextFit}
      </button>
      {fullscreenSupported ? (
        <button
          type="button"
          aria-label={fullscreenActive ? labels.exitFullscreen : labels.fullscreen}
          onClick={onToggleFullscreen}
        >
          ⤢
        </button>
      ) : null}
      <button type="button" aria-label={labels.close} data-mk-close onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
