import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { profile } from '@/data/profile';
import es from '../../../messages/es.json';
import { Hero } from './hero';

function renderHero() {
  render(
    <NextIntlClientProvider locale="es" messages={es}>
      <Hero locale="es" cvLabel="Ver CV" />
    </NextIntlClientProvider>,
  );
}

describe('Hero', () => {
  it('renderiza headline y summary del locale y CTA al CV', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.headline.es);
    expect(screen.getByText(profile.summary.es)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver CV' })).toHaveAttribute('href', '/es/cv');
  });
});
