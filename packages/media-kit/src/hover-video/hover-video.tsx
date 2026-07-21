'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { prefersReducedMotion } from '../internal/prefers-reduced-motion';

export type HoverVideoProps = {
  /** URL del MP4; solo se descarga tras activación (facade — 0 bytes en reposo). */
  src: string;
  /** Imagen visible en reposo. */
  poster: string;
  /** Nombre accesible del área interactiva. */
  label: string;
  /** ms de hover sostenido antes de activar el vídeo. Default `300`. */
  delay?: number;
  /** Dimensiones intrínsecas del poster (cero CLS). */
  width: number;
  height: number;
  className?: string;
  /** Clases del poster y del vídeo montado; permite definir el fit desde el consumidor. */
  mediaClassName?: string;
};

const DEFAULT_DELAY = 300;

/**
 * `matchMedia` es opcional (SSR/entorno de test sin polyfill): en su ausencia se
 * asume puntero fino, tratando la mejora de hover como progresiva en vez de
 * bloquearla — el toggle explícito (click/Enter/Espacio) siempre funciona igual.
 */
function hasFinePointer(): boolean {
  return (
    typeof window === 'undefined' ||
    !window.matchMedia ||
    window.matchMedia('(pointer: fine)').matches
  );
}

/**
 * Facade de vídeo: en reposo solo existe el `<img poster>` (cero bytes de vídeo
 * descargados). Un hover sostenido de `delay` ms monta el `<video>` en autoplay;
 * salir del área antes de que venza el delay lo cancela. El toggle por teclado
 * (Enter/Espacio) o click siempre funciona, incluso con `prefers-reduced-motion`
 * o puntero coarse (donde el hover por sí solo no activa nada).
 */
export function HoverVideo({
  src,
  poster,
  label,
  delay = DEFAULT_DELAY,
  width,
  height,
  className,
  mediaClassName,
}: HoverVideoProps) {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => clearTimer, []);

  function onPointerEnter() {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPlaying(true);
    }, delay);
  }

  function onPointerLeave() {
    clearTimer();
    setPlaying(false);
  }

  function toggle() {
    clearTimer();
    setPlaying((prev) => !prev);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle();
  }

  return (
    <div
      className={['mk-hover-video', className].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={playing}
      data-state={playing ? 'playing' : 'idle'}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      onClick={toggle}
    >
      <img
        src={poster}
        width={width}
        height={height}
        loading="lazy"
        alt=""
        className={mediaClassName}
      />
      {playing && (
        <video src={src} autoPlay muted loop playsInline aria-hidden className={mediaClassName} />
      )}
    </div>
  );
}
