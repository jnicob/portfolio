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

  it('renderiza el badge de disponibilidad y el CTA a LinkedIn', () => {
    renderHero();
    expect(screen.getByText(es.home.availability)).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: es.home.availabilityCta });
    expect(cta).toHaveAttribute('href', profile.links.linkedin);
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
