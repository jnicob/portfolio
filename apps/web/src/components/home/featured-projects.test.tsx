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
  it('destaca freepik-api-platform, ai-service-integration y freepik-api-playground', () => {
    expect(featured.map((p) => p.slug).sort()).toEqual(
      ['freepik-api-platform', 'ai-service-integration', 'freepik-api-playground'].sort(),
    );
  });

  it('renderiza un heading y un link por proyecto destacado, interno si tiene case study y externo si no', () => {
    renderFeaturedProjects();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Featured projects');
    // +1 for MoreProjectsCard link ("All projects" → /projects).
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

  it('renders MoreProjectsCard as the last grid cell, linking to /projects', () => {
    renderFeaturedProjects();
    // localePrefix: 'always' (i18n/routing.ts) antepone el locale a cualquier href de <Link>.
    expect(screen.getByRole('link', { name: /all projects/i })).toHaveAttribute(
      'href',
      '/en/projects',
    );
  });

  it('no project has a metric with label "Pull requests"', () => {
    for (const project of projects) {
      expect(project.metrics.some((m) => m.label.en === 'Pull requests')).toBe(false);
    }
  });

  it('hay 16 proyectos en total', () => {
    expect(projects).toHaveLength(16);
  });

  it('envuelve cada celda del grid (proyectos destacados + MoreProjectsCard) con TiltCard', () => {
    renderFeaturedProjects();
    expect(document.querySelectorAll('[data-tilt]')).toHaveLength(featured.length + 1);
  });

  it('estira la superficie de cada proyecto destacado al alto completo de su fila', () => {
    renderFeaturedProjects();

    for (const project of featured) {
      const card = screen
        .getByRole('link', { name: project.title.en })
        .closest('[data-tilt]')?.firstElementChild;
      expect(card).toHaveClass('h-full');
    }
  });

  it('with an odd number of featured items (768px, sm:grid-cols-2), the last featured card is not orphaned: spans 2 columns on sm and reverts to 1 on lg (design review F3.6 T21, "card huérfana 768")', () => {
    // 3 destacados en un grid sm:grid-cols-2 lg:grid-cols-3: en el rango sm (640-1024,
    // includes 768) the 3rd card was left alone in its row with an empty gap next to it.
    expect(featured.length % 2).toBe(1);
    renderFeaturedProjects();
    const lastFeatured = featured[featured.length - 1]!;
    const lastLink = screen.getByRole('link', { name: lastFeatured.title.en });
    const tiltWrapper = lastLink.closest('[data-tilt]') as HTMLElement;
    expect(tiltWrapper.className).toContain('sm:col-span-2');
    expect(tiltWrapper.className).toContain('lg:col-span-1');
    // Other featured cards DO NOT carry this extra span.
    const otherFeatured = featured.slice(0, -1);
    for (const project of otherFeatured) {
      const link = screen.getByRole('link', { name: project.title.en });
      const wrapper = link.closest('[data-tilt]') as HTMLElement;
      expect(wrapper.className).not.toContain('sm:col-span-2');
    }
  });

  it('la celda de MoreProjectsCard conserva su column-span del grid al envolverla en TiltCard', () => {
    renderFeaturedProjects();
    const moreLink = screen.getByRole('link', { name: /all projects/i });
    const tiltWrapper = moreLink.closest('[data-tilt]') as HTMLElement;
    expect(tiltWrapper.className).toContain('sm:col-span-2');
    expect(tiltWrapper.className).toContain('lg:col-span-3');
  });
});
