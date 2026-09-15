'use client';

import { useEffect, useRef, useState } from 'react';
import type { CvView } from '@/data/schemas';
import { buildShareUrl, currentSkin, currentTheme } from '@/lib/appearance';
import { ShareIcon } from '@/components/icons/share-icon';
import { Button } from '@/components/ui/button';

const FEEDBACK_TIMEOUT_MS = 2000;

type ShareState = 'idle' | 'copied' | 'error';

export type ShareViewButtonLabels = { share: string; copied: string; error: string };

type ShareViewButtonProps = {
  /** Active CV view to include in URL; omitted on viewless pages (showcase). */
  view?: CvView;
  labels: ShareViewButtonLabels;
};

/**
 * "Share this view" button (T25): builds a URL with current `origin`/`pathname` +
 * appearance read from the DOM (`data-theme`/`data-skin`) + `view` if passed, and copies it to
 * clipboard. Explicit feedback in `aria-live="polite"` (never color alone); reverts to
 * `idle` after 2s. `no-print`: only makes sense on screen.
 */
export function ShareViewButton({ view, labels }: ShareViewButtonProps) {
  const [state, setState] = useState<ShareState>('idle');
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimeout.current), []);

  function announce(next: ShareState) {
    clearTimeout(resetTimeout.current);
    setState(next);
    resetTimeout.current = setTimeout(() => setState('idle'), FEEDBACK_TIMEOUT_MS);
  }

  async function handleClick() {
    const url = buildShareUrl({
      origin: location.origin,
      pathname: location.pathname,
      theme: currentTheme(),
      skin: currentSkin(),
      ...(view ? { view } : {}),
    });

    if (!navigator.clipboard?.writeText) {
      announce('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      announce('copied');
    } catch {
      announce('error');
    }
  }

  const feedback = state === 'idle' ? '' : state === 'copied' ? labels.copied : labels.error;

  return (
    <div className="no-print flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClick}
        title={labels.share}
        aria-label={labels.share}
      >
        <ShareIcon />
        <span className="hidden sm:inline">{labels.share}</span>
      </Button>
      <span aria-live="polite" className="text-sm text-fg-muted">
        {feedback}
      </span>
    </div>
  );
}
