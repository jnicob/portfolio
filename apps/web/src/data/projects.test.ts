import { describe, expect, it } from 'vitest';
import { projects } from './projects';

describe('projects data', () => {
  it('URLs reales del feedback E5-E6', () => {
    const playground = projects.find((p) => p.slug === 'freepik-api-playground')!;
    const cadi = projects.find((p) => p.slug === 'cadi')!;
    expect(playground.links.live).toBe('https://www.magnific.com/api/playground');
    expect(cadi.links.live).toBe('https://www.cadigolf.com/');
  });

  it('el deck del backoffice resume los cinco subproyectos sin formar un muro de texto', () => {
    const backoffice = projects.find((project) => project.slug === 'freepik-backoffice');

    expect(backoffice?.summary.es.length).toBeLessThanOrEqual(200);
    expect(backoffice?.summary.en.length).toBeLessThanOrEqual(200);
  });
});
