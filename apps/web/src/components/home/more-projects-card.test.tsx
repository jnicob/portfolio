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
  it('is a single link-card to /projects (localized), without nested links', () => {
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
    // Previously, an aria-label="Todos los proyectos" truncated the name to just the title,
    // ignorando el resto del contenido visible del link (preview de proyectos + contador)
    // — axe (label-content-name-mismatch) lo marca como mismatch porque el nombre no
    // contiene TODO el texto visible anidado. Sin aria-label, el nombre se computa del
    // own content: by construction it contains (starts with) the visible title.
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

  it('previews at most 3 non-featured titles and shows the counter for the remaining ones', () => {
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

  it('the "y N más" counter has lower weight compared to the titles (design review F3.6 T21, hierarchy)', () => {
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
    // Link accessible name remains intact (T30): starts with visible title.
    expect(screen.getByRole('link')).toHaveAccessibleName(/^Todos los proyectos/);
  });
});
