import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TiltCard } from './tilt-card';

/**
 * Stubea matchMedia por query (no un booleano global): TiltCard consulta dos
 * media queries independientes — puntero fino y reduced-motion — y cada test
 * necesita combinarlas de forma distinta.
 */
function stubMatchMedia(queries: Record<string, boolean>) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: queries[query] ?? false,
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

type FrameStub = {
  /** Executes pending frames (simulates next repaint). */
  flush: () => void;
  /** Number of pending frames neither executed nor cancelled. */
  pendingCount: () => number;
};

/**
 * TiltCard schedules the 4 `pointermove` writes in a single `requestAnimationFrame`
 * (batching) and cancels the previous frame if a move arrives faster than the
 * repaint. jsdom does not provide a synchronous or deterministic rAF scheduler, so
 * without this stub batching/cancellation cannot be reliably observed.
 *
 * Local to this describe (via `vi.stubGlobal` + `afterEach(vi.unstubAllGlobals)`),
 * NOT in `vitest.setup.ts`: other tests in the repo that depend on real async
 * rAF behavior (e.g. `AnimatedMetric` loops, which use their own
 * ad-hoc manual clock) must not inherit this global stub.
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

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getRoot() {
  return screen.getByText('content').closest('[data-tilt]') as HTMLElement;
}

function mockRect(
  root: HTMLElement,
  rect: { left: number; top: number; width: number; height: number },
) {
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
}

describe('TiltCard', () => {
  let frame: FrameStub;

  beforeEach(() => {
    frame = stubAnimationFrame();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('with a fine pointer, moving the mouse tilts (both axes) and positions the glow', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();
    mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    frame.flush();
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('4.00deg');
    expect(root.style.getPropertyValue('--tilt-rx')).toBe('4.00deg');
    expect(root.style.getPropertyValue('--tilt-gx')).toBe('100.0%');
    expect(root.style.getPropertyValue('--tilt-gy')).toBe('0.0%');

    fireEvent.pointerLeave(root);
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('0deg');
    expect(root.style.getPropertyValue('--tilt-rx')).toBe('0deg');
  });

  it('con reduced-motion no inclina', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: true });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    frame.flush();
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('');
  });

  it('con reduced-motion, el glow sigue apareciendo al hover pero queda centrado (no sigue el puntero)', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: true });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    frame.flush();
    expect(root.style.getPropertyValue('--tilt-gx')).toBe('');
    expect(root.querySelector('[aria-hidden]')).toHaveClass('opacity-[0.12]');
  });

  it('on touch (without fine pointer) is an inert div: no glow and no tilt', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: false, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    frame.flush();
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('');
    expect(root.querySelector('[aria-hidden]')).not.toBeInTheDocument();
  });

  it('with rect of width/height 0 (layout not yet measured) does not write custom properties', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();
    mockRect(root, { left: 0, top: 0, width: 0, height: 0 });

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    frame.flush();
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('');
    expect(frame.pendingCount()).toBe(0);
  });

  it('forwards className to the root element (to position the glow with `relative`)', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard className="relative">
        <div>content</div>
      </TiltCard>,
    );
    expect(getRoot()).toHaveClass('relative');
  });

  it('maxTilt scales the tilt magnitude', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard maxTilt={8}>
        <div>content</div>
      </TiltCard>,
    );
    const root = getRoot();
    mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    frame.flush();
    expect(root.style.getPropertyValue('--tilt-ry')).toBe('8.00deg');
  });

  describe('batching de rAF', () => {
    it('schedules writes in a single rAF and cancels the previous frame if a move arrives faster than repaint', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();
      mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

      // Two moves before frame runs (browser has not repainted yet).
      fireEvent.pointerMove(root, { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });

      // First frame was cancelled: only one alive, none executed yet.
      expect(frame.pendingCount()).toBe(1);
      expect(root.style.getPropertyValue('--tilt-ry')).toBe('');

      frame.flush();
      // Applies position of LAST move (clientX 200 → 4.00deg), not first (0 → -4.00deg).
      expect(root.style.getPropertyValue('--tilt-ry')).toBe('4.00deg');
    });

    it('pointerLeave cancels an in-flight tilt frame: the reset to 0deg is not overwritten afterwards', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();
      mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

      fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
      expect(frame.pendingCount()).toBe(1);

      fireEvent.pointerLeave(root);
      expect(frame.pendingCount()).toBe(0);
      expect(root.style.getPropertyValue('--tilt-ry')).toBe('0deg');

      // If the canceled frame ran anyway, it would overwrite the reset with the old position.
      frame.flush();
      expect(root.style.getPropertyValue('--tilt-ry')).toBe('0deg');
    });

    it('al desmontar con un frame en vuelo, cancela el frame pendiente', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      const { unmount } = render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();
      mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

      fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
      expect(frame.pendingCount()).toBe(1);

      unmount();
      expect(frame.pendingCount()).toBe(0);
      expect(() => frame.flush()).not.toThrow();
    });
  });

  describe('will-change', () => {
    it('does not apply will-change before any hover (with tilt enabled)', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      expect(getRoot().style.willChange).toBe('');
    });

    it('aplica will-change: transform durante el hover, con tilt habilitado', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();
      mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

      fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
      expect(root.style.willChange).toBe('transform');
    });

    it('quita will-change al salir el puntero (pointerLeave)', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();
      mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

      fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
      expect(root.style.willChange).toBe('transform');

      fireEvent.pointerLeave(root);
      expect(root.style.willChange).toBe('');
    });

    it('nunca aplica will-change con reduced-motion, aunque haya hover', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: true });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();

      fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
      expect(root.style.willChange).toBe('');
      expect(root.style.transform).toBe('');
    });

    it('nunca aplica will-change en touch (sin puntero fino), aunque haya hover', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: false, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();

      fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
      expect(root.style.willChange).toBe('');
      expect(root.style.transform).toBe('');
    });
  });
});
