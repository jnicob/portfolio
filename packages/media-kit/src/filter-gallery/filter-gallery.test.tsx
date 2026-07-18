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
 * jsdom no calcula layout real: `getBoundingClientRect` siempre devuelve un rect en
 * cero, así que el diff FLIP (before.left - after.left) sería siempre 0. Se stubea
 * con un valor que crece en cada llamada para simular un reflow real (mismo patrón
 * que `mockRect` en spotlight-reveal.test.tsx).
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
  return handles;
}

describe('FilterGallery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it('sin filtro muestra todo; filtrar por categoría oculta el resto (no controlado)', () => {
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

  it('interseca visibleIds con el filtro de categoría', () => {
    const items = [
      { id: 'a', categories: ['image'], node: <span>A</span> },
      { id: 'b', categories: ['image'], node: <span>B</span> },
      { id: 'c', categories: ['video'], node: <span>C</span> },
    ];
    render(<FilterGallery items={items} filter="image" visibleIds={['b', 'c']} label="G" />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument(); // categoría lo excluye
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
    const handles = stubAnimateWithHandles();
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.getByText('A')).toBeInTheDocument(); // saliendo, aún montado

    act(() => handles.forEach((handle) => handle.onfinish?.()));
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('el item saliente queda fuera del árbol accesible mientras se desvanece', () => {
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

  it('si el item saliente vuelve a ser visible antes de terminar, cancela la animación y reaparece accesible', () => {
    const handles = stubAnimateWithHandles();
    const { rerender } = render(<FilterGallery items={ITEMS} filter={null} label="G" />);
    rerender(<FilterGallery items={ITEMS} filter="video" label="G" />);
    expect(screen.getByText('A')).toBeInTheDocument();

    rerender(<FilterGallery items={ITEMS} filter={null} label="G" />);
    expect(handles[0]?.cancel).toHaveBeenCalled();
    const item = screen.getByText('A').closest('li');
    expect(item).not.toHaveAttribute('aria-hidden');
    expect(item).not.toHaveAttribute('inert');

    // El onfinish del handle cancelado no debe poder desmontarlo retroactivamente.
    act(() => handles[0]?.onfinish?.());
    expect(screen.getByText('A')).toBeInTheDocument();
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
