import { describe, expect, it } from 'vitest';
import {
  cvViewSchema,
  educationEntrySchema,
  experienceEntrySchema,
  localizedStringSchema,
  profileSchema,
  projectFrontmatterSchema,
  projectSchema,
  skillSchema,
  skinSchema,
} from './schemas';

const LOC = { es: 'Hola', en: 'Hello' };

describe('localizedStringSchema', () => {
  it('exige ambos idiomas no vacíos', () => {
    expect(localizedStringSchema.safeParse(LOC).success).toBe(true);
    expect(localizedStringSchema.safeParse({ es: 'Hola' }).success).toBe(false);
    expect(localizedStringSchema.safeParse({ es: '', en: 'Hello' }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(
      localizedStringSchema.safeParse({ es: 'Hola', en: 'Hello', fr: 'Bonjour' }).success,
    ).toBe(false);
  });

  it('rechaza ambos idiomas vacíos', () => {
    expect(localizedStringSchema.safeParse({ es: '', en: '' }).success).toBe(false);
  });
});

describe('profileSchema — guardia de PII', () => {
  const base = {
    name: 'Nico Behm',
    headline: LOC,
    summary: LOC,
    location: LOC,
    links: { github: 'https://github.com/jnicob', linkedin: 'https://www.linkedin.com/in/x' },
  };

  it('acepta el perfil público', () => {
    expect(profileSchema.safeParse(base).success).toBe(true);
  });

  it('RECHAZA claves extra (email/teléfono imposibles por construcción)', () => {
    expect(profileSchema.safeParse({ ...base, email: 'a@b.com' }).success).toBe(false);
    expect(
      profileSchema.safeParse({ ...base, links: { ...base.links, email: 'mailto:a@b.com' } })
        .success,
    ).toBe(false);
  });

  it('rechaza links inválidos', () => {
    expect(
      profileSchema.safeParse({
        ...base,
        links: { github: 'not-a-url', linkedin: 'https://www.linkedin.com/in/x' },
      }).success,
    ).toBe(false);
  });

  it('rechaza nombre vacío', () => {
    expect(profileSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
});

describe('experienceEntrySchema', () => {
  const entry = {
    id: 'freepik',
    company: 'Freepik',
    role: LOC,
    start: '2024-01',
    end: null,
    summary: LOC,
    highlights: [LOC],
    tags: ['api'],
  };

  it('valida fechas YYYY-MM y end null = presente', () => {
    expect(experienceEntrySchema.safeParse(entry).success).toBe(true);
  });

  it('rechaza fecha inválida en start', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, start: 'enero 2024' }).success).toBe(false);
  });

  it('rechaza start sin mes', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, start: '2024' }).success).toBe(false);
  });

  it('valida end como YYYY-MM o null', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, end: '2025-06' }).success).toBe(true);
    expect(experienceEntrySchema.safeParse({ ...entry, end: null }).success).toBe(true);
  });

  it('rechaza highlights vacío', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, highlights: [] }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, notes: 'extra' }).success).toBe(false);
  });
});

