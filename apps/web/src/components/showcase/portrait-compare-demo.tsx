'use client';

import { useEffect, useRef, useState } from 'react';
import { CompareSlider } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';

/**
 * Demo color/B-N: un único bitmap; el lado "antes" deriva el blanco y negro con
 * filter grayscale (cero peso extra). Fullscreen NATIVO sobre el contenedor del
 * slider — no el lightbox de zoom, cuyos gestos de pan chocan con el arrastre
 * del divisor.
 */
export function PortraitCompareDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  useEffect(() => {
    setFullscreenSupported(Boolean(document.fullscreenEnabled));
    const sync = () => setFullscreenActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void containerRef.current?.requestFullscreen().catch(() => {});
    }
  }

  return (
    <figure className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:bg-bg [&:fullscreen]:p-8"
      >
        <div className="w-full">
          <CompareSlider
            before={
              <img
                src="/demo/portrait.webp"
                alt="Retrato en blanco y negro"
                width={1600}
                height={900}
                loading="lazy"
                style={{ filter: 'grayscale(1)' }}
              />
            }
            after={
              <img src="/demo/portrait.webp" alt="" width={1600} height={900} loading="lazy" />
            }
            label="Comparar blanco y negro con color"
          />
        </div>
        {fullscreenSupported ? (
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-3 top-3"
            onClick={toggleFullscreen}
          >
            {fullscreenActive ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
          </Button>
        ) : null}
      </div>
      <figcaption className="text-sm text-fg-muted">
        Colorización simulada — un único bitmap; el B-N se deriva con{' '}
        <code>filter: grayscale(1)</code>. Retrato generado con IA.
      </figcaption>
    </figure>
  );
}
