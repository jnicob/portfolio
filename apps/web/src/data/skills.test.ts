import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from './constants';
import { experience } from './experience';
import { profile } from './profile';
import { skills } from './skills';

describe('skills and experience frontend prioritization', () => {
  it('places frontend first in SKILL_CATEGORIES', () => {
    expect(SKILL_CATEGORIES[0]).toBe('frontend');
  });

  it('reflects the level review and includes state management (React Query / Zustand / Jotai / Redux), PostgreSQL, Python / FastAPI, and Java', () => {
    const byName = Object.fromEntries(skills.map((s) => [s.name, s.level]));
    expect(byName['JavaScript']).toBe(5);
    expect(byName['React / Next.js']).toBe(4);
    expect(byName['TypeScript']).toBe(4);
    expect(byName['React Query / Zustand / Jotai / Redux']).toBe(4);
    expect(byName['Vue']).toBe(3);
    expect(byName['SQL (MySQL / PostgreSQL / SQL Server)']).toBe(4);
    expect(byName['Python / FastAPI']).toBe(2);
    expect(byName['Java']).toBe(2);
    expect(byName['React']).toBeUndefined();
    expect(byName['Next.js']).toBeUndefined();
  });

  it('lists frontend & interactive playground highlight first in Freepik experience with React Query, Zustand, and Jotai', () => {
    const freepik = experience.find((e) => e.id === 'freepik')!;
    expect(freepik.highlights[0]?.es).toMatch(/Playground interactivo/);
    expect(freepik.highlights[0]?.es).toMatch(/React Query/);
    expect(freepik.highlights[0]?.es).toMatch(/Zustand/);
    expect(freepik.highlights[0]?.es).toMatch(/Jotai/);
    expect(freepik.highlights[0]?.en).toMatch(/Interactive playground/);
    expect(freepik.highlights[0]?.en).toMatch(/React Query/);
    expect(freepik.highlights[0]?.en).toMatch(/Zustand/);
    expect(freepik.highlights[0]?.en).toMatch(/Jotai/);
  });

  it('includes Redux and Context API in AccelOne experience and profile core tech', () => {
    const accelone = experience.find((e) => e.id === 'accelone')!;
    expect(accelone.tags).toContain('redux');
    expect(JSON.stringify(accelone.highlights)).toMatch(/Redux/);
    expect(JSON.stringify(accelone.highlights)).toMatch(/Context API/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Redux/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Zustand/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Jotai/);
  });
});
