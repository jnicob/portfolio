import type { ReactNode } from 'react';
import { HeroCanvas } from './hero-canvas';

type HomeBackgroundProps = { children: ReactNode };

/**
 * Superficie completa del inicio: el canvas mide y escucha el puntero sobre
 * todo el `main`; el contenido queda en una capa superior para conservar sus
 * interacciones y permitir que las cards añadan su propio glow.
 */
export function HomeBackground({ children }: HomeBackgroundProps) {
  return (
    <main className="relative isolate mx-auto max-w-5xl overflow-hidden px-4">
      <HeroCanvas />
      <div className="relative z-10 flex flex-col gap-8">{children}</div>
    </main>
  );
}
