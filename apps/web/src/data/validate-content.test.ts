import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import { compileProject, getProjectSlugs } from '@/lib/content';
import { education } from './education';
import { experience } from './experience';
import { profile } from './profile';
import { projects } from './projects';
import { skills } from './skills';

const EMAIL = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
// 9+ dígitos con separadores = teléfono; fechas (8) y métricas cortas no disparan.
const PHONE = /\+?(?:\d[\s().-]?){9,}/;

describe('validate-content', () => {
  it('slugs de case studies y MDX coinciden en ambos locales (solo los proyectos con caseStudy tienen página propia)', async () => {
    const caseStudySlugs = projects
      .filter((p) => p.caseStudy)
      .map((p) => p.slug)
      .sort();
    for (const locale of routing.locales) {
      expect(await getProjectSlugs(locale)).toEqual(caseStudySlugs);
    }
  });

  it('todo el frontmatter MDX de ambos locales parsea', async () => {
    for (const locale of routing.locales) {
      for (const slug of await getProjectSlugs(locale)) {
        const compiled = await compileProject(locale, slug);
        expect(compiled, `${locale}/${slug}`).not.toBeNull();
      }
    }
  });

  it('GUARDIA PII: ni email ni teléfono en ningún dato serializado', () => {
    const all = JSON.stringify({ profile, experience, education, skills, projects });
    expect(all).not.toMatch(EMAIL);
    expect(all).not.toMatch(PHONE);
  });

  it('la guardia de teléfono no dispara con fechas ni métricas', () => {
    expect(JSON.stringify({ d: '2026-07-10', m: '251,122' })).not.toMatch(PHONE);
  });
});
