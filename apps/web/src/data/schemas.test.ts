import { describe, expect, it } from 'vitest';
import {
  beyondCodeSchema,
  contactSchema,
  cvViewSchema,
  educationEntrySchema,
  experienceEntrySchema,
  galleryItemSchema,
  languageEntrySchema,
  localizedStringSchema,
  profileSchema,
  projectFrontmatterSchema,
  projectSchema,
  skillSchema,
  skinSchema,
} from './schemas';

const LOC = { es: 'Hola', en: 'Hello' };

describe('localizedStringSchema', () => {
  it('requires both languages to be non-empty', () => {
    expect(localizedStringSchema.safeParse(LOC).success).toBe(true);
    expect(localizedStringSchema.safeParse({ es: 'Hola' }).success).toBe(false);
    expect(localizedStringSchema.safeParse({ es: '', en: 'Hello' }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(
      localizedStringSchema.safeParse({ es: 'Hola', en: 'Hello', fr: 'Bonjour' }).success,
    ).toBe(false);
  });

  it('rejects both languages being empty', () => {
    expect(localizedStringSchema.safeParse({ es: '', en: '' }).success).toBe(false);
  });
});

describe('profileSchema — guardia de PII', () => {
  const base = {
    name: 'Nico Behm',
    headline: LOC,
    summary: {
      paragraphs: { es: ['Hola'], en: ['Hello'] },
      coreTechTitle: LOC,
      coreTechBullets: [{ label: LOC, value: LOC }],
    },

    location: LOC,
    links: { github: 'https://github.com/jnicob', linkedin: 'https://www.linkedin.com/in/x' },
  };

  it('accepts public profile with or without website', () => {
    expect(profileSchema.safeParse(base).success).toBe(true);
    expect(
      profileSchema.safeParse({
        ...base,
        links: { ...base.links, website: 'https://jnicob.dev' },
      }).success,
    ).toBe(true);
  });

  it('REJECTS extra keys (email/phone impossible by construction)', () => {
    expect(profileSchema.safeParse({ ...base, email: 'a@b.com' }).success).toBe(false);
    expect(
      profileSchema.safeParse({ ...base, links: { ...base.links, email: 'mailto:a@b.com' } })
        .success,
    ).toBe(false);
  });

  it('rejects invalid links', () => {
    expect(
      profileSchema.safeParse({
        ...base,
        links: { github: 'not-a-url', linkedin: 'https://www.linkedin.com/in/x' },
      }).success,
    ).toBe(false);
  });

  it('rejects empty name', () => {
    expect(profileSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
});

describe('experienceEntrySchema', () => {
  const entry = {
    id: 'freepik',
    company: 'Freepik/Magnific',
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

  it('rejects invalid date in start', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, start: 'enero 2024' }).success).toBe(false);
  });

  it('rechaza start sin mes', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, start: '2024' }).success).toBe(false);
  });

  it('valida end como YYYY-MM o null', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, end: '2025-06' }).success).toBe(true);
    expect(experienceEntrySchema.safeParse({ ...entry, end: null }).success).toBe(true);
  });

  it('rejects empty highlights', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, highlights: [] }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(experienceEntrySchema.safeParse({ ...entry, notes: 'extra' }).success).toBe(false);
  });

  it('accepts optional location field with localized strings', () => {
    expect(
      experienceEntrySchema.safeParse({
        ...entry,
        location: { es: 'Málaga, España', en: 'Málaga, Spain' },
      }).success,
    ).toBe(true);
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

  it('validates valid education entry', () => {
    expect(educationEntrySchema.safeParse(entry).success).toBe(true);
  });

  it('validates end as null (ongoing education)', () => {
    expect(educationEntrySchema.safeParse({ ...entry, end: null }).success).toBe(true);
  });

  it('rejects invalid year in start', () => {
    expect(educationEntrySchema.safeParse({ ...entry, start: '2020-01' }).success).toBe(false);
    expect(educationEntrySchema.safeParse({ ...entry, start: 'twenty-twenty' }).success).toBe(
      false,
    );
  });

  it('rejects invalid year in end', () => {
    expect(educationEntrySchema.safeParse({ ...entry, end: '2024-06' }).success).toBe(false);
  });

  it('rejects empty institution', () => {
    expect(educationEntrySchema.safeParse({ ...entry, institution: '' }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(educationEntrySchema.safeParse({ ...entry, verified: true }).success).toBe(false);
  });
});

describe('languageEntrySchema', () => {
  const entry = {
    id: 'es',
    language: LOC,
    level: LOC,
  };

  it('validates valid language entry', () => {
    expect(languageEntrySchema.safeParse(entry).success).toBe(true);
  });

  it('rejects empty id', () => {
    expect(languageEntrySchema.safeParse({ ...entry, id: '' }).success).toBe(false);
  });

  it('rejects language without localization', () => {
    expect(languageEntrySchema.safeParse({ ...entry, language: { es: 'Español' } }).success).toBe(
      false,
    );
  });

  it('rechaza claves extra', () => {
    expect(languageEntrySchema.safeParse({ ...entry, certified: true }).success).toBe(false);
  });
});

describe('skillSchema', () => {
  const skill = {
    name: 'TypeScript',
    level: 5,
    category: 'frontend',
    tags: ['language'],
  };

  it('validates valid skill', () => {
    expect(skillSchema.safeParse(skill).success).toBe(true);
  });

  it('rechaza level fuera del rango 1-5', () => {
    expect(skillSchema.safeParse({ ...skill, level: 0 }).success).toBe(false);
    expect(skillSchema.safeParse({ ...skill, level: 6 }).success).toBe(false);
  });

  it('rechaza level no entero', () => {
    expect(skillSchema.safeParse({ ...skill, level: 3.5 }).success).toBe(false);
  });

  it('rejects category outside enum', () => {
    expect(skillSchema.safeParse({ ...skill, category: 'design' }).success).toBe(false);
  });

  it('accepts all valid categories', () => {
    const categories = ['backend', 'frontend', 'ai', 'platform', 'tooling'];
    for (const category of categories) {
      expect(skillSchema.safeParse({ ...skill, category }).success).toBe(true);
    }
  });

  it('rejects empty name', () => {
    expect(skillSchema.safeParse({ ...skill, name: '' }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(skillSchema.safeParse({ ...skill, endorsed: true }).success).toBe(false);
  });
});

describe('projectSchema y frontmatter', () => {
  it('localized project with metrics and flat frontmatter per locale', () => {
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

  it('rejects invalid slug (not kebab-case)', () => {
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

  it('rejects empty stack', () => {
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

  it('rejects invalid links', () => {
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
  it('data modules parse against their schemas', async () => {
    const { profile } = await import('./profile');
    const { experience } = await import('./experience');
    const { education } = await import('./education');
    const { skills } = await import('./skills');
    const { projects } = await import('./projects');
    const { beyondCode } = await import('./beyond-code');
    expect(profile.name).toBe('Nico Behm');
    expect(profile.fullName?.es).toBe('Juan Nicolás Behm');
    expect(profile.fullName?.en).toBe('Juan Nicolas Behm');
    expect(beyondCode.title.es).toBe('Más allá del código');
    expect(experience.length).toBeGreaterThanOrEqual(2);
    expect(education.length).toBeGreaterThanOrEqual(1);
    expect(skills.length).toBeGreaterThanOrEqual(8);
    expect(projects).toHaveLength(16);
    expect(projects.map((p) => p.slug)).toEqual([
      'freepik-api-platform',
      'ai-service-integration',
      'freepik-api-playground',
      'freepik-developer-dashboard',
      'freepik-backoffice',
      'cadi',
      'gds',
      'deal-me',
      'candidate-viewer',
      'the-crane-club',
      'develop-intelligence',
      'hotel-monte-cervino',
      'manos-activas',
      'his-municipal',
      'fares-taie-salud',
      'elisa-processor',
    ]);
  });
});

describe('galleryItemSchema', () => {
  const image = {
    type: 'image' as const,
    id: 'nbp-retrato-neon',
    model: 'Google NBP',
    title: LOC,
    src: '/demo/gallery/nbp-retrato-neon.webp',
    hdSrc: '/demo/gallery/nbp-retrato-neon-hd.webp',
    width: 1200,
    height: 1608,
  };
  const video = {
    type: 'video' as const,
    id: 'veo-costa-atardecer',
    model: 'Google Veo',
    title: LOC,
    src: '/demo/gallery/veo-costa-atardecer.mp4',
    poster: '/demo/gallery/veo-costa-atardecer-poster.webp',
    width: 1200,
    height: 675,
  };
  const audio = {
    type: 'audio' as const,
    id: 'audio-lofi',
    model: 'Google Lyria',
    title: LOC,
    src: '/demo/gallery/audio-lofi.mp3',
    cover: '/demo/gallery/audio-lofi-cover.webp',
    coverHd: '/demo/gallery/audio-lofi-cover-hd.webp',
    width: 1200,
    height: 1200,
  };

  it('accepts a valid image/video/audio item', () => {
    expect(galleryItemSchema.safeParse(image).success).toBe(true);
    expect(galleryItemSchema.safeParse(video).success).toBe(true);
    expect(galleryItemSchema.safeParse(audio).success).toBe(true);
  });

  it('image exige src y hdSrc', () => {
    expect(() =>
      galleryItemSchema.parse({
        type: 'image',
        id: 'x',
        model: 'Google NBP',
        title: LOC,
        src: '/demo/gallery/x.webp',
        width: 1200,
        height: 800,
      }),
    ).toThrow(); // falta hdSrc
  });

  it('video exige src y poster', () => {
    const withoutPoster: Record<string, unknown> = { ...video };
    delete withoutPoster.poster;
    expect(galleryItemSchema.safeParse(withoutPoster).success).toBe(false);
  });

  it('audio exige src, cover y coverHd', () => {
    const withoutCoverHd: Record<string, unknown> = { ...audio };
    delete withoutCoverHd.coverHd;
    expect(galleryItemSchema.safeParse(withoutCoverHd).success).toBe(false);
  });

  it('rechaza width/height no positivos', () => {
    expect(galleryItemSchema.safeParse({ ...image, width: 0 }).success).toBe(false);
    expect(galleryItemSchema.safeParse({ ...image, height: -1 }).success).toBe(false);
  });

  it('rechaza claves extra', () => {
    expect(galleryItemSchema.safeParse({ ...image, extra: true }).success).toBe(false);
  });

  it('rechaza type fuera del discriminador', () => {
    expect(galleryItemSchema.safeParse({ ...image, type: 'gif' }).success).toBe(false);
  });
});

describe('enums de apariencia', () => {
  it('valid and invalid skin', () => {
    expect(skinSchema.safeParse('editorial').success).toBe(true);
    expect(skinSchema.safeParse('dev-tool').success).toBe(true);
    expect(skinSchema.safeParse('terminal').success).toBe(true);
    expect(skinSchema.safeParse('vibrant').success).toBe(true);
    expect(skinSchema.safeParse('neon').success).toBe(false);
  });

  it('valid and invalid view', () => {
    expect(cvViewSchema.safeParse('timeline').success).toBe(true);
    expect(cvViewSchema.safeParse('standard').success).toBe(true);
    expect(cvViewSchema.safeParse('compact').success).toBe(true);
    expect(cvViewSchema.safeParse('full').success).toBe(false);
  });
});

describe('contactSchema (nico-zod)', () => {
  const validContact = {
    subject: 'Consulta sobre proyecto',
    email: 'contacto@example.com',
    phone: '+34 600 000 000',
    message: 'Hola Nico, nos gustaría conversar sobre una colaboración.',
    honeypot: '',
  };

  it('accepts valid data with or without phone', () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
    expect(contactSchema.safeParse({ ...validContact, phone: '' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...validContact, phone: undefined }).success).toBe(true);
    expect(contactSchema.safeParse({ ...validContact, phone: '672814490' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...validContact, phone: '(011) 4567-8900' }).success).toBe(
      true,
    );
  });

  it('rejects phones with letters, few digits, or invalid format', () => {
    expect(contactSchema.safeParse({ ...validContact, phone: '12345' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: 'telefono123456' }).success).toBe(
      false,
    );
    expect(contactSchema.safeParse({ ...validContact, phone: '++34--999' }).success).toBe(false);
  });

  it('rejects invalid or missing email', () => {
    expect(contactSchema.safeParse({ ...validContact, email: 'invalido' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, email: '' }).success).toBe(false);
  });

  it('rechaza asunto o mensaje demasiado corto', () => {
    expect(contactSchema.safeParse({ ...validContact, subject: 'Hi' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, message: 'Hola' }).success).toBe(false);
  });

  it('detects bot if honeypot is not empty', () => {
    expect(contactSchema.safeParse({ ...validContact, honeypot: 'spam bot' }).success).toBe(false);
  });

  it('rechaza campos desconocidos extra (strict)', () => {
    expect(contactSchema.safeParse({ ...validContact, unknownField: 123 }).success).toBe(false);
  });
});

describe('beyondCodeSchema', () => {
  const validBeyondCode = {
    title: { es: 'Más allá del código', en: 'Beyond Code' },
    subtitle: { es: 'Vida personal y aficiones', en: 'Personal life and hobbies' },
    location: { es: 'Aguadulce, Almería', en: 'Aguadulce, Almería' },
    origin: {
      es: 'Nacido en Argentina, nacionalidad española',
      en: 'Born in Argentina, Spanish nationality',
    },
    interestsTitle: { es: 'Deportes', en: 'Sports' },
    interests: [{ es: 'Fútbol', en: 'Football' }],
    makerTitle: { es: 'Maker', en: 'Maker' },
    makerDescription: { es: 'Prototipado con Raspberry Pi', en: 'Prototyping with Raspberry Pi' },
    philosophyTitle: { es: 'Filosofía', en: 'Philosophy' },
    philosophyDescription: { es: 'Trabajo asíncrono', en: 'Async work' },
    images: [
      {
        src: '/profile/gallery/ski.webp',
        alt: { es: 'Foto esquiando', en: 'Ski photo' },
        caption: { es: 'Sierra Nevada', en: 'Sierra Nevada' },
      },
    ],
  };

  it('validates complete and well-formed data', () => {
    expect(beyondCodeSchema.safeParse(validBeyondCode).success).toBe(true);
  });

  it('rejects if a required field is missing or empty', () => {
    expect(beyondCodeSchema.safeParse({ ...validBeyondCode, title: undefined }).success).toBe(
      false,
    );
    expect(beyondCodeSchema.safeParse({ ...validBeyondCode, interests: [] }).success).toBe(false);
    expect(beyondCodeSchema.safeParse({ ...validBeyondCode, images: [] }).success).toBe(false);
  });

  it('rejects extra unrecognized fields (strict)', () => {
    expect(beyondCodeSchema.safeParse({ ...validBeyondCode, extra: 'forbidden' }).success).toBe(
      false,
    );
  });
});
