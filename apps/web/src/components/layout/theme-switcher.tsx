'use client';

import { useEffect, useState } from 'react';
import { applyTheme } from '@/lib/appearance';
import type { Theme } from '@/data/schemas';

/** Botón de cambio de tema. El estado inicial se lee del DOM (fijado por themeInitScript). */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  if (theme === null) {
    // Aún sin hidratar: reservar espacio para evitar layout shift.
    return <span aria-hidden className="inline-block size-9" />;
  }

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      className="inline-flex size-9 items-center justify-center rounded-control border border-border text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
