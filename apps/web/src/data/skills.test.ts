import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from './constants';
import { experience } from './experience';
import { profile } from './profile';
import { skills } from './skills';

describe('skills and experience frontend prioritization', () => {
  it('places frontend first in SKILL_CATEGORIES', () => {
    expect(SKILL_CATEGORIES[0]).toBe('frontend');
  });

  it('reflects the level review and includes state management (Hooks & State Management), PostgreSQL, Python / FastAPI, and Java', () => {
    const byName = Object.fromEntries(skills.map((s) => [s.name, s.level]));
    expect(byName['JavaScript']).toBe(5);
    expect(byName['React / Next.js']).toBe(4);
    expect(byName['TypeScript']).toBe(4);
    expect(byName['Hooks & State Management (React Query / Zustand / Jotai / Redux)']).toBe(4);
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
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Hooks/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/React Query/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Redux/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Zustand/);
  });

  it('highlights Claude Code, skills/commands, accessible design systems, async workflows, and Docker & CI/CD across profile, experience, and skills', () => {
    const names = skills.map((s) => s.name);
    expect(names).toContain('Claude Code / Codex / Gemini');
    expect(names).toContain('Docker & CI/CD (GitHub Actions / Tekton / Jenkins)');

    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/Claude Code/);
    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/skills y commands/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/Claude Code/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/skills and commands/);

    expect(profile.summary.coreTechBullets[4]?.value.es).toMatch(/sistema de diseño/);
    expect(profile.summary.coreTechBullets[4]?.value.es).toMatch(/accesibilidad \(WCAG\)/);
    expect(profile.summary.coreTechBullets[4]?.value.en).toMatch(/design system/);
    expect(profile.summary.coreTechBullets[4]?.value.en).toMatch(/accessibility \(WCAG\)/);

    const freepik = experience.find((e) => e.id === 'freepik')!;
    expect(freepik.highlights[0]?.es).toMatch(/sistema de diseño, accesibilidad/);
    expect(freepik.highlights[0]?.en).toMatch(/design system, accessibility/);
    expect(freepik.highlights[1]?.es).toMatch(/procesos asíncronos/);
    expect(freepik.highlights[1]?.en).toMatch(/asynchronous workflows/);
    expect(freepik.highlights[2]?.es).toMatch(/Claude Code, skills y commands/);
    expect(freepik.highlights[2]?.en).toMatch(/Claude Code, skills & commands/);
  });

  it('surfaces healthcare interoperability (HIS/EHR, HL7 V2/V3 Infobuttons/FHIR, CDSS) and presentation/REST stack across profile, experience, and skills', () => {
    // Profile narrative & core tech bullets in both locales
    expect(profile.summary.paragraphs.es[0]).toMatch(/HIS\/EHR/);
    expect(profile.summary.paragraphs.en[0]).toMatch(/HIS\/EHR/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/HTML5, CSS3/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Java\b/);
    expect(profile.summary.coreTechBullets[2]?.value.es).toMatch(
      /HL7 \(V2, V3 Infobuttons, FHIR\)/,
    );
    expect(profile.summary.coreTechBullets[2]?.value.en).toMatch(
      /HL7 \(V2, V3 Infobuttons, FHIR\)/,
    );
    expect(profile.summary.coreTechBullets[3]?.value.es).toMatch(/Bootstrap, AJAX \/ jQuery, DOM/);
    expect(profile.summary.coreTechBullets[3]?.value.es).toMatch(/OpenSearch \/ Kibana/);

    // Fares Taie CDSS + HL7 FHIR & V3 Infobuttons + Java/REST
    const faresTaie = experience.find((e) => e.id === 'fares-taie')!;
    expect(faresTaie.highlights[0]?.es).toMatch(/HL7 FHIR y HL7 V3 Infobuttons/);
    expect(faresTaie.highlights[0]?.en).toMatch(/HL7 FHIR and HL7 V3 Infobuttons/);
    expect(faresTaie.highlights[1]?.es).toMatch(/APIs RESTful/);
    expect(faresTaie.highlights[1]?.en).toMatch(/RESTful APIs/);

    // Municipalidad HIS presentation & Doctrine ORM
    const muni = experience.find((e) => e.id === 'municipalidad-general-pueyrredon')!;
    expect(muni.highlights[2]?.es).toMatch(/HTML5, CSS, Bootstrap, JavaScript, jQuery, AJAX/);
    expect(muni.highlights[2]?.es).toMatch(/Doctrine ORM/);
    expect(muni.highlights[2]?.en).toMatch(/HTML5, CSS, Bootstrap, JavaScript, jQuery, AJAX/);
    expect(muni.highlights[2]?.en).toMatch(/Doctrine ORM/);

    // Skills pills visibility
    const names = skills.map((s) => s.name);
    expect(names).toContain('HTML5 / CSS3 / DOM / AJAX / jQuery');
    expect(names).toContain('RESTful APIs & ORMs (Doctrine / Eloquent / Prisma / Drizzle)');
    expect(names).toContain('HL7 (V2 / V3 / FHIR) & Healthcare Interoperability');
    expect(names).toContain('Observability (OpenSearch / Kibana / Analytics)');
    expect(names).toContain('Tailwind CSS / Bootstrap');
  });
});
