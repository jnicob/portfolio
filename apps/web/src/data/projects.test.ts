import { describe, expect, it } from 'vitest';
import { projects } from './projects';

describe('projects data', () => {
  it('URLs reales del feedback E5-E6', () => {
    const playground = projects.find((p) => p.slug === 'freepik-api-playground')!;
    const cadi = projects.find((p) => p.slug === 'cadi')!;
    expect(playground.links.live).toBe('https://www.magnific.com/api/playground');
    expect(cadi.links.live).toBe('https://www.cadigolf.com/');
  });
});
