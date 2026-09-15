'use client';

import { useState } from 'react';
import { CompareSlider, type CompareSliderMode } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';

/** Perf (T30/qa-B1): ver el mismo comentario en media-kit-demo.tsx — variante ~840w. */
const LANDSCAPE_SRC_SET = '/demo/landscape-840.webp 840w, /demo/landscape.webp 1600w';
/** Figure a ancho completo del contenido (sin grid), en cualquier breakpoint. */
const FULL_WIDTH_SIZES = '(min-width: 1024px) 1000px, calc(100vw - 3rem)';

/** Display order of the modes in the button bar (spec B4). */
const MODES = [
  'wipe',
  'onion',
  'blink',
  'side-by-side',
] as const satisfies readonly CompareSliderMode[];

export type CompareModesDemoStrings = {
  /** Nombre accesible del `role="group"` de la botonera. */
  groupLabel: string;
  /** Un label por modo, indexado por `CompareSliderMode`. */
  modeLabels: Record<CompareSliderMode, string>;
  /** Alt del lado "antes" (ReactNode con filtro desaturado). */
  beforeAlt: string;
  /** Nombre accesible del divisor del CompareSlider. */
  compareLabel: string;
  /** Anunciado al pausar el hover-follow del divisor (modos wipe/onion, C6). */
  pauseLabel: string;
  /** Anunciado al reanudar el hover-follow del divisor (modos wipe/onion, C6). */
  resumeLabel: string;
  /**
   * Text for the blink mode pause/resume switch when running (switches to
   * "paused" on press). Dedicated i18n key (design review F3.6 T21, code review
   * Minor): previously reused `pauseLabel`/`resumeLabel`, intended for wipe/onion
   * hover-follow, not for this switch.
   */
  blinkPauseLabel: string;
  /** Text for the blink switch when paused (switches to "running" on press). */
  blinkResumeLabel: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: CompareModesDemoStrings };

/**
 * Button group + CompareSlider that toggles `compareMode` (spec B4, F3.6): same
 * landscape photo as the demos above (T11), four comparison axes.
 *
 * The slider remounts on every mode change (`key={mode}`): `blink`
 * initializes its "running" state on mount (`useState(() => …)` inside the
 * package) and is NOT reinitialized if only the `compareMode` prop changes on an
 * already mounted component. Without this remount, returning to "blink" after having
 * paused it would leave it paused forever (finding from T5 review in
 * media-kit 0.5) — the `key` forces React to unmount/mount again.
 */
export function CompareModesDemo({ strings }: Props) {
  const [mode, setMode] = useState<CompareSliderMode>('wipe');

  return (
    <figure className="flex flex-col gap-4">
      <div role="group" aria-label={strings.groupLabel} className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <Button
            key={m}
            variant={mode === m ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {strings.modeLabels[m]}
          </Button>
        ))}
      </div>
      <CompareSlider
        key={mode}
        compareMode={mode}
        before={
          <img
            src="/demo/landscape.webp"
            srcSet={LANDSCAPE_SRC_SET}
            sizes={FULL_WIDTH_SIZES}
            alt={strings.beforeAlt}
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
            sizes={FULL_WIDTH_SIZES}
            alt=""
            width={1600}
            height={900}
            loading="lazy"
          />
        }
        label={strings.compareLabel}
        pauseLabel={strings.pauseLabel}
        resumeLabel={strings.resumeLabel}
        blinkPauseLabel={strings.blinkPauseLabel}
        blinkResumeLabel={strings.blinkResumeLabel}
      />
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
