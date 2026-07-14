import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PortraitCompareDemo } from './portrait-compare-demo';

function defineFullscreen(enabled: boolean) {
  Object.defineProperty(document, 'fullscreenEnabled', {
    value: enabled,
    configurable: true,
  });
}

describe('PortraitCompareDemo', () => {
  afterEach(() => {
    defineFullscreen(false);
    vi.restoreAllMocks();
  });

  it('deriva el B-N del mismo bitmap con filter grayscale en el lado "antes"', () => {
    render(<PortraitCompareDemo />);
    const before = screen.getByAltText('Retrato en blanco y negro');
    expect(before).toHaveAttribute('src', '/demo/portrait.webp');
    expect(before.style.filter).toBe('grayscale(1)');
    expect(before).toHaveAttribute('width', '1600');
    expect(before).toHaveAttribute('height', '900');
  });

  it('sin Fullscreen API no renderiza el botón de pantalla completa', () => {
    defineFullscreen(false);
    render(<PortraitCompareDemo />);
    expect(
      screen.queryByRole('button', { name: 'Ver a pantalla completa' }),
    ).not.toBeInTheDocument();
  });

  it('el botón pide fullscreen nativo sobre el contenedor del slider', async () => {
    defineFullscreen(true);
    const request = vi.fn(() => Promise.resolve());
    Element.prototype.requestFullscreen = request;
    render(<PortraitCompareDemo />);
    const button = await screen.findByRole('button', { name: 'Ver a pantalla completa' });
    await userEvent.click(button);
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
  });
});
