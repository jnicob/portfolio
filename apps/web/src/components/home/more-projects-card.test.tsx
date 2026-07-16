import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '@/data/projects';
import es from '../../../messages/es.json';
import en from '../../../messages/en.json';
import { MoreProjectsCard } from './more-projects-card';

describe('MoreProjectsCard', () => {
  it('enlaza a /projects (localizado) y adelanta títulos de proyectos no destacados', () => {
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <MoreProjectsCard locale="es" title="Todos los proyectos" cta="Ver todos →" />
      </NextIntlClientProvider>,
    );
    // localePrefix: 'always' (i18n/routing.ts) antepone el locale a cualquier href de <Link>.
    expect(screen.getByRole('link', { name: /todos los proyectos/i })).toHaveAttribute(
      'href',
      '/es/projects',
    );
    expect(screen.getByText(/Backoffice de contenido Freepik\/Flaticon/)).toBeInTheDocument();
  });

  it('adelanta como máximo 3 títulos, todos de proyectos no destacados', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <MoreProjectsCard locale="en" title="All projects" cta="View all →" />
      </NextIntlClientProvider>,
    );
    const notFeatured = projects.filter((p) => !p.featured);
    const previewTitles = notFeatured.slice(0, 3).map((p) => p.title.en);
    for (const title of previewTitles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    const featuredTitles = projects.filter((p) => p.featured).map((p) => p.title.en);
    for (const title of featuredTitles) {
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    }
  });
});
