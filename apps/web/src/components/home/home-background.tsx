import type { ReactNode } from 'react';
import { HeroCanvas } from './hero-canvas';

type HomeBackgroundProps = { children: ReactNode };

/**
 * Full home surface in two layers: `main` is full-bleed and the
 * canvas measures and listens for pointer events across the entire viewport width; the
 * content remains in an inner layer constrained to `max-w-5xl` to
 * preserve the layout and its interactions (cards add their own glow).
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
