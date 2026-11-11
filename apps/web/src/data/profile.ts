import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  fullName: {
    es: 'Juan Nicolás Behm',
    en: 'Juan Nicolas Behm',
  },
  headline: {
    es: 'Senior Full-Stack & AI Engineer | Analista Funcional Técnico — TypeScript, React/Next.js, Python/FastAPI, PHP/Laravel, APIs & Cloud',
    en: 'Senior Full-Stack & AI Engineer | Technical Functional Analyst — TypeScript, React/Next.js, Python/FastAPI, PHP/Laravel, APIs & Cloud',
  },
  summary: {
    paragraphs: {
      es: [
        'Ingeniero en Informática con más de 15 años de trayectoria diseñando, evolucionando y construyendo soluciones de software de extremo a extremo: desde interfaces web modernas y sistemas de backoffice transaccionales hasta arquitecturas de microservicios y plataformas de APIs distribuidas en la nube (+2M de usuarios y +350 endpoints en producción).',
        'Aporto valor uniendo mentalidad de producto y análisis funcional (traduciendo requerimientos de negocio en especificaciones robustas y contratos de APIs) con un riguroso estándar de ingeniería (TDD, Clean Code, seguridad, observabilidad y rendimiento). Además, integro agentes de IA para acelerar el ciclo de desarrollo y asegurar testing, buenas prácticas y seguridad, sin comprometer la fiabilidad a largo plazo.',
      ],
      en: [
        'Computer Engineer with 15+ years of experience designing, building, and evolving end-to-end software solutions: from modern web interfaces and transactional backoffice systems to microservice architectures and distributed Cloud API platforms (2M+ users and 350+ production endpoints).',
        'I deliver value by pairing product thinking and functional analysis (translating business requirements into robust technical specifications and API contracts) with solid engineering standards (TDD, Clean Code, security, observability, and performance). In addition, I leverage AI agents to accelerate development cycles and enforce testing, best practices, and security, while ensuring long-term system reliability.',
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
          es: 'JavaScript, TypeScript, React / Next.js (React Query, Zustand, Jotai, Redux, Context), Node.js, Vue, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI).',
          en: 'JavaScript, TypeScript, React / Next.js (React Query, Zustand, Jotai, Redux, Context), Node.js, Vue, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI).',
        },
      },
      {
        label: { es: 'AI & API Platform', en: 'AI & API Platform' },
        value: {
          es: 'API Gateways (APISIX), OpenAPI, Orquestación de Agentes de IA (Claude, Codex, Gemini), Spec-Driven Development (SDD), automatización con skills.',
          en: 'API Gateways (APISIX), OpenAPI, AI Agent Orchestration (Claude, Codex, Gemini), Spec-Driven Development (SDD), custom skill automation.',
        },
      },
      {
        label: { es: 'Datos & Middleware', en: 'Data & Middleware' },
        value: {
          es: 'SQL (PostgreSQL, MySQL, SQL Server), NoSQL (MongoDB, Redis), ORMs (Eloquent, Doctrine, Prisma, Drizzle), RESTful APIs, Mirth Connect, HL7, SNOMED CT.',
          en: 'SQL (PostgreSQL, MySQL, SQL Server), NoSQL (MongoDB, Redis), ORMs (Eloquent, Doctrine, Prisma, Drizzle), RESTful APIs, Mirth Connect, HL7, SNOMED CT.',
        },
      },
      {
        label: { es: 'Tooling & Calidad', en: 'Tooling & Quality' },
        value: {
          es: 'Tailwind CSS, Vitest / Jest, PHPUnit, Git, Docker, CI/CD.',
          en: 'Tailwind CSS, Vitest / Jest, PHPUnit, Git, Docker, CI/CD.',
        },
      },
      {
        label: { es: 'Arquitectura & Prácticas', en: 'Architecture & Practices' },
        value: {
          es: 'TDD, SOLID, Clean Code, patrones de diseño (MVC, DDD), metodologías ágiles.',
          en: 'TDD, SOLID, Clean Code, design patterns (MVC, DDD), agile methodologies.',
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
