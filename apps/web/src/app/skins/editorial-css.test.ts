import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Invariants of the editorial skin layout partial (spec F3.9 §2):
 * - every selector scoped to [data-skin='editorial'] (cannot leak to other skins);
 * - zero hex colors (hard rule: colors only via tokens);
 * - every data-* hook it uses exists in the code (no dead selectors).
 */

const CSS_PATH = path.resolve(__dirname, 'editorial.css');
const css = readFileSync(CSS_PATH, 'utf-8');

/** Rule selectors: what precedes each `{`, ignoring comments and @media. */
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

describe('editorial.css (editorial skin layout)', () => {
  it('every selector is scoped to [data-skin=editorial]', () => {
    const selectors = ruleSelectors(css);
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector, selector).toMatch(/^\[data-skin='editorial'\]/);
    }
  });

  it('does not contain hex colors (tokens only)', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('does not contain color functions (rgb/hsl/oklch/color/…) (tokens only)', () => {
    expect(css).not.toMatch(/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i);
  });

  it('does not contain bare named colors (black/white/red/blue/gray/grey) (tokens only)', () => {
    // Boundaries excluding hyphens so as not to trigger on CSS identifiers
    // such as `white-space` or `off-white` (which are not the named color "white").
    expect(css).not.toMatch(/(?<![\w-])(black|white|red|blue|gray|grey)(?![\w-])/i);
  });

  it('uses explicit semantic data-hero-* hooks instead of fragile positional > div chains in the Hero masthead', () => {
    const selectors = ruleSelectors(css);
    for (const selector of selectors) {
      expect(selector).not.toMatch(/>\s*div\b/);
    }
    expect(css).toContain('[data-hero-header]');
    expect(css).toContain('[data-hero-title]');
    expect(css).toContain('[data-hero-headline]');
    expect(css).toContain('[data-hero-badges]');
    expect(css).toContain('[data-hero-actions]');
  });

  it('CV vertical rhythm has a single owner: editorial overrides layout gap and declares the total', () => {
    // Hygiene established in the F3.9 design review: the 4.5rem between sections
    // (2.5rem above the hairline + 2rem below it) live ENTIRELY in this partial,
    // rather than split between the base layout's gap-10 and this padding.
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

  it('every data-* hook it uses exists in the app code', () => {
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
