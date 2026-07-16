import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '@/data/projects';
import es from '../../../messages/es.json';
import en from '../../../messages/en.json';
import { MoreProjectsCard } from './more-projects-card';

const notFeatured = projects.filter((p) => !p.featured);
const remaining = notFeatured.length - 3;

describe('MoreProjectsCard', () => {
  it('es una única card-enlace a /projects (localizado), sin enlaces anidados', () => {
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <MoreProjectsCard
          locale="es"
          title="Todos los proyectos"
          countTemplate="y {count} proyectos más"
        />
      </NextIntlClientProvider>,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    // localePrefix: 'always' (i18n/routing.ts) antepone el locale a cualquier href de <Link>.
    expect(links[0]).toHaveAttribute('href', '/es/projects');
    expect(links[0]).toHaveAccessibleName(/todos los proyectos/i);
    expect(screen.getByText(/Backoffice de contenido Freepik\/Flaticon/)).toBeInTheDocument();
  });

  it('ocupa el ancho completo del grid en lg y 2 columnas en sm', () => {
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <MoreProjectsCard
          locale="es"
          title="Todos los proyectos"
          countTemplate="y {count} proyectos más"
        />
      </NextIntlClientProvider>,
    );
    const link = screen.getByRole('link');
    expect(link.className).toContain('sm:col-span-2');
    expect(link.className).toContain('lg:col-span-3');
  });

  it('adelanta como máximo 3 títulos no destacados y muestra el contador de los restantes', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <MoreProjectsCard locale="en" title="All projects" countTemplate="and {count} more projects" />
      </NextIntlClientProvider>,
    );
    const previewTitles = notFeatured.slice(0, 3).map((p) => p.title.en);
    for (const title of previewTitles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    const featuredTitles = projects.filter((p) => p.featured).map((p) => p.title.en);
    for (const title of featuredTitles) {
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    }
    expect(screen.getByText(`and ${remaining} more projects`)).toBeInTheDocument();
  });
});
