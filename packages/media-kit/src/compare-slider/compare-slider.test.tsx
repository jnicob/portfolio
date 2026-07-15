import { fireEvent, render, screen } from '@testing-library/react';
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
