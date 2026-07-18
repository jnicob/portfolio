'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from 'react';

export type VideoScrubPreviewProps = {
  /** URL del vídeo (mismo origen o CORS habilitado). */
  src: string;
  /** Imagen mostrada antes de la interacción / mientras carga metadata. */
  poster?: string;
  /** Nombre accesible del área interactiva. */
  label: string;
  /** Habilita el scrub por teclado (flechas ±5%, Home/End). Default `true`. */
  scrubOnFocus?: boolean;
  className?: string;
};

/** Paso de las flechas de teclado, como fracción 0-1 (5%). */
const KEY_STEP = 0.05;

/** Formatea segundos como `m:ss` (p.ej. 90 → "1:30"). */
function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/** Vídeo que se recorre al mover el puntero (estilo miniaturas de YouTube, spec A6). */
export function VideoScrubPreview({
  src,
  poster,
  label,
  scrubOnFocus = true,
  className,
}: VideoScrubPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDurationState] = useState<number | null>(null);

  function scrubTo(fraction: number) {
    const video = videoRef.current;
    const total = duration ?? video?.duration;
    if (!video || !Number.isFinite(total) || (total ?? 0) <= 0) return;
    const clamped = Math.min(1, Math.max(0, fraction));
    video.currentTime = clamped * (total as number);
    setProgress(clamped * 100);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const fraction = (event.clientX - rect.left) / rect.width;
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      scrubTo(fraction);
    });
  }

  function onPointerLeave() {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const video = videoRef.current;
    if (video) video.currentTime = 0;
    setProgress(0);
  }

  function onLoadedMetadata(event: SyntheticEvent<HTMLVideoElement>) {
    setDurationState(event.currentTarget.duration);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!scrubOnFocus) return;
    const fraction = progress / 100;
    if (event.key === 'ArrowRight') scrubTo(fraction + KEY_STEP);
    else if (event.key === 'ArrowLeft') scrubTo(fraction - KEY_STEP);
    else if (event.key === 'Home') scrubTo(0);
    else if (event.key === 'End') scrubTo(1);
    else return;
    event.preventDefault();
  }

  const style = { '--mk-scrub-pos': `${progress}%` } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={['mk-scrub', className].filter(Boolean).join(' ')}
      tabIndex={scrubOnFocus ? 0 : undefined}
      aria-label={label}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="metadata"
        aria-hidden
        onLoadedMetadata={onLoadedMetadata}
      />
      <div className="mk-scrub__track" aria-hidden>
        <div className="mk-scrub__bar" aria-hidden />
      </div>
      <div className="mk-scrub__time" aria-hidden>
        {duration != null ? `${formatTime((progress / 100) * duration)} / ${formatTime(duration)}` : ''}
      </div>
    </div>
  );
}
