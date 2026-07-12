'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

export type CompareSliderProps = {
  /** Medio original (típicamente <img>). Se muestra a la izquierda / arriba. */
  before: ReactNode;
  /** Medio procesado. Se revela a la derecha / abajo del divisor. */
  after: ReactNode;
  /** Nombre accesible del divisor. */
  label?: string;
  /** Posición inicial del divisor, 0-100. */
  initialPosition?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onPositionChange?: (position: number) => void;
};

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function CompareSlider({
  before,
  after,
  label = 'Compare',
  initialPosition = 50,
  orientation = 'horizontal',
  className,
  onPositionChange,
}: CompareSliderProps) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontal = orientation === 'horizontal';

  function update(next: number) {
    const clamped = clamp(next);
    setPosition(clamped);
    onPositionChange?.(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step: Record<string, number> = horizontal
      ? { ArrowRight: 1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }
      : { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key === 'Home') {
      event.preventDefault();
      update(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      update(100);
    } else if (event.key in step) {
      event.preventDefault();
      update(position + (step[event.key] ?? 0));
    }
  }

  function positionFromPointer(event: PointerEvent<HTMLDivElement>): number {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return position;
    return horizontal
      ? ((event.clientX - rect.left) / rect.width) * 100
      : ((event.clientY - rect.top) / rect.height) * 100;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    update(positionFromPointer(event));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    update(positionFromPointer(event));
  }

  return (
    <div
      ref={containerRef}
      className={['mk-compare', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      style={{ ['--mk-compare-pos' as string]: `${position}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <div className="mk-compare__before">{before}</div>
      <div className="mk-compare__after" aria-hidden="true">
        {after}
      </div>
      <div className="mk-compare__divider" aria-hidden="true" />
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation={orientation}
        className="mk-compare__handle"
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
