import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '@/data/projects';
import en from '../../../messages/en.json';
import { FeaturedProjects } from './featured-projects';

const featured = projects.filter((p) => p.featured);

function renderFeaturedProjects() {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <FeaturedProjects
        locale="en"
        title="Featured projects"
        moreTitle="All projects"
        moreCountTemplate="and {count} more projects"
      />
    </NextIntlClientProvider>,
  );
}

describe('FeaturedProjects', () => {
  it('destaca freepik-api-platform, ai-model-onboarding y freepik-api-playground', () => {
    expect(featured.map((p) => p.slug).sort()).toEqual(
      ['freepik-api-platform', 'ai-model-onboarding', 'freepik-api-playground'].sort(),
    );
  });

  it('renderiza un heading y un link por proyecto destacado, interno si tiene case study y externo si no', () => {
    renderFeaturedProjects();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Featured projects');
    // +1 por el link de la MoreProjectsCard ("All projects" → /projects).
    expect(screen.getAllByRole('link')).toHaveLength(featured.length + 1);
    for (const project of featured) {
      const expectedHref = project.caseStudy
        ? `/en/projects/${project.slug}`
        : (project.links.live ?? project.links.docs ?? project.links.repo);
      expect(screen.getByRole('link', { name: project.title.en })).toHaveAttribute(
        'href',
        expectedHref,
      );
    }
  });

  it('renderiza la MoreProjectsCard como última celda del grid, enlazando a /projects', () => {
    renderFeaturedProjects();
    // localePrefix: 'always' (i18n/routing.ts) antepone el locale a cualquier href de <Link>.
    expect(screen.getByRole('link', { name: /all projects/i })).toHaveAttribute(
      'href',
      '/en/projects',
    );
  });

  it('ningún proyecto tiene una métrica con label "Pull requests"', () => {
    for (const project of projects) {
      expect(project.metrics.some((m) => m.label.en === 'Pull requests')).toBe(false);
    }
  });

  it('hay 14 proyectos en total', () => {
    expect(projects).toHaveLength(14);
  });
});
