import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeBackground } from './home-background';

describe('HomeBackground', () => {
  it('usa el main completo como superficie del efecto de puntero', () => {
    render(
      <HomeBackground>
        <section>Contenido completo del inicio</section>
      </HomeBackground>,
    );

    const main = screen.getByRole('main');
    expect(main.querySelector('canvas')?.parentElement).toBe(main);
    expect(screen.getByText('Contenido completo del inicio').parentElement).toHaveClass(
      'relative',
      'z-10',
    );
  });
});
