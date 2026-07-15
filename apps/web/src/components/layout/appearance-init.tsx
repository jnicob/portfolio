'use client';

import { useEffect } from 'react';
import { applyAppearance, resolveAppearance, STORAGE_KEYS } from '@/lib/appearance';
import type { CvView } from '@/data/schemas';

type Props = { onView?: (view: CvView) => void };

/**
 * Resuelve y aplica la apariencia (URL > storage > default) tras hidratar, y limpia
 * `theme`/`skin`/`view` de la URL cuando venían presentes, conservando el resto de la query.
 * Idempotente: montarlo más de una vez (p.ej. /cv monta el suyo con `onView`) es inocuo — la
 * segunda pasada no ve params en la URL porque la primera ya la limpió.
 */
export function AppearanceInit({ onView }: Props) {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stored = {
      theme: localStorage.getItem(STORAGE_KEYS.theme),
      skin: localStorage.getItem(STORAGE_KEYS.skin),
      view: localStorage.getItem(STORAGE_KEYS.cvView),
    };
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    const { theme, skin, view, hadUrlParams } = resolveAppearance({ params, stored, prefersLight });
    applyAppearance({ theme, skin });
    onView?.(view);

    if (hadUrlParams) {
      params.delete('theme');
      params.delete('skin');
      params.delete('view');
      const query = params.toString();
      const url = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
      window.history.replaceState(null, '', url);
    }
  }, [onView]);

  return null;
}
