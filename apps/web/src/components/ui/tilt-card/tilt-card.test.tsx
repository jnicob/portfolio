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
  /** Ejecuta todos los frames agendados y aún no cancelados (simula el próximo repintado). */
  flush: () => void;
  /** Nº de frames agendados y todavía ni ejecutados ni cancelados. */
  pendingCount: () => number;
};

/**
 * TiltCard agenda los 4 writes de `pointermove` en un único `requestAnimationFrame`
 * (batching) y cancela el frame anterior si llega un move más rápido que el
 * repintado. jsdom no trae un scheduler de rAF sincrónico ni determinista, así que
 * sin este stub no se puede observar el batching/cancelación de forma fiable.
 *
 * Local a este describe (vía `vi.stubGlobal` + `afterEach(vi.unstubAllGlobals)`),
 * NO en `vitest.setup.ts`: otros tests del repo que dependan del comportamiento
 * async real de rAF (p.ej. los bucles de `AnimatedMetric`, que usan su propio
 * reloj manual ad-hoc) no deben heredar este stub global.
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

  it('con puntero fino, mover el ratón inclina (ambos ejes) y posiciona el glow', () => {
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

  it('en touch (sin puntero fino) es un div inerte: sin glow y sin inclinación', () => {
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

  it('con rect de ancho/alto 0 (layout aún no medido) no escribe custom properties', () => {
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

  it('reenvía className al elemento raíz (para posicionar el glow con `relative`)', () => {
    stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
    render(
      <TiltCard className="relative">
        <div>content</div>
      </TiltCard>,
    );
    expect(getRoot()).toHaveClass('relative');
  });

  it('maxTilt escala la magnitud de la inclinación', () => {
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
    it('agenda los writes en un único rAF y cancela el frame anterior si llega un move más rápido que el repintado', () => {
      stubMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
      render(
        <TiltCard>
          <div>content</div>
        </TiltCard>,
      );
      const root = getRoot();
      mockRect(root, { left: 0, top: 0, width: 200, height: 100 });

      // Dos moves antes de que corra ningún frame (el navegador no ha repintado aún).
      fireEvent.pointerMove(root, { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });

      // El primer frame fue cancelado: solo queda uno vivo, y ninguno corrió todavía.
      expect(frame.pendingCount()).toBe(1);
      expect(root.style.getPropertyValue('--tilt-ry')).toBe('');

      frame.flush();
      // Se aplica la posición del ÚLTIMO move (clientX 200 → 4.00deg), no la del primero (0 → -4.00deg).
      expect(root.style.getPropertyValue('--tilt-ry')).toBe('4.00deg');
    });

    it('pointerLeave cancela un frame de tilt en vuelo: el reset a 0deg no queda sobreescrito después', () => {
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

      // Si el frame cancelado igual corriera, sobreescribiría el reset con la posición vieja.
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
    it('no aplica will-change antes de ningún hover (con tilt habilitado)', () => {
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
