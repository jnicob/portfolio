'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DEFAULT_MAX_TILT_DEG = 4;
const GLOW_RADIUS_PX = 240;

type TiltCardProps = {
  children: ReactNode;
  /** Inclinación máxima en grados, en cada eje. */
  maxTilt?: number;
  className?: string;
};

/**
 * Envuelve contenido con un tilt 3D sutil + glow radial que sigue el puntero.
 *
 * Capacidades resueltas una vez al montar (no reactivas a cambios en vivo, igual
 * que `prefersReducedMotion`): puntero fino (`(hover: hover) and (pointer: fine)`)
 * habilita el glow; puntero fino SIN `prefers-reduced-motion` habilita además el
 * tilt. En touch queda como un div inerte (sin glow ni tilt). Con reduced-motion,
 * el glow sigue disponible mostrado al hover, pero centrado y estático — no sigue
 * al puntero, porque el tilt (que actualiza `--tilt-gx/gy`) está desactivado.
 * `will-change: transform` solo mientras hay puntero encima.
 */
export function TiltCard({ children, maxTilt = DEFAULT_MAX_TILT_DEG, className }: TiltCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pointerFine, setPointerFine] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
    setPointerFine(fine);
    setTiltEnabled(fine && !prefersReducedMotion());
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    setHovering(true);
    if (!tiltEnabled) return;
    const root = rootRef.current;
    const rect = root?.getBoundingClientRect();
    if (!root || !rect || rect.width === 0 || rect.height === 0) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    root.style.setProperty('--tilt-rx', `${((0.5 - py) * maxTilt * 2).toFixed(2)}deg`);
    root.style.setProperty('--tilt-ry', `${((px - 0.5) * maxTilt * 2).toFixed(2)}deg`);
    root.style.setProperty('--tilt-gx', `${(px * 100).toFixed(1)}%`);
    root.style.setProperty('--tilt-gy', `${(py * 100).toFixed(1)}%`);
  }

  function handlePointerLeave() {
    setHovering(false);
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty('--tilt-rx', '0deg');
    root.style.setProperty('--tilt-ry', '0deg');
  }

  return (
    <div
      ref={rootRef}
      data-tilt
      className={cn(tiltEnabled && 'transition-transform duration-150 ease-out', className)}
      style={
        tiltEnabled
          ? {
              transform:
                'perspective(800px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg))',
              willChange: hovering ? 'transform' : undefined,
            }
          : undefined
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      {pointerFine && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-200',
            hovering && 'opacity-[0.12]',
          )}
          style={{
            background: `radial-gradient(${GLOW_RADIUS_PX}px circle at var(--tilt-gx, 50%) var(--tilt-gy, 50%), var(--color-accent), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
