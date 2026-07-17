'use client';

import { useEffect, useRef, useState } from 'react';
import type { ApiDemo } from '@/data/api-demo';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PENDING_MS = 600;
/** ~800 caracteres/s a 60fps ≈ 13.3 car/frame, redondeado a 14. */
const CHARS_PER_FRAME = 14;
const COPY_FEEDBACK_MS = 2000;

type PlayerState = 'idle' | 'pending' | 'streaming' | 'done';

export type ApiRequestPlayerLabels = {
  run: string;
  running: string;
  /** Etiqueta de estado (font-mono) junto al spinner mientras `state === 'pending'`. */
  pending: string;
  /** Etiqueta de estado (font-mono) junto al caret mientras `state === 'streaming'`. */
  streaming: string;
  copy: string;
  copied: string;
  done: string;
  /** Contenido del `<pre>` de respuesta en `state === 'idle'`, antes de la primera ejecución. */
  responsePlaceholder: string;
};

type Props = { demo: ApiDemo; labels: ApiRequestPlayerLabels };

/**
 * Demo interactiva de un endpoint (T19): bloque request estático + botón Run
 * que simula una llamada real — 600 ms de latencia (`pending`, spinner) y la
 * respuesta escribiéndose en streaming (rAF, ~14 car/frame) con caret, hasta
 * `done` (status badge + botón copy). Con `prefers-reduced-motion` la
 * respuesta aparece completa, sin typing. Reejecutable desde cualquier estado.
 * Reutilizada en F4 con request/response reales del playground (`demo`/`labels`
 * son props, nada hardcodeado en el componente salvo el propio comportamiento).
 */
export function ApiRequestPlayer({ demo, labels }: Props) {
  const [state, setState] = useState<PlayerState>('idle');
  const [responseText, setResponseText] = useState('');
  const [copied, setCopied] = useState(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const frame = useRef<number | null>(null);

  const requestText = JSON.stringify(demo.request, null, 2);
  const fullResponse = JSON.stringify(demo.response, null, 2);

  useEffect(() => {
    return () => {
      clearTimeout(pendingTimeout.current);
      clearTimeout(copyTimeout.current);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function run() {
    clearTimeout(pendingTimeout.current);
    if (frame.current != null) cancelAnimationFrame(frame.current);
    setCopied(false);
    setResponseText('');
    setState('pending');

    pendingTimeout.current = setTimeout(() => {
      if (prefersReducedMotion()) {
        setResponseText(fullResponse);
        setState('done');
        return;
      }
      setState('streaming');
      let index = 0;
      const tick = () => {
        index = Math.min(fullResponse.length, index + CHARS_PER_FRAME);
        setResponseText(fullResponse.slice(0, index));
        if (index < fullResponse.length) {
          frame.current = requestAnimationFrame(tick);
        } else {
          frame.current = null;
          setState('done');
        }
      };
      frame.current = requestAnimationFrame(tick);
    }, PENDING_MS);
  }

  async function copy() {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(fullResponse);
      setCopied(true);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Sin feedback de error dedicado: esta demo no simula fallos de portapapeles.
    }
  }

  const isRunning = state === 'pending' || state === 'streaming';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-sm text-fg-muted">
          <span className="font-semibold text-fg">{demo.method}</span>
          <span>{demo.path}</span>
        </div>
        <pre className="overflow-x-auto rounded-control border border-border bg-surface p-4 font-mono text-sm text-fg">
          {requestText}
        </pre>
      </div>

      <div>
        <Button onClick={run} disabled={isRunning}>
          {isRunning ? labels.running : labels.run}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {/* Idle no tiene nada que mostrar aquí (ni spinner, ni badge): en vez de
            una fila min-h-8 hueca, directamente no se renderiza hasta pending. */}
        {state !== 'idle' && (
          <div className="flex min-h-8 items-center gap-2">
            {state === 'pending' && (
              <>
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent"
                />
                <span className="font-mono text-sm text-fg-muted">{labels.pending}</span>
              </>
            )}
            {state === 'streaming' && (
              <span className="font-mono text-sm text-fg-muted">{labels.streaming}</span>
            )}
            {state === 'done' && (
              <>
                <Badge variant="accent">{demo.status}</Badge>
                <Button variant="ghost" size="sm" onClick={copy}>
                  {copied ? labels.copied : labels.copy}
                </Button>
              </>
            )}
          </div>
        )}
        <pre className="overflow-x-auto rounded-control border border-border bg-surface p-4 font-mono text-sm text-fg">
          {state === 'idle' ? labels.responsePlaceholder : responseText}
          {state === 'streaming' && (
            <span aria-hidden className="animate-pulse">
              ▌
            </span>
          )}
        </pre>
        {/* Único aria-live del componente: anuncia la llegada de la respuesta, no el
            texto que se va escribiendo (evita verbosidad en streaming). */}
        <div role="status" className="sr-only">
          {state === 'done' ? labels.done : ''}
        </div>
      </div>
    </div>
  );
}
