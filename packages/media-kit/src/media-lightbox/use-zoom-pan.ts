import { useCallback, useRef, useState, type CSSProperties, type RefObject } from 'react';

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

  const { maxTx, maxTy } = bounds(state.scale);

  return {
    scale: state.scale,
    minZoom,
    maxZoom,
    canPan: maxTx > 0 || maxTy > 0,
    style: { transform: `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})` },
    zoomIn,
    zoomOut,
    zoomTo,
    reset,
    panBy,
    consumeDrag,
  };
}
