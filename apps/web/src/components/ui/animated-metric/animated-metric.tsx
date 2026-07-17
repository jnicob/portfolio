'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DEFAULT_DURATION_MS = 900;

/** Reproduce el patrón del literal original (prefijo, separador de miles, sufijo) sobre n. */
export function formatLike(original: string, n: number): string {
  const match = /^(\D*)([\d.,\s]+)(.*)$/.exec(original);
  if (!match) return original;
  const [, prefix = '', digits = '', suffix = ''] = match;
  const separator = /[.,\s]/.exec(digits)?.[0];
  let body = String(n);
  if (separator) body = body.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${prefix}${body}${suffix}`;
}

type AnimatedMetricProps = {
  /** Literal de la métrica tal cual se muestra, p.ej. `'25+'` o `'1.000+'`. */
  value: string;
  durationMs?: number;
};

/**
 * Anima un número 0→N al entrar en viewport (IntersectionObserver, una vez),
 * conservando el formato del literal original. El primer render (SSR y
 * cliente por igual) siempre muestra el valor final, evitando un mismatch
 * de hidratación; el conteo 0→N solo arranca cuando el elemento intersecta.
 * Sin IO (SSR/tests) o con `prefers-reduced-motion`, no hay animación: el
 * valor final se queda tal cual.
 * El nodo animado es decorativo (`aria-hidden`); el valor real vive en `sr-only`
 * para que quede accesible desde el primer render.
 */
export function AnimatedMetric({ value, durationMs = DEFAULT_DURATION_MS }: AnimatedMetricProps) {
  const targetRef = useRef<HTMLSpanElement>(null);
  // El estado inicial es siempre el valor final, igual en servidor y cliente:
  // el servidor (sin IntersectionObserver) no tiene otra opción, así que el
  // cliente debe pintar lo mismo en su primer render para no producir un
  // mismatch de hidratación. El conteo 0→N arranca solo al intersectar (ver
  // efecto más abajo), nunca antes del primer paint.
  const [display, setDisplay] = useState(value);
  const target = Number((/[\d.,\s]+/.exec(value)?.[0] ?? '0').replace(/[.,\s]/g, ''));

  useEffect(() => {
    const node = targetRef.current;
    if (!node || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return;

    let frame: number | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - (1 - t) ** 3;
        setDisplay(formatLike(value, Math.round(target * eased)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [value, target, durationMs]);

  return (
    <span ref={targetRef}>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
