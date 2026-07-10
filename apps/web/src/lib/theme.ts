export type Theme = 'dark' | 'light';

/** stored > preferencia del sistema > dark. Mantener en sincronía con themeInitScript (layout). */
export function resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersLight ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* almacenamiento no disponible (p.ej. modo privado): el tema aplica solo a la sesión */
  }
}
