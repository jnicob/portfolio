'use client';

import { useEffect } from 'react';
import {
  applyAppearance,
  parseValid,
  persistCvView,
  reapplyStoredAppearance,
  resolveAppearance,
  STORAGE_KEYS,
} from '@/lib/appearance';
import { CV_VIEWS } from '@/data/constants';
import type { CvView, Skin, Theme } from '@/data/constants';

type Props = { onView?: (view: CvView) => void };

type ResolvedAppearance = { theme: Theme; skin: Skin };

/**
 * One-shot a nivel de módulo: el layout monta un AppearanceInit sin `onView` y /cv monta
 * OTRO con `onView`. La primera instancia en montar limpia `?theme/skin/view` de la URL,
 * así que si cada instancia re-leyera `location`, la segunda ya no vería `?view=` y los
 * deep links a una vista del CV se romperían. Resolver UNA vez y cachear theme/skin hace
 * que el orden de montaje deje de importar.
 *
 * La `view` NO se cachea: se CONSUME una vez — si la URL traía una view válida, el
 * one-shot la persiste a storage; después, cada montaje la lee fresca de storage
 * (storage > default). Así el deep link gana en la primera carga y la elección posterior
 * del usuario gana al volver a /cv por navegación client (una view cacheada del primer
 * load taparía la elección persistida al remontar CvContent).
 *
 * Tests: cualquier test que monte AppearanceInit (directa o transitivamente, p.ej. vía
 * CvContent) debe aislar esta caché de módulo con `vi.resetModules()` en beforeEach +
 * import dinámico por test.
 */
let resolvedOnce: ResolvedAppearance | null = null;

function resolveAndApplyOnce(): void {
  if (resolvedOnce) {
    // El remount del root layout puede reimponer sus atributos HTML estáticos.
    reapplyStoredAppearance(resolvedOnce);
    return;
  }

  const params = new URLSearchParams(location.search);
  const stored = {
    theme: localStorage.getItem(STORAGE_KEYS.theme),
    skin: localStorage.getItem(STORAGE_KEYS.skin),
    view: localStorage.getItem(STORAGE_KEYS.cvView),
  };
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const { theme, skin, view, hadUrlParams } = resolveAppearance({ params, stored, prefersLight });
  applyAppearance({ theme, skin });

  // view del deep link: consumida una vez — persistir aquí; storage manda en adelante.
  const urlView = params.get('view');
  if (parseValid(CV_VIEWS, urlView) !== undefined) {
    persistCvView(view);
  }

  if (hadUrlParams) {
    params.delete('theme');
    params.delete('skin');
    params.delete('view');
    const query = params.toString();
    const url = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
    window.history.replaceState(null, '', url);
  }

  resolvedOnce = { theme, skin };
}

/** View fresca en cada montaje: storage > default (la URL ya fue consumida por el one-shot). */
function currentView(): CvView {
  const stored = localStorage.getItem(STORAGE_KEYS.cvView);
  return parseValid(CV_VIEWS, stored) ?? 'standard';
}

/**
 * Resuelve y aplica la apariencia (URL > storage > default) tras hidratar, y limpia
 * `theme`/`skin`/`view` de la URL cuando venían presentes, conservando el resto de la query.
 * theme/skin se resuelven una sola vez y se re-aplican desde storage en montajes posteriores
 * (ver `resolveAndApplyOnce`); la view se lee fresca de storage en cada montaje y se notifica
 * al `onView` propio de cada instancia.
 */
export function AppearanceInit({ onView }: Props) {
  useEffect(() => {
    resolveAndApplyOnce();
    onView?.(currentView());
  }, [onView]);

  return null;
}
