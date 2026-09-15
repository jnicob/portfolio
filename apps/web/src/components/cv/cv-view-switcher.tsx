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
 * Segmented CV view selector: native radios (free arrow-key navigation)
 * visually hidden, with styled labels — `:checked` marks the active option via
 * `has-[:checked]`. `no-print`: only makes sense on screen (T24).
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
            'hover:text-fg hover:bg-surface/50',
            'has-[:checked]:bg-accent has-[:checked]:text-accent-fg has-[:checked]:hover:bg-accent',
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
