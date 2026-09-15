'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { prefersReducedMotion } from '../internal/prefers-reduced-motion';

export type HoverVideoProps = {
  /** MP4 URL; only downloaded after activation (facade — 0 bytes at rest). */
  src: string;
  /** Imagen visible en reposo. */
  poster: string;
  /** Accessible name of the interactive area. */
  label: string;
  /** ms of sustained hover before activating the video. Default `300`. */
  delay?: number;
  /** Intrinsic dimensions of the poster (zero CLS). */
  width: number;
  height: number;
  className?: string;
  /** Classes for the poster and mounted video; allows defining fit from the consumer. */
  mediaClassName?: string;
};

const DEFAULT_DELAY = 300;

/**
 * `matchMedia` is optional (SSR/test environment without polyfill): in its absence,
 * fine pointer is assumed, treating hover enhancement as progressive rather than
 * blocking it — explicit toggle (click/Enter/Space) always works the same.
 */
function hasFinePointer(): boolean {
  return (
    typeof window === 'undefined' ||
    !window.matchMedia ||
    window.matchMedia('(pointer: fine)').matches
  );
}

/**
 * Video facade: at rest only the `<img poster>` exists (zero video bytes
 * downloaded). Sustained hover of `delay` ms mounts the `<video>` with autoplay;
 * leaving the area before the delay expires cancels it. Keyboard toggle
 * (Enter/Space) or click always works, even with `prefers-reduced-motion`
 * or coarse pointer (where hover alone activates nothing).
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
