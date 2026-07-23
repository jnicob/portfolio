import type { ReactNode } from 'react';
import { HeroCanvas } from './hero-canvas';

type HomeBackgroundProps = { children: ReactNode };

/**
 * Superficie completa del inicio en dos capas: el `main` es full-bleed y el
 * canvas mide y escucha el puntero sobre todo el ancho del viewport; el
 * contenido queda en una capa interior constreñida a `max-w-5xl` para
 * conservar la maqueta y sus interacciones (las cards añaden su propio glow).
 */
export function HomeBackground({ children }: HomeBackgroundProps) {
  return (
    <main className="relative isolate overflow-hidden">
      <HeroCanvas />
      <div data-home-content className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4">
        {children}
      </div>
    </main>
  );
}
