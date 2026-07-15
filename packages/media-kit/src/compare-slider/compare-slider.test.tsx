import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CompareSlider } from './compare-slider';

function renderSlider(props = {}) {
  return render(
    <CompareSlider
      before={<img src="/a.png" alt="Antes" />}
      after={<img src="/b.png" alt="Después" />}
      {...props}
    />,
  );
}

describe('CompareSlider', () => {
  it('expone un slider accesible con valor inicial 50', () => {
    renderSlider();
    const handle = screen.getByRole('slider', { name: 'Compare' });
    expect(handle).toHaveAttribute('aria-valuemin', '0');
    expect(handle).toHaveAttribute('aria-valuemax', '100');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
  });

  it('renderiza ambos medios', () => {
    renderSlider();
    expect(screen.getByAltText('Antes')).toBeInTheDocument();
    expect(screen.getByAltText('Después')).toBeInTheDocument();
  });

  it('mueve con flechas (±1) y PageUp/PageDown (±10)', async () => {
    const onPositionChange = vi.fn();
    renderSlider({ onPositionChange });
    const handle = screen.getByRole('slider');
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '51');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '49');
    await userEvent.keyboard('{PageUp}');
    expect(handle).toHaveAttribute('aria-valuenow', '59');
    await userEvent.keyboard('{PageDown}');
    expect(handle).toHaveAttribute('aria-valuenow', '49');
    expect(onPositionChange).toHaveBeenLastCalledWith(49);
  });

  it('Home/End van a los extremos y el valor queda acotado', async () => {
    renderSlider({ initialPosition: 99 });
    const handle = screen.getByRole('slider');
    handle.focus();
    await userEvent.keyboard('{PageUp}');
    expect(handle).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  it('soporta orientación vertical (flechas Up/Down)', async () => {
    renderSlider({ orientation: 'vertical' });
    const handle = screen.getByRole('slider');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    handle.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(handle).toHaveAttribute('aria-valuenow', '51');
    await userEvent.keyboard('{ArrowDown}');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
  });
});

function mockRect(element: HTMLElement) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 200,
    bottom: 100,
    width: 200,
    height: 100,
    toJSON: () => ({}),
  } as DOMRect);
}

