import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilterGallery } from './filter-gallery';

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

/**
 * jsdom does not compute real layout: `getBoundingClientRect` always returns a rect at
 * zero, so the FLIP diff (before.left - after.left) would always be 0. It is stubbed
 * with a value that grows on each call to simulate a real reflow (same pattern
 * as `mockRect` in spotlight-reveal.test.tsx).
 */
function stubGrowingRects() {
  let call = 0;
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        x: 0,
        y: 0,
        top: 0,
        left: (call += 10),
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  );
}

const ITEMS = [
  { id: 'a', categories: ['image'], node: <span>A</span> },
  { id: 'b', categories: ['video'], node: <span>B</span> },
  { id: 'c', categories: ['image', 'video'], node: <span>C</span> },
];

const RATIO_ITEMS = ITEMS.map((item) => ({ ...item, aspectRatio: 1 }));

let resizeCallbacks: ResizeObserverCallback[] = [];

function stubResizeObserver() {
  resizeCallbacks = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback);
      }
      observe = () => {};
      unobserve = () => {};
      disconnect = () => {};
    },
  );
}

function fireResize(width: number) {
  act(() => {
    for (const callback of resizeCallbacks) {
      callback(
        [{ contentRect: { width } } as unknown as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    }
  });
}

/**
 * Stub de `element.animate` que devuelve un handle fake (con `onfinish` capturable
 * y `cancel` espiable) por cada llamada, en vez de `vi.fn()` a secas: los tests de
 * salida animada necesitan disparar `onfinish` manualmente y comprobar que una
 * reentrada cancela el handle en curso.
 */
function stubAnimateWithHandles() {
  const handles: { onfinish: (() => void) | null; cancel: ReturnType<typeof vi.fn> }[] = [];
  const animate = vi.fn(() => {
    const handle = { onfinish: null as (() => void) | null, cancel: vi.fn() };
    handles.push(handle);
    return handle;
  });
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  return { handles, animate };
}

describe('FilterGallery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it('shows everything without filter; filtering by category hides the rest (uncontrolled)', () => {
    render(
      <FilterGallery
        items={ITEMS}
        categories={[
          { id: 'image', label: 'Image' },
          { id: 'video', label: 'Video' },
        ]}
        label="Gallery"
        allLabel="All"
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Video' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('modo controlado: filter + onFilterChange', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterGallery
        items={ITEMS}
        categories={[{ id: 'image', label: 'Image' }]}
        filter="image"
        onFilterChange={onFilterChange}
        label="G"
        allLabel="All"
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(onFilterChange).toHaveBeenCalledWith(null);
    expect(screen.getAllByRole('listitem')).toHaveLength(2); // controlado: no cambia solo
  });

  it('anima con FLIP al filtrar (spy en element.animate)', () => {
    stubGrowingRects();
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
    const { rerender } = render(
      <FilterGallery items={ITEMS} filter={null} label="G" allLabel="All" />,
    );
    rerender(<FilterGallery items={ITEMS} filter="image" label="G" allLabel="All" />);
    expect(animate).toHaveBeenCalled();
  });

  it('con prefers-reduced-motion no anima al filtrar', () => {
    stubReducedMotion(true);
    stubGrowingRects();
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
    const { rerender } = render(
      <FilterGallery items={ITEMS} filter={null} label="G" allLabel="All" />,
    );
    rerender(<FilterGallery items={ITEMS} filter="image" label="G" allLabel="All" />);
    expect(animate).not.toHaveBeenCalled();
  });
});

