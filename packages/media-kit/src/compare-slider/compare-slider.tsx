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
  /**
   * 'drag' (default): arrastrar para mover, como v1.
   * 'hover': con ratón el divisor sigue al puntero sin click (al salir se queda
   * donde estaba); touch/pen usan el camino drag. Teclado idéntico en ambos.
   */
  mode?: 'drag' | 'hover';
  /**
   * 'surface' (default): arrastrar en cualquier punto de la superficie mueve el
   * divisor (comportamiento v1/v2, cero regresión).
   * 'handle': el divisor SOLO se mueve arrastrando el handle (o con flechas cuando
   * el handle tiene el foco); el resto de la superficie ignora el pointerdown. Pensado
   * para cuando el compare vive dentro de un visor con su propio pan (T13/MediaLightbox):
   * el gesto de pan del visor y el drag del divisor no deben pelear por el mismo puntero.
   * Con dragTarget='handle', mode='hover' se ignora: el divisor solo se mueve desde el
   * handle (puntero o teclado).
   */
  dragTarget?: 'surface' | 'handle';
  className?: string;
  onPositionChange?: (position: number) => void;
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

export function CompareSlider({
  before,
  after,
  label = 'Compare',
  initialPosition = 50,
  orientation = 'horizontal',
  mode = 'drag',
  dragTarget = 'surface',
  className,
  onPositionChange,
}: CompareSliderProps) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
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
      // El keydown del lightbox es un handler de React en el root del dialog (no un
      // listener nativo), así que stopPropagation sí lo frena: con foco en el handle,
      // Home/End/flechas mueven el divisor y NO llegan al pan/zoom por teclado del visor.
      event.stopPropagation();
      update(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      event.stopPropagation();
      update(100);
    } else if (event.key in step) {
      event.preventDefault();
      event.stopPropagation();
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

  function followsHover(event: PointerEvent<HTMLDivElement>): boolean {
    // Con dragTarget='handle' el hover-follow queda desactivado por completo: la
    // superficie no responde al puntero, solo el handle (puntero o teclado).
    return dragTarget === 'surface' && mode === 'hover' && event.pointerType === 'mouse';
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    if (
      dragTarget === 'handle' &&
      !(event.target instanceof Element && event.target.closest('.mk-compare__handle'))
    ) {
      return;
    }
    handleRef.current?.focus({ preventScroll: true });
    // Con hover activo el ratón ya sigue al puntero; el down solo aplica a touch/pen.
    if (followsHover(event)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(positionFromPointer(event));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (followsHover(event)) {
      update(positionFromPointer(event));
      return;
    }
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
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation={orientation}
        className="mk-compare__handle"
        data-mk-drag-exempt=""
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
