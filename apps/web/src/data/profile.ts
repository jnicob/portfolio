import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  fullName: {
    es: 'Juan Nicolás Behm',
    en: 'Juan Nicolas Behm',
  },
  headline: {
    es: 'Senior Frontend Engineer · Full-Stack & AI Engineer · Analista Técnico — TypeScript, React/Next.js, Vue, Node.js & AI Agents',
    en: 'Senior Frontend Engineer · Full-Stack & AI Engineer · Technical Analyst — TypeScript, React/Next.js, Vue, Node.js & AI Agents',
  },
  summary: {
    paragraphs: {
      es: [
        'Ingeniero en Informática con +15 años diseñando y construyendo soluciones de software para clientes de España, EE. UU. y Latinoamérica: desde interfaces web de alto tráfico, sistemas de diseño y plataformas SaaS/e-commerce hasta backoffices transaccionales, sistemas críticos de salud (HIS/EHR) y plataformas de microservicios, APIs e IA en la nube (+2M de usuarios y +350 endpoints).',
        'Aporto valor uniendo mentalidad de producto y análisis funcional con un riguroso estándar de ingeniería (TDD, Clean Code, accesibilidad, observabilidad y rendimiento). Integro agentes de IA (Claude Code, Codex, MCPs) para automatizar procesos y acelerar entregas, garantizando testing y seguridad sin comprometer la fiabilidad del producto.',
      ],
      en: [
        'Computer Engineer with 15+ years designing and building software solutions for clients across Spain, the US, and Latin America: from high-traffic web interfaces, design systems, and SaaS/e-commerce platforms to transactional backoffices, mission-critical healthcare systems (HIS/EHR), and cloud microservices, API & AI platforms (2M+ users and 350+ endpoints).',
        'I deliver value by combining product mindset and functional analysis with rigorous engineering standards (TDD, Clean Code, accessibility, observability, and performance). I integrate AI agents (Claude Code, Codex, MCPs) to automate workflows and accelerate delivery while ensuring testing and security without compromising product reliability.',
      ],
    },
    coreTechTitle: {
      es: 'Core Tech & Dominio:',
      en: 'Core Tech & Expertise:',
    },
    coreTechBullets: [
      {
        label: { es: 'Lenguajes & Frameworks', en: 'Languages & Frameworks' },
        value: {
          es: 'JavaScript, TypeScript, React / Next.js (Hooks, TanStack Query, Zustand, Jotai, Redux), Vue 2/3, Node.js (Express), HTML5, CSS3, PHP (Laravel, CodeIgniter), Python (FastAPI), Java (Spring).',
          en: 'JavaScript, TypeScript, React / Next.js (Hooks, TanStack Query, Zustand, Jotai, Redux), Vue 2/3, Node.js (Express), HTML5, CSS3, PHP (Laravel, CodeIgniter), Python (FastAPI), Java (Spring).',
        },
      },
      {
        label: { es: 'AI & API Platform', en: 'AI & API Platform' },
        value: {
          es: 'LLMs e IA Generativa, sistemas multiagente, Model Context Protocol (MCP), subagentes y automatización (Claude Code, Codex, Gemini), SDD, skills y commands, API Gateways (APISIX), OpenAPI, Auth & RBAC.',
          en: 'LLMs & Generative AI, multi-agent systems, Model Context Protocol (MCP), subagents & automation (Claude Code, Codex, Gemini), SDD, custom skills and commands, API Gateways (APISIX), OpenAPI, Auth & RBAC.',
        },
      },
      {
        label: { es: 'Datos & Middleware', en: 'Data & Middleware' },
        value: {
          es: 'SQL (PostgreSQL, MySQL, MariaDB, SQL Server), NoSQL (MongoDB, Redis), ERD, ORMs (Drizzle, Prisma, Eloquent, Doctrine, Hibernate), APIs RESTful, HL7 (V2, V3 Infobuttons, FHIR), Mirth Connect, CDSS, SNOMED CT, LOINC, CIE-10.',
          en: 'SQL (PostgreSQL, MySQL, MariaDB, SQL Server), NoSQL (MongoDB, Redis), ERD, ORMs (Drizzle, Prisma, Eloquent, Doctrine, Hibernate), RESTful APIs, HL7 (V2, V3 Infobuttons, FHIR), Mirth Connect, CDSS, SNOMED CT, LOINC, ICD-10.',
        },
      },
      {
        label: { es: 'Tooling & Calidad', en: 'Tooling & Quality' },
        value: {
          es: 'Tailwind CSS, Radix UI, Bootstrap, Vitest / Jest, Testing Library, PHPUnit, Git, Docker, Kubernetes, CI/CD (GitHub Actions), GCP, OpenSearch / Kibana.',
          en: 'Tailwind CSS, Radix UI, Bootstrap, Vitest / Jest, Testing Library, PHPUnit, Git, Docker, Kubernetes, CI/CD (GitHub Actions), GCP, OpenSearch / Kibana.',
        },
      },
      {
        label: { es: 'Arquitectura & Prácticas', en: 'Architecture & Practices' },
        value: {
          es: 'TDD, SOLID, Clean Code, Design Systems, accesibilidad (WCAG AA), SEO técnico (SSR/SSG, Core Web Vitals), Microservicios, Arq. Hexagonal, MVC, DDD, SCRUM.',
          en: 'TDD, SOLID, Clean Code, Design Systems, accessibility (WCAG AA), Technical SEO (SSR/SSG, Core Web Vitals), Microservices, Hexagonal Arch., MVC, DDD, SCRUM.',
        },
      },
    ],
  },
  location: { es: 'Almería, España', en: 'Almería, Spain' },
  links: {
    website: 'https://jnicob.dev',
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
