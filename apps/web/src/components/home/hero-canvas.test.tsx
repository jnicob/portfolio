import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroCanvas } from './hero-canvas';

/**
 * Stubs `prefers-reduced-motion` by directly overwriting `window.matchMedia`
 * (same pattern as `tilt-card.test.tsx`): each test that needs it redefines
 * it, so there is no need to restore it in `afterEach`.
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
 * jsdom does not implement the canvas 2D context (`getContext` returns `null`):
 * without this stub, the HeroCanvas effect stops at the `if (!ctx) return` guard
 * before painting/animating anything, and tests exercising that behavior would not
 * be able to observe it.
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
 * jsdom does not implement real layout: `getBoundingClientRect` returns 0x0 by
 * default. HeroCanvas measures the container only once on mount (there is no
 * `ResizeObserver` in jsdom — see defensive guard in the implementation), so
 * this stub must be applied BEFORE `render` so that the grid has a
 * real size and the cells actually get painted.
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
  /** Executes all scheduled frames that have not yet been canceled. */
  flush: () => void;
  /** Number of scheduled frames neither executed nor canceled yet. */
  pendingCount: () => number;
};

/**
 * Synchronous and deterministic rAF clock, local to this describe (same pattern
 * as `tilt-card.test.tsx`): jsdom provides a real but asynchronous rAF, useless
 * for deterministic assertions about starting/pausing the loop.
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

/**
 * Without this stub, `getComputedStyle` in jsdom returns `''` for
 * `--color-accent` (no real resolved stylesheet), and with the
 * "no accent, no paint" guard (see `hero-canvas.tsx`) that would leave the canvas empty in
 * ALL tests that verify repainting via `ctx.fill`. It is only applied in
 * tests that need a real color to observe painting; those that
 * verify `clearRect` (which always runs, with or without accent) do not need it.
 */
function stubAccentColor(value: string) {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => value,
  } as unknown as CSSStyleDeclaration);
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

  it('with reduced-motion, moving the pointer does not start the loop but repaints a static frame', () => {
    stubReducedMotion(true);
    const ctx = stubContext2D();
    stubAccentColor('#336699');
    stubContainerRect({ width: 200, height: 100 });
    const frame = stubAnimationFrame();
    render(<HeroCanvas />);
    const fillsAtMount = ctx.fill.mock.calls.length;

    fireEvent.pointerMove(getContainer(), { clientX: 50, clientY: 50 });
    expect(frame.pendingCount()).toBe(0);
    expect(ctx.fill.mock.calls.length).toBeGreaterThan(fillsAtMount);
  });

  it('moving the pointer out of the container stops the loop and paints a final resting frame', () => {
    stubReducedMotion(false);
    const ctx = stubContext2D();
    stubAccentColor('#336699');
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

  it('hiding the tab pauses an active loop; showing it again resumes it', () => {
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

  it('caps devicePixelRatio at 2 for the canvas backing buffer size', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 100, height: 50 });
    vi.stubGlobal('devicePixelRatio', 4);

    render(<HeroCanvas />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(200); // 100 * min(4, 2)
    expect(canvas.height).toBe(100); // 50 * min(4, 2)
  });

  it('sets canvas CSS size to container size (independent of DPR-scaled backing buffer)', () => {
    stubReducedMotion(false);
    stubContext2D();
    stubContainerRect({ width: 800, height: 300 });
    vi.stubGlobal('devicePixelRatio', 2);

    render(<HeroCanvas />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    // Backing buffer (width/height attributes) is DPR scaled...
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(600);
    // ...but CSS box must remain at actual container size: a
    // <canvas> is a replaced element — without an explicit CSS size, its
    // uses the width/height attributes (already scaled), not the intrinsic size
    // of the container, and on HiDPI the grid would only fill the upper quadrant
    // izquierdo del hero.
    expect(canvas.style.width).toBe('800px');
    expect(canvas.style.height).toBe('300px');
  });

  it('en reposo (sin puntero) usa 0.35 de alpha por dot — no el 0.15 casi invisible en dark del design review F3.6 T21', () => {
    stubReducedMotion(false);
    const ctx = stubContext2D();
    stubAccentColor('#336699');
    stubContainerRect({ width: 200, height: 100 });

    render(<HeroCanvas />);

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.globalAlpha).toBe(0.35);
  });

  it('with empty --color-accent (not yet resolved), does not paint any dot instead of a default color', () => {
    stubReducedMotion(false);
    const ctx = stubContext2D();
    stubAccentColor('');
    stubContainerRect({ width: 200, height: 100 });

    render(<HeroCanvas />);
    expect(ctx.clearRect).toHaveBeenCalled(); // el frame se limpia igual...
    expect(ctx.fill).not.toHaveBeenCalled(); // ...without filling default black/color.
  });
});
