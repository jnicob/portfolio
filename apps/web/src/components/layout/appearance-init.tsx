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

// Suppresses React 19 false positive in development when reconciling the theme initialization script during soft navigations
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag while rendering React component')
    ) {
      return;
    }
    origError.apply(console, args);
  };
}

type Props = { onView?: (view: CvView) => void };

type ResolvedAppearance = { theme: Theme; skin: Skin };

/**
 * Module-level one-shot: the layout mounts an AppearanceInit without `onView` and /cv mounts
 * ANOTHER with `onView`. The first instance to mount strips `?theme/skin/view` from the URL,
 * so if each instance re-read `location`, the second would no longer see `?view=` and
 * deep links to a CV view would break. Resolving ONCE and caching theme/skin makes
 * the mount order no longer matter.
 *
 * The `view` is NOT cached: it is CONSUMED once — if the URL carried a valid view, the
 * one-shot persists it to storage; afterwards, each mount reads it fresh from storage
 * (storage > default). Thus, the deep link wins on first load and the user's subsequent
 * choice wins when returning to /cv via client-side navigation (a view cached from the first
 * load would overwrite the persisted choice when remounting CvContent).
 *
 * Tests: any test mounting AppearanceInit (directly or transitively, e.g. via
 * CvContent) must isolate this module cache with `vi.resetModules()` in beforeEach +
 * dynamic import per test.
 */
let resolvedOnce: ResolvedAppearance | null = null;

function resolveAndApplyOnce(): void {
  if (resolvedOnce) {
    // Root layout remount might re-impose static HTML attributes.
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

  // Deep link view: consumed once — persist here; storage takes precedence going forward.
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

/** Fresh view on each mount: storage > default (URL was already consumed by one-shot). */
function currentView(): CvView {
  const stored = localStorage.getItem(STORAGE_KEYS.cvView);
  return parseValid(CV_VIEWS, stored) ?? 'standard';
}

/**
 * Resolves and applies appearance (URL > storage > default) after hydration, and strips
 * `theme`/`skin`/`view` from the URL when present, preserving the rest of the query.
 * theme/skin are resolved only once and re-applied from storage on subsequent mounts
 * (see `resolveAndApplyOnce`); view is read fresh from storage on each mount and notified
 * to each instance's own `onView`.
 */
export function AppearanceInit({ onView }: Props) {
  useEffect(() => {
    resolveAndApplyOnce();
    onView?.(currentView());
  }, [onView]);

  return null;
}
