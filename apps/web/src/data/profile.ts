import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  fullName: {
    es: 'Juan Nicolás Behm',
    en: 'Juan Nicolas Behm',
  },
  headline: {
    es: 'Senior Full-Stack & AI Engineer | Analista Funcional Técnico — TypeScript, React/Next.js, Node.js, Python, PHP, APIs & Cloud',
    en: 'Senior Full-Stack & AI Engineer | Technical Functional Analyst — TypeScript, React/Next.js, Node.js, Python, PHP, APIs & Cloud',
  },
  summary: {
    paragraphs: {
      es: [
        'Ingeniero en Informática con más de 15 años de trayectoria diseñando, evolucionando y construyendo soluciones de software de extremo a extremo: desde interfaces web modernas, sistemas de gestión hospitalaria (HIS/EHR) y backoffices transaccionales hasta arquitecturas de microservicios y plataformas de APIs REST distribuidas en la nube (+2M de usuarios y +350 endpoints en producción).',
        'Aporto valor uniendo mentalidad de producto y análisis funcional (traduciendo requerimientos de negocio en especificaciones robustas y contratos de APIs) con un riguroso estándar de ingeniería (TDD, SOLID, Clean Code, seguridad, observabilidad y rendimiento). Además, integro agentes de IA para acelerar el ciclo de desarrollo y asegurar testing, buenas prácticas y seguridad, sin comprometer la fiabilidad a largo plazo.',
      ],
      en: [
        'Computer Engineer with 15+ years of experience designing, building, and evolving end-to-end software solutions: from modern web interfaces, hospital information systems (HIS/EHR), and transactional backoffices to microservice architectures and distributed Cloud REST API platforms (2M+ users and 350+ production endpoints).',
        'I deliver value by pairing product thinking and functional analysis (translating business requirements into robust technical specifications and API contracts) with solid engineering standards (TDD, SOLID, Clean Code, security, observability, and performance). In addition, I leverage AI agents to accelerate development cycles and enforce testing, best practices, and security, while ensuring long-term system reliability.',
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
          es: 'JavaScript, TypeScript, HTML5, CSS3, React / Next.js (Hooks, React Query, Zustand, Redux), Vue, Node.js, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI), Java (Spring).',
          en: 'JavaScript, TypeScript, HTML5, CSS3, React / Next.js (Hooks, React Query, Zustand, Redux), Vue, Node.js, PHP (Laravel, CodeIgniter, WordPress), Python (FastAPI), Java (Spring).',
        },
      },
      {
        label: { es: 'AI & API Platform', en: 'AI & API Platform' },
        value: {
          es: 'API Gateways (APISIX), OpenAPI, Auth & RBAC, Orquestación de Agentes de IA (Claude Code, Codex, Gemini), Spec-Driven Development (SDD), automatización con skills y commands.',
          en: 'API Gateways (APISIX), OpenAPI, Auth & RBAC, AI Agent Orchestration (Claude Code, Codex, Gemini), Spec-Driven Development (SDD), custom skills and commands automation.',
        },
      },
      {
        label: { es: 'Datos & Middleware', en: 'Data & Middleware' },
        value: {
          es: 'SQL (PostgreSQL, MySQL, MariaDB, SQL Server), NoSQL (MongoDB, Redis), ERD, ORMs (Eloquent, Doctrine, Prisma, Drizzle, Hibernate), APIs RESTful, HL7 (V2, V3 Infobuttons, FHIR), Mirth Connect, CDSS, SNOMED CT, LOINC, CIE-10.',
          en: 'SQL (PostgreSQL, MySQL, MariaDB, SQL Server), NoSQL (MongoDB, Redis), ERD, ORMs (Eloquent, Doctrine, Prisma, Drizzle, Hibernate), RESTful APIs, HL7 (V2, V3 Infobuttons, FHIR), Mirth Connect, CDSS, SNOMED CT, LOINC, ICD-10.',
        },
      },
      {
        label: { es: 'Tooling & Calidad', en: 'Tooling & Quality' },
        value: {
          es: 'Tailwind CSS, Bootstrap, AJAX / jQuery, DOM, Vitest / Jest, PHPUnit, Git, Docker, CI/CD, GCP, OpenSearch / Kibana.',
          en: 'Tailwind CSS, Bootstrap, AJAX / jQuery, DOM, Vitest / Jest, PHPUnit, Git, Docker, CI/CD, GCP, OpenSearch / Kibana.',
        },
      },
      {
        label: { es: 'Arquitectura & Prácticas', en: 'Architecture & Practices' },
        value: {
          es: 'TDD, SOLID, Clean Code, Microservicios, Arq. Hexagonal, MVC, DDD, sistema de diseño, accesibilidad (WCAG), SCRUM.',
          en: 'TDD, SOLID, Clean Code, Microservices, Hexagonal Architecture, MVC, DDD, design system, accessibility (WCAG), SCRUM.',
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
