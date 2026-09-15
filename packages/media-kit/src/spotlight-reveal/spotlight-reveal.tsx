'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { isMediaSource, type MediaSource } from '../media-source';

export type SpotlightRevealProps = {
  /** Capa siempre visible. */
  base: ReactNode | MediaSource;
  /** Capa revelada bajo la lente (recortada con `clip-path`). */
  reveal: ReactNode | MediaSource;
  /** Accessible name of the interactive area. */
  label: string;
  /** Radio de la lente en px. Default 110. */
  radius?: number;
  /** Initial position of the lens, % 0-100. Default `{ x: 50, y: 50 }`. */
  defaultPosition?: { x: number; y: number };
  /** Badges superpuestos (`aria-hidden`), esquina superior izquierda/derecha. */
  overlayLabels?: { base?: string; reveal?: string };
  className?: string;
};

/** Paso de las flechas de teclado, en %. Shift usa el paso fino. */
const STEP = 5;
const FINE_STEP = 1;

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function renderSide(side: ReactNode | MediaSource): ReactNode {
  if (isMediaSource(side)) {
    return <img src={side.src} alt={side.alt} draggable={false} />;
  }
  return side;
}

/**
 * Magnifier/flashlight revealing `reveal` over `base` under the pointer (spec A4, F3.6).
 * Pointer: the lens follows `pointermove` (coordinates relative to container) and hides
 * upon leaving the area. Keyboard: `tabIndex={0}` container with arrow keys that move
 * the lens in 5% steps (Shift = 1%), `Home` centers, `Escape` hides the lens without
 * losing focus. With focus, the lens remains always visible in its last position.
 */
export function SpotlightReveal({
  base,
  reveal,
  label,
  radius = 110,
  defaultPosition = { x: 50, y: 50 },
  overlayLabels,
  className,
}: SpotlightRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(defaultPosition);
  const [active, setActive] = useState(false);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    setPosition({
      x: clampPct(((event.clientX - rect.left) / rect.width) * 100),
      y: clampPct(((event.clientY - rect.top) / rect.height) * 100),
    });
    setActive(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setActive(false);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setPosition({ x: 50, y: 50 });
      setActive(true);
      return;
    }
    const step = event.shiftKey ? FINE_STEP : STEP;
    const moves: Record<string, { dx: number; dy: number }> = {
      ArrowRight: { dx: step, dy: 0 },
      ArrowLeft: { dx: -step, dy: 0 },
      ArrowDown: { dx: 0, dy: step },
      ArrowUp: { dx: 0, dy: -step },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setPosition((p) => ({ x: clampPct(p.x + move.dx), y: clampPct(p.y + move.dy) }));
    setActive(true);
  }

  const style = {
    '--mk-spot-x': `${position.x}%`,
    '--mk-spot-y': `${position.y}%`,
    '--mk-spot-radius': `${radius}px`,
    // "Effective" radius of the clip: 0 when inactive, the configured radius
    // when active. Only THIS variable transitions (see styles.css) — x/y and
    // incluso --mk-spot-radius (usado por el anillo) se aplican siempre al instante.
    '--mk-spot-active-radius': active ? `${radius}px` : '0px',
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={['mk-spotlight', className].filter(Boolean).join(' ')}
      tabIndex={0}
      aria-label={label}
      aria-roledescription="spotlight"
      data-active={active || undefined}
      style={style}
      onPointerDown={onPointerMove}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onKeyDown={onKeyDown}
    >
      <div className="mk-spotlight__base">{renderSide(base)}</div>
      <div className="mk-spotlight__reveal" aria-hidden>
        {renderSide(reveal)}
      </div>
      <div className="mk-spotlight__lens" aria-hidden />
      {overlayLabels?.base && (
        <span className="mk-spotlight__badge" data-side="base" aria-hidden>
          {overlayLabels.base}
        </span>
      )}
      {overlayLabels?.reveal && (
        <span className="mk-spotlight__badge" data-side="reveal" aria-hidden>
          {overlayLabels.reveal}
        </span>
      )}
    </div>
  );
}
