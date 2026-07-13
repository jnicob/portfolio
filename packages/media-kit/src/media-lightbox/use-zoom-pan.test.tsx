import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useZoomPan } from './use-zoom-pan';

export function fakeElement(width: number, height: number): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true });
  el.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
  return el;
}

function setup(vpW = 800, vpH = 600, ctW = 800, ctH = 600) {
  const viewport = fakeElement(vpW, vpH);
  const content = fakeElement(ctW, ctH);
  const hook = renderHook(() => useZoomPan({ current: viewport }, { current: content }));
  return { ...hook, viewport, content };
}

describe('useZoomPan núcleo', () => {
  it('zoomIn multiplica ×1.5 y respeta maxZoom', () => {
    const { result } = setup();
    act(() => result.current.zoomIn());
    expect(result.current.scale).toBeCloseTo(1.5);
    for (let i = 0; i < 10; i += 1) act(() => result.current.zoomIn());
    expect(result.current.scale).toBe(8);
  });

  it('zoomOut en el mínimo se queda en minZoom', () => {
    const { result } = setup();
    act(() => result.current.zoomOut());
    expect(result.current.scale).toBe(1);
  });

  it('zoomTo anclado mantiene el punto bajo el ancla', () => {
    const { result } = setup();
    act(() => result.current.zoomTo(2, { x: 200, y: 0 }));
    // t' = a − (a − t)·ratio = 200 − 200·2 = −200; maxTx = (800·2−800)/2 = 400
    expect(result.current.style.transform).toBe('translate(-200px, 0px) scale(2)');
  });

  it('panBy se clampa a los límites del contenido', () => {
    const { result } = setup();
    act(() => result.current.zoomTo(2));
    act(() => result.current.panBy(10000, -10000));
    expect(result.current.style.transform).toBe('translate(400px, -300px) scale(2)');
  });

  it('sin desborde: canPan false y panBy no mueve', () => {
    const { result } = setup();
    expect(result.current.canPan).toBe(false);
    act(() => result.current.panBy(50, 50));
    expect(result.current.style.transform).toBe('translate(0px, 0px) scale(1)');
  });

  it('con desborde a 1x (p.ej. fit actual con imagen grande) canPan true', () => {
    const { result } = setup(800, 600, 1600, 1200);
    expect(result.current.canPan).toBe(true);
  });

  it('reset vuelve a minZoom centrado', () => {
    const { result } = setup();
    act(() => result.current.zoomTo(3, { x: 100, y: 100 }));
    act(() => result.current.reset());
    expect(result.current.style.transform).toBe('translate(0px, 0px) scale(1)');
  });
});