describe('educationEntrySchema', () => {
  const entry = {
    id: 'uni-123',
    institution: 'University of X',
    degree: LOC,
    start: '2020',
    end: '2024',
  };

  it('valida entrada de educación válida', () => {
    expect(educationEntrySchema.safeParse(entry).success).toBe(true);
  });

  it('valida end como null (educación en curso)', () => {
    expect(educationEntrySchema.safeParse({ ...entry, end: null }).success).toBe(true);
  });

  it('rechaza año inválido en start', () => {
    expect(educationEntrySchema.safeParse({ ...entry, start: '2020-01' }).success).toBe(false);
    expect(educationEntrySchema.safeParse({ ...entry, start: 'twenty-twenty' }).success).toBe(
      false,
    );
  });

  it('rechaza año inválido en end', () => {
    expect(educationEntrySchema.safeParse({ ...entry, end: '2024-06' }).success).toBe(false);
  });

  it('rechaza institution vacía', () => {
    expect(educationEntrySchema.safeParse({ ...entry, institution: '' }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(educationEntrySchema.safeParse({ ...entry, verified: true }).success).toBe(false);
  });
});

describe('skillSchema', () => {
  const skill = {
    name: 'TypeScript',
    level: 5,
    category: 'frontend',
    tags: ['language'],
  };

  it('valida skill válido', () => {
    expect(skillSchema.safeParse(skill).success).toBe(true);
  });

  it('rechaza level fuera del rango 1-5', () => {
    expect(skillSchema.safeParse({ ...skill, level: 0 }).success).toBe(false);
    expect(skillSchema.safeParse({ ...skill, level: 6 }).success).toBe(false);
  });

  it('rechaza level no entero', () => {
    expect(skillSchema.safeParse({ ...skill, level: 3.5 }).success).toBe(false);
  });

  it('rechaza categoría fuera del enum', () => {
    expect(skillSchema.safeParse({ ...skill, category: 'design' }).success).toBe(false);
  });

  it('acepta todas las categorías válidas', () => {
    const categories = ['backend', 'frontend', 'ai', 'platform', 'tooling'];
    for (const category of categories) {
      expect(skillSchema.safeParse({ ...skill, category }).success).toBe(true);
    }
  });

  it('rechaza name vacío', () => {
    expect(skillSchema.safeParse({ ...skill, name: '' }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(skillSchema.safeParse({ ...skill, endorsed: true }).success).toBe(false);
  });
});

describe('projectSchema y frontmatter', () => {
  it('proyecto localizado con métricas y frontmatter plano por locale', () => {
    expect(
      projectSchema.safeParse({
        slug: 'freepik-api-platform',
        title: LOC,
        summary: LOC,
        role: LOC,
        stack: ['nextjs'],
        links: { live: 'https://www.freepik.com/api' },
        metrics: [{ label: LOC, value: '1,000+ PRs' }],
        featured: true,
        date: '2026-07',
      }).success,
    ).toBe(true);

    expect(
      projectFrontmatterSchema.safeParse({
        title: 'X',
        summary: 'Y',
        role: 'Z',
        stack: ['a'],
        links: {},
        metrics: [{ label: 'PRs', value: '1,000+' }],
        date: '2026-07',
      }).success,
    ).toBe(true);
  });

  it('rechaza slug inválido (no kebab-case)', () => {
    expect(
      projectSchema.safeParse({
        slug: 'FreepikAPIplatform',
        title: LOC,
        summary: LOC,
        role: LOC,
        stack: ['nextjs'],
        links: {},
        metrics: [],
        featured: false,
        date: '2026-07',
      }).success,
    ).toBe(false);
  });

  it('valida dates como YYYY-MM o YYYY-MM-DD', () => {
    const base = {
      slug: 'test-project',
      title: LOC,
      summary: LOC,
      role: LOC,
      stack: ['node'],
      links: {},
      metrics: [],
      featured: false,
    };
    expect(projectSchema.safeParse({ ...base, date: '2026-07' }).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, date: '2026-07-15' }).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, date: 'July 2026' }).success).toBe(false);
  });

  it('rechaza stack vacío', () => {
    expect(
      projectSchema.safeParse({
        slug: 'test',
        title: LOC,
        summary: LOC,
        role: LOC,
        stack: [],
        links: {},
        metrics: [],
        featured: false,
        date: '2026',
      }).success,
    ).toBe(false);
  });

  it('rechaza links inválidos', () => {
    expect(
      projectSchema.safeParse({
        slug: 'test',
        title: LOC,
        summary: LOC,
        role: LOC,
        stack: ['node'],
        links: { live: 'not-a-url' },
        metrics: [],
        featured: false,
        date: '2026-07',
      }).success,
    ).toBe(false);
  });

  it('caseStudy es false por defecto', () => {
    const parsed = projectSchema.parse({
      slug: 'test',
      title: LOC,
      summary: LOC,
      role: LOC,
      stack: ['node'],
      links: {},
      metrics: [],
      featured: false,
      date: '2026-07',
    });
    expect(parsed.caseStudy).toBe(false);
  });

  it('rechaza claves extra en project', () => {
    expect(
      projectSchema.safeParse({
        slug: 'test',
        title: LOC,
        summary: LOC,
        role: LOC,
        stack: ['node'],
        links: {},
        metrics: [],
        featured: false,
        date: '2026-07',
        archived: true,
      }).success,
    ).toBe(false);
  });
});

describe('datos reales', () => {
  it('los módulos de datos parsean contra sus schemas', async () => {
    const { profile } = await import('./profile');
    const { experience } = await import('./experience');
    const { education } = await import('./education');
    const { skills } = await import('./skills');
    const { projects } = await import('./projects');
    expect(profile.name).toBe('Nico Behm');
    expect(experience.length).toBeGreaterThanOrEqual(2);
    expect(education.length).toBeGreaterThanOrEqual(1);
    expect(skills.length).toBeGreaterThanOrEqual(8);
    expect(projects).toHaveLength(14);
    expect(projects.map((p) => p.slug)).toEqual([
      'freepik-api-platform',
      'ai-model-onboarding',
      'freepik-api-playground',
      'freepik-developer-dashboard',
      'freepik-backoffice',
      'cadi',
      'gds',
      'deal-me',
      'candidate-viewer',
      'the-crane-club',
      'develop-intelligence',
      'his-municipal',
      'fares-taie-salud',
      'elisa-processor',
    ]);
  });
});

describe('enums de apariencia', () => {
  it('skin válido e inválido', () => {
    expect(skinSchema.safeParse('editorial').success).toBe(true);
    expect(skinSchema.safeParse('dev-tool').success).toBe(true);
    expect(skinSchema.safeParse('terminal').success).toBe(true);
    expect(skinSchema.safeParse('vibrant').success).toBe(true);
    expect(skinSchema.safeParse('neon').success).toBe(false);
  });

  it('view válido e inválido', () => {
    expect(cvViewSchema.safeParse('timeline').success).toBe(true);
    expect(cvViewSchema.safeParse('standard').success).toBe(true);
    expect(cvViewSchema.safeParse('compact').success).toBe(true);
    expect(cvViewSchema.safeParse('full').success).toBe(false);
  });
});
