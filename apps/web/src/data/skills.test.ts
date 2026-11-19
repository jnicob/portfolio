import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from './constants';
import { experience } from './experience';
import { profile } from './profile';
import { skills } from './skills';

describe('skills and experience frontend prioritization', () => {
  it('places frontend first in SKILL_CATEGORIES', () => {
    expect(SKILL_CATEGORIES[0]).toBe('frontend');
  });

  it('uses a unified headline covering Frontend, Full-Stack, AI Engineer, and Technical Analyst without PHP/Python clutter', () => {
    expect(profile.headline.en).toMatch(/^Senior Frontend Engineer/);
    expect(profile.headline.en).toMatch(/Full-Stack & AI Engineer/);
    expect(profile.headline.en).toMatch(/Technical Analyst/);
    expect(profile.headline.en).toMatch(/React\/Next\.js.*Vue.*Node\.js/);
    expect(profile.headline.en).not.toMatch(/\b(PHP|Python)\b/);

    expect(profile.headline.es).toMatch(/^Senior Frontend Engineer/);
    expect(profile.headline.es).toMatch(/Full-Stack & AI Engineer/);
    expect(profile.headline.es).toMatch(/Analista Técnico/);
    expect(profile.headline.es).not.toMatch(/\b(PHP|Python)\b/);
  });

  it('reflects the level review and includes state management (TanStack / React Query), Design Systems & SEO/WCAG, Vue 2/3, SQL/ERD, NoSQL, Python/FastAPI, Java, GCP, and SCRUM', () => {
    const byName = Object.fromEntries(skills.map((s) => [s.name, s.level]));
    expect(byName['JavaScript']).toBe(5);
    expect(byName['React / Next.js']).toBe(4);
    expect(byName['TypeScript']).toBe(4);
    expect(byName['TanStack / React Query, Zustand, Jotai, Redux']).toBe(4);
    expect(byName['Design Systems, WCAG AA & Technical SEO']).toBe(4);
    expect(byName['Vue 2/3']).toBe(3);
    expect(byName['SQL / NoSQL (Postgres, MySQL, Mongo, Redis)']).toBe(4);
    expect(byName['Python / FastAPI']).toBe(2);
    expect(byName['Java (Spring / Hibernate)']).toBe(2);
    expect(byName['GCP & Gateway APISIX']).toBe(3);
    expect(byName['SCRUM & Agile']).toBe(5);
    expect(byName['React']).toBeUndefined();
    expect(byName['Next.js']).toBeUndefined();
  });

  it('lists frontend & interactive playground highlight first in Freepik experience with TanStack Query, Zustand, and Jotai', () => {
    const freepik = experience.find((e) => e.id === 'freepik')!;
    expect(freepik.highlights[0]?.es).toMatch(/Playground interactivo/);
    expect(freepik.highlights[0]?.es).toMatch(/TanStack Query \(React Query\)/);
    expect(freepik.highlights[0]?.es).toMatch(/Zustand/);
    expect(freepik.highlights[0]?.es).toMatch(/Jotai/);
    expect(freepik.highlights[0]?.en).toMatch(/Interactive playground/);
    expect(freepik.highlights[0]?.en).toMatch(/TanStack Query \(React Query\)/);
    expect(freepik.highlights[0]?.en).toMatch(/Zustand/);
    expect(freepik.highlights[0]?.en).toMatch(/Jotai/);
  });

  it('includes Redux and Context API in AccelOne experience and profile core tech', () => {
    const accelone = experience.find((e) => e.id === 'accelone')!;
    expect(accelone.tags).toContain('redux');
    expect(JSON.stringify(accelone.highlights)).toMatch(/Redux/);
    expect(JSON.stringify(accelone.highlights)).toMatch(/Context API/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Hooks/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/TanStack Query/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Redux/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Zustand/);
  });

  it('highlights Claude Code, MCPs, subagents, skills/commands, accessible design systems, async workflows, and Docker & CI/CD across profile, experience, and skills', () => {
    const names = skills.map((s) => s.name);
    expect(names).toContain('Generative AI (LLMs), Multi-Agent & MCPs');
    expect(names).toContain('Claude Code / Codex / Gemini');
    expect(names).toContain('Docker & CI/CD (GitHub Actions / Jenkins)');
    expect(names).toContain('Linux & Kubernetes');

    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/LLMs/);
    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/sistemas multiagente/);
    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/MCP/);
    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/subagentes/);
    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/Claude Code/);
    expect(profile.summary.coreTechBullets[1]?.value.es).toMatch(/skills y commands/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/LLMs/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/multi-agent systems/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/MCP/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/subagents/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/Claude Code/);
    expect(profile.summary.coreTechBullets[1]?.value.en).toMatch(/skills and commands/);
    expect(profile.summary.coreTechBullets[3]?.value.es).toMatch(/Kubernetes/);
    expect(profile.summary.coreTechBullets[3]?.value.en).toMatch(/Kubernetes/);

    expect(profile.summary.coreTechBullets[4]?.value.es).toMatch(/Design Systems/);
    expect(profile.summary.coreTechBullets[4]?.value.es).toMatch(/accesibilidad \(WCAG AA\)/);
    expect(profile.summary.coreTechBullets[4]?.value.es).toMatch(/SEO técnico/);
    expect(profile.summary.coreTechBullets[4]?.value.en).toMatch(/Design Systems/);
    expect(profile.summary.coreTechBullets[4]?.value.en).toMatch(/accessibility \(WCAG AA\)/);
    expect(profile.summary.coreTechBullets[4]?.value.en).toMatch(/Technical SEO/);

    const freepik = experience.find((e) => e.id === 'freepik')!;
    expect(freepik.highlights[0]?.es).toMatch(/sistema de diseño, accesibilidad/);
    expect(freepik.highlights[0]?.en).toMatch(/design system, accessibility/);
    expect(freepik.highlights[1]?.es).toMatch(/procesos asíncronos/);
    expect(freepik.highlights[1]?.en).toMatch(/asynchronous workflows/);
    expect(freepik.highlights[2]?.es).toMatch(/Claude Code, skills y commands/);
    expect(freepik.highlights[2]?.en).toMatch(/Claude Code, skills & commands/);
  });

  it('keeps legacy jQuery/AJAX out of top-level Core Tech & Skills while preserving historical healthcare experience', () => {
    // Profile narrative & core tech bullets in both locales
    expect(profile.summary.paragraphs.es.join(' ')).toMatch(/HIS\/EHR/);
    expect(profile.summary.paragraphs.en.join(' ')).toMatch(/HIS\/EHR/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/HTML5, CSS3/);
    expect(profile.summary.coreTechBullets[0]?.value.es).toMatch(/Java\b/);
    expect(profile.summary.coreTechBullets[2]?.value.es).toMatch(
      /HL7 \(V2, V3 Infobuttons, FHIR\)/,
    );
    expect(profile.summary.coreTechBullets[2]?.value.en).toMatch(
      /HL7 \(V2, V3 Infobuttons, FHIR\)/,
    );
    expect(profile.summary.coreTechBullets[3]?.value.es).not.toMatch(/jQuery|AJAX/i);
    expect(profile.summary.coreTechBullets[3]?.value.en).not.toMatch(/jQuery|AJAX/i);
    expect(profile.summary.coreTechBullets[3]?.value.es).toMatch(/Testing Library/);
    expect(profile.summary.coreTechBullets[3]?.value.es).toMatch(/OpenSearch \/ Kibana/);

    // Fares Taie CDSS + HL7 FHIR & V3 Infobuttons + Java (Spring + Hibernate)/REST + relational data modeling
    const faresTaie = experience.find((e) => e.id === 'fares-taie')!;
    expect(faresTaie.highlights[0]?.es).toMatch(/HL7 FHIR y HL7 V3 Infobuttons/);
    expect(faresTaie.highlights[0]?.en).toMatch(/HL7 FHIR and HL7 V3 Infobuttons/);
    expect(faresTaie.highlights[1]?.es).toMatch(/modelado de datos relacional/);
    expect(faresTaie.highlights[1]?.es).toMatch(/APIs RESTful/);
    expect(faresTaie.highlights[1]?.es).toMatch(/Java \(Spring \+ Hibernate\)/);
    expect(faresTaie.highlights[1]?.en).toMatch(/RESTful APIs/);
    expect(faresTaie.highlights[1]?.en).toMatch(/Java \(Spring \+ Hibernate\)/);

    // Municipalidad HIS relational data modeling, presentation & Doctrine ORM
    const muni = experience.find((e) => e.id === 'municipalidad-general-pueyrredon')!;
    expect(muni.highlights[0]?.es).toMatch(/modelado de datos relacional/);
    expect(muni.highlights[2]?.es).toMatch(/HTML5, CSS, Bootstrap, JavaScript, jQuery, AJAX/);
    expect(muni.highlights[2]?.es).toMatch(/Doctrine ORM/);
    expect(muni.highlights[2]?.en).toMatch(/HTML5, CSS, Bootstrap, JavaScript, jQuery, AJAX/);
    expect(muni.highlights[2]?.en).toMatch(/Doctrine ORM/);

    // Skills pills visibility
    const names = skills.map((s) => s.name);
    expect(names).toContain('HTML5 / CSS3 (Semantic HTML, DOM)');
    expect(names.some((name) => /jQuery|AJAX/i.test(name))).toBe(false);
    expect(names).toContain('REST APIs, Hexagonal Arch. & ORMs');
    expect(names).toContain('HL7 (V2 / V3 / FHIR) & Healthcare IT');
    expect(names).toContain('Observability (OpenSearch / Kibana)');
    expect(names).toContain('Vitest / Jest / Testing Library / PHPUnit');
    expect(names).toContain('Tailwind CSS / Bootstrap');
  });

  it('keeps skill pills and English experience copy free of untranslated Spanish terms and consistent in metric/role formatting', () => {
    for (const skill of skills) {
      expect(skill.name).not.toMatch(/Arq\.|Metodologías|Ágiles/i);
    }
    const freepik = experience.find((e) => e.id === 'freepik')!;
    expect(freepik.summary.en).toMatch(/2M\+ users, 1M\+ active subscribers, and 1,000\+ PRs/);
    const accelone = experience.find((e) => e.id === 'accelone')!;
    expect(accelone.role.en).toBe('Senior Full-Stack / Frontend Developer');
  });
});
