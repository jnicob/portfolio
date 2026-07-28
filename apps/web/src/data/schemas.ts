import { z } from 'zod';
import { CV_VIEWS, SKILL_CATEGORIES, SKINS, THEMES } from './constants';

// Compat de tipos para consumidores existentes (los VALORES se importan de
// './constants' — importarlos desde aquí metería zod en el bundle cliente).
export type { CvView, Skin, SkillCategory, Theme } from './constants';

/** Un dato, dos idiomas: imposible desincronizar es/en. */
export const localizedStringSchema = z
  .object({ es: z.string().min(1), en: z.string().min(1) })
  .strict();
export type LocalizedString = z.infer<typeof localizedStringSchema>;

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'formato YYYY-MM');
const dateish = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'formato YYYY-MM o YYYY-MM-DD');

/** Contacto público SOLO GitHub/LinkedIn — strict() hace imposible añadir email/teléfono. */
export const profileSchema = z
  .object({
    name: z.string().min(1),
    headline: localizedStringSchema,
    summary: localizedStringSchema,
    location: localizedStringSchema,
    links: z.object({ github: z.url(), linkedin: z.url() }).strict(),
  })
  .strict();
export type Profile = z.infer<typeof profileSchema>;

export const experienceEntrySchema = z
  .object({
    id: z.string().min(1),
    company: z.string().min(1),
    role: localizedStringSchema,
    start: yearMonth,
    end: yearMonth.nullable(),
    summary: localizedStringSchema,
    highlights: z.array(localizedStringSchema).min(1),
    tags: z.array(z.string().min(1)),
  })
  .strict();
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;

export const educationEntrySchema = z
  .object({
    id: z.string().min(1),
    institution: z.string().min(1),
    degree: localizedStringSchema,
    start: z.string().regex(/^\d{4}$/, 'formato YYYY'),
    end: z
      .string()
      .regex(/^\d{4}$/, 'formato YYYY')
      .nullable(),
  })
  .strict();
export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const skillSchema = z
  .object({
    name: z.string().min(1),
    level: z.number().int().min(1).max(5),
    category: z.enum(SKILL_CATEGORIES),
    tags: z.array(z.string().min(1)),
  })
  .strict();
export type Skill = z.infer<typeof skillSchema>;

const projectLinksSchema = z
  .object({
    live: z.url().optional(),
    docs: z.url().optional(),
    repo: z.url().optional(),
  })
  .strict();

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: localizedStringSchema,
    summary: localizedStringSchema,
    role: localizedStringSchema,
    stack: z.array(z.string().min(1)).min(1),
    links: projectLinksSchema,
    metrics: z.array(z.object({ label: localizedStringSchema, value: z.string().min(1) }).strict()),
    featured: z.boolean(),
    caseStudy: z.boolean().default(false),
    date: dateish,
  })
  .strict();
export type Project = z.infer<typeof projectSchema>;

/** Frontmatter MDX: plano (cada fichero ya ES un locale). */
export const projectFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    role: z.string().min(1),
    stack: z.array(z.string().min(1)).min(1),
    links: projectLinksSchema,
    metrics: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) }).strict()),
    date: dateish,
  })
  .strict();
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

/** Enums de apariencia (spec §5): validación server-side; el cliente usa './constants'. */
export const themeSchema = z.enum(THEMES);
export const skinSchema = z.enum(SKINS);
export const cvViewSchema = z.enum(CV_VIEWS);

/** Campos comunes a los 3 tipos de ítem de la galería IA (spec §7). */
const galleryItemBase = {
  id: z.string().min(1),
  model: z.string().min(1),
  title: localizedStringSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
};

export const galleryItemSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('image'),
      ...galleryItemBase,
      src: z.string().min(1),
      hdSrc: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal('video'),
      ...galleryItemBase,
      src: z.string().min(1),
      poster: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal('audio'),
      ...galleryItemBase,
      src: z.string().min(1),
      cover: z.string().min(1),
      coverHd: z.string().min(1),
    })
    .strict(),
]);
export type GalleryItem = z.infer<typeof galleryItemSchema>;
