'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { prefersReducedMotion } from '../internal/prefers-reduced-motion';
import { MediaLightbox, type MediaLightboxLabels } from '../media-lightbox';
import { isMediaSource, preloadFullSources, type MediaSource } from '../media-source';

/** Cadencia del alterno before/after en `compareMode="blink"` (spec A3). */
const BLINK_INTERVAL_MS = 800;

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

/**
 * Eje de comparación (spec A3, F3.6). Default `'wipe'` = comportamiento actual
 * (clip-path + divisor), cero cambios. `'blink'` alterna before/after con un
 * timer (sin slider); ver `data-blink-side` y el switch de pausa en el componente.
 */
export type CompareSliderMode = 'wipe' | 'onion' | 'blink' | 'side-by-side';

export type CompareSliderOverlayLabels = {
  /** Label superpuesto en el lado `before` (esquina inferior izquierda). */
  before: string;
  /** Label superpuesto en el lado `after` (esquina inferior derecha). */
  after: string;
};

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
  /**
   * Solo aplica con `mode="hover"` (spec C6): un click (down+up sin arrastre) alterna
   * pausar el seguimiento del ratón, para poder soltar el puntero sin perder la
   * posición comparada. Mientras está en pausa, NINGÚN gesto de puntero sobre la
   * superficie reposiciona el divisor (el click que reanuda tampoco: el divisor se
   * queda donde estaba congelado); el teclado sobre el handle sigue funcionando.
   * Default `true`.
   */
  pauseOnClick?: boolean;
  /** Anunciado por el aria-live al pausar. Default `'Comparison paused'`. */
  pauseLabel?: string;
  /** Anunciado por el aria-live al reanudar. Default `'Comparison following pointer'`. */
  resumeLabel?: string;
  /**
   * Badges superpuestos en cada lado (paridad C5), esquina inferior izquierda/derecha.
   * `aria-hidden`: el nombre accesible del medio ya lo da el `alt` del `<img>` (interno
   * si el lado es `MediaSource`, o el que ponga el consumidor si es `ReactNode`).
   */
  overlayLabels?: CompareSliderOverlayLabels;
  /**
   * `object-fit` de los `<img>` internos que el paquete renderiza para un lado
   * `MediaSource` (T14). Un lado `ReactNode` es opaco al componente — este prop NO le
   * llega; el consumidor controla su propio `object-fit`. Default `'cover'`.
   */
  objectFit?: 'cover' | 'contain';
  /**
   * Eje de comparación (spec A3, F3.6). Default `'wipe'` (comportamiento actual).
   * `'onion'` conserva el mismo handle/teclado pero gobierna opacidad en vez de
   * posición del divisor. `'side-by-side'` no tiene slider ni handle: ambos lados
   * se muestran completos (grid). `'blink'` tampoco tiene slider: alterna
   * before/after cada 800ms con un switch de pausa (reutiliza `pauseLabel`/`resumeLabel`).
   */
  compareMode?: CompareSliderMode;
};

/** Umbral de movimiento (px) para distinguir click de drag (convención de use-zoom-pan). */
const CLICK_MOVE_THRESHOLD = 4;

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

type CompareSide = 'before' | 'after';

