import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  fullName: {
    es: 'Juan Nicolás Behm',
    en: 'Juan Nicolas Behm',
  },
  headline: {
    es: 'Full-Stack Engineer | Analista Funcional Técnico — Web, Microservicios, APIs, Cloud & AI dev',
    en: 'Full-Stack Engineer | Technical Functional Analyst — Web, Microservices, APIs, Cloud & AI dev',
  },
  summary: {
    paragraphs: {
      es: [
        'Ingeniero en Informática con más de 15 años de trayectoria diseñando, evolucionando y construyendo soluciones de software de extremo a extremo: desde interfaces web modernas y sistemas de backoffice transaccionales hasta arquitecturas de microservicios y plataformas de APIs distribuidas en la nube.',
        'Aporto valor uniendo mentalidad de producto y análisis funcional (traduciendo requerimientos de negocio en especificaciones robustas y contratos de APIs) con un riguroso estándar de ingeniería (TDD, Clean Code, seguridad, observabilidad y rendimiento). Además, integro agentes de IA para acelerar el ciclo de desarrollo sin comprometer la fiabilidad a largo plazo.',
      ],
      en: [
        'Computer Engineer with 15+ years of experience designing, building, and evolving end-to-end software solutions: from modern web interfaces and transactional backoffice systems to microservice architectures and distributed Cloud API platforms.',
        'I deliver value by pairing product thinking and functional analysis (translating business requirements into robust technical specifications and API contracts) with solid engineering standards (TDD, Clean Code, security, observability, and performance). In addition, I leverage AI agents to accelerate development cycles while ensuring long-term system reliability.',
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
