import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiDemo } from '@/data/api-demo';
import { ApiRequestPlayer, type ApiRequestPlayerLabels } from './api-request-player';

const labels: ApiRequestPlayerLabels = {
  run: 'Run',
  running: 'Running…',
  pending: 'Pending…',
  streaming: 'Streaming…',
  copy: 'Copy',
  copied: 'Copied!',
  done: 'Response received',
  responsePlaceholder: 'The response will appear here — press Run',
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function stubReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === REDUCED_MOTION_QUERY ? matches : false,
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

function renderPlayer() {
  return render(<ApiRequestPlayer demo={apiDemo} labels={labels} />);
}

/**
 * Stub determinista de rAF (mismo patrón que tilt-card/animated-metric): jsdom
 * no trae un scheduler síncrono, así que sin esto el streaming del player nunca
 * avanza en tests. Local a cada test vía `vi.stubGlobal` + `afterEach(vi.unstubAllGlobals)`.
 */
function stubAnimationFrame() {
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
    /** Ejecuta los frames agendados en este instante (una "ronda" de streaming). */
    flush: () => {
      const pending = Array.from(frames.values());
      frames.clear();
      act(() => {
        for (const cb of pending) cb(0);
      });
    },
    /** Ejecuta rondas hasta que no quede ningún frame agendado (streaming completo). */
    flushAll: () => {
      let guard = 0;
      while (frames.size > 0 && guard < 1000) {
        const pending = Array.from(frames.values());
        frames.clear();
        act(() => {
          for (const cb of pending) cb(0);
        });
        guard += 1;
      }
    },
    pendingCount: () => frames.size,
  };
}

describe('ApiRequestPlayer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('idle muestra la request y el botón run', () => {
    renderPlayer();
    expect(screen.getByText(/text-to-image/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.run })).toBeInTheDocument();
  });

  it('idle muestra un placeholder en la respuesta en vez de un <pre> vacío', () => {
    renderPlayer();
    expect(screen.getByText(labels.responsePlaceholder)).toBeInTheDocument();
  });

  it('durante pending, una etiqueta de estado en font-mono acompaña al spinner', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    stubReducedMotion(true);
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    expect(screen.getByText(labels.pending)).toBeInTheDocument();
  });

  it('durante streaming, una etiqueta de estado en font-mono acompaña al caret', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const frame = stubAnimationFrame();
    stubReducedMotion(false);
    renderPlayer();

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    act(() => vi.advanceTimersByTime(600));
    frame.flush();

    expect(screen.getByText(labels.streaming)).toBeInTheDocument();
    expect(screen.getByText('▌')).toBeInTheDocument();

    frame.flushAll();
  });

  it('run → pending → done con la respuesta completa (reduced-motion: sin typing)', async () => {
    stubReducedMotion(true);
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    expect(await screen.findByText(/COMPLETED/)).toBeInTheDocument();
    expect(screen.getByText('200 OK')).toBeInTheDocument();
  });

  it('el botón copy copia la respuesta', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    stubReducedMotion(true);
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    await screen.findByText(/COMPLETED/);
    fireEvent.click(screen.getByRole('button', { name: labels.copy }));
    expect(writeText).toHaveBeenCalled();
  });

  it('durante pending, el botón run se deshabilita y muestra el label "running"', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    stubReducedMotion(true);
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    expect(screen.getByRole('button', { name: labels.running })).toBeDisabled();
  });

  it('sin reduced-motion, la respuesta se escribe en streaming con caret y termina en done', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const frame = stubAnimationFrame();
    stubReducedMotion(false);
    renderPlayer();

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    act(() => vi.advanceTimersByTime(600));

    const fullResponse = JSON.stringify(apiDemo.response, null, 2);
    frame.flush();
    expect(screen.queryByText(fullResponse)).not.toBeInTheDocument();
    expect(screen.getByText('▌')).toBeInTheDocument();

    frame.flushAll();
    expect(screen.getByText(/COMPLETED/)).toBeInTheDocument();
    expect(screen.queryByText('▌')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.run })).toBeInTheDocument();
  });

  it('reejecutable: correr de nuevo desde done resetea y vuelve a completar la respuesta', async () => {
    stubReducedMotion(true);
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    await screen.findByText(/COMPLETED/);

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    expect(screen.getByRole('button', { name: labels.running })).toBeInTheDocument();

    await screen.findByText(/COMPLETED/);
    expect(screen.getByText('200 OK')).toBeInTheDocument();
  });

  it('copy sin clipboard disponible no rompe', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    stubReducedMotion(true);
    renderPlayer();
    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    await screen.findByText(/COMPLETED/);
    expect(() => fireEvent.click(screen.getByRole('button', { name: labels.copy }))).not.toThrow();
  });

  it('desmontar durante pending cancela el timeout pendiente (mecanismo, no solo ausencia de crash)', () => {
    // React 19 vuelve un no-op silencioso el setState post-unmount (ya no hay warning
    // "state update on an unmounted component"), así que "no lanza / no hace
    // console.error" NO discrimina si el cleanup deja de llamar clearTimeout. La
    // aserción real es sobre el motor de fake timers: `getTimerCount()` cuenta los
    // timers (`setTimeout`) todavía pendientes — debe pasar de 1 a 0 al desmontar.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    stubReducedMotion(true);
    const { unmount } = renderPlayer();

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    expect(screen.getByRole('button', { name: labels.running })).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(1);

    // Desmonta ANTES de que el setTimeout de 600ms llegue a disparar.
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('si el portapapeles rechaza, no crashea, no deja unhandled rejection y no queda "copied"', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubReducedMotion(true);
    renderPlayer();

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    await screen.findByText(/COMPLETED/);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: labels.copy }));
      // Deja correr el microtask del catch antes de aserciones (evita el warning
      // "not wrapped in act" por el setState que NO llega a producirse).
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: labels.copy })).toBeInTheDocument();
    expect(screen.queryByText(labels.copied)).not.toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('desmontar durante streaming limpia timeout y rAF sin dejar un setState huérfano', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const frame = stubAnimationFrame();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubReducedMotion(false);
    const { unmount } = renderPlayer();

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    act(() => vi.advanceTimersByTime(600));
    frame.flush();
    expect(frame.pendingCount()).toBe(1);

    unmount();
    expect(frame.pendingCount()).toBe(0);
    expect(() => act(() => vi.advanceTimersByTime(600))).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('anuncia la respuesta recibida solo al llegar a done, en un contenedor sr-only role=status', async () => {
    stubReducedMotion(true);
    renderPlayer();
    expect(screen.getByRole('status')).toHaveTextContent('');

    fireEvent.click(screen.getByRole('button', { name: labels.run }));
    await screen.findByText(/COMPLETED/);
    expect(screen.getByRole('status')).toHaveTextContent(labels.done);
  });
});