function renderSide(
  side: ReactNode | MediaSource,
  sideKey: CompareSide,
  objectFit: 'cover' | 'contain',
  onSideLoaded: (side: CompareSide) => void,
): ReactNode {
  if (!isMediaSource(side)) return side;
  return (
    <img
      // Hidratación (static export): el `load` nativo puede dispararse ANTES de que
      // React adjunte onLoad; sin este check el lado quedaría pendiente para siempre
      // (data-loading permanente, opacidad 0). Un nodo ya completo al adjuntar el ref
      // se marca cargado directamente. naturalWidth>0 distingue carga OK de error
      // (un img roto también reporta complete=true, pero con naturalWidth 0).
      ref={(node) => {
        if (node?.complete && node.naturalWidth > 0) onSideLoaded(sideKey);
      }}
      src={side.src}
      alt={side.alt}
      draggable={false}
      style={{ objectFit }}
      onLoad={() => onSideLoaded(sideKey)}
    />
  );
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
  pauseOnClick = true,
  pauseLabel = 'Comparison paused',
  resumeLabel = 'Comparison following pointer',
  overlayLabels,
  objectFit = 'cover',
  compareMode = 'wipe',
}: CompareSliderProps) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  // Declarado incondicional (reglas de hooks) aunque solo se use con `expand`.
  const [expanded, setExpanded] = useState(false);
  // C6: pausa del hover-follow por click; `announcement` alterna entre los dos
  // labels para que el aria-live re-anuncie cada toggle.
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  // C5: carga por lado, idempotente (ref de nodo ya completo + onLoad pueden
  // solaparse tras la hidratación: dos señales, un solo "cargado" por lado).
  // Limitación documentada: si el src de un lado cambia tras el montaje, su flag
  // NO se resetea (data-loading no reaparece para la nueva fuente).
  const [loadedSides, setLoadedSides] = useState({ before: false, after: false });
  // Blink (spec A3): lado mostrado por el timer y si sigue corriendo. Arranca
  // pausado si el usuario prefiere menos movimiento (lazy initializer: se lee
  // una sola vez al montar, no reactivo a que la preferencia cambie en vivo).
  const [blinkShowsAfter, setBlinkShowsAfter] = useState(false);
  const [blinkRunning, setBlinkRunning] = useState(
    () => compareMode === 'blink' && !prefersReducedMotion(),
  );
  const [stacked, setStacked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  // Posición del pointerdown y si hubo arrastre desde entonces (umbral 4px, misma
  // convención que draggedRef en use-zoom-pan) para distinguir click de drag.
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggedSinceDownRef = useRef(false);
  const horizontal = orientation === 'horizontal';
  // Derivado en render: solo los lados MediaSource son rastreables; sin ninguno,
  // `data-loading` nunca se activa (ReactNode es opaco, su carga no se puede
  // observar desde aquí — documentado en el JSDoc de objectFit/overlayLabels).
  const loading =
    (isMediaSource(before) && !loadedSides.before) || (isMediaSource(after) && !loadedSides.after);
  // `side-by-side` y `blink` no tienen divisor ni handle: el gesto de
  // puntero/teclado de esta superficie no aplica y hace early-return.
  const hasSlider = compareMode === 'wipe' || compareMode === 'onion';

  // Timer de blink: solo corre en compareMode="blink" y con blinkRunning=true;
  // el switch de pausa (más abajo) alterna blinkRunning y este effect limpia el
  // interval anterior antes de crear uno nuevo (o al desmontar).
  useEffect(() => {
    if (compareMode !== 'blink' || !blinkRunning) return;
    const id = window.setInterval(() => setBlinkShowsAfter((v) => !v), BLINK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [compareMode, blinkRunning]);

  // side-by-side responsive: ResizeObserver para detectar cuando el contenedor
  // es estrecho (<480px) y apilar verticalmente.
  const STACK_BREAKPOINT = 480;
  useEffect(() => {
    if (compareMode !== 'side-by-side') return;
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setStacked(entry.contentRect.width < STACK_BREAKPOINT);
      }
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [compareMode]);

  function update(next: number) {
    const clamped = clamp(next);
    setPosition(clamped);
    onPositionChange?.(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Sin handle no hay teclado que gobernar (side-by-side/blink): el handle ni
    // siquiera se renderiza, pero el guard documenta la invariante.
    if (!hasSlider) return;
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
    // En pausa (C6) el seguimiento se suspende: el divisor se queda donde estaba.
    return dragTarget === 'surface' && mode === 'hover' && event.pointerType === 'mouse' && !paused;
  }

  function togglePaused() {
    // Fuera del updater de setPaused: los updaters deben ser puros (sin side effects).
    const next = !paused;
    setAnnouncement(next ? pauseLabel : resumeLabel);
    setPaused(next);
  }

  function toggleBlinkRunning() {
    // Mismo patrón que togglePaused: reutiliza pauseLabel/resumeLabel para el
    // aria-live aunque el switch de blink gobierne "running", no "paused".
    const next = !blinkRunning;
    setAnnouncement(next ? resumeLabel : pauseLabel);
    setBlinkRunning(next);
  }

  // El lightbox de `expand` (C1) monta vía createPortal en document.body pero sigue
  // siendo hijo de React de ESTE componente: sus eventos de puntero burbujean hasta
  // aquí según el árbol de React, no el DOM real. `currentTarget.contains(target)` usa
  // el DOM real, así que descarta correctamente los eventos que se originan dentro del
  // lightbox (ayuda, controles, cerrar…) aunque su nodo no esté bajo containerRef.
  function originatesOnSurface(event: PointerEvent<HTMLDivElement>): boolean {
    return event.target instanceof Node && event.currentTarget.contains(event.target);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasSlider) return;
    if (!originatesOnSurface(event)) return;
    // Se resetea en cada down (incluido el que se descarta más abajo) para que un
    // pointerup posterior nunca reutilice la posición de un down anterior.
    downPosRef.current = null;
    draggedSinceDownRef.current = false;
    if (!event.isPrimary || event.button !== 0) return;
    if (
      dragTarget === 'handle' &&
      !(event.target instanceof Element && event.target.closest('.mk-compare__handle'))
    ) {
      return;
    }
    handleRef.current?.focus({ preventScroll: true });
    downPosRef.current = { x: event.clientX, y: event.clientY };
    // Con hover activo el ratón ya sigue al puntero; el down solo aplica a touch/pen.
    if (followsHover(event)) return;
    // En pausa (C6), la superficie no reposiciona el divisor con ningún puntero: el
    // down queda registrado SOLO para clasificar en pointerup el click que reanuda
    // (sin capture ni update, el divisor no salta a la posición del click).
    if (paused) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(positionFromPointer(event));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!hasSlider) return;
    if (!originatesOnSurface(event)) return;
    if (downPosRef.current && !draggedSinceDownRef.current) {
      const dx = event.clientX - downPosRef.current.x;
      const dy = event.clientY - downPosRef.current.y;
      if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD) draggedSinceDownRef.current = true;
    }
    if (followsHover(event)) {
      update(positionFromPointer(event));
      return;
    }
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    update(positionFromPointer(event));
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!hasSlider) return;
    if (!originatesOnSurface(event)) return;
    const wasDown = downPosRef.current !== null;
    const dragged = draggedSinceDownRef.current;
    downPosRef.current = null;
    draggedSinceDownRef.current = false;
    // Click = down+up sin arrastre; solo pausa/reanuda en mode="hover" con pauseOnClick
    // y dragTarget='surface' (con dragTarget='handle' no hay hover-follow que pausar).
    // wasDown descarta clicks cuyo down fue absorbido por otro elemento (p.ej. el botón
    // expand, que hace stopPropagation en su propio pointerdown).
    if (!wasDown || dragged || mode !== 'hover' || !pauseOnClick || dragTarget !== 'surface') {
      return;
    }
    togglePaused();
  }

  function preloadExpandSources() {
    preloadFullSources([before, after].filter(isMediaSource));
  }

  // C5: marca un lado como cargado. Idempotente: si ya estaba, devuelve el MISMO
  // objeto de estado (sin re-render), así el doble disparo complete+onLoad es inocuo.
  function markSideLoaded(side: CompareSide) {
    setLoadedSides((prev) => (prev[side] ? prev : { ...prev, [side]: true }));
  }

  return (
    <div
      ref={containerRef}
      className={['mk-compare', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-compare-mode={compareMode}
      data-blink-side={compareMode === 'blink' ? (blinkShowsAfter ? 'after' : 'before') : undefined}
      data-paused={paused ? '' : undefined}
      data-loading={loading ? '' : undefined}
      data-stacked={compareMode === 'side-by-side' && stacked ? 'true' : undefined}
      style={{ ['--mk-compare-pos' as string]: `${position}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="mk-compare__before">
        {renderSide(before, 'before', objectFit, markSideLoaded)}
      </div>
      <div
        className="mk-compare__after"
        // side-by-side muestra dos medios completos e independientes (ambos con
        // su propio nombre accesible); en el resto de modos `after` es un efecto
        // de revelado sobre `before` y se oculta a lectores de pantalla.
        aria-hidden={compareMode === 'side-by-side' ? undefined : 'true'}
      >
        {renderSide(after, 'after', objectFit, markSideLoaded)}
      </div>
      {hasSlider ? <div className="mk-compare__divider" aria-hidden="true" /> : null}
      {overlayLabels ? (
        <>
          <span
            className="mk-compare__overlay-label mk-compare__overlay-label--before"
            aria-hidden="true"
          >
            {overlayLabels.before}
          </span>
          <span
            className="mk-compare__overlay-label mk-compare__overlay-label--after"
            aria-hidden="true"
          >
            {overlayLabels.after}
          </span>
        </>
      ) : null}
      {hasSlider ? (
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          // onion gobierna opacidad, no la posición del divisor: el valuetext
          // anuncia lo que realmente cambia con el handle en ese modo.
          aria-valuetext={compareMode === 'onion' ? `${Math.round(position)}% after` : undefined}
          aria-orientation={orientation}
          className="mk-compare__handle"
          data-mk-drag-exempt=""
          onKeyDown={onKeyDown}
        />
      ) : null}
      {(mode === 'hover' && pauseOnClick) || compareMode === 'blink' ? (
        <span className="mk-visually-hidden" aria-live="polite">
          {announcement}
        </span>
      ) : null}
      {compareMode === 'blink' ? (
        <button
          type="button"
          role="switch"
          aria-checked={blinkRunning}
          className="mk-compare__blink-toggle"
          data-mk-drag-exempt=""
          onClick={toggleBlinkRunning}
        >
          {blinkRunning ? pauseLabel : resumeLabel}
        </button>
      ) : null}
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
          // Fix T4→T5: sin compareMode aquí, el lightbox interno abriría siempre
          // en 'wipe' aunque el slider de fondo esté en onion/side-by-side/blink.
          compare={{ before, after, label: expand.lightboxLabel, compareMode }}
        />
      ) : null}
    </div>
  );
}
