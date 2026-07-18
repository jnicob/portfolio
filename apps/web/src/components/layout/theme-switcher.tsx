'use client';

import { useEffect, useState } from 'react';
import { applyTheme } from '@/lib/appearance';
import type { Theme } from '@/data/schemas';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/**
 * Botón de cambio de tema. El estado inicial se lee del DOM (fijado por
 * themeInitScript) y se mantiene sincronizado vía `MutationObserver` sobre
 * `data-theme` en `<html>`: puede haber más de una instancia montada a la vez
 * (fila desktop + panel del MobileMenu), y un cambio disparado desde
 * cualquiera de ellas debe reflejarse en todas, no solo en la que lo originó.
 */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(readTheme());

    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
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
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-control border border-border text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => applyTheme(next)}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
