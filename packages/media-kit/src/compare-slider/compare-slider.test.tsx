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

  it('un pointerdown dentro del lightbox interno (portal) no captura el puntero de la superficie de fondo', async () => {
    // Regresión (T26 finding 2): el lightbox de `expand` es hijo de React de este
    // componente pero monta vía createPortal en document.body. React burbujea sus
    // eventos de puntero según el árbol de React, no el DOM real: sin guard, un
    // pointerdown sobre CUALQUIER control del lightbox (p.ej. el toggle de ayuda)
    // llegaba al onPointerDown de ESTA superficie de fondo y capturaba el puntero
    // aquí, robando el pointerup/click real de su destino en el navegador.
    render(
      <CompareSlider
        before={<img src="/a.png" alt="Antes" />}
        after={<img src="/b.png" alt="Después" />}
        expand={{ lightboxLabel: 'Comparar a pantalla completa' }}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    const captureSpy = vi.spyOn(container, 'setPointerCapture');

    await userEvent.click(screen.getByRole('button', { name: 'Full Screen' }));
    const dialog = screen.getByRole('dialog');
    const helpToggle = within(dialog).getByRole('button', { name: 'Keyboard shortcuts' });

    fireEvent.pointerDown(helpToggle, {
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });

    expect(captureSpy).not.toHaveBeenCalled();
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

  it('en pausa, el click de reanudar NO reposiciona el divisor (ni en el down ni en el up)', () => {
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

    fireEvent.pointerMove(container, { clientX: 160, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '80');

    click(container, { clientX: 160, clientY: 50 });
    expect(container).toHaveAttribute('data-paused');

    // Click de reanudar en OTRA posición: el divisor no debe saltar al 20 en el down…
    fireEvent.pointerDown(container, {
      clientX: 40,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '80');
    // …ni tras el up que reanuda: se queda donde estaba congelado.
    fireEvent.pointerUp(container, {
      clientX: 40,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    expect(container).not.toHaveAttribute('data-paused');
    expect(slider).toHaveAttribute('aria-valuenow', '80');

    // Reanudado: el hover vuelve a seguir al puntero.
    fireEvent.pointerMove(container, { clientX: 60, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '30');
  });

  it('en pausa, las flechas del teclado siguen moviendo el divisor', async () => {
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
    click(container, { clientX: 120, clientY: 50 });
    expect(container).toHaveAttribute('data-paused');
    expect(slider).toHaveAttribute('aria-valuenow', '60');

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '61');
    await userEvent.keyboard('{PageDown}');
    expect(slider).toHaveAttribute('aria-valuenow', '51');
  });

  it("con dragTarget='handle' un click en el handle no pausa (no hay hover-follow que pausar)", () => {
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

    click(slider, { clientX: 100, clientY: 50 });
    expect(container).not.toHaveAttribute('data-paused');
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

describe('CompareSlider v2.2 — paridad C5', () => {
  it('overlayLabels renderiza badges Before/After ocultos a lectores', () => {
    renderSlider({ overlayLabels: { before: 'Antes', after: 'Después' } });
    const badges = document.querySelectorAll('.mk-compare__overlay-label');
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveAttribute('aria-hidden', 'true');
    expect(badges[0]).toHaveClass('mk-compare__overlay-label--before');
    expect(badges[0]).toHaveTextContent('Antes');
    expect(badges[1]).toHaveAttribute('aria-hidden', 'true');
    expect(badges[1]).toHaveClass('mk-compare__overlay-label--after');
    expect(badges[1]).toHaveTextContent('Después');
  });

  it('sin overlayLabels no hay badges (regresión)', () => {
    renderSlider();
    expect(document.querySelectorAll('.mk-compare__overlay-label')).toHaveLength(0);
  });

  it('objectFit contain llega al img interno', () => {
    render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
        objectFit="contain"
      />,
    );
    expect(screen.getByAltText('Antes')).toHaveStyle({ objectFit: 'contain' });
    expect(screen.getByAltText('Después')).toHaveStyle({ objectFit: 'contain' });
  });

  it('objectFit por defecto es cover', () => {
    render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    expect(screen.getByAltText('Antes')).toHaveStyle({ objectFit: 'cover' });
  });

  it('data-loading desaparece cuando ambos img internos cargan', () => {
    render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    expect(container).toHaveAttribute('data-loading');

    fireEvent.load(screen.getByAltText('Antes'));
    expect(container).toHaveAttribute('data-loading');

    fireEvent.load(screen.getByAltText('Después'));
    expect(container).not.toHaveAttribute('data-loading');
  });

  it('un load duplicado en el mismo img NO descuenta de más (idempotente por lado)', () => {
    render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    const container = screen.getByRole('slider').closest('.mk-compare') as HTMLElement;
    expect(container).toHaveAttribute('data-loading');

    // Doble disparo en el MISMO lado (complete + onLoad pueden solaparse tras
    // hidratación): el otro lado sigue pendiente → data-loading debe persistir.
    fireEvent.load(screen.getByAltText('Antes'));
    fireEvent.load(screen.getByAltText('Antes'));
    expect(container).toHaveAttribute('data-loading');

    fireEvent.load(screen.getByAltText('Después'));
    expect(container).not.toHaveAttribute('data-loading');
  });

  it('un img ya completo al adjuntar el ref se marca cargado (hidratación: load previo a onLoad)', () => {
    const { rerender } = render(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    const container = screen.getByRole('slider').closest('.mk-compare') as HTMLElement;
    expect(container).toHaveAttribute('data-loading');

    // Simula imgs que ya dispararon su `load` nativo antes de que React adjuntara
    // handlers (static export + hidratación): complete=true y naturalWidth>0.
    for (const alt of ['Antes', 'Después']) {
      const img = screen.getByAltText(alt);
      Object.defineProperty(img, 'complete', { value: true, configurable: true });
      Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true });
    }
    // El ref callback es inline (identidad nueva por render): un re-render lo
    // re-adjunta y debe detectar los nodos ya completos sin esperar onLoad.
    rerender(
      <CompareSlider
        before={{ src: '/a.png', alt: 'Antes' }}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    expect(container).not.toHaveAttribute('data-loading');
  });

  it('con un solo lado MediaSource, data-loading se limpia al cargar ese único img (mezcla)', () => {
    render(
      <CompareSlider
        before={<img src="/a.png" alt="Antes" />}
        after={{ src: '/b.png', alt: 'Después' }}
      />,
    );
    const container = screen.getByRole('slider').closest('.mk-compare') as HTMLElement;
    expect(container).toHaveAttribute('data-loading');

    fireEvent.load(screen.getByAltText('Después'));
    expect(container).not.toHaveAttribute('data-loading');
  });

  it('sin ningún lado MediaSource nunca hay data-loading (ReactNode no se puede rastrear)', () => {
    renderSlider();
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    expect(container).not.toHaveAttribute('data-loading');
  });

  it('touch: pointerdown+move con pointerType touch mueve el divisor (paridad, sin regresión)', () => {
    render(
      <CompareSlider before={<img src="/b.png" alt="b" />} after={<img src="/a.png" alt="" />} />,
    );
    const slider = screen.getByRole('slider');
    const container = slider.closest('.mk-compare') as HTMLElement;
    mockRect(container);
    // jsdom no rastrea pointer capture real (ver vitest.setup.ts); se simula aquí
    // para poder ejercitar el camino de pointermove con capture también en touch.
    vi.spyOn(container, 'hasPointerCapture').mockReturnValue(true);

    fireEvent.pointerDown(container, {
      clientX: 100,
      clientY: 50,
      pointerType: 'touch',
      button: 0,
      isPrimary: true,
      pointerId: 3,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '50');

    fireEvent.pointerMove(container, {
      clientX: 160,
      clientY: 50,
      pointerType: 'touch',
      pointerId: 3,
    });
    expect(slider).toHaveAttribute('aria-valuenow', '80');
  });
});

describe('compareMode (v0.5)', () => {
  it('onion: sin divisor, la posición gobierna la opacidad y el handle anuncia aria-valuetext', () => {
    render(
      <CompareSlider
        before={<img alt="" src="/a.png" />}
        after={<img alt="" src="/b.png" />}
        compareMode="onion"
        initialPosition={30}
        label="C"
      />,
    );
    const root = screen.getByRole('slider').closest('.mk-compare')!;
    expect(root).toHaveAttribute('data-compare-mode', 'onion');
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '30% after');
  });

  it('side-by-side: sin slider ni handle, ambos lados visibles', () => {
    render(
      <CompareSlider
        before={<img alt="a" src="/a.png" />}
        after={<img alt="b" src="/b.png" />}
        compareMode="side-by-side"
        label="C"
      />,
    );
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.getByRole('img', { name: 'a' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'b' })).toBeInTheDocument();
  });

  it('default wipe: comportamiento actual intacto', () => {
    render(
      <CompareSlider
        before={<img alt="" src="/a.png" />}
        after={<img alt="" src="/b.png" />}
        label="C"
      />,
    );
    expect(screen.getByRole('slider').closest('.mk-compare')).toHaveAttribute(
      'data-compare-mode',
      'wipe',
    );
  });
});
