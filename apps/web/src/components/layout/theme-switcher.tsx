'use client';

import { useEffect, useState } from 'react';
import { applyTheme } from '@/lib/appearance';
import type { Theme } from '@/data/schemas';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/**
 * Theme toggle button. Initial state is read from the DOM (set by
 * themeInitScript) and kept in sync via `MutationObserver` on
 * `data-theme` on `<html>`: there can be more than one instance mounted at once
 * (desktop row + MobileMenu panel), and a change triggered from
 * any of them must be reflected in all, not just the one that originated it.
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
    // Not yet hydrated: reserve space to prevent layout shift.
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
