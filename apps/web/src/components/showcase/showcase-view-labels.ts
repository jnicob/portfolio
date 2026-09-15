import type { ShowcaseViewLabels } from './showcase-view';

/** Minimal shape we need from a next-intl translator with namespace `showcase`. */
type ShowcaseTranslator = {
  (key: string): string;
  raw(key: string): string;
};

/**
 * Builds the labels for `ShowcaseView` from a translator with namespace `showcase`
 * (server or client, both expose the same shape). Extracted from `page.tsx` to be able to test
 * the contract of `index.showing` with real messages — see `showcase-view.test.tsx`.
 *
 * `showing` is read with `t.raw`, not with `t()`: the message includes the literal placeholder
 * `{section}` (`"Mostrando: {section}"`), which `ShowcaseView` interpolates manually with
 * `.replace('{section}', activeLabel)` once it knows, on the client, which section is active.
 * Requesting it with `t('index.showing')` forces next-intl to format ICU right there without the
 * `section` argument (which does not exist yet at that moment) — triggers FORMATTING_ERROR and
 * next-intl returns the raw key (`namespace.key`) as a fallback instead of the pattern.
 */
export function buildShowcaseViewLabels(t: ShowcaseTranslator): ShowcaseViewLabels {
  return {
    navLabel: t('tocLabel'),
    inputLabel: t('filterLabel'),
    emptyMessage: t('filterEmpty'),
    placeholder: t('filterPlaceholder'),
    all: t('index.all'),
    showing: t.raw('index.showing'),
    showingAll: t('index.showingAll'),
  };
}
