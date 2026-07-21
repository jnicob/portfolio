import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CSS_PATH = path.resolve(__dirname, 'globals.css');
const css = readFileSync(CSS_PATH, 'utf-8');

function ruleBody(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = Array.from(css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')));
  return matches.at(-1)?.[1] ?? '';
}

describe('tipografía prose-portfolio', () => {
  it('restaura los marcadores de listas eliminados por Preflight', () => {
    expect(ruleBody('.prose-portfolio ul')).toMatch(/list-style-type:\s*disc/);
    expect(ruleBody('.prose-portfolio ol')).toMatch(/list-style-type:\s*decimal/);
  });
});
