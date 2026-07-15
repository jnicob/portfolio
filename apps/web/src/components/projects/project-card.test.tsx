import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '@/data/projects';
import es from '../../../messages/es.json';
import { ProjectCard } from './project-card';

const flowsApi = projects.find((p) => p.slug === 'flows-api')!;

function renderProjectCard() {
  render(
    <NextIntlClientProvider locale="es" messages={es}>
      <ProjectCard project={flowsApi} locale="es" />
    </NextIntlClientProvider>,
  );
}

describe('ProjectCard', () => {
  it('renderiza título ES enlazado al case study, summary ES y un badge por item de stack', () => {
    renderProjectCard();

    const link = screen.getByRole('link', { name: flowsApi.title.es });
    expect(link).toHaveAttribute('href', '/es/projects/flows-api');
    expect(screen.getByText(flowsApi.summary.es)).toBeInTheDocument();
    for (const item of flowsApi.stack) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
