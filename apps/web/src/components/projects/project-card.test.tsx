import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ComponentProps } from 'react';
import { projects } from '@/data/projects';
import es from '../../../messages/es.json';
import { ProjectCard } from './project-card';

const flowsApi = projects.find((p) => p.slug === 'flows-api')!;
const apiPlatform = projects.find((p) => p.slug === 'freepik-api-platform')!;

function renderProjectCard(props: ComponentProps<typeof ProjectCard>) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <ProjectCard {...props} />
    </NextIntlClientProvider>,
  );
}

describe('ProjectCard', () => {
  it('renderiza título ES enlazado externamente (sin case study), summary ES y un badge por item de stack', () => {
    renderProjectCard({ project: flowsApi, locale: 'es' });

    const link = screen.getByRole('link', { name: flowsApi.title.es });
    expect(link).toHaveAttribute('href', flowsApi.links.docs);
    expect(screen.getByText(flowsApi.summary.es)).toBeInTheDocument();
    for (const item of flowsApi.stack) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it('enlaza al case study interno cuando caseStudy=true', () => {
    renderProjectCard({ project: { ...flowsApi, caseStudy: true, slug: 'x' }, locale: 'es' });

    expect(screen.getByRole('link', { name: flowsApi.title.es })).toHaveAttribute(
      'href',
      '/es/projects/x',
    );
  });

  it('enlaza al live externo cuando no hay case study', () => {
    renderProjectCard({
      project: { ...flowsApi, caseStudy: false, links: { live: 'https://example.com' } },
      locale: 'es',
    });

    expect(screen.getByRole('link', { name: flowsApi.title.es })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('sin case study ni enlaces, el título no es un enlace', () => {
    renderProjectCard({ project: { ...flowsApi, caseStudy: false, links: {} }, locale: 'es' });

    expect(screen.queryByRole('link', { name: flowsApi.title.es })).toBeNull();
  });

  it('renderiza las métricas como dl con label localizado y su valor', () => {
    const { container } = renderProjectCard({ project: apiPlatform, locale: 'es' });

    expect(container.querySelector('dl')).toBeInTheDocument();
    for (const metric of apiPlatform.metrics) {
      expect(screen.getByText(metric.label.es)).toBeInTheDocument();
      expect(screen.getByText(metric.value)).toBeInTheDocument();
    }
  });

  it('no renderiza dl cuando el proyecto no tiene métricas', () => {
    const { container } = renderProjectCard({ project: flowsApi, locale: 'es' });

    expect(flowsApi.metrics).toHaveLength(0);
    expect(container.querySelector('dl')).not.toBeInTheDocument();
  });

  it('usa heading h3 por defecto y h2 cuando headingLevel="h2"', () => {
    renderProjectCard({ project: flowsApi, locale: 'es' });
    expect(screen.getByRole('heading', { level: 3, name: flowsApi.title.es })).toBeInTheDocument();

    renderProjectCard({ project: apiPlatform, locale: 'es', headingLevel: 'h2' });
    expect(
      screen.getByRole('heading', { level: 2, name: apiPlatform.title.es }),
    ).toBeInTheDocument();
  });
});
