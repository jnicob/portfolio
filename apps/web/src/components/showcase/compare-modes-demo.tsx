'use client';

import { useState } from 'react';
import { CompareSlider, type CompareSliderMode } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';

/** Perf (T30/qa-B1): ver el mismo comentario en media-kit-demo.tsx — variante ~840w. */
const LANDSCAPE_SRC_SET = '/demo/landscape-840.webp 840w, /demo/landscape.webp 1600w';
/** Figure a ancho completo del contenido (sin grid), en cualquier breakpoint. */
const FULL_WIDTH_SIZES = '(min-width: 1024px) 1000px, calc(100vw - 3rem)';

/** Orden de exhibición de los modos en la botonera (spec B4). */
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
  /** Anunciado/mostrado al pausar el switch de blink. */
  pauseLabel: string;
  /** Anunciado/mostrado al reanudar el switch de blink. */
  resumeLabel: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: CompareModesDemoStrings };

/**
 * Botonera + CompareSlider que alterna `compareMode` (spec B4, F3.6): misma
 * foto de paisaje que las demos de arriba (T11), cuatro ejes de comparación.
 *
 * El slider se remonta en cada cambio de modo (`key={mode}`): `blink`
 * inicializa su estado "running" en el mount (`useState(() => …)` dentro del
 * paquete) y NO se reinicializa si solo cambia la prop `compareMode` en un
 * componente ya montado. Sin este remount, volver a "blink" tras haberlo
 * pausado lo dejaría pausado para siempre (hallazgo de la review de T5 en
 * media-kit 0.5) — el `key` fuerza a React a desmontar/montar de nuevo.
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
      />
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
