import type { ZodType } from 'zod';
import { cvViewSchema, skinSchema, themeSchema } from '@/data/schemas';
import type { CvView, Skin, Theme } from '@/data/schemas';

export type Appearance = { theme: Theme; skin: Skin };

export const DEFAULT_APPEARANCE: Appearance = { theme: 'dark', skin: 'dev-tool' };

export const STORAGE_KEYS = { theme: 'theme', skin: 'skin', cvView: 'cv-view' } as const;

function parseValid<T>(schema: ZodType<T>, value: string | null): T | undefined {
  if (value === null) return undefined;
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

/** Precedencia URL > localStorage > default; inválidos caen en cascada al siguiente nivel. */
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
    parseValid(themeSchema, urlTheme) ??
    parseValid(themeSchema, stored.theme) ??
    (prefersLight ? 'light' : 'dark');
  const skin =
    parseValid(skinSchema, urlSkin) ??
    parseValid(skinSchema, stored.skin) ??
    DEFAULT_APPEARANCE.skin;
  const view =
    parseValid(cvViewSchema, urlView) ?? parseValid(cvViewSchema, stored.view) ?? 'standard';

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
    /* almacenamiento no disponible (p.ej. modo privado): aplica solo a la sesión */
  }
}

function currentSkin(): Skin {
  return (
    parseValid(skinSchema, document.documentElement.dataset.skin ?? null) ?? DEFAULT_APPEARANCE.skin
  );
}

function currentTheme(): Theme {
  return (
    parseValid(themeSchema, document.documentElement.dataset.theme ?? null) ??
    DEFAULT_APPEARANCE.theme
  );
}

/** Compat con ThemeSwitcher: cambia solo el tema conservando el skin aplicado. */
export function applyTheme(theme: Theme): void {
  applyAppearance({ theme, skin: currentSkin() });
}

export function applySkin(skin: Skin): void {
  applyAppearance({ theme: currentTheme(), skin });
}

export function persistCvView(view: CvView): void {
  try {
    localStorage.setItem(STORAGE_KEYS.cvView, view);
  } catch {
    /* almacenamiento no disponible (p.ej. modo privado): la vista aplica solo a la sesión */
  }
}

/** URL compartible con el estado actual; view solo si se pasa (páginas ≠ /cv no lo pasan). */
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
