'use client';

import { useEffect, useRef, useState } from 'react';
import type { CvView } from '@/data/schemas';
import { buildShareUrl, currentSkin, currentTheme } from '@/lib/appearance';
import { Button } from '@/components/ui/button';

const FEEDBACK_TIMEOUT_MS = 2000;

type ShareState = 'idle' | 'copied' | 'error';

export type ShareViewButtonLabels = { share: string; copied: string; error: string };

type ShareViewButtonProps = {
  /** Vista activa del CV a incluir en la URL; se omite en páginas sin vistas (showcase). */
  view?: CvView;
  labels: ShareViewButtonLabels;
};

/**
 * Botón "Compartir esta vista" (T25): construye una URL con `origin`/`pathname` actuales +
 * apariencia leída del DOM (`data-theme`/`data-skin`) + `view` si se pasa, y la copia al
 * portapapeles. Feedback explícito en `aria-live="polite"` (nunca solo color); vuelve a
 * `idle` a los 2s. `no-print`: solo tiene sentido en pantalla.
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
      <Button variant="secondary" size="sm" onClick={handleClick}>
        {labels.share}
      </Button>
      <span aria-live="polite" className="text-sm text-fg-muted">
        {feedback}
      </span>
    </div>
  );
}
