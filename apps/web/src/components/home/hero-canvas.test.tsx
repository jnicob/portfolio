import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroCanvas } from './hero-canvas';

/**
 * Stubea `prefers-reduced-motion` sobreescribiendo `window.matchMedia` directo
 * (mismo patrón que `tilt-card.test.tsx`): cada test que lo necesita lo vuelve a
 * definir, así que no hace falta restaurarlo en `afterEach`.
 */
function stubReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

type Context2DStub = {
  clearRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  setTransform: ReturnType<typeof vi.fn>;
  fillStyle: string;
  globalAlpha: number;
};

/**
 * jsdom no implementa el contexto 2D de canvas (`getContext` devuelve `null`):
 * sin este stub, el efecto de HeroCanvas corta en el guard `if (!ctx) return`
 * antes de pintar/animar nada, y los tests que ejercen ese comportamiento no
 * podrían observarlo.
 */
function stubContext2D(): Context2DStub {
  const ctx: Context2DStub = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  return ctx;
}

/**
 * jsdom no implementa layout real: `getBoundingClientRect` devuelve 0x0 por
 * defecto. HeroCanvas mide el contenedor una única vez al montar (no hay
 * `ResizeObserver` en jsdom — ver guard defensivo en la implementación), así
 * que este stub debe aplicarse ANTES de `render` para que el grid tenga
 * tamaño real y las celdas lleguen a pintarse.
 */
function stubContainerRect(rect: { width: number; height: number }) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: rect.width,
    height: rect.height,
    left: 0,
    top: 0,
    right: rect.width,
    bottom: rect.height,
    x: 0,
    y: 0,
    toJSON() {},
  } as DOMRect);
}

type FrameStub = {
  /** Ejecuta todos los frames agendados y aún no cancelados. */
  flush: () => void;
  /** Nº de frames agendados y todavía ni ejecutados ni cancelados. */
  pendingCount: () => number;
};

/**
 * Reloj de rAF sincrónico y determinista, local a este describe (mismo patrón
 * que `tilt-card.test.tsx`): jsdom trae un rAF real pero asíncrono, inútil
 * para aserciones deterministas sobre arranque/pausa del bucle.
 */
function stubAnimationFrame(): FrameStub {
  let nextId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
    const id = ++nextId;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
  return {
    flush: () => {
      const pending = Array.from(frames.values());
      frames.clear();
      for (const cb of pending) cb(0);
    },
    pendingCount: () => frames.size,
  };
}

function getContainer() {
  return document.querySelector('canvas')!.parentElement as HTMLElement;
}

describe('HeroCanvas', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-skin');
  });

  it('renderiza un canvas decorativo aria-hidden', () => {
    render(<HeroCanvas />);
    const canvas = document.querySelector('canvas')!;
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('con reduced-motion no arranca el bucle', () => {
    stubReducedMotion(true);
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    render(<HeroCanvas />);
    expect(raf).not.toHaveBeenCalled();
  });

  it('en reposo (sin puntero encima) no arranca el bucle, aunque no haya reduced-motion', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    render(<HeroCanvas />);
    expect(frame.pendingCount()).toBe(0);
  });

  it('mover el puntero dentro del contenedor arranca el bucle de rAF', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    render(<HeroCanvas />);

    fireEvent.pointerMove(getContainer(), { clientX: 50, clientY: 50 });
    expect(frame.pendingCount()).toBe(1);
  });

  it('con reduced-motion, mover el puntero no arranca el bucle pero repinta un frame estático', () => {
    stubReducedMotion(true);
    const ctx = stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    render(<HeroCanvas />);
    const fillsAtMount = ctx.fill.mock.calls.length;

    fireEvent.pointerMove(getContainer(), { clientX: 50, clientY: 50 });
    expect(frame.pendingCount()).toBe(0);
    expect(ctx.fill.mock.calls.length).toBeGreaterThan(fillsAtMount);
  });

  it('sacar el puntero del contenedor detiene el bucle y pinta un último frame de reposo', () => {
    stubReducedMotion(false);
    const ctx = stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    render(<HeroCanvas />);
    const container = getContainer();

    fireEvent.pointerMove(container, { clientX: 50, clientY: 50 });
    expect(frame.pendingCount()).toBe(1);
    const fillsBeforeLeave = ctx.fill.mock.calls.length;

    fireEvent.pointerLeave(container);
    expect(frame.pendingCount()).toBe(0);
    expect(ctx.fill.mock.calls.length).toBeGreaterThan(fillsBeforeLeave);
  });

  it('ocultar la pestaña pausa un bucle activo; volver a mostrarla lo reanuda', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    render(<HeroCanvas />);

    fireEvent.pointerMove(getContainer(), { clientX: 50, clientY: 50 });
    expect(frame.pendingCount()).toBe(1);
    frame.flush(); // el tick corre y se reprograma: el puntero sigue dentro.
    expect(frame.pendingCount()).toBe(1);

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(frame.pendingCount()).toBe(0);

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    expect(frame.pendingCount()).toBe(1);
  });

  it('re-lee --color-accent y repinta cuando cambia data-theme en <html>', async () => {
    stubReducedMotion(false);
    const ctx = stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    render(<HeroCanvas />);
    const callsAtMount = ctx.clearRect.mock.calls.length;

    document.documentElement.setAttribute('data-theme', 'dark');

    await waitFor(() => expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(callsAtMount));
  });

  it('re-lee --color-accent y repinta cuando cambia data-skin en <html>', async () => {
    stubReducedMotion(false);
    const ctx = stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    render(<HeroCanvas />);
    const callsAtMount = ctx.clearRect.mock.calls.length;

    document.documentElement.setAttribute('data-skin', 'brand');

    await waitFor(() => expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(callsAtMount));
  });

  it('al desmontar con un frame en vuelo, cancela el frame pendiente', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    const { unmount } = render(<HeroCanvas />);

    fireEvent.pointerMove(getContainer(), { clientX: 50, clientY: 50 });
    expect(frame.pendingCount()).toBe(1);

    unmount();
    expect(frame.pendingCount()).toBe(0);
  });

  it('capa devicePixelRatio a 2 para el tamaño del backing buffer del canvas', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 100, height: 50 });
    vi.stubGlobal('devicePixelRatio', 4);

    render(<HeroCanvas />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(200); // 100 * min(4, 2)
    expect(canvas.height).toBe(100); // 50 * min(4, 2)
  });
});
