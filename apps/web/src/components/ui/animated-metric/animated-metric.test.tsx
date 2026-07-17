import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimatedMetric, formatLike } from './animated-metric';

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

/**
 * jsdom no implementa IntersectionObserver ni un scheduler real de
 * requestAnimationFrame, así que sin este stub el bucle de conteo de
 * AnimatedMetric (IO → rAF → easing → formatLike en cada tick → disconnect)
 * nunca se ejecuta en tests: siempre cae en la rama fallback "sin IO". Este
 * helper stubea las tres piezas con un reloj manual para poder disparar la
 * intersección y avanzar frame a frame de forma determinista.
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
    pendingFrameCount: () => frames.size,
  };
}

describe('formatLike', () => {
  it('conserva separador de miles y sufijo del literal original', () => {
    expect(formatLike('1.000+', 500)).toBe('500+');
    expect(formatLike('1.000+', 1000)).toBe('1.000+');
    expect(formatLike('40+', 12)).toBe('12+');
  });

  it('devuelve el literal sin cambios cuando no contiene dígitos', () => {
    expect(formatLike('N/A', 5)).toBe('N/A');
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
    // Contrato de hidratación: el servidor (sin IntersectionObserver) renderiza
    // el valor final directo. El cliente debe pintar exactamente lo mismo en su
    // primer render -aunque IO esté disponible- para no producir un mismatch de
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
    // en t=1 el tick no reprograma más frames: la animación termina.
    expect(env.pendingFrameCount()).toBe(0);
  });

  it('respeta un durationMs personalizado (misma fracción t, distinta escala de tiempo)', () => {
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

  it('al desmontar durante la animación, cancela el frame en vuelo sin dejar un setState huérfano', () => {
    const env = stubAnimationEnvironment();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<AnimatedMetric value="1.000+" durationMs={1000} />);

    env.intersect();
    env.flush(500); // t<1: el tick reprograma un siguiente frame antes de desmontar.
    expect(env.pendingFrameCount()).toBe(1);

    unmount();
    expect(env.pendingFrameCount()).toBe(0); // el cleanup del effect canceló el frame pendiente.
    expect(consoleError).not.toHaveBeenCalled();
  });
});
