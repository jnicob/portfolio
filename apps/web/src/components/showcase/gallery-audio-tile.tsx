'use client';

import { useEffect, useRef, useState, type SyntheticEvent } from 'react';

export type GalleryAudioTileLabels = { play: string; pause: string };

type Props = {
  cover: string;
  src: string;
  width: number;
  height: number;
  labels: GalleryAudioTileLabels;
  /**
   * Omite la carátula y deja solo controles compactos (fix design review T25 I1):
   * el lightbox de audio ya pinta su propia carátula grande por encima, así que
   * una segunda instancia de este componente con su propia carátula duplicaba la
   * imagen y desbordaba el viewport. Con `hideCover` el layout pasa de "carátula +
   * botón superpuesto" a una fila horizontal botón+barra de ancho completo.
   * Default `false` (tile de la grid, sin cambios).
   */
  hideCover?: boolean;
  className?: string;
  coverClassName?: string;
};

/**
 * Tile de galería para un ítem de audio (spec F3.7 / T10): carátula +
 * overlay play/pause + barra de progreso fina.
 *
 * Sin `title` propio (fix review T11): el nombre accesible por ítem ya lo
 * llevan `labels.play`/`labels.pause` (interpolados por el consumidor, p.ej.
 * "Reproducir Lo-fi") y, en `GalleryDemo`, el `<figcaption>` visible del tile.
 * Un tercer `<span sr-only>{title}</span>` aquí solo triplicaba esa misma
 * información para lectores de pantalla.
 *
 * Facade: el `<audio src>` no se monta hasta la PRIMERA pulsación de play —
 * 0 bytes de red antes de esa interacción (mismo patrón que `VideoScrubDemo`
 * con el `<video>`). `mounted` solo pasa de `false` a `true` una vez; el
 * efecto que llama a `play()` en esa transición cubre el arranque inicial,
 * cuando el nodo `<audio>` todavía no existía en el momento del click.
 * Los toggles posteriores (ya montado) llaman a `play()`/`pause()`
 * directamente desde el handler.
 */
export function GalleryAudioTile({
  cover,
  src,
  width,
  height,
  labels,
  hideCover = false,
  className,
  coverClassName,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (mounted) {
      void audioRef.current?.play();
    }
  }, [mounted]);

  function handleToggle() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    if (mounted) {
      void audioRef.current?.play();
    } else {
      setMounted(true);
    }
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLAudioElement>) {
    const audio = event.currentTarget;
    if (audio.duration > 0) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
  }

  const audioElement = mounted && (
    <audio
      ref={audioRef}
      src={src}
      className="hidden"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
    >
      <track kind="captions" />
    </audio>
  );

  if (hideCover) {
    return (
      <div className="flex w-full items-center gap-3 rounded-card border border-border bg-surface p-3">
        <button
          type="button"
          aria-label={playing ? labels.pause : labels.play}
          onClick={handleToggle}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-fg hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div aria-hidden className="h-1 flex-1 rounded-full bg-bg">
          <div
            data-testid="audio-progress-fill"
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        {audioElement}
      </div>
    );
  }

  return (
    <div className={['relative overflow-hidden rounded-card', className].filter(Boolean).join(' ')}>
      <img
        src={cover}
        alt=""
        loading="lazy"
        width={width}
        height={height}
        className={['h-full w-full object-cover', coverClassName].filter(Boolean).join(' ')}
      />
      <button
        type="button"
        aria-label={playing ? labels.pause : labels.play}
        onClick={handleToggle}
        className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-surface/80 text-fg backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-surface/40">
        <div
          data-testid="audio-progress-fill"
          className="h-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
      {audioElement}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}
