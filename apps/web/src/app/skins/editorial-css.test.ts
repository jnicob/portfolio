import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Invariantes del parcial de disposición del skin editorial (spec F3.9 §2):
 * - todo selector escopado a [data-skin='editorial'] (no puede filtrar a otros skins);
 * - cero colores hex (hard rule: colores solo vía tokens);
 * - todo hook data-* que use existe en el código (sin selectores muertos).
 */

const CSS_PATH = path.resolve(__dirname, 'editorial.css');
const css = readFileSync(CSS_PATH, 'utf-8');

/** Selectores de regla: lo que precede a cada `{`, ignorando comentarios y @media. */
function ruleSelectors(source: string): string[] {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{/g, '');
  const selectors: string[] = [];
  for (const match of clean.matchAll(/(^|\})\s*([^@{}]+)\{/g)) {
    selectors.push(...(match[2] ?? '').split(',').map((s) => s.trim()));
  }
  return selectors.filter(Boolean);
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && /\.(tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name),
    )
    .map((entry) => path.join(entry.parentPath, entry.name));
}

describe('editorial.css (disposición del skin editorial)', () => {
  it('todo selector está escopado a [data-skin=editorial]', () => {
    const selectors = ruleSelectors(css);
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector, selector).toMatch(/^\[data-skin='editorial'\]/);
    }
  });

  it('no contiene colores hex (solo tokens)', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('no contiene funciones de color (rgb/hsl/oklch/color/…) (solo tokens)', () => {
    expect(css).not.toMatch(/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i);
  });

  it('no contiene named colors sueltos (black/white/red/blue/gray/grey) (solo tokens)', () => {
    // Límites que excluyen guiones para no disparar con identificadores CSS
    // como `white-space` o `off-white` (no son el color named "white").
    expect(css).not.toMatch(/(?<![\w-])(black|white|red|blue|gray|grey)(?![\w-])/i);
  });

  it('el ritmo vertical del CV tiene dueño único: editorial anula el gap del layout y declara el total', () => {
    // Higiene adjudicada en el design review de F3.9: los 4.5rem entre secciones
    // (2.5rem sobre la hairline + 2rem bajo ella) viven ENTEROS en este parcial,
    // no repartidos entre el gap-10 del layout base y este padding.
    const container = css.match(/\[data-skin='editorial'\] \[data-cv-sections\]\s*\{([^}]*)\}/);
    expect(container).not.toBeNull();
    expect(container?.[1]).toMatch(/row-gap:\s*0/);

    const sections = css.match(
      /\[data-skin='editorial'\] \[data-cv-sections\] > section \+ section\s*\{([^}]*)\}/,
    );
    expect(sections).not.toBeNull();
    expect(sections?.[1]).toMatch(/margin-top:\s*2\.5rem/);
    expect(sections?.[1]).toMatch(/padding-top:\s*2rem/);
  });

  it('cada hook data-* que usa existe en el código de la app', () => {
    const hooks = [...new Set(css.match(/data-(?!skin|theme)[\w-]+/g) ?? [])];
    expect(hooks.length).toBeGreaterThan(0);
    const appSource = sourceFiles(path.resolve(__dirname, '..', '..'))
      .filter((file) => !file.endsWith('editorial.css') && !file.endsWith('editorial-css.test.ts'))
      .map((file) => readFileSync(file, 'utf-8'))
      .join('\n');
    for (const hook of hooks) {
      expect(appSource, `hook ${hook} sin uso en la app`).toContain(hook);
    }
  });
});
