import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CompareSliderExpand } from '@nicobehm/media-kit';
import { PortraitCompareDemo } from './portrait-compare-demo';

const beforeAlt = 'Black and white portrait';
const compareLabel = 'Compare black and white with color';
const caption =
  'Simulated colorization — a single bitmap; the B&W side is derived with filter: grayscale(1). AI-generated portrait.';
const expand: CompareSliderExpand = {
  lightboxLabel: 'Compare before and after',
  buttonLabel: 'Full Screen',
  lightboxLabels: { close: 'Close' },
};

function renderDemo() {
  return render(
    <PortraitCompareDemo
      beforeAlt={beforeAlt}
      compareLabel={compareLabel}
      caption={caption}
      expand={expand}
    />,
  );
}

describe('PortraitCompareDemo', () => {
  it('deriva el B-N del mismo bitmap con filter grayscale en el lado "antes" (ReactNode)', () => {
    renderDemo();
    const before = screen.getByAltText(beforeAlt);
    expect(before).toHaveAttribute('src', '/demo/portrait.webp');
    expect(before.style.filter).toBe('grayscale(1)');
    expect(before).toHaveAttribute('width', '1600');
    expect(before).toHaveAttribute('height', '900');
  });

  it('el lado "después" es un MediaSource con fullSrc HD, resuelto por el propio slider', () => {
    renderDemo();
    const after = screen.getByAltText('');
    expect(after).toHaveAttribute('src', '/demo/portrait.webp');
    expect(after).toHaveAttribute('draggable', 'false');
  });

  it('el divisor usa el label pasado por props', () => {
    renderDemo();
    expect(screen.getByRole('slider', { name: compareLabel })).toBeInTheDocument();
  });

  it('muestra el botón expand con el label pasado por props, sin fullscreen nativo', () => {
    renderDemo();
    expect(screen.getByRole('button', { name: expand.buttonLabel })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ver a pantalla completa' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Salir de pantalla completa' }),
    ).not.toBeInTheDocument();
  });

  it('el caption usa el texto traducido pasado por props', () => {
    renderDemo();
    expect(screen.getByText(caption)).toBeInTheDocument();
  });

  // Perf (T30/qa-B1): portrait.webp es 1600×900, muy por encima del ancho real de esta
  // figure en mobile. srcSet deja elegir la variante ~840w (el lado "después", MediaSource
  // con fullSrc HD, ya lo resuelve el propio paquete — no se toca aquí).
  it('el lado "antes" (ReactNode) ofrece una variante ~840w vía srcSet', () => {
    renderDemo();
    const before = screen.getByAltText(beforeAlt);
    expect(before).toHaveAttribute(
      'srcset',
      '/demo/portrait-840.webp 840w, /demo/portrait.webp 1600w',
    );
    expect(before.getAttribute('sizes')).toBeTruthy();
  });
});
