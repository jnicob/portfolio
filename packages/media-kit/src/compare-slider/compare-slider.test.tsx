import { render, screen } from '@testing-library/react';
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
