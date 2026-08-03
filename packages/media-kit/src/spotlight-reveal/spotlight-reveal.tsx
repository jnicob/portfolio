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
  /** Nombre accesible del área interactiva. */
  label: string;
  /** Radio de la lente en px. Default 110. */
  radius?: number;
  /** Posición inicial de la lente, % 0-100. Default `{ x: 50, y: 50 }`. */
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
 * Lupa/linterna que revela `reveal` sobre `base` bajo el puntero (spec A4, F3.6).
 * Puntero: la lente sigue `pointermove` (coordenadas relativas al contenedor) y se
 * oculta al salir del área. Teclado: contenedor `tabIndex={0}` con flechas que mueven
 * la lente en pasos de 5% (Shift = 1%), `Home` centra, `Escape` oculta la lente sin
 * perder el foco. Con foco, la lente queda siempre visible en su última posición.
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
    // Radio "efectivo" del recorte: 0 cuando está inactivo, el radio configurado
    // cuando está activo. Solo ESTA variable transiciona (ver styles.css) — x/y e
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
