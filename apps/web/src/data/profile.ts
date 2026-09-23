import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  fullName: {
    es: 'Juan Nicolás Behm',
    en: 'Juan Nicolas Behm',
  },
  headline: {
    es: 'Ingeniero en Informática - desarrollador web full-stack',
    en: 'Computer Engineer - full-stack web developer',
  },
  summary: {
    paragraphs: {
      es: [
        'Ingeniero en Informática con más de 15 años construyendo productos digitales completos, desde interfaces web modernas y accesibles hasta arquitecturas de microservicios y APIs distribuidas. Experiencia en equipos internacionales resolviendo retos de integración de servicios, interoperabilidad de datos y modernización de sistemas.',
        'Aporto valor uniendo el rigor de ingeniería (rendimiento, observabilidad, seguridad, testing y buenas prácticas / Clean Code) con la aceleración que ofrecen los agentes de IA para entregar software robusto y mantenible en plazos reducidos.',
      ],
      en: [
        'Computer Engineer with 15+ years of experience building end-to-end digital products, from modern, accessible web interfaces to microservices and distributed API platforms. Proven track record across international teams solving service integration, data interoperability, and system modernization challenges.',
        'I deliver value by pairing solid engineering practices (performance, observability, security, automated testing, and Clean Code) with AI agent workflows to build robust, maintainable software at high velocity.',
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
          es: 'TypeScript, JavaScript, Node.js, React / Next.js, Vue, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI).',
          en: 'TypeScript, JavaScript, Node.js, React / Next.js, Vue, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI).',
        },
      },
      {
        label: { es: 'AI & API Platform', en: 'AI & API Platform' },
        value: {
          es: 'API Gateways (APISIX), Orquestación de Agentes de IA (Claude, Codex, Gemini), OpenAPI, automatización con skills.',
          en: 'API Gateways (APISIX), AI Agent Orchestration (Claude, Codex, Gemini), OpenAPI, custom skill automation.',
        },
      },
      {
        label: { es: 'Datos & Middleware', en: 'Data & Middleware' },
        value: {
          es: 'SQL (PostgreSQL, MySQL, SQL Server), NoSQL (MongoDB, Redis), ORMs (Eloquent, Doctrine, Prisma), RESTful APIs, Mirth Connect, HL7, SNOMED CT.',
          en: 'SQL (PostgreSQL, MySQL, SQL Server), NoSQL (MongoDB, Redis), ORMs (Eloquent, Doctrine, Prisma), RESTful APIs, Mirth Connect, HL7, SNOMED CT.',
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
