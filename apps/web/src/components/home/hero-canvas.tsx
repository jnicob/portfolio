'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const GRID_STEP_PX = 24;
const POINTER_RADIUS_PX = 140;
const BASE_DOT_RADIUS_PX = 1;
const MAX_DOT_RADIUS_PX = 2.5;
// Con 0.15 el grid en reposo quedaba casi invisible en dark (design review
// F3.6 T21, finding "canvas dark en reposo"): el degradado de --color-accent
// over the dark background it needs more base alpha to read as a texture without
// puntero encima. 0.35 iguala el "piso" que ya usaba el propio elemento
// <canvas> (see `opacity-[0.35]` below) — same value in both themes
// (verified in dev: in light it doesn't get loud, it remains a background
// sutil de puntos).
const BASE_DOT_ALPHA = 0.35;
const MAX_DEVICE_PIXEL_RATIO = 2;

type PointerPosition = { x: number; y: number };

/**
 * Decorative canvas positioned behind the Hero content: a grid of
 * dots (`GRID_STEP_PX` step) whose radius/opacity increases with falloff near
 * the pointer (`POINTER_RADIUS_PX`). Purely visual — `pointer-events: none`
 * + `aria-hidden`, without i18n or copy.
 *
 * The rAF loop only runs while there is a pointer over the parent container,
 * without `prefers-reduced-motion` and with the tab visible; outside those
 * conditions it remains at rest: a single static frame, no loop. The color
 * is read from computed `--color-accent` and re-read (MutationObserver) when
 * `data-theme`/`data-skin` changes on `<html>`, because that value is not
 * observable via CSS. `devicePixelRatio` is capped at 2 for the backing buffer.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Declared as const/arrow (not hoisted `function`): this way TS preserves the
    // estrechamiento de `canvas`/`container`/`ctx` a no-nulos dentro de estos
    // closures — con declaraciones hoisteadas, TS no puede asumir que se
    // invoked after the guard above and treats them as possibly null.
    const readAccentColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();

    let accent = readAccentColor();
    let pointer: PointerPosition | null = null;
    let width = 0;
    let height = 0;
    let frame: number | null = null;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // Without `--color-accent` resolved yet (or in the middle of a
      // theme transition) we leave the frame empty instead of painting with a color by
      // defecto: cero fallbacks de color hardcodeados.
      if (!accent) return;
      ctx.fillStyle = accent;
      for (let gy = GRID_STEP_PX / 2; gy < height; gy += GRID_STEP_PX) {
        for (let gx = GRID_STEP_PX / 2; gx < width; gx += GRID_STEP_PX) {
          const dist = pointer ? Math.hypot(gx - pointer.x, gy - pointer.y) : Infinity;
          const falloff = dist < POINTER_RADIUS_PX ? 1 - dist / POINTER_RADIUS_PX : 0;
          ctx.globalAlpha = BASE_DOT_ALPHA + falloff * (1 - BASE_DOT_ALPHA);
          const radius = BASE_DOT_RADIUS_PX + falloff * (MAX_DOT_RADIUS_PX - BASE_DOT_RADIUS_PX);
          ctx.beginPath();
          ctx.arc(gx, gy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // <canvas> is a replaced element: without an explicit CSS size, its box
      // layout box takes the INTRINSIC size from the width/height attributes of
      // arriba — que ya vienen escalados por dpr. Con dpr > 1 (cualquier
      // HiDPI display) that leaves the canvas box larger than the
      // contenedor real y, con overflow-hidden en el Hero, el grid solo llena
      // el cuadrante superior-izquierdo, desalineado del puntero. Fijamos el
      // CSS size to the actual measured size, independent of the backing buffer.
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const stopLoop = () => {
      if (frame == null) return;
      cancelAnimationFrame(frame);
      frame = null;
    };

    const tick = () => {
      draw();
      if (pointer && !prefersReducedMotion() && !document.hidden) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = null;
      }
    };

    /** Starts loop if conditions allow; otherwise renders a static frame. */
    const maybeStartLoop = () => {
      if (frame != null) return;
      if (!pointer || prefersReducedMotion() || document.hidden) {
        draw();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      maybeStartLoop();
    };

    const handlePointerLeave = () => {
      pointer = null;
      stopLoop();
      draw();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
        draw();
      } else {
        maybeStartLoop();
      }
    };

    const handleThemeChange = () => {
      accent = readAccentColor();
      draw();
    };

    resize();

    // jsdom does not implement ResizeObserver: falls back to the size measured on mount
    // (same defensive pattern as AnimatedMetric with IntersectionObserver).
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    }

    const mutationObserver = new MutationObserver(handleThemeChange);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-skin'],
    });

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopLoop();
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
    />
  );
}
