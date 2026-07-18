import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

import { fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import type { UseZoomPanResult } from './use-zoom-pan';

function GestureProbe({ onRender }: { onRender: (r: UseZoomPanResult) => void }) {
  const vpRef = useRef<HTMLDivElement>(null);
  const ctRef = useRef<HTMLDivElement>(null);
  const result = useZoomPan(vpRef, ctRef);
  onRender(result);
  return (
    <div ref={vpRef} data-testid="viewport">
      <div ref={ctRef} data-testid="content" style={result.style} />
    </div>
  );
}

function mockSizes(el: HTMLElement, width: number, height: number) {
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
}

describe('useZoomPan gestos', () => {
  function setupProbe() {
    let latest: UseZoomPanResult | undefined;
    const utils = render(<GestureProbe onRender={(r) => (latest = r)} />);
    const viewport = utils.getByTestId('viewport');
    const content = utils.getByTestId('content');
    mockSizes(viewport, 800, 600);
    mockSizes(content, 800, 600);
    return { viewport, content, latest: () => latest! };
  }

  it('rueda hacia arriba hace zoom in anclado al cursor', () => {
    const { viewport, latest } = setupProbe();
    fireEvent.wheel(viewport, { deltaY: -100, clientX: 600, clientY: 300 });
    expect(latest().scale).toBeCloseTo(1.1);
    // ancla x = 600 − 400 = 200 → tx = 200 − 200·1.1 = −20 (con tolerancia de fp: 200*1.1 no
    // es exacto en IEEE-754, la fórmula de zoomTo del núcleo de Task 4 arrastra ese residuo).
    const match = (latest().style.transform ?? '').match(
      /^translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(1\.1\)$/,
    );
    expect(match).not.toBeNull();
    expect(Number(match?.[1])).toBeCloseTo(-20);
    expect(Number(match?.[2])).toBeCloseTo(0);
  });

  it('doble click alterna 1x ↔ 2x', () => {
    const { viewport, latest } = setupProbe();
    fireEvent.dblClick(viewport, { clientX: 400, clientY: 300 });
    expect(latest().scale).toBe(2);
    fireEvent.dblClick(viewport, { clientX: 400, clientY: 300 });
    expect(latest().scale).toBe(1);
  });

  it('drag de un puntero panea (con zoom) y marca consumeDrag', () => {
    const { viewport, latest } = setupProbe();
    fireEvent.wheel(viewport, { deltaY: -800, clientX: 400, clientY: 300 }); // zoom céntrico
    const scale = latest().scale;
    expect(scale).toBeGreaterThan(1.5);
    fireEvent.pointerDown(viewport, {
      pointerId: 1,
      clientX: 400,
      clientY: 300,
      button: 0,
      pointerType: 'mouse',
    });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 360, clientY: 300 });
    expect(latest().style.transform).toContain('translate(-40px, 0px)');
    fireEvent.pointerUp(viewport, { pointerId: 1 });
    expect(latest().consumeDrag()).toBe(true);
    expect(latest().consumeDrag()).toBe(false);
  });

  it('click sin apenas movimiento NO marca drag', () => {
    const { viewport, latest } = setupProbe();
    fireEvent.pointerDown(viewport, {
      pointerId: 1,
      clientX: 400,
      clientY: 300,
      button: 0,
      pointerType: 'mouse',
    });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 402, clientY: 300 });
    fireEvent.pointerUp(viewport, { pointerId: 1 });
    expect(latest().consumeDrag()).toBe(false);
  });

  it('pinch con dos punteros escala según la distancia', () => {
    const { viewport, latest } = setupProbe();
    fireEvent.pointerDown(viewport, {
      pointerId: 1,
      clientX: 300,
      clientY: 300,
      pointerType: 'touch',
      button: 0,
    });
    fireEvent.pointerDown(viewport, {
      pointerId: 2,
      clientX: 500,
      clientY: 300,
      pointerType: 'touch',
      button: 0,
    });
    // distancia 200 → 400: escala ×2
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 200, clientY: 300 });
    fireEvent.pointerMove(viewport, { pointerId: 2, clientX: 600, clientY: 300 });
    expect(latest().scale).toBeCloseTo(2, 1);
  });
});

