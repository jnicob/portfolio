'use client';

import { SpotlightReveal } from '@nicobehm/media-kit';

export type SpotlightDemoStrings = {
  /** Nombre accesible del área interactiva del spotlight. */
  label: string;
  /** Alt del lado "base" (ReactNode con `filter: grayscale(1)`). */
  baseAlt: string;
  /** Badge superpuesto en el lado base. */
  baseBadge: string;
  /** Badge superpuesto en el lado reveal. */
  revealBadge: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: SpotlightDemoStrings };

/**
 * Lupa que revela color bajo el puntero (spec B4, F3.6): una única foto de
 * paisaje — el lado "base" (B/N) deriva del mismo bitmap con
 * `filter: grayscale(1)`, cero assets extra (mismo patrón que la
 * colorización de las demos de arriba, T11).
 */
export function SpotlightDemo({ strings }: Props) {
  return (
    <figure className="flex flex-col gap-2">
      <SpotlightReveal
        base={
          <img
            src="/demo/landscape.webp"
            alt={strings.baseAlt}
            width={1600}
            height={900}
            loading="lazy"
            style={{ filter: 'grayscale(1)' }}
          />
        }
        reveal={<img src="/demo/landscape.webp" alt="" width={1600} height={900} loading="lazy" />}
        label={strings.label}
        overlayLabels={{ base: strings.baseBadge, reveal: strings.revealBadge }}
      />
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
