'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CompareSlider } from '../compare-slider';
import { isMediaSource, pickFullscreenSrc, type MediaSource } from '../media-source';
import { LightboxControls, template } from './lightbox-controls';
import { LightboxHelp } from './lightbox-help';
import { useAutoHide } from './use-auto-hide';
import { useFullscreen } from './use-fullscreen';
import { useZoomPan } from './use-zoom-pan';

export type MediaLightboxFit = 'contain' | 'cover' | 'actual';

export type MediaLightboxLabels = {
  controls: string;
  zoomIn: string;
  zoomOut: string;
  /** Plantilla del anuncio de zoom; {percent} se sustituye. */
  zoomLevel: string;
  reset: string;
  /** Plantilla del botón de ajuste; {current} y {next} se sustituyen. */
  fit: string;
  fullscreen: string;
  exitFullscreen: string;
  hideControls: string;
  showControls: string;
  close: string;
  /** aria-label del botón de ayuda. */
  help: string;
  /** Encabezado del panel de ayuda. */
  helpTitle: string;
  /** Descripciones del mapa de teclado (las teclas son literales, no traducibles). */
  shortcutZoom: string;
  shortcutReset: string;
  shortcutPanKeys: string;
  shortcutPanDrag: string;
  shortcutFit: string;
  shortcutFullscreen: string;
  shortcutControls: string;
  shortcutHelp: string;
  shortcutClose: string;
};

