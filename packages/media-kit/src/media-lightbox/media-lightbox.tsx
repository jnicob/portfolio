'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { LightboxControls } from './lightbox-controls';
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
  /** Contenido a pantalla completa: <img>, <video> o composición. */
  children: ReactNode;
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
};

const FIT_ORDER: MediaLightboxFit[] = ['contain', 'cover', 'actual'];

type FullscreenDocument = Document & { webkitFullscreenElement?: Element | null };

function nativeFullscreenActive(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement);
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
}: MediaLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controlsRegionRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // El foco inicial (más abajo) aterriza en Close, que ahora vive DENTRO de la
  // toolbar: el focusin sintético de React burbujea hasta controls-region y
  // dispararía pin(true) sin que el usuario haya interactuado. Se suprime solo
  // ese focus programático de apertura; cualquier foco posterior (Tab del
  // usuario, foco en Zoom in, etc.) sigue pineando con normalidad.
  const initialFocusRef = useRef(false);

  const [fit, setFit] = useState<MediaLightboxFit>(initialFit);
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
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    initialFocusRef.current = true;
    (
      dialogRef.current?.querySelector<HTMLElement>('[data-mk-close]') ?? dialogRef.current
    )?.focus();
    initialFocusRef.current = false;
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

  const nextFit = FIT_ORDER[(FIT_ORDER.indexOf(fit) + 1) % FIT_ORDER.length] ?? 'contain';

  function cycleFit() {
    setFit(
      (current) => FIT_ORDER[(FIT_ORDER.indexOf(current) + 1) % FIT_ORDER.length] ?? 'contain',
    );
    resetZoom();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (event.key === 'Escape') {
      // Con fullscreen nativo activo el navegador sale de fullscreen con este
      // mismo Escape; el lightbox no debe cerrarse a la vez.
      if (nativeFullscreenActive()) return;
      // Evita que otros handlers React por encima reaccionen al mismo Escape.
      event.stopPropagation();
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
      onKeyDown={onKeyDown}
      onClick={onOverlayClick}
      onPointerMove={autoHide.poke}
    >
      <div ref={viewportRef} className="mk-lightbox__viewport">
        <div ref={contentRef} className="mk-lightbox__media" style={zoomPan.style}>
          {children}
        </div>
      </div>
      {controls ? (
        <>
          <button
            ref={toggleRef}
            type="button"
            className="mk-lightbox__controls-toggle"
            aria-expanded={autoHide.visible}
            aria-label={autoHide.visible ? labels.hideControls : labels.showControls}
            onClick={autoHide.toggle}
          >
            ⋯
          </button>
          <div
            ref={controlsRegionRef}
            className="mk-lightbox__controls-region"
            data-visible={autoHide.visible}
            onFocus={() => {
              if (!initialFocusRef.current) autoHide.pin(true);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) autoHide.pin(false);
            }}
          >
            <LightboxControls
              labels={labels}
              percent={percent}
              announcedPercent={announced}
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
              onClose={onClose}
            />
          </div>
        </>
      ) : (
        <button
          type="button"
          aria-label={labels.close}
          data-mk-close
          className="mk-lightbox__close"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>,
    document.body,
  );
}
