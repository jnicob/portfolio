/**
 * Domain const-object unions, WITHOUT dependencies: this module enters the
 * client bundle (switchers, appearance), so it cannot import zod.
 * Schemas in `schemas.ts` derive their enums from these constants.
 */

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

export const SKINS = ['dev-tool', 'editorial', 'terminal', 'vibrant'] as const;
export type Skin = (typeof SKINS)[number];

export const CV_VIEWS = ['standard', 'compact', 'timeline'] as const;
export type CvView = (typeof CV_VIEWS)[number];

export const SKILL_CATEGORIES = ['backend', 'frontend', 'ai', 'platform', 'tooling'] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