export type MediaLightboxProps = {
  open: boolean;
  onClose: () => void;
  /** Nombre accesible del dialog. */
  label: string;
  /** Alias v1 de labels.close (labels.close tiene precedencia). */
  closeLabel?: string;
  /** Modo de ajuste base a zoom 1x. Default 'contain'. */
  fit?: MediaLightboxFit;
  /** Límites del zoom. Default { min: 1, max: 8 }. */
  zoom?: { min?: number; max?: number };
  /** Renderizar la caja de controles. Default true. */
  controls?: boolean;
  /** Visibilidad inicial de los controles. Default true. */
  defaultControlsVisible?: boolean;
  /** ms de inactividad antes del auto-hide. null lo desactiva. Default 3000. */
  autoHideDelay?: number | null;
  /** Textos de los botones (i18n); cada clave tiene default en inglés. */
  labels?: Partial<MediaLightboxLabels>;
  /**
   * Contenido a pantalla completa: <img>, <video> o composición. Ignorado si
   * `compare` o `media` están presentes.
   */
  children?: ReactNode;
  /**
   * Medio único como `MediaSource` (alternativa a `children`): el lightbox
   * renderiza su propio `<img>` eligiendo `fullSrc` según la pantalla (C3, vía
   * `pickFullscreenSrc`). Prioridad: `compare` > `media` > `children`.
   */
  media?: MediaSource;
  /**
   * Compare (before/after) dentro del visor: hereda zoom/pan/toolbar del lightbox
   * sin duplicar el motor de gestos (spec C2). Si está presente, gana sobre
   * `media` y `children`. Cada lado acepta `ReactNode` o `MediaSource`; con
   * `MediaSource` el lado se resuelve con `pickFullscreenSrc` (fullscreen = contexto HD).
   * Sin ninguno de los tres, el visor no renderiza media.
   */
  compare?: { before: ReactNode | MediaSource; after: ReactNode | MediaSource; label?: string };
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const DEFAULT_LABELS: MediaLightboxLabels = {
  controls: 'Controls',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomLevel: 'Zoom {percent}%',
  reset: 'Reset view',
  fit: 'Fit: {current}. Switch to {next}',
  fullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  hideControls: 'Hide controls',
  showControls: 'Show controls',
  close: 'Close',
  help: 'Keyboard shortcuts',
  helpTitle: 'Keyboard shortcuts',
  shortcutZoom: 'Zoom in / out',
  shortcutReset: 'Reset view',
  shortcutPanKeys: 'Pan',
  shortcutPanDrag: 'Hold Space and drag to pan',
  shortcutFit: 'Cycle fit mode (toolbar)',
  shortcutFullscreen: 'Toggle fullscreen',
  shortcutControls: 'Show / hide controls',
  shortcutHelp: 'Toggle this help',
  shortcutClose: 'Close',
};

const FIT_ORDER: MediaLightboxFit[] = ['contain', 'cover', 'actual'];

// Iconos SVG inline (trazo currentColor): deterministas y sin dependencias.
const EYE_ICON = (
  <svg
    data-mk-icon="eye"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EYE_OFF_ICON = (
  <svg
    data-mk-icon="eye-off"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-7 0-11-7-11-7a19.9 19.9 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A10.4 10.4 0 0 1 12 5c7 0 11 7 11 7a19.9 19.9 0 0 1-3.22 4.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

type FullscreenDocument = Document & { webkitFullscreenElement?: Element | null };

function nativeFullscreenActive(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement);
}

// Fullscreen = contexto HD: cualquier MediaSource (media único o cada lado del
// compare) se resuelve con pickFullscreenSrc antes de renderizarse.
function renderFullscreenSide(side: ReactNode | MediaSource): ReactNode {
  return isMediaSource(side) ? (
    <img src={pickFullscreenSrc(side)} alt={side.alt} draggable={false} />
  ) : (
    side
  );
}

export function MediaLightbox(props: MediaLightboxProps) {
  // Guard externo: el contenido monta FRESCO en cada apertura. Esto garantiza
  // estado limpio (zoom/fit/toolbar) sin effects de reset, y que el effect de
  // gestos de useZoomPan se ejecute con los refs ya poblados (sus deps son
  // refs estables y no se re-dispararía si el dialog apareciera condicionalmente
  // dentro del mismo componente).
  if (!props.open) return null;
  return <MediaLightboxContent {...props} />;
}

function MediaLightboxContent({
  onClose,
  label,
  closeLabel,
  fit: initialFit = 'contain',
  zoom,
  controls = true,
  defaultControlsVisible = true,
  autoHideDelay = 3000,
  labels: labelOverrides,
  children,
  media,
  compare,
}: MediaLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controlsRegionRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [fit, setFit] = useState<MediaLightboxFit>(initialFit);
  // B1: Espacio mantenido = modo pan (cursor grab + mover panea). El flag vive aquí
  // (no en useZoomPan) porque es una convención de teclado del dialog, no un gesto.
  const [spacePan, setSpacePan] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const zoomPan = useZoomPan(viewportRef, contentRef, {
    minZoom: zoom?.min,
    maxZoom: zoom?.max,
  });
  const autoHide = useAutoHide({ delay: autoHideDelay, defaultVisible: defaultControlsVisible });
  const fullscreen = useFullscreen(dialogRef);
  const { reset: resetZoom } = zoomPan;

  const labels: MediaLightboxLabels = {
    ...DEFAULT_LABELS,
    ...(closeLabel !== undefined ? { close: closeLabel } : {}),
    ...labelOverrides,
  };

  const percent = Math.round(zoomPan.scale * 100);
  // Anuncio debounced: el aria-live comunica el valor FINAL del gesto, no cada tick.
  const [announced, setAnnounced] = useState(percent);
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(percent), 250);
    return () => clearTimeout(timer);
  }, [percent]);

  // Al montar (= al abrir): foco previo, scroll lock compensando la barra, foco al Close.
  // Close vive en la esquina superior derecha (fuera de la región auto-ocultable), así que
  // este foco de apertura no dispara el onFocus/pin de la región.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    (
      dialogRef.current?.querySelector<HTMLElement>('[data-mk-close]') ?? dialogRef.current
    )?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      previouslyFocused?.focus();
    };
  }, []);

  // Toolbar oculta = inert (fuera del trap y del árbol de accesibilidad). Antes de
  // inertizar, si el foco vive dentro de la región lo reubicamos al toggle (que está
  // fuera de la región y siempre visible): inert desenfoca a su descendiente activo
  // hacia document.body, que está fuera del portal, y ahí Escape/Tab dejarían de
  // llegar al diálogo. El toggle mantiene el foco dentro del diálogo.
  useEffect(() => {
    const region = controlsRegionRef.current;
    if (!region) return;
    const hiding = !autoHide.visible;
    if (hiding && region.contains(document.activeElement)) {
      toggleRef.current?.focus();
    }
    region.toggleAttribute('inert', hiding);
  }, [autoHide.visible]);

  // Si la ventana pierde el foco con Espacio pulsado, el keyup nunca llega: liberar.
  useEffect(() => {
    if (!spacePan) return;
    const release = () => {
      setSpacePan(false);
      lastPointRef.current = null;
    };
    window.addEventListener('blur', release);
    return () => window.removeEventListener('blur', release);
  }, [spacePan]);

  // Al abrir la ayuda, el foco entra al panel (closeHelp lo devuelve al botón).
  useEffect(() => {
    if (helpOpen) dialogRef.current?.querySelector<HTMLElement>('[data-mk-help]')?.focus();
  }, [helpOpen]);

  // Al alternar fullscreen el foco queda en el botón ⤢, y Espacio sobre un botón
  // no activa el space-pan (:354). Devolver el foco al root restablece el follow.
  const fullscreenWasActive = useRef(fullscreen.active);
  useEffect(() => {
    if (fullscreenWasActive.current === fullscreen.active) return;
    fullscreenWasActive.current = fullscreen.active;
    dialogRef.current?.focus();
  }, [fullscreen.active]);

  const nextFit = FIT_ORDER[(FIT_ORDER.indexOf(fit) + 1) % FIT_ORDER.length] ?? 'contain';

  function cycleFit() {
    setFit(
      (current) => FIT_ORDER[(FIT_ORDER.indexOf(current) + 1) % FIT_ORDER.length] ?? 'contain',
    );
    resetZoom();
  }

  // La ayuda devuelve el foco a su disparador al cerrarse (patrón de overlay).
  function closeHelp() {
    setHelpOpen(false);
    helpButtonRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Cualquier interacción de teclado revive una toolbar oculta por inactividad
    // (poke() es no-op si el usuario la ocultó explícitamente): así un usuario de
    // teclado estacionario recupera la toolbar y el feedback de zoom.
    autoHide.poke();
    const target = event.target as HTMLElement;
    if (event.key === 'Escape') {
      // Con fullscreen nativo activo el navegador sale de fullscreen con este
      // mismo Escape; el lightbox no debe cerrarse a la vez.
      if (nativeFullscreenActive()) return;
      // Evita que otros handlers React por encima reaccionen al mismo Escape.
      event.stopPropagation();
      if (helpOpen) {
        closeHelp();
        return;
      }
      onClose();
      return;
    }
    if (event.key === 'Tab') {
      const focusables = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => !el.closest('[inert]'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && active === dialogRef.current) {
        // El propio root del dialog enfocado (p.ej. tras click en contenido no
        // enfocable, o foco puesto ahí programáticamente): avanza al ÚLTIMO
        // focusable, igual que en v1 cuando Close era el primer nodo del DOM
        // inmediatamente después del root.
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !focusables.includes(active as HTMLElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }
    if (target.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === ' ') {
      // Espacio sobre un elemento interactivo conserva el default del navegador
      // (activa botones; en enlaces no hace nada): nunca entra en modo pan.
      if (target.closest('button, a')) return;
      event.preventDefault();
      if (!event.repeat) setSpacePan(true);
      return;
    }
    if (event.key === '+' || event.key === '=') {
      zoomPan.zoomIn();
    } else if (event.key === '-') {
      zoomPan.zoomOut();
    } else if (event.key === '0') {
      resetZoom();
    } else if (event.key === 'f' && fullscreen.supported) {
      fullscreen.toggle();
    } else if (event.key === 'c' && controls) {
      autoHide.toggle();
    } else if (event.key === '?') {
      if (helpOpen) closeHelp();
      else setHelpOpen(true);
    } else if (!target.closest('.mk-lightbox__controls-region')) {
      const pan: Record<string, [number, number]> = {
        ArrowLeft: [40, 0],
        ArrowRight: [-40, 0],
        ArrowUp: [0, 40],
        ArrowDown: [0, -40],
      };
      const delta = pan[event.key];
      if (delta) {
        event.preventDefault();
        // panBy() clampa contra el tamaño LIVE del viewport/contenido (lee los
        // refs en el momento de la llamada): si no hay desborde real, el propio
        // clamp deja tx/ty en 0 y esto es un no-op. No usamos zoomPan.canPan
        // aquí porque es una foto fija del render en que se leyó (no se
        // recalcula si el layout cambia sin que el componente vuelva a
        // renderizar), y dependemos de la lectura fresca de panBy.
        zoomPan.panBy(delta[0], delta[1]);
      }
    }
  }

  function onKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === ' ') {
      setSpacePan(false);
      lastPointRef.current = null;
    }
  }

  function onRootPointerMove(event: PointerEvent<HTMLDivElement>) {
    autoHide.poke();
    // Con botón pulsado ya panea el drag de useZoomPan sobre el viewport; este camino
    // cubre "Espacio + mover" sin botón y evita duplicar el delta del arrastre.
    if (!spacePan || event.buttons !== 0) {
      lastPointRef.current = null;
      return;
    }
    const last = lastPointRef.current;
    if (last) zoomPan.panBy(event.clientX - last.x, event.clientY - last.y);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
  }

  function onOverlayClick(event: MouseEvent<HTMLDivElement>) {
    // Un pan que termina en click no debe cerrar.
    if (zoomPan.consumeDrag()) return;
    if (event.target === event.currentTarget || event.target === viewportRef.current) onClose();
  }

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      // Enfocable (no tabulable): al hacer click en contenido no enfocable, el
      // navegador enfoca este root en vez de body, y Escape/Tab siguen llegando.
      tabIndex={-1}
      className="mk-lightbox"
      data-fit={fit}
      data-space-pan={spacePan ? 'true' : undefined}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onClick={onOverlayClick}
      onPointerMove={onRootPointerMove}
    >
      <div ref={viewportRef} className="mk-lightbox__viewport">
        <div ref={contentRef} className="mk-lightbox__media" style={zoomPan.style}>
          {compare ? (
            <CompareSlider
              before={renderFullscreenSide(compare.before)}
              after={renderFullscreenSide(compare.after)}
              label={compare.label ?? 'Compare'}
              dragTarget="handle"
            />
          ) : media ? (
            renderFullscreenSide(media)
          ) : (
            children
          )}
        </div>
      </div>
      {/* Anuncio de zoom: vive en el root del dialog, FUERA de la región auto-ocultable,
          por lo que nunca se inertiza y anuncia el zoom en cualquier estado (incluso con
          la toolbar oculta o con controls=false). Debounced al valor final del gesto. */}
      <span className="mk-visually-hidden" aria-live="polite">
        {template(labels.zoomLevel, { percent: announced })}
      </span>
      {/* Esquina persistente, siempre visible, fuera de la región auto-ocultable:
          cerrar (ambos modos) + toggle de la toolbar (solo con controls). */}
      <div className="mk-lightbox__corner">
        <button
          ref={helpButtonRef}
          type="button"
          className="mk-lightbox__help-toggle"
          aria-expanded={helpOpen}
          aria-label={labels.help}
          data-mk-tooltip={labels.help}
          onClick={() => (helpOpen ? closeHelp() : setHelpOpen(true))}
        >
          ?
        </button>
        {controls ? (
          <button
            ref={toggleRef}
            type="button"
            className="mk-lightbox__controls-toggle"
            aria-expanded={autoHide.visible}
            aria-label={autoHide.visible ? labels.hideControls : labels.showControls}
            data-mk-tooltip={autoHide.visible ? labels.hideControls : labels.showControls}
            onClick={autoHide.toggle}
          >
            {autoHide.visible ? EYE_ICON : EYE_OFF_ICON}
          </button>
        ) : null}
        <button
          type="button"
          aria-label={labels.close}
          data-mk-close
          data-mk-tooltip={labels.close}
          className="mk-lightbox__close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      {helpOpen ? <LightboxHelp labels={labels} /> : null}
      {controls ? (
        <div
          ref={controlsRegionRef}
          className="mk-lightbox__controls-region"
          data-visible={autoHide.visible}
          onFocus={() => autoHide.pin(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) autoHide.pin(false);
          }}
        >
          <LightboxControls
            labels={labels}
            percent={percent}
            atMin={zoomPan.scale <= zoomPan.minZoom}
            atMax={zoomPan.scale >= zoomPan.maxZoom}
            fit={fit}
            nextFit={nextFit}
            fullscreenSupported={fullscreen.supported}
            fullscreenActive={fullscreen.active}
            onZoomIn={zoomPan.zoomIn}
            onZoomOut={zoomPan.zoomOut}
            onReset={resetZoom}
            onCycleFit={cycleFit}
            onToggleFullscreen={fullscreen.toggle}
          />
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
