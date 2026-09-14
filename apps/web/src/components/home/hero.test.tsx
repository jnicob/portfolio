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
  it('renders name in h1, headline, localized summary, and dual action CTAs', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name);
    expect(screen.getByText(profile.headline.es)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('15 años'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: es.home.projectsCta })).toHaveAttribute(
      'href',
      '/es/showcase',
    );
    expect(screen.getByRole('link', { name: 'Ver CV' })).toHaveAttribute('href', '/es/cv');
  });

  it('renders availability badge and LinkedIn CTA', () => {
    renderHero();
    expect(screen.getByText(es.home.availability)).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: `${es.home.availabilityCta} — LinkedIn` });
    expect(cta).toHaveAttribute('href', profile.links.linkedin);
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders official technology icons strip and metric stats cards', () => {
    renderHero();
    expect(screen.getByText(es.home.technologiesLabel)).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();

    // Stats bar cards
    expect(screen.getByText('+15')).toBeInTheDocument();
    expect(screen.getByText(es.home.stats.exp)).toBeInTheDocument();
    expect(screen.getByText('150M+')).toBeInTheDocument();
    expect(screen.getByText(es.home.stats.requests)).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText(es.home.stats.uptime)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(es.home.stats.cleanCode)).toBeInTheDocument();
  });

  it('renders the prominent portrait with accessible image element', () => {
    renderHero();
    const portraitContainer = screen.getByTestId('hero-portrait');
    expect(portraitContainer).toBeInTheDocument();

    const img = screen.getByRole('img', { name: profile.name });
    expect(img).toHaveAttribute('src', '/profile/hero-portrait.webp');
  });
});
