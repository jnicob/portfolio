import { describe, expect, it } from 'vitest';
import { skills } from './skills';

describe('skills data', () => {
  it('reflects the level review and includes PostgreSQL, Python / FastAPI, and Java', () => {
    const byName = Object.fromEntries(skills.map((s) => [s.name, s.level]));
    expect(byName['JavaScript']).toBe(5);
    expect(byName['React / Next.js']).toBe(4);
    expect(byName['TypeScript']).toBe(4);
    expect(byName['Vue']).toBe(3);
    expect(byName['SQL (MySQL / PostgreSQL / SQL Server)']).toBe(4);
    expect(byName['Python / FastAPI']).toBe(2);
    expect(byName['Java']).toBe(2);
    expect(byName['React']).toBeUndefined();
    expect(byName['Next.js']).toBeUndefined();
  });
});
