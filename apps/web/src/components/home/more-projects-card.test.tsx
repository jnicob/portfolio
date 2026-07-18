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
    // WCAG 2.5.3 (Label in Name): el nombre accesible debe CONTENER el texto visible.
    // Antes, un aria-label="Todos los proyectos" recortaba el nombre a solo el título,
    // ignorando el resto del contenido visible del link (preview de proyectos + contador)
    // — axe (label-content-name-mismatch) lo marca como mismatch porque el nombre no
    // contiene TODO el texto visible anidado. Sin aria-label, el nombre se computa del
    // propio contenido: por construcción contiene (empieza por) el título visible.
    expect(links[0]).not.toHaveAttribute('aria-label');
    expect(links[0]).toHaveAccessibleName(/^Todos los proyectos/);
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
        <MoreProjectsCard
          locale="en"
          title="All projects"
          countTemplate="and {count} more projects"
        />
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

  it('el contador "y N más" baja de peso frente a los títulos (design review F3.6 T21, jerarquía)', () => {
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <MoreProjectsCard
          locale="es"
          title="Todos los proyectos"
          countTemplate="y {count} proyectos más"
        />
      </NextIntlClientProvider>,
    );
    const countText = screen.getByText(`y ${remaining} proyectos más`);
    expect(countText.className).toContain('text-sm');
    expect(countText.className).toContain('text-fg-muted');
    // El nombre accesible del link sigue intacto (T30): sigue empezando por el título visible.
    expect(screen.getByRole('link')).toHaveAccessibleName(/^Todos los proyectos/);
  });
});
