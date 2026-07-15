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
      <FeaturedProjects locale="en" title="Featured projects" />
    </NextIntlClientProvider>,
  );
}

describe('FeaturedProjects', () => {
  it('renderiza un heading y un link por proyecto destacado apuntando a /en/projects/<slug>', () => {
    renderFeaturedProjects();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Featured projects');
    expect(screen.getAllByRole('link')).toHaveLength(featured.length);
    for (const project of featured) {
      expect(screen.getByRole('link', { name: project.title.en })).toHaveAttribute(
        'href',
        `/en/projects/${project.slug}`,
      );
    }
  });
});
