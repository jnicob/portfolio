'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DEFAULT_DURATION_MS = 900;

/**
 * Formats number `n` matching original template pattern (prefix, thousands separator, suffix).
 * Numeric segment starts and ends with a digit, preserving surrounding text.
 */
export function formatLike(original: string, n: number): string {
  if (!/\d/.test(original)) return original;
  const match = /^(\D*)(\d(?:[\d.,]*\d)?)(.*)$/.exec(original);
  if (!match) return original;
  const [, prefix = '', digits = '', suffix = ''] = match;
  const separator = /[.,]/.exec(digits)?.[0];
  let body = String(n);
  if (separator) body = body.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${prefix}${body}${suffix}`;
}

type AnimatedMetricProps = {
  /** Metric literal as displayed, e.g. `'25+'` or `'1.000+'`. */
  value: string;
  durationMs?: number;
};

/**
 * Animates a number 0→N upon entering the viewport (IntersectionObserver, once),
 * preserving the format of the original literal. The first render (SSR and
 * client alike) always shows the final value, avoiding a hydration
 * mismatch; the 0→N count only starts when the element intersects.
 * Without IO (SSR/tests) or with `prefers-reduced-motion`, there is no animation: the
 * final value remains as-is.
 * The animated node is decorative (`aria-hidden`); the real value lives in `sr-only`
 * so that it remains accessible from the first render.
 */
export function AnimatedMetric({ value, durationMs = DEFAULT_DURATION_MS }: AnimatedMetricProps) {
  const targetRef = useRef<HTMLSpanElement>(null);
  // El estado inicial es siempre el valor final, igual en servidor y cliente:
  // Server (without IntersectionObserver) renders final value to prevent hydration mismatch.
  // cliente debe pintar lo mismo en su primer render para no producir un
  // hydration mismatch. The 0→N count starts only upon intersecting (see
  // effect below), never before the first paint.
  const [display, setDisplay] = useState(value);
  const hasDigits = /\d/.test(value);
  const target = Number((/[\d.,\s]+/.exec(value)?.[0] ?? '0').replace(/[.,\s]/g, ''));

  useEffect(() => {
    const node = targetRef.current;
    // Metrics without digits (e.g. text lists like "Kling, WAN") have nothing to animate.
    // animar: se quedan en el literal directo, sin observar el elemento.
    if (
      !node ||
      !hasDigits ||
      typeof IntersectionObserver === 'undefined' ||
      prefersReducedMotion()
    )
      return;

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
  }, [value, target, durationMs, hasDigits]);

  return (
    <span ref={targetRef}>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