describe('CompareSlider v2', () => {
  it('mode="hover": el divisor sigue al ratón sin click', () => {
    render(
      <CompareSlider
        mode="hover"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerMove(container, { clientX: 150, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '75');
  });

  it('mode="hover": un puntero táctil NO mueve el divisor solo con move (cae a drag)', () => {
    render(
      <CompareSlider
        mode="hover"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerMove(container, { clientX: 150, clientY: 50, pointerType: 'touch' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    fireEvent.pointerDown(container, {
      clientX: 160,
      clientY: 50,
      pointerType: 'touch',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '80');
  });

  it('mode="drag" (default): move sin capture no mueve el divisor (v1 intacto)', () => {
    render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerMove(container, { clientX: 150, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('ignora botones de puntero no primarios', () => {
    render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerDown(container, {
      clientX: 150,
      clientY: 50,
      pointerType: 'mouse',
      button: 2,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('initialPosition no finito cae al 50', () => {
    render(
      <CompareSlider
        initialPosition={Number.NaN}
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
  });

  it('pointerdown enfoca el handle (las flechas funcionan tras arrastrar)', () => {
    render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerDown(container, {
      clientX: 100,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveFocus();
  });
});

describe('CompareSlider v2.2 — dragTarget handle (C2)', () => {
  it("con dragTarget='handle' el drag sobre la superficie NO mueve el divisor", () => {
    render(
      <CompareSlider
        dragTarget="handle"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerDown(container, {
      clientX: 150,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it("con dragTarget='handle' arrastrar el handle SÍ mueve el divisor", () => {
    render(
      <CompareSlider
        dragTarget="handle"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerDown(slider, {
      clientX: 150,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '75');
  });

  it('el handle expone data-mk-drag-exempt en ambos modos', () => {
    const { rerender } = render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('data-mk-drag-exempt', '');
    rerender(
      <CompareSlider
        dragTarget="handle"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('data-mk-drag-exempt', '');
  });

  it("con dragTarget='handle' el modo hover se ignora: pointermove sobre la superficie NO mueve el divisor", () => {
    render(
      <CompareSlider
        mode="hover"
        dragTarget="handle"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerMove(container, { clientX: 150, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it("dragTarget por defecto ('surface') conserva el drag actual", () => {
    render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    fireEvent.pointerDown(container, {
      clientX: 150,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '75');
  });
});

describe('CompareSlider v2.2 — MediaSource (C3)', () => {
  it('con MediaSource renderiza su propio <img> con src/alt/draggable=false', () => {
    render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    const before = screen.getByAltText('Antes');
    expect(before).toHaveAttribute('src', '/a.png');
    expect(before).toHaveAttribute('draggable', 'false');
    const after = screen.getByAltText('Después');
    expect(after).toHaveAttribute('src', '/b.png');
    expect(after).toHaveAttribute('draggable', 'false');
  });

  it('acepta ReactNode en un lado y MediaSource en el otro (mezcla)', () => {
    render(
      <CompareSlider
        before={<img src="/a.png" alt="Antes" />}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    expect(screen.getByAltText('Antes')).toBeInTheDocument();
    const after = screen.getByAltText('Después');
    expect(after).toHaveAttribute('src', '/b.png');
    expect(after).toHaveAttribute('draggable', 'false');
  });

  it('con ReactNode sigue funcionando igual que antes (regresión)', () => {
    renderSlider();
    expect(screen.getByAltText('Antes')).toBeInTheDocument();
    expect(screen.getByAltText('Después')).toBeInTheDocument();
  });
});

function stubScreen(width: number, devicePixelRatio: number) {
  vi.stubGlobal('screen', { width });
  vi.stubGlobal('devicePixelRatio', devicePixelRatio);
}

describe('CompareSlider v2.2 — expand (C1)', () => {
  it('sin expand no hay botón (regresión)', () => {
    renderSlider();
    expect(screen.queryByRole('button', { name: 'Full Screen' })).not.toBeInTheDocument();
  });

  it('con expand renderiza el botón con icono y label, y abre el compare-lightbox', async () => {
    render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
        expand={{ lightboxLabel: 'Comparar a pantalla completa' }}
      />,
    );
    const button = screen.getByRole('button', { name: 'Full Screen' });
    expect(button.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
    await userEvent.click(button);
    const dialog = screen.getByRole('dialog', { name: 'Comparar a pantalla completa' });
    expect(within(dialog).getByRole('slider')).toBeInTheDocument();
  });

  it('el hover/focus del botón dispara el preload de los fullSrc', () => {
    stubScreen(2560, 1);
    const calls: string[] = [];
    class FakeImage {
      set src(value: string) {
        calls.push(value);
      }
    }
    vi.stubGlobal('Image', FakeImage);

    render(
      <CompareSlider
        before={{ src: '/a.png', fullSrc: '/a-full-expand.png', alt: 'Antes' }}
        after={{ src: '/b.png', fullSrc: '/b-full-expand.png', alt: 'Después' }}
        expand={{ lightboxLabel: 'Comparar a pantalla completa' }}
      />,
    );
    const button = screen.getByRole('button', { name: 'Full Screen' });
    fireEvent.pointerEnter(button);
    expect(calls).toEqual(['/a-full-expand.png', '/b-full-expand.png']);
  });

  it('el click del botón NO mueve el divisor', async () => {
    render(
      <CompareSlider
        before={<img src="/a.png" alt="Antes" />}
        after={<img src="/b.png" alt="Después" />}
        expand={{ lightboxLabel: 'Comparar a pantalla completa' }}
      />,
    );
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    const button = screen.getByRole('button', { name: 'Full Screen' });
    await userEvent.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('humo de import: CompareSlider y MediaLightbox se importan sin romper el ciclo ESM', async () => {
    const mod = await import('../index');
    expect(mod.CompareSlider).toBe(CompareSlider);
    expect(typeof mod.MediaLightbox).toBe('function');
  });
});

function click(container: HTMLElement, position: { clientX: number; clientY: number }) {
  fireEvent.pointerDown(container, {
    ...position,
    pointerType: 'mouse',
    button: 0,
    isPrimary: true,
    pointerId: 1,
  });
  fireEvent.pointerUp(container, {
    ...position,
    pointerType: 'mouse',
    button: 0,
    isPrimary: true,
    pointerId: 1,
  });
}

describe('CompareSlider v2.2 — pauseOnClick (C6)', () => {
  it('en hover, click pausa el seguimiento y otro click lo reanuda', () => {
    render(
      <CompareSlider
        mode="hover"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);

    fireEvent.pointerMove(container, { clientX: 120, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '60');

    click(container, { clientX: 120, clientY: 50 });
    expect(container).toHaveAttribute('data-paused');

    fireEvent.pointerMove(container, { clientX: 60, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '60');

    click(container, { clientX: 120, clientY: 50 });
    expect(container).not.toHaveAttribute('data-paused');

    fireEvent.pointerMove(container, { clientX: 60, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
  });

  it('el estado se anuncia por aria-live con los labels', () => {
    render(
      <CompareSlider
        mode="hover"
        pauseLabel="Pausado"
        resumeLabel="Siguiendo el puntero"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);

    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live).toBeInTheDocument();
    expect(live).toHaveTextContent('');

    click(container, { clientX: 100, clientY: 50 });
    expect(live).toHaveTextContent('Pausado');

    click(container, { clientX: 100, clientY: 50 });
    expect(live).toHaveTextContent('Siguiendo el puntero');
  });

  it('pauseOnClick={false} desactiva la pausa', () => {
    render(
      <CompareSlider
        mode="hover"
        pauseOnClick={false}
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);

    click(container, { clientX: 100, clientY: 50 });
    expect(container).not.toHaveAttribute('data-paused');

    fireEvent.pointerMove(container, { clientX: 150, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '75');
  });

  it('en mode="drag" el click no pausa (sin data-paused)', () => {
    render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);

    click(container, { clientX: 100, clientY: 50 });
    expect(container).not.toHaveAttribute('data-paused');
  });

  it('un click en el botón expand no pausa el hover (su pointerdown detiene la propagación)', async () => {
    render(
      <CompareSlider
        mode="hover"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
        expand={{ lightboxLabel: 'Comparar a pantalla completa' }}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    const button = screen.getByRole('button', { name: 'Full Screen' });

    await userEvent.click(button);

    expect(container).not.toHaveAttribute('data-paused');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('un drag táctil (≥4px) en modo hover no alterna la pausa', () => {
    render(
      <CompareSlider
        mode="hover"
        before={<img src="/b.png" alt="b" />}
        after={<img src="/a.png" alt="" />}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);

    fireEvent.pointerDown(container, {
      clientX: 100,
      clientY: 50,
      pointerType: 'touch',
      button: 0,
      isPrimary: true,
      pointerId: 2,
    });
    fireEvent.pointerMove(container, {
      clientX: 120,
      clientY: 50,
      pointerType: 'touch',
      pointerId: 2,
    });
    fireEvent.pointerUp(container, {
      clientX: 120,
      clientY: 50,
      pointerType: 'touch',
      button: 0,
      isPrimary: true,
      pointerId: 2,
    });

    expect(container).not.toHaveAttribute('data-paused');
  });
});