describe('useZoomPan v2.2 — auditoría pan con ratón (C4)', () => {
  function setupProbe() {
    let latest: UseZoomPanResult | undefined;
    const utils = render(<GestureProbe onRender={(r) => (latest = r)} />);
    const viewport = utils.getByTestId('viewport');
    const content = utils.getByTestId('content');
    mockSizes(viewport, 800, 600);
    mockSizes(content, 800, 600);
    return { viewport, content, latest: () => latest! };
  }

  it('el dragstart nativo sobre el media queda prevenido (el drag de img no mata el pan)', () => {
    const { viewport } = setupProbe();
    const event = new Event('dragstart', { bubbles: true, cancelable: true });
    viewport.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('con zoom > 1 el arrastre de ratón panea y clampa en los límites', () => {
    const { viewport, latest } = setupProbe();
    act(() => latest().zoomTo(2));
    expect(latest().scale).toBe(2);
    fireEvent.pointerDown(viewport, {
      pointerId: 1,
      clientX: 400,
      clientY: 300,
      button: 0,
      pointerType: 'mouse',
    });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 300, clientY: 300 });
    expect(latest().style.transform).toContain('translate(-100px, 0px)');
    // sigue moviendo más allá del límite: maxTx = (800·2−800)/2 = 400 → clampa ahí.
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: -5000, clientY: 300 });
    expect(latest().style.transform).toContain('translate(-400px, 0px)');
  });

  it('expone data-can-pan en el viewport solo cuando hay desborde', () => {
    const { viewport, latest } = setupProbe();
    expect(viewport).not.toHaveAttribute('data-can-pan');
    act(() => latest().zoomTo(2));
    expect(viewport).toHaveAttribute('data-can-pan');
  });
});

describe('useZoomPan — re-clamp del pan al cambiar el viewport', () => {
  function growViewport(viewport: HTMLElement, width: number, height: number) {
    Object.defineProperty(viewport, 'clientWidth', { value: width, configurable: true });
    Object.defineProperty(viewport, 'clientHeight', { value: height, configurable: true });
  }

  it('re-clampa tx/ty al disparar resize cuando el viewport crece', () => {
    const { result, viewport } = setup(400, 300, 800, 600);
    act(() => {
      result.current.zoomTo(2);
      result.current.panBy(10_000, 10_000); // clampa al máximo actual
    });
    expect(result.current.style.transform).toBe('translate(600px, 450px) scale(2)');

    // el viewport crece (p.ej. al entrar en fullscreen): el desborde desaparece.
    growViewport(viewport, 1600, 1200);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.style.transform).toBe('translate(0px, 0px) scale(2)');
    expect(result.current.canPan).toBe(false);
  });

  it('re-clampa tx/ty al disparar fullscreenchange cuando el viewport crece', () => {
    const { result, viewport } = setup(400, 300, 800, 600);
    act(() => {
      result.current.zoomTo(2);
      result.current.panBy(10_000, 10_000);
    });
    expect(result.current.style.transform).toBe('translate(600px, 450px) scale(2)');

    growViewport(viewport, 1600, 1200);
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.style.transform).toBe('translate(0px, 0px) scale(2)');
    expect(result.current.canPan).toBe(false);
  });
});

describe('useZoomPan — no capturar el puntero de controles interactivos (T25 QA fix)', () => {
  // Causa raíz (t25-qa-a11y.md): onPointerDown capturaba el puntero de CUALQUIER
  // target dentro del viewport salvo [data-mk-drag-exempt], lo que retargeteaba el
  // click subsiguiente (p.ej. de un botón play/pause) al div del viewport.
  function setupProbe() {
    let latest: UseZoomPanResult | undefined;
    const utils = render(<GestureProbe onRender={(r) => (latest = r)} />);
    const viewport = utils.getByTestId('viewport');
    const content = utils.getByTestId('content');
    mockSizes(viewport, 800, 600);
    mockSizes(content, 800, 600);
    return { viewport, content, latest: () => latest! };
  }

  it('pointerdown sobre un <button> hijo del contenido no captura el puntero', () => {
    const { viewport } = setupProbe();
    const button = document.createElement('button');
    viewport.querySelector('[data-testid="content"]')?.appendChild(button);
    const captureSpy = vi.spyOn(viewport, 'setPointerCapture');
    fireEvent.pointerDown(button, {
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      button: 0,
      pointerType: 'mouse',
    });
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it('consumeInteractiveDown refleja el pointerdown sobre un control y se limpia al leerlo', () => {
    const { viewport, latest } = setupProbe();
    const button = document.createElement('button');
    viewport.querySelector('[data-testid="content"]')?.appendChild(button);
    fireEvent.pointerDown(button, {
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      button: 0,
      pointerType: 'mouse',
    });
    expect(latest().consumeInteractiveDown()).toBe(true);
    expect(latest().consumeInteractiveDown()).toBe(false);
  });

  it('regresión: pointerdown sobre el contenido no interactivo SÍ captura el puntero (pan intacto)', () => {
    const { content, latest } = setupProbe();
    fireEvent.pointerDown(content, {
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      button: 0,
      pointerType: 'mouse',
    });
    expect(latest().consumeInteractiveDown()).toBe(false);
  });
});
