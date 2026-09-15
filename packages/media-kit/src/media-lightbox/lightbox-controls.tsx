'use client';

import type { MediaLightboxFit, MediaLightboxLabels } from './media-lightbox';

// Re-export: lightbox-controls.test.tsx imports the types from this module.
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
 * Substitutes {key} with values[key]. Exported so media-lightbox can reuse the
 * same template in the zoom's aria-live (which lives outside this inert-able region).
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
        {/* Fixed-width glyph: the meaning (current fit → next) lives in the
            aria-label. Avoids putting the enum word in the UI (i18n) and prevents the pill
            from overflowing at 375px when switching between "contain"/"actual". */}
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
