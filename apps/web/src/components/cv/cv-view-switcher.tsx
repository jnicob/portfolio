'use client';

import { useId } from 'react';
import { CV_VIEWS } from '@/data/constants';
import type { CvView } from '@/data/constants';
import { cn } from '@/lib/cn';

export type CvViewSwitcherLabels = Record<CvView, string> & { groupLabel: string };

type CvViewSwitcherProps = {
  view: CvView;
  onChange: (view: CvView) => void;
  labels: CvViewSwitcherLabels;
};

/**
 * Selector segmentado de vista del CV: radios nativos (teclado de flechas gratis)
 * visualmente ocultos, con labels estilizadas — `:checked` marca la opción activa vía
 * `has-[:checked]`. `no-print`: solo tiene sentido en pantalla (T24).
 */
export function CvViewSwitcher({ view, onChange, labels }: CvViewSwitcherProps) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={labels.groupLabel}
      className="no-print inline-flex gap-0.5 rounded-control border border-border p-0.5"
    >
      {CV_VIEWS.map((option) => (
        <label
          key={option}
          className={cn(
            'cursor-pointer rounded-control px-3 py-1 text-sm text-fg-muted transition-colors',
            'has-[:checked]:bg-accent has-[:checked]:text-accent-fg',
            'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
          )}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={view === option}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          {labels[option]}
        </label>
      ))}
    </div>
  );
}
