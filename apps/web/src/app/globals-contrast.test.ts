import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * WCAG 2.x AA contrast check for the 11 color variables across every
 * skin x theme combo. Reads globals.css via fs and parses the :root[...] blocks
 * as written — single source of truth for the final hex values rather than a
 * manually maintained copy.
 */

const CSS_PATH = path.resolve(__dirname, 'globals.css');
const css = readFileSync(CSS_PATH, 'utf-8');

const COLOR_VARS = [
  'bg',
  'surface',
  'fg',
  'fg-muted',
  'accent',
  'accent-hover',
  'accent-fg',
  'border',
  'ring',
  'danger',
  'danger-fg',
] as const;

type ColorVar = (typeof COLOR_VARS)[number];
type ThemeName = 'dark' | 'light';
type ParsedBlock = {
  skin: string | null;
  theme: ThemeName;
  vars: Partial<Record<ColorVar, string>>;
};
type Combo = { skin: string; theme: ThemeName; vars: Record<ColorVar, string> };

function parseBlocks(source: string): ParsedBlock[] {
  const blockRegex =
    /:root(\[data-skin='([\w-]+)'\])?\[data-theme='(dark|light)'\]\s*\{([\s\S]*?)\}/g;
  const blocks: ParsedBlock[] = [];
  for (const match of source.matchAll(blockRegex)) {
    const [, , skin, theme, body] = match;
    const vars: Partial<Record<ColorVar, string>> = {};
    for (const varName of COLOR_VARS) {
      const varMatch = (body ?? '').match(new RegExp(`--${varName}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
      if (varMatch) vars[varName] = varMatch[1];
    }
    // Blocks without any of the 11 variables (e.g. media-kit token mapping) are not
    // theme/skin blocks: discard them so they do not overwrite the real base block.
    if (Object.keys(vars).length === 0) continue;
    blocks.push({ skin: skin ?? null, theme: theme as ThemeName, vars });
  }
  return blocks;
}

/** dev-tool = base blocks without data-skin; each skin inherits from base and overrides. */
function buildCombos(blocks: ParsedBlock[]): Combo[] {
  const baseBlocks = blocks.filter((block) => block.skin === null);
  const skinBlocks = blocks.filter((block) => block.skin !== null);
  const combos: Combo[] = baseBlocks.map((base) => ({
    skin: 'dev-tool',
    theme: base.theme,
    vars: base.vars as Record<ColorVar, string>,
  }));
  for (const skinBlock of skinBlocks) {
    const base = baseBlocks.find((block) => block.theme === skinBlock.theme);
    combos.push({
      skin: skinBlock.skin as string,
      theme: skinBlock.theme,
      vars: { ...base?.vars, ...skinBlock.vars } as Record<ColorVar, string>,
    });
  }
  return combos;
}

function hexToLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.slice(0, 6);
  const channel = (start: number) => parseInt(full.slice(start, start + 2), 16) / 255;
  const linearize = (value: number) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const [r, g, b] = [0, 2, 4].map((start) => linearize(channel(start))) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hexA: string, hexB: string): number {
  const [lighter, darker] = [hexToLuminance(hexA), hexToLuminance(hexB)].sort((a, b) => b - a) as [
    number,
    number,
  ];
  return (lighter + 0.05) / (darker + 0.05);
}

const PAIRS: { name: string; fg: ColorVar; bg: ColorVar; min: number }[] = [
  { name: 'fg/bg', fg: 'fg', bg: 'bg', min: 4.5 },
  { name: 'fg-muted/bg', fg: 'fg-muted', bg: 'bg', min: 4.5 },
  { name: 'fg/surface', fg: 'fg', bg: 'surface', min: 4.5 },
  { name: 'fg-muted/surface', fg: 'fg-muted', bg: 'surface', min: 4.5 },
  { name: 'accent-fg/accent', fg: 'accent-fg', bg: 'accent', min: 4.5 },
  { name: 'danger-fg/danger', fg: 'danger-fg', bg: 'danger', min: 4.5 },
  { name: 'accent/bg', fg: 'accent', bg: 'bg', min: 3 },
  { name: 'ring/bg', fg: 'ring', bg: 'bg', min: 3 },
];

const combos = buildCombos(parseBlocks(css));

describe('globals.css contrast (WCAG AA) por combo skin x theme', () => {
  it('define 4 skins x 2 themes = 8 combos', () => {
    expect(combos).toHaveLength(8);
  });

  describe.each(combos)('skin=$skin theme=$theme', ({ vars }) => {
    it.each(PAIRS)('$name >= $min:1', ({ fg, bg, min }) => {
      expect(contrast(vars[fg], vars[bg])).toBeGreaterThanOrEqual(min);
    });
  });
});
