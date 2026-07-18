import { describe, expect, it } from 'vitest';
import { skills } from './skills';

describe('skills data', () => {
  it('refleja la revisión de niveles del feedback C2', () => {
    const byName = Object.fromEntries(skills.map((s) => [s.name, s.level]));
    expect(byName['JavaScript']).toBe(5);
    expect(byName['React / Next.js']).toBe(4);
    expect(byName['TypeScript']).toBe(4);
    expect(byName['Vue 2/3']).toBe(3);
    expect(byName['React']).toBeUndefined();
    expect(byName['Next.js']).toBeUndefined();
  });
});
