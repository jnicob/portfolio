'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { MediaLightbox, type MediaLightboxLabels } from '../media-lightbox';
import { isMediaSource, preloadFullSources, type MediaSource } from '../media-source';

export type CompareSliderExpand = {
  /** aria-label del dialog del compare-lightbox. */
  lightboxLabel: string;
  /** Texto del botón overlay. Default 'Full Screen'. */
  buttonLabel?: string;
  /** Labels del MediaLightbox interno (i18n). */
  lightboxLabels?: Partial<MediaLightboxLabels>;
};

// Icono expand (trazo currentColor, patrón F2.6): sin dependencias.
const EXPAND_ICON = (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);

export type CompareSliderProps = {
  /**
   * Medio original (típicamente <img>). Se muestra a la izquierda / arriba.
   * Acepta un `MediaSource`: el slider renderiza internamente su `<img src alt draggable={false}>`.
   */
  before: ReactNode | MediaSource;
  /** Medio procesado. Se revela a la derecha / abajo del divisor. Mismas reglas que `before`. */
  after: ReactNode | MediaSource;
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
  /**
   * CTA fullscreen por ejemplo (spec C1): con `expand`, el slider renderiza un
   * botón overlay que abre un `MediaLightbox` interno con este mismo compare.
   */
  expand?: CompareSliderExpand;
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function renderSide(side: ReactNode | MediaSource): ReactNode {
  return isMediaSource(side) ? <img src={side.src} alt={side.alt} draggable={false} /> : side;
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
  expand,
}: CompareSliderProps) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  // Declarado incondicional (reglas de hooks) aunque solo se use con `expand`.
  const [expanded, setExpanded] = useState(false);
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

  function preloadExpandSources() {
    preloadFullSources([before, after].filter(isMediaSource));
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
      <div className="mk-compare__before">{renderSide(before)}</div>
      <div className="mk-compare__after" aria-hidden="true">
        {renderSide(after)}
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
      {expand ? (
        <button
          type="button"
          className="mk-compare__expand"
          data-mk-drag-exempt=""
          onPointerDown={(event) => event.stopPropagation()}
          onPointerEnter={preloadExpandSources}
          onFocus={preloadExpandSources}
          onClick={() => setExpanded(true)}
        >
          {EXPAND_ICON}
          {expand.buttonLabel ?? 'Full Screen'}
        </button>
      ) : null}
      {expand ? (
        <MediaLightbox
          open={expanded}
          onClose={() => setExpanded(false)}
          label={expand.lightboxLabel}
          labels={expand.lightboxLabels}
          compare={{ before, after, label: expand.lightboxLabel }}
        />
      ) : null}
    </div>
  );
}
