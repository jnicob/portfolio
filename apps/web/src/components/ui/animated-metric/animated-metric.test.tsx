import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimatedMetric, formatLike } from './animated-metric';

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

/**
 * jsdom does not implement IntersectionObserver or a real scheduler for
 * requestAnimationFrame, so without this stub the AnimatedMetric counting loop
 * (IO → rAF → easing → formatLike on each tick → disconnect)
 * never runs in tests: it always falls into the "no IO" fallback branch. This
 * helper stubs the three pieces with a manual clock to trigger the
 * intersection and advance frame by frame deterministically.
 */
function stubAnimationEnvironment() {
  let clock = 0;
  let nextFrameId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const disconnect = vi.fn();
  const observe = vi.fn();
  let ioCallback: IntersectionCallback = () => {};

  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation((callback: IntersectionCallback) => {
      ioCallback = callback;
      return { observe, disconnect, unobserve: vi.fn() };
    }),
  );
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = ++nextFrameId;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
  vi.spyOn(performance, 'now').mockImplementation(() => clock);

  return {
    /** Simula el elemento entrando en viewport. */
    intersect: () => {
      act(() => ioCallback([{ isIntersecting: true }]));
    },
    /** Ejecuta los callbacks de rAF pendientes con `now` como timestamp del frame. */
    flush: (now: number) => {
      clock = now;
      const pending = Array.from(frames.values());
      frames.clear();
      act(() => {
        for (const cb of pending) cb(now);
      });
    },
    disconnect,
    observe,
    pendingFrameCount: () => frames.size,
  };
}

describe('formatLike', () => {
  it('conserva separador de miles y sufijo del literal original', () => {
    expect(formatLike('1.000+', 500)).toBe('500+');
    expect(formatLike('1.000+', 1000)).toBe('1.000+');
    expect(formatLike('40+', 12)).toBe('12+');
  });

  it('returns the literal unchanged when it contains no digits', () => {
    expect(formatLike('N/A', 5)).toBe('N/A');
  });

  it('does not corrupt a text list without digits (", " is not a thousands separator)', () => {
    expect(formatLike('Kling, WAN', 0)).toBe('Kling, WAN');
  });

  it('preserves the space between the number and the rest of the literal', () => {
    expect(formatLike('3 (create, list, get-by-id)', 3)).toBe('3 (create, list, get-by-id)');
  });
});

describe('AnimatedMetric', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sin IntersectionObserver muestra el valor final directo', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<AnimatedMetric value="25+" />);
    expect(screen.getByText('25+', { selector: '[aria-hidden]' })).toBeInTheDocument();
  });

  it('expone el valor real para lectores de pantalla', () => {
    render(<AnimatedMetric value="1.000+" />);
    expect(screen.getByText('1.000+', { selector: '.sr-only' })).toBeInTheDocument();
  });
});

describe('AnimatedMetric — camino animado (IntersectionObserver + rAF disponibles)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('antes de intersectar (primer render) muestra el valor final, igual que el SSR', () => {
    // Hydration contract: server renders target value to avoid mismatch.
    // el valor final directo. El cliente debe pintar exactamente lo mismo en su
    // first render -even if IO is available- so as not to produce a mismatch of
    // texto (React #418). El conteo 0→N solo arranca cuando el IO intersecta.
    stubAnimationEnvironment();
    render(<AnimatedMetric value="1.000+" durationMs={1000} />);
    expect(screen.getByText('1.000+', { selector: '[aria-hidden]' })).toBeInTheDocument();
  });

  it('tras intersectar progresa con easing out-cubic y termina exacto en el literal original', () => {
    const env = stubAnimationEnvironment();
    render(<AnimatedMetric value="1.000+" durationMs={1000} />);

    env.intersect();
    // t = 500/1000 = 0.5 → eased = 1 - (1-0.5)^3 = 0.875 → round(1000 * 0.875) = 875
    env.flush(500);
    expect(screen.getByText('875+', { selector: '[aria-hidden]' })).toBeInTheDocument();

    // t = 1 → eased = 1 → 1000, reformateado con el separador de miles original.
    env.flush(1000);
    expect(screen.getByText('1.000+', { selector: '[aria-hidden]' })).toBeInTheDocument();
    // At t=1 tick schedules no more frames: animation completes.
    expect(env.pendingFrameCount()).toBe(0);
  });

  it('respects a custom durationMs (same fraction t, different time scale)', () => {
    const env = stubAnimationEnvironment();
    render(<AnimatedMetric value="40+" durationMs={2000} />);

    env.intersect();
    // t = 1000/2000 = 0.5 → eased = 0.875 → round(40 * 0.875) = 35
    env.flush(1000);
    expect(screen.getByText('35+', { selector: '[aria-hidden]' })).toBeInTheDocument();

    env.flush(2000);
    expect(screen.getByText('40+', { selector: '[aria-hidden]' })).toBeInTheDocument();
  });

  it('desconecta el observer una sola vez, al primer disparo de isIntersecting', () => {
    const env = stubAnimationEnvironment();
    render(<AnimatedMetric value="25+" durationMs={1000} />);

    env.intersect();
    expect(env.disconnect).toHaveBeenCalledTimes(1);

    env.flush(1000);
    expect(env.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not animate metrics without digits: does not observe the element and displays the literal directly', () => {
    const env = stubAnimationEnvironment();
    render(<AnimatedMetric value="Kling, WAN" durationMs={1000} />);

    expect(env.observe).not.toHaveBeenCalled();
    expect(screen.getByText('Kling, WAN', { selector: '[aria-hidden]' })).toBeInTheDocument();
  });

  it('animates only the number of an "N (resto)" literal, preserving the rest byte-exact', () => {
    const env = stubAnimationEnvironment();
    render(<AnimatedMetric value="3 (create, list, get-by-id)" durationMs={1000} />);

    env.intersect();
    env.flush(1000);
    expect(
      screen.getByText('3 (create, list, get-by-id)', { selector: '[aria-hidden]' }),
    ).toBeInTheDocument();
  });

  it('when unmounting during animation, cancels the in-flight frame without leaving an orphaned setState', () => {
    const env = stubAnimationEnvironment();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<AnimatedMetric value="1.000+" durationMs={1000} />);

    env.intersect();
    env.flush(500); // t<1: el tick reprograma un siguiente frame antes de desmontar.
    expect(env.pendingFrameCount()).toBe(1);

    unmount();
    expect(env.pendingFrameCount()).toBe(0); // Effect cleanup cancelled pending frame.
    expect(consoleError).not.toHaveBeenCalled();
  });
});