describe('visibleIds (v0.6)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it('intersects visibleIds with the category filter', () => {
    const items = [
      { id: 'a', categories: ['image'], node: <span>A</span> },
      { id: 'b', categories: ['image'], node: <span>B</span> },
      { id: 'c', categories: ['video'], node: <span>C</span> },
    ];
    render(<FilterGallery items={items} filter="image" visibleIds={['b', 'c']} label="G" />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument(); // category excludes it
  });

  it('sin visibleIds mantiene el comportamiento actual', () => {
    const items = [
      { id: 'a', categories: ['image'], node: <span>A</span> },
      { id: 'b', categories: ['image'], node: <span>B</span> },
      { id: 'c', categories: ['video'], node: <span>C</span> },
    ];
    render(<FilterGallery items={items} filter="image" label="G" />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('cambia visibleIds dispara element.animate', () => {
    stubGrowingRects();
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
    const { rerender } = render(
      <FilterGallery items={ITEMS} filter={null} visibleIds={['a', 'b']} label="G" />,
    );
    rerender(<FilterGallery items={ITEMS} filter={null} visibleIds={['b', 'c']} label="G" />);
    expect(animate).toHaveBeenCalled();
  });

  it('el primer render con visibleIds no anima (SSR-safe)', () => {
    stubGrowingRects();
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
    render(<FilterGallery items={ITEMS} filter={null} visibleIds={['a', 'b']} label="G" />);
    expect(animate).not.toHaveBeenCalled();
  });
});

describe('exit animation (v0.6)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it('mantiene el item saliente montado hasta que termina el fade-out', () => {
    const { handles } = stubAnimateWithHandles();
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.getByText('A')).toBeInTheDocument(); // exiting, still mounted

    act(() => handles.forEach((handle) => handle.onfinish?.()));
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('keeps the exiting item out of the accessible tree while fading out', () => {
    stubAnimateWithHandles();
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    const exitingItem = screen.getByText('A').closest('li');
    expect(exitingItem).toHaveAttribute('aria-hidden', 'true');
    expect(exitingItem).toHaveAttribute('inert');
  });

  it('con prefers-reduced-motion desmonta inmediatamente (sin fase de salida)', () => {
    stubReducedMotion(true);
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('sin element.animate (sin WAAPI) desmonta inmediatamente', () => {
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('if the exiting item becomes visible again before finishing, cancels the animation and reappears accessible', () => {
    const { handles, animate } = stubAnimateWithHandles();
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.getByText('A')).toBeInTheDocument();

    rerender(<FilterGallery items={ITEMS} filter={null} label="G" />);
    expect(handles[0]?.cancel).toHaveBeenCalled();
    const item = screen.getByText('A').closest('li');
    expect(item).not.toHaveAttribute('aria-hidden');
    expect(item).not.toHaveAttribute('inert');

    // El onfinish del handle cancelado es un "stale callback": no debe reabrir una
    // nueva fase de salida (nada de `data-fg-exiting` de vuelta) ni disparar una
    // extra animation — without the reentrancy guard, dropExiting('a') wouldn't break
    // nada visualmente (el item sigue en `visible`), pero esto confirma que ni
    // siquiera se re-procesa como si acabara de salir.
    const animateCallsBeforeStaleFinish = animate.mock.calls.length;
    act(() => handles[0]?.onfinish?.());
    expect(animate.mock.calls.length).toBe(animateCallsBeforeStaleFinish);
    const itemAfterStaleFinish = screen.getByText('A').closest('li');
    expect(itemAfterStaleFinish).not.toHaveAttribute('data-fg-exiting');
    expect(itemAfterStaleFinish).not.toHaveAttribute('aria-hidden');
  });

  it('desmonta con una salida en curso: cancela la Animation pendiente (mecanismo, no solo ausencia de crash)', () => {
    // Igual que en api-request-player.test.tsx: React 19 vuelve un no-op silencioso
    // el setState post-unmount (ya no hay warning "state update on an unmounted
    // component"), so "does not throw / does not console.error" does NOT distinguish on its
    // own whether cleanup stops canceling the Animation. The real assertion is that
    // `cancel()` was called on the handle on unmount; the `console.error` spy is
    // an additional check that no other warning appears either.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { handles } = stubAnimateWithHandles();
    const { rerender, unmount } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.getByText('A')).toBeInTheDocument(); // salida en curso

    unmount();
    expect(handles[0]?.cancel).toHaveBeenCalled();

    // An `onfinish` that fires after unmount (some environments do
    // incluso tras `cancel()`) no debe lanzar ni imprimir warnings.
    expect(() => act(() => handles[0]?.onfinish?.())).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('items no afectados por el filtro siguen sin marcas de salida', () => {
    stubAnimateWithHandles();
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    const survivor = screen.getByText('B').closest('li');
    expect(survivor).not.toHaveAttribute('data-fg-exiting');
    expect(survivor).not.toHaveAttribute('aria-hidden');
  });
});

describe('layout masonry/justified', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resizeCallbacks = [];
  });

  it('usa grid por defecto sin estilos de posicionamiento', () => {
    stubResizeObserver();
    render(<FilterGallery items={ITEMS} label="Demo" />);
    fireResize(700);

    const grid = screen.getByRole('list', { name: 'Demo' });
    expect(grid).toHaveAttribute('data-layout', 'grid');
    expect(grid.style.height).toBe('');
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('masonry positions items and sets container height', () => {
    stubResizeObserver();
    render(<FilterGallery items={RATIO_ITEMS} label="Demo" layout="masonry" />);

    fireResize(1000);

    const grid = screen.getByRole('list', { name: 'Demo' });
    const first = grid.querySelectorAll('li')[0] as HTMLElement;
    expect(first.style.left).toBe('0px');
    expect(first.style.top).toBe('0px');
    expect(first.style.width).toBe('244px');
    expect(first.style.height).toBe('244px');
    expect(grid.style.height).not.toBe('');
  });

  it('uses aspectRatio 1 when the item does not declare it', () => {
    stubResizeObserver();
    const itemWithoutRatio = { id: 'square', categories: [], node: <span>Square</span> };
    render(<FilterGallery items={[itemWithoutRatio]} label="Demo" layout="masonry" />);

    fireResize(1000);

    const item = screen.getByRole('listitem');
    expect(item.style.width).toBe('244px');
    expect(item.style.height).toBe('244px');
  });

  it('justified reparte una fila completa hasta llenar el ancho', () => {
    stubResizeObserver();
    render(<FilterGallery items={RATIO_ITEMS} label="Demo" layout="justified" />);

    fireResize(600);

    const items = screen.getAllByRole('listitem');
    const last = items[2] as HTMLElement;
    expect(Number.parseFloat(last.style.left) + Number.parseFloat(last.style.width)).toBeCloseTo(
      600,
      5,
    );
  });

  it('switches layout on the fly without losing items', () => {
    stubResizeObserver();
    stubGrowingRects();
    const animate = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
    const { rerender } = render(<FilterGallery items={RATIO_ITEMS} label="Demo" layout="grid" />);

    rerender(<FilterGallery items={RATIO_ITEMS} label="Demo" layout="masonry" />);
    fireResize(1000);

    expect(screen.getByRole('list', { name: 'Demo' })).toHaveAttribute('data-layout', 'masonry');
    expect(screen.getAllByRole('listitem')).toHaveLength(RATIO_ITEMS.length);
    expect(animate).toHaveBeenCalled();
  });

  it('repositions surviving items before the exiting item fade finishes', () => {
    stubResizeObserver();
    stubAnimateWithHandles();
    const { rerender } = render(
      <FilterGallery items={RATIO_ITEMS} filter={null} label="Demo" layout="masonry" />,
    );
    fireResize(200);

    rerender(<FilterGallery items={RATIO_ITEMS} filter="video" label="Demo" layout="masonry" />);

    expect(screen.getByText('A').closest('li')).toHaveAttribute('data-fg-exiting');
    expect(screen.getByText('B').closest('li')?.style.top).toBe('0px');
    expect(screen.getByText('C').closest('li')?.style.top).toBe('0px');
  });

  it('grid removes the exiting item from flow on the same filtering beat', () => {
    stubAnimateWithHandles();
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const id = this.dataset.fgId;
      const boxes: Record<string, { left: number; top: number; width: number; height: number }> = {
        a: { left: 10, top: 20, width: 100, height: 100 },
        b: { left: 110, top: 20, width: 100, height: 100 },
        c: { left: 10, top: 120, width: 100, height: 100 },
      };
      const box = (id ? boxes[id] : undefined) ?? {
        left: 10,
        top: 20,
        width: 300,
        height: 200,
      };
      return {
        ...box,
        x: box.left,
        y: box.top,
        right: box.left + box.width,
        bottom: box.top + box.height,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const { rerender } = render(
      <FilterGallery items={RATIO_ITEMS} filter={null} label="Demo" layout="grid" />,
    );

    rerender(<FilterGallery items={RATIO_ITEMS} filter="video" label="Demo" layout="grid" />);

    const exiting = screen.getByText('A').closest('li');
    expect(exiting).toHaveStyle({
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '100px',
      height: '100px',
    });
  });
});
