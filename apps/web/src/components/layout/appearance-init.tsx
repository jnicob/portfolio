'use client';

import { useEffect } from 'react';
import { applyAppearance, resolveAppearance, STORAGE_KEYS } from '@/lib/appearance';
import type { CvView, Skin, Theme } from '@/data/schemas';

type Props = { onView?: (view: CvView) => void };

type ResolvedAppearance = { theme: Theme; skin: Skin; view: CvView };

/**
 * One-shot a nivel de módulo: el layout monta un AppearanceInit sin `onView` y /cv monta
 * OTRO con `onView`. La primera instancia en montar limpia `?theme/skin/view` de la URL,
 * así que si cada instancia re-leyera `location`, la segunda ya no vería `?view=` y los
 * deep links a una vista del CV se romperían. Resolver UNA vez y cachear el resultado
 * completo (incluido `view`) hace que el orden de montaje deje de importar: todas las
 * instancias leen la misma resolución.
 */
let resolvedOnce: ResolvedAppearance | null = null;

function resolveAndApplyOnce(): ResolvedAppearance {
  if (resolvedOnce) return resolvedOnce;

  const params = new URLSearchParams(location.search);
  const stored = {
    theme: localStorage.getItem(STORAGE_KEYS.theme),
    skin: localStorage.getItem(STORAGE_KEYS.skin),
    view: localStorage.getItem(STORAGE_KEYS.cvView),
  };
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const { theme, skin, view, hadUrlParams } = resolveAppearance({ params, stored, prefersLight });
  applyAppearance({ theme, skin });

  if (hadUrlParams) {
    params.delete('theme');
    params.delete('skin');
    params.delete('view');
    const query = params.toString();
    const url = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
    window.history.replaceState(null, '', url);
  }

  resolvedOnce = { theme, skin, view };
  return resolvedOnce;
}

/**
 * Resuelve y aplica la apariencia (URL > storage > default) tras hidratar, y limpia
 * `theme`/`skin`/`view` de la URL cuando venían presentes, conservando el resto de la query.
 * La resolución es one-shot compartida entre instancias (ver `resolveAndApplyOnce`); cada
 * instancia notifica su propio `onView` con el resultado cacheado.
 */
export function AppearanceInit({ onView }: Props) {
  useEffect(() => {
    const resolved = resolveAndApplyOnce();
    onView?.(resolved.view);
  }, [onView]);

  return null;
}
