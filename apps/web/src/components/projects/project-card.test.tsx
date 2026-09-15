import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ComponentProps } from 'react';
import { projects } from '@/data/projects';
import es from '../../../messages/es.json';
import { ProjectCard } from './project-card';

const withoutCaseStudy = projects.find((p) => p.slug === 'freepik-api-playground')!;
const withMetrics = projects.find((p) => p.slug === 'ai-service-integration')!;

function renderProjectCard(props: ComponentProps<typeof ProjectCard>) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <ProjectCard {...props} />
    </NextIntlClientProvider>,
  );
}

describe('ProjectCard', () => {
  it('renders externally linked ES title (without case study), ES summary and one badge per stack item', () => {
    renderProjectCard({ project: withoutCaseStudy, locale: 'es' });

    const link = screen.getByRole('link', { name: withoutCaseStudy.title.es });
    expect(link).toHaveAttribute('href', withoutCaseStudy.links.live);
    expect(screen.getByText(withoutCaseStudy.summary.es)).toBeInTheDocument();
    for (const item of withoutCaseStudy.stack) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it('enlaza al case study interno cuando caseStudy=true', () => {
    renderProjectCard({
      project: { ...withoutCaseStudy, caseStudy: true, slug: 'x' },
      locale: 'es',
    });

    expect(screen.getByRole('link', { name: withoutCaseStudy.title.es })).toHaveAttribute(
      'href',
      '/es/projects/x',
    );
  });

  it('enlaza al live externo cuando no hay case study', () => {
    renderProjectCard({
      project: { ...withoutCaseStudy, caseStudy: false, links: { live: 'https://example.com' } },
      locale: 'es',
    });

    expect(screen.getByRole('link', { name: withoutCaseStudy.title.es })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('without case study or links, title is not a link', () => {
    renderProjectCard({
      project: { ...withoutCaseStudy, caseStudy: false, links: {} },
      locale: 'es',
    });

    expect(screen.queryByRole('link', { name: withoutCaseStudy.title.es })).toBeNull();
  });

  it('renders metrics as dl with localized label and its value', () => {
    const { container } = renderProjectCard({ project: withMetrics, locale: 'es' });

    expect(container.querySelector('dl')).toBeInTheDocument();
    for (const metric of withMetrics.metrics) {
      expect(screen.getByText(metric.label.es)).toBeInTheDocument();
      expect(screen.getByText(metric.value)).toBeInTheDocument();
    }
  });

  it('does not render dl when project has no metrics', () => {
    const { container } = renderProjectCard({ project: withoutCaseStudy, locale: 'es' });

    expect(withoutCaseStudy.metrics).toHaveLength(0);
    expect(container.querySelector('dl')).not.toBeInTheDocument();
  });

  it('usa heading h3 por defecto y h2 cuando headingLevel="h2"', () => {
    renderProjectCard({ project: withoutCaseStudy, locale: 'es' });
    expect(
      screen.getByRole('heading', { level: 3, name: withoutCaseStudy.title.es }),
    ).toBeInTheDocument();

    renderProjectCard({ project: withMetrics, locale: 'es', headingLevel: 'h2' });
    expect(
      screen.getByRole('heading', { level: 2, name: withMetrics.title.es }),
    ).toBeInTheDocument();
  });

  it('title with case study ends in → (internal link affordance), without changing accessible name', () => {
    renderProjectCard({ project: withMetrics, locale: 'es' });
    expect(withMetrics.caseStudy).toBe(true);
    const heading = screen.getByRole('heading', { name: withMetrics.title.es });
    expect(heading.textContent).toBe(`${withMetrics.title.es}\u2009→`);
    expect(screen.getByRole('link', { name: withMetrics.title.es })).toBeInTheDocument();
  });

  it('title with external link (without case study) ends in ↗', () => {
    renderProjectCard({
      project: { ...withoutCaseStudy, caseStudy: false, links: { live: 'https://example.com' } },
      locale: 'es',
    });
    const heading = screen.getByRole('heading', { name: withoutCaseStudy.title.es });
    expect(heading.textContent).toBe(`${withoutCaseStudy.title.es}\u2009↗`);
  });

  it('title with external link (without case study) opens in new tab with secure rel (E3)', () => {
    renderProjectCard({
      project: { ...withoutCaseStudy, caseStudy: false, links: { live: 'https://example.com' } },
      locale: 'es',
    });
    const link = screen.getByRole('link', { name: withoutCaseStudy.title.es });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('plain text title (without case study or links) has no suffix', () => {
    renderProjectCard({
      project: { ...withoutCaseStudy, caseStudy: false, links: {} },
      locale: 'es',
    });
    const heading = screen.getByRole('heading', { name: withoutCaseStudy.title.es });
    expect(heading.textContent).toBe(withoutCaseStudy.title.es);
  });

  it('with animateMetrics, each metric value remains accessible via sr-only and visible (aria-hidden)', () => {
    renderProjectCard({ project: withMetrics, locale: 'es', animateMetrics: true });

    for (const metric of withMetrics.metrics) {
      // jsdom does not implement IntersectionObserver: AnimatedMetric falls back
      // and displays the final value directly in the visible node as well.
      expect(screen.getByText(metric.value, { selector: '.sr-only' })).toBeInTheDocument();
      expect(screen.getByText(metric.value, { selector: '[aria-hidden]' })).toBeInTheDocument();
    }
  });

  it('without animateMetrics (default), the metric value renders as plain text', () => {
    renderProjectCard({ project: withMetrics, locale: 'es' });

    for (const metric of withMetrics.metrics) {
      expect(screen.getByText(metric.value)).toBeInTheDocument();
      expect(screen.queryByText(metric.value, { selector: '.sr-only' })).not.toBeInTheDocument();
    }
  });
});
