import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero en Informática - desarrollador web full-stack',
    en: 'Computer Engineer - full-stack web developer',
  },
  summary: {
    es: `Ingeniero en Informática con más de 15 años construyendo software full-stack en entornos diversos y de alta escala: plataformas públicas de APIs de IA, e-commerce, sistemas de salud e interoperabilidad HL7 y soluciones internacionales para clientes de EE. UU. y Latinoamérica.

Perfil de punta a punta: desde la especificación OpenAPI, arquitectura backend y gateways de APIs hasta el frontend, la documentación y el ciclo completo de producto. Pionero en la integración y orquestación de sistemas basados en Agentes de IA para automatización de specs, código y reglas de negocio, acumulando más de 1.000 PRs en los últimos cuatro años. Experiencia trabajando en equipos multidisciplinarios y remotos.

Core Tech & Dominio:
• Lenguajes & Frameworks: TypeScript, JavaScript (ES2024), Python (FastAPI), PHP (Laravel, CodeIgniter), Node.js (Express), React / Next.js, Vue 2/3.
• AI & API Platform: OpenAPI, Gateway APISIX (rate limits, billing/credits, API keys), Orquestación de Agentes de IA (Claude, Codex, Gemini).
• Data & Middleware: MySQL, SQL Server, PostgreSQL, RESTful APIs, Mirth Connect, HL7 V2, SNOMED CT.
• Tooling & CSS: Tailwind CSS, Jest, PHPUnit, Git, Docker, CI/CD plataform, Linux, Apache.
`,
    en: `Computer Engineer with 15+ years of experience building full-stack software across diverse and high-scale environments: public AI API platforms, e-commerce, healthcare & HL7 interoperability systems, and international products for US and Latin American clients.

End-to-end profile: from OpenAPI specs, backend architecture, and API gateways to frontend, documentation, and full product lifecycle. Pioneer in orchestrating AI Agent systems to automate specs, code generation, and business rules, delivering 1,000+ PRs over the last four years. Experienced in multidisciplinary, remote, and distributed teams.

Core Tech & Expertise:
• Languages & Frameworks: TypeScript, JavaScript (ES2024), Python (FastAPI), PHP (Laravel, CodeIgniter), Node.js (Express), React / Next.js, Vue 2/3.
• AI & API Platform: OpenAPI, APISIX Gateway (rate limits, billing/credits, API keys), AI Agent Orchestration (Claude, Codex, Gemini).
• Data & Middleware: MySQL, SQL Server, PostgreSQL, RESTful APIs, Mirth Connect, HL7 V2, SNOMED CT.
• Tooling & Styling: Tailwind CSS, Jest, PHPUnit, Git, Docker, CI/CD plataform, Linux, Apache.
`,
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    website: 'https://jnicob.dev',
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
