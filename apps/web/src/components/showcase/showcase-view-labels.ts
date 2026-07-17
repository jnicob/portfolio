import type { ShowcaseViewLabels } from './showcase-view';

/** Forma mínima que necesitamos de un translator de next-intl con namespace `showcase`. */
type ShowcaseTranslator = {
  (key: string): string;
  raw(key: string): string;
};

/**
 * Construye las labels de `ShowcaseView` a partir de un translator con namespace `showcase`
 * (server o client, ambos exponen la misma forma). Extraído de `page.tsx` para poder testear
 * el contrato de `index.showing` con los mensajes reales — ver `showcase-view.test.tsx`.
 *
 * `showing` se lee con `t.raw`, no con `t()`: el mensaje trae el placeholder literal
 * `{section}` (`"Mostrando: {section}"`), que `ShowcaseView` interpola a mano con
 * `.replace('{section}', activeLabel)` una vez conoce, en cliente, qué sección está activa.
 * Pedirlo con `t('index.showing')` obliga a next-intl a formatear el ICU ahí mismo sin el
 * argumento `section` (que todavía no existe en ese momento) — dispara FORMATTING_ERROR y
 * next-intl devuelve como fallback la key cruda (`namespace.key`) en su lugar del patrón.
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
