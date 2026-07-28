/**
 * Const-object unions del dominio, SIN dependencias: este módulo entra en el
 * bundle cliente (switchers, appearance), así que no puede importar zod.
 * Los schemas de `schemas.ts` derivan sus enums de estas constantes.
 */

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

export const SKINS = ['dev-tool', 'editorial', 'terminal', 'vibrant'] as const;
export type Skin = (typeof SKINS)[number];

export const CV_VIEWS = ['standard', 'compact', 'timeline'] as const;
export type CvView = (typeof CV_VIEWS)[number];

export const SKILL_CATEGORIES = ['backend', 'frontend', 'ai', 'platform', 'tooling'] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
