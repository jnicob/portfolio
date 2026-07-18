import { fireEvent, render, screen } from '@testing-library/react';
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
});
