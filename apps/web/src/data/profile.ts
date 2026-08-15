import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero en Informática - desarrollador web full-stack',
    en: 'Computer Engineer - full-stack web developer',
  },
  summary: {
    es: `Ingeniero en Informática con más de 15 años de experiencia en análisis, arquitectura y desarrollo de software full-stack. He trabajado en soluciones para empresas y proyectos de España, EE. UU. y Latinoamérica, abarcando plataformas web a medida, servicios de API, e-commerce, sistemas de gestión, citas, historias clínicas e interoperabilidad en salud.

Aplico e integro activamente flujos de trabajo con Agentes de IA y skills especializadas para la automatización de especificaciones, desarrollo guiado y reglas de negocio. Experiencia trabajando en equipos multidisciplinarios, distribuidos y remotos.

Core Tech & Dominio:
• Lenguajes & Frameworks: TypeScript, JavaScript, Node.js, React / Next.js, Vue 2/3, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI).
• AI & API Platform: API Gateways (APISIX), Orquestación de Agentes de IA (Claude, Codex, Gemini), OpenAPI, automatización con skills.
• Datos & Middleware: PostgreSQL, MySQL, SQL Server, RESTful APIs, Mirth Connect, HL7, SNOMED CT.
• Tooling & Calidad: Tailwind CSS, Vitest / Jest, PHPUnit, Git, Docker, CI/CD.
• Arquitectura & Prácticas: TDD, SOLID, Clean Code, patrones de diseño (MVC, DDD), metodologías ágiles.
`,
    en: `Computer Engineer with 15+ years of experience in software analysis, architecture, and full-stack development. Worked on solutions for companies and projects across Spain, the US, and Latin America, covering custom web platforms, API services, e-commerce, management systems, appointment scheduling, EHR/clinical records, and healthcare interoperability.

Actively integrating AI Agent workflows and custom skills to automate specifications, code generation, and business rules. Proven experience collaborating in multidisciplinary, distributed, and remote teams.

Core Tech & Expertise:
• Languages & Frameworks: TypeScript, JavaScript, Node.js, React / Next.js, Vue 2/3, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI).
• AI & API Platform: API Gateways (APISIX), AI Agent Orchestration (Claude, Codex, Gemini), OpenAPI, custom skill automation.
• Data & Middleware: PostgreSQL, MySQL, SQL Server, RESTful APIs, Mirth Connect, HL7, SNOMED CT.
• Tooling & Quality: Tailwind CSS, Vitest / Jest, PHPUnit, Git, Docker, CI/CD.
• Architecture & Practices: TDD, SOLID, Clean Code, design patterns (MVC, DDD), agile methodologies.
`,
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    website: 'https://jnicob.dev',
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
