import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

export type UseZoomPanOptions = {
  minZoom?: number;
  maxZoom?: number;
};

export type UseZoomPanResult = {
  scale: number;
  minZoom: number;
  maxZoom: number;
  /** true si el contenido desborda el viewport y tiene sentido panear. */
  canPan: boolean;
  /** Estilo (transform) para el wrapper del contenido. */
  style: CSSProperties;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Zoom a un factor, opcionalmente anclado a un punto (px desde el centro del viewport). */
  zoomTo: (scale: number, anchor?: { x: number; y: number }) => void;
  reset: () => void;
  panBy: (dx: number, dy: number) => void;
  /** Lee y limpia el flag "el último gesto fue un drag" (evita cerrar en overlay). */
  consumeDrag: () => boolean;
};

type ZoomPanState = { scale: number; tx: number; ty: number };

/** Paso multiplicativo de botones y teclado. */
const BUTTON_STEP = 1.5;

export function useZoomPan(
  viewportRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  { minZoom = 1, maxZoom = 8 }: UseZoomPanOptions = {},
): UseZoomPanResult {
  const [state, setState] = useState<ZoomPanState>({ scale: minZoom, tx: 0, ty: 0 });
  const draggedRef = useRef(false);
  const scaleRef = useRef(state.scale);
  scaleRef.current = state.scale;

  const bounds = useCallback(
    (scale: number) => {
      const vp = viewportRef.current;
      const ct = contentRef.current;
      if (!vp || !ct) return { maxTx: 0, maxTy: 0 };
      return {
        maxTx: Math.max(0, (ct.offsetWidth * scale - vp.clientWidth) / 2),
        maxTy: Math.max(0, (ct.offsetHeight * scale - vp.clientHeight) / 2),
      };
    },
    [contentRef, viewportRef],
  );

  const clampState = useCallback(
    (next: ZoomPanState): ZoomPanState => {
      const scale = Math.min(maxZoom, Math.max(minZoom, next.scale));
      const { maxTx, maxTy } = bounds(scale);
      return {
        scale,
        tx: Math.min(maxTx, Math.max(-maxTx, next.tx)),
        ty: Math.min(maxTy, Math.max(-maxTy, next.ty)),
      };
    },
    [bounds, maxZoom, minZoom],
  );

  const zoomTo = useCallback(
    (scale: number, anchor?: { x: number; y: number }) => {
      setState((prev) => {
        const clamped = Math.min(maxZoom, Math.max(minZoom, scale));
        const ratio = clamped / prev.scale;
        const ax = anchor?.x ?? 0;
        const ay = anchor?.y ?? 0;
        return clampState({
          scale: clamped,
          tx: ax - (ax - prev.tx) * ratio,
          ty: ay - (ay - prev.ty) * ratio,
        });
      });
    },
    [clampState, maxZoom, minZoom],
  );

  const zoomIn = useCallback(() => zoomTo(scaleRef.current * BUTTON_STEP), [zoomTo]);
  const zoomOut = useCallback(() => zoomTo(scaleRef.current / BUTTON_STEP), [zoomTo]);
  const reset = useCallback(() => setState({ scale: minZoom, tx: 0, ty: 0 }), [minZoom]);

  const panBy = useCallback(
    (dx: number, dy: number) =>
      setState((prev) => clampState({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy })),
    [clampState],
  );

  const consumeDrag = useCallback(() => {
    const dragged = draggedRef.current;
    draggedRef.current = false;
    return dragged;
  }, []);

  // Gestos: listeners nativos sobre el viewport (wheel necesita passive: false).
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let pinch: { dist: number; scale: number } | null = null;
    let pan: { x: number; y: number } | null = null;
    let downAt: { x: number; y: number } | null = null;

    const anchorFrom = (clientX: number, clientY: number) => {
      const rect = vp.getBoundingClientRect();
      return {
        x: clientX - rect.left - rect.width / 2,
        y: clientY - rect.top - rect.height / 2,
      };
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.pow(1.1, -event.deltaY / 100);
      zoomTo(scaleRef.current * factor, anchorFrom(event.clientX, event.clientY));
    };

    const onDblClick = (event: MouseEvent) => {
      if (scaleRef.current > 1.01) reset();
      else zoomTo(2, anchorFrom(event.clientX, event.clientY));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      vp.setPointerCapture?.(event.pointerId);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()] as [
          { x: number; y: number },
          { x: number; y: number },
        ];
        pinch = { dist: Math.hypot(b.x - a.x, b.y - a.y), scale: scaleRef.current };
        pan = null;
      } else if (pointers.size === 1) {
        pan = { x: event.clientX, y: event.clientY };
        downAt = { x: event.clientX, y: event.clientY };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()] as [
          { x: number; y: number },
          { x: number; y: number },
        ];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        if (dist > 0 && pinch.dist > 0) {
          zoomTo(pinch.scale * (dist / pinch.dist), anchorFrom((a.x + b.x) / 2, (a.y + b.y) / 2));
        }
        draggedRef.current = true;
      } else if (pan) {
        panBy(event.clientX - pan.x, event.clientY - pan.y);
        pan = { x: event.clientX, y: event.clientY };
        if (downAt && Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 4) {
          draggedRef.current = true;
        }
      }
    };

    const onPointerEnd = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        pan = null;
        downAt = null;
      } else if (pointers.size === 1) {
        const [rest] = [...pointers.values()] as [{ x: number; y: number }];
        pan = { x: rest.x, y: rest.y };
      }
    };

    // C4 (auditoría pan con ratón): el drag nativo HTML5 de <img>/<video> (draggable
    // por defecto) cancela a mitad de gesto los pointermove del pan con ratón real —
    // el mecanismo de pan en sí funciona (ver tests), el drag nativo lo interrumpe.
    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('dblclick', onDblClick);
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerEnd);
    vp.addEventListener('pointercancel', onPointerEnd);
    vp.addEventListener('dragstart', onDragStart);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('dblclick', onDblClick);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerEnd);
      vp.removeEventListener('pointercancel', onPointerEnd);
      vp.removeEventListener('dragstart', onDragStart);
    };
  }, [panBy, reset, viewportRef, zoomTo]);

  const { maxTx, maxTy } = bounds(state.scale);
  const canPan = maxTx > 0 || maxTy > 0;

  // Affordance del cursor grab/grabbing (CSS) y ancla para T13: solo cuando hay
  // desborde real. Se limpia al desmontar para no dejar el atributo huérfano.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.toggleAttribute('data-can-pan', canPan);
    return () => {
      vp.removeAttribute('data-can-pan');
    };
  }, [canPan, viewportRef]);

  return {
    scale: state.scale,
    minZoom,
    maxZoom,
    canPan,
    style: { transform: `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})` },
    zoomIn,
    zoomOut,
    zoomTo,
    reset,
    panBy,
    consumeDrag,
  };
}
