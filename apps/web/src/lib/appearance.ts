import { CV_VIEWS, SKINS, THEMES } from '@/data/constants';
import type { CvView, Skin, Theme } from '@/data/constants';

export type Appearance = { theme: Theme; skin: Skin };

export const DEFAULT_APPEARANCE: Appearance = { theme: 'dark', skin: 'dev-tool' };

export const STORAGE_KEYS = { theme: 'theme', skin: 'skin', cvView: 'cv-view' } as const;

/** Validated value against a const-union, without zod (this module enters client bundle). */
export function parseValid<T extends string>(
  options: readonly T[],
  value: string | null,
): T | undefined {
  return options.find((option) => option === value);
}

/** URL > localStorage > default precedence; invalid values cascade down to the next level. */
export function resolveAppearance(input: {
  params: URLSearchParams;
  stored: { theme: string | null; skin: string | null; view: string | null };
  prefersLight: boolean;
}): { theme: Theme; skin: Skin; view: CvView; hadUrlParams: boolean } {
  const { params, stored, prefersLight } = input;
  const urlTheme = params.get('theme');
  const urlSkin = params.get('skin');
  const urlView = params.get('view');

  const theme =
    parseValid(THEMES, urlTheme) ??
    parseValid(THEMES, stored.theme) ??
    (prefersLight ? 'light' : 'dark');
  const skin =
    parseValid(SKINS, urlSkin) ?? parseValid(SKINS, stored.skin) ?? DEFAULT_APPEARANCE.skin;
  const view = parseValid(CV_VIEWS, urlView) ?? parseValid(CV_VIEWS, stored.view) ?? 'standard';

  return {
    theme,
    skin,
    view,
    hadUrlParams: urlTheme !== null || urlSkin !== null || urlView !== null,
  };
}

/** Aplica data-theme y data-skin (dev-tool = SIN atributo) y persiste. */
export function applyAppearance(appearance: Appearance): void {
  document.documentElement.dataset.theme = appearance.theme;
  if (appearance.skin === 'dev-tool') {
    delete document.documentElement.dataset.skin;
  } else {
    document.documentElement.dataset.skin = appearance.skin;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.theme, appearance.theme);
    localStorage.setItem(STORAGE_KEYS.skin, appearance.skin);
  } catch {
    /* Storage not available (e.g. private browsing mode): applies only to session */
  }
}

/** Skin actualmente aplicado al DOM (dataset ausente = 'dev-tool'), validado. */
export function currentSkin(): Skin {
  return (
    parseValid(SKINS, document.documentElement.dataset.skin ?? null) ?? DEFAULT_APPEARANCE.skin
  );
}

/** Theme actualmente aplicado al DOM, validado (fallback al default si el dataset falta). */
export function currentTheme(): Theme {
  return (
    parseValid(THEMES, document.documentElement.dataset.theme ?? null) ?? DEFAULT_APPEARANCE.theme
  );
}

/** Compatibility with ThemeSwitcher: changes only theme while preserving active skin. */
export function applyTheme(theme: Theme): void {
  applyAppearance({ theme, skin: currentSkin() });
}

export function applySkin(skin: Skin): void {
  applyAppearance({ theme: currentTheme(), skin });
}

/**
 * Re-applies appearance after root layout remount: storage contains user's
 * latest choice and fallback preserves initial resolution.
 */
export function reapplyStoredAppearance(fallback: Appearance): void {
  let storedTheme: string | null = null;
  let storedSkin: string | null = null;
  try {
    storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    storedSkin = localStorage.getItem(STORAGE_KEYS.skin);
  } catch {
    /* almacenamiento no disponible: re-aplica el fallback de la primera carga */
  }
  applyAppearance({
    theme: parseValid(THEMES, storedTheme) ?? fallback.theme,
    skin: parseValid(SKINS, storedSkin) ?? fallback.skin,
  });
}

export function persistCvView(view: CvView): void {
  try {
    localStorage.setItem(STORAGE_KEYS.cvView, view);
  } catch {
    /* Storage not available (e.g. private browsing mode): view applies only to session */
  }
}

/** Shareable URL with current state; view included only when provided (pages ≠ /cv omit it). */
export function buildShareUrl(input: {
  origin: string;
  pathname: string;
  theme: Theme;
  skin: Skin;
  view?: CvView;
}): string {
  const params = new URLSearchParams({ theme: input.theme, skin: input.skin });
  if (input.view) params.set('view', input.view);
  return `${input.origin}${input.pathname}?${params.toString()}`;
}
