import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeBackground } from './home-background';

describe('HomeBackground', () => {
  it('el main es full-bleed y el canvas cubre todo su ancho', () => {
    render(
      <HomeBackground>
        <section>Contenido completo del inicio</section>
      </HomeBackground>,
    );

    const main = screen.getByRole('main');
    expect(main).not.toHaveClass('max-w-5xl');
    expect(main).not.toHaveClass('px-4');
    expect(main.querySelector('canvas')?.parentElement).toBe(main);
  });

  it('el contenido queda en una capa interior constreñida a max-w-5xl', () => {
    render(
      <HomeBackground>
        <section>Contenido completo del inicio</section>
      </HomeBackground>,
    );

    const inner = screen.getByText('Contenido completo del inicio').parentElement;
    expect(inner).toHaveClass('relative', 'z-10', 'mx-auto', 'max-w-5xl', 'px-4');
    expect(inner).toHaveAttribute('data-home-content');
  });
});
