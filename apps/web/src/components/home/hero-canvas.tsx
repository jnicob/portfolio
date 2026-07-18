'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const GRID_STEP_PX = 24;
const POINTER_RADIUS_PX = 140;
const BASE_DOT_RADIUS_PX = 1;
const MAX_DOT_RADIUS_PX = 2.5;
// Con 0.15 el grid en reposo quedaba casi invisible en dark (design review
// F3.6 T21, finding "canvas dark en reposo"): el degradado de --color-accent
// sobre el fondo oscuro necesita más alpha base para leerse como textura sin
// puntero encima. 0.35 iguala el "piso" que ya usaba el propio elemento
// <canvas> (ver `opacity-[0.35]` más abajo) — mismo valor en ambos temas
// (verificado en dev: en light no se vuelve chillón, sigue siendo un fondo
// sutil de puntos).
const BASE_DOT_ALPHA = 0.35;
const MAX_DEVICE_PIXEL_RATIO = 2;

type PointerPosition = { x: number; y: number };

/**
 * Canvas decorativo posicionado detrás del contenido del Hero: un grid de
 * puntos (paso de `GRID_STEP_PX`) cuyo radio/opacidad sube con falloff cerca
 * del puntero (`POINTER_RADIUS_PX`). Puramente visual — `pointer-events: none`
 * + `aria-hidden`, sin i18n ni copy.
 *
 * El bucle de rAF solo corre mientras hay puntero sobre el contenedor padre,
 * sin `prefers-reduced-motion` y con la pestaña visible; fuera de esas
 * condiciones queda en reposo: un único frame estático, sin bucle. El color
 * se lee de `--color-accent` computado y se re-lee (MutationObserver) cuando
 * cambia `data-theme`/`data-skin` en `<html>`, porque ese valor no es
 * observable por CSS. `devicePixelRatio` se capa a 2 para el backing buffer.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Declaradas como const/arrow (no `function` hoisteada): así TS conserva el
    // estrechamiento de `canvas`/`container`/`ctx` a no-nulos dentro de estos
    // closures — con declaraciones hoisteadas, TS no puede asumir que se
    // invocan después del guard de arriba y las trata como posiblemente null.
    const readAccentColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();

    let accent = readAccentColor();
    let pointer: PointerPosition | null = null;
    let width = 0;
    let height = 0;
    let frame: number | null = null;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // Sin `--color-accent` resuelto todavía (o en medio de una transición de
      // tema) dejamos el frame vacío en vez de pintar con un color por
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
      // <canvas> es un elemento reemplazado: sin tamaño CSS explícito, su caja
      // de layout toma el tamaño INTRÍNSECO de los atributos width/height de
      // arriba — que ya vienen escalados por dpr. Con dpr > 1 (cualquier
      // pantalla HiDPI) eso deja la caja del canvas más grande que el
      // contenedor real y, con overflow-hidden en el Hero, el grid solo llena
      // el cuadrante superior-izquierdo, desalineado del puntero. Fijamos el
      // tamaño CSS al tamaño real medido, independiente del backing buffer.
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

    /** Arranca el bucle si las condiciones lo permiten; si no, deja un frame estático. */
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

    // jsdom no implementa ResizeObserver: se degrada al tamaño medido al montar
    // (mismo patrón defensivo que AnimatedMetric con IntersectionObserver).
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
