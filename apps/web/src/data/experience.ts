import { experienceEntrySchema, type ExperienceEntry } from './schemas';

const entries = [
  {
    id: 'independent-consulting',
    company: 'Freelance',
    role: {
      es: 'Senior Full-Stack & AI Engineer',
      en: 'Senior Full-Stack & AI Engineer',
    },
    start: '2026-08',
    end: null,
    location: {
      es: 'Almería, España (Remoto)',
      en: 'Almería, Spain (Remote)',
    },
    summary: {
      es: 'Desarrollo end-to-end de productos web a medida con arquitecturas modernas (Next.js 16, React 19, TypeScript) y flujos guiados por IA.',
      en: 'End-to-end delivery of custom web products with modern architectures (Next.js 16, React 19, TypeScript) and AI-assisted spec-driven workflows.',
    },
    highlights: [
      {
        es: 'Lauquen Transporte (2026): modernización de un sistema legacy Access 97 a plataforma web de control de gastos de flota (combustible, peajes y mantenimiento) con migración ETL automatizada de +11.300 registros, RBAC, auditoría inmutable, reportes Excel y suite TDD (Vitest) en Next.js 16, React 19, TypeScript, Drizzle ORM y MySQL 8.0.',
        en: 'Lauquen Transporte (2026): modernization of a legacy Access 97 system into a fleet expense management web platform (fuel, tolls, and maintenance) featuring automated ETL migration of 11,300+ records, RBAC, immutable audit trail, Excel reporting, and a Vitest TDD suite in Next.js 16, React 19, TypeScript, Drizzle ORM, and MySQL 8.0.',
      },
      {
        es: 'Hotel Monte Cervino (2026): sitio web trilingüe de hotel orientado a reservas directas y SEO local en Next.js SSG, TypeScript y Tailwind CSS, con integración del motor de reservas Cloudbeds y CI/CD con GitHub Actions.',
        en: 'Hotel Monte Cervino (2026): trilingual hotel website built to drive direct bookings and local organic SEO in Next.js SSG, TypeScript, and Tailwind CSS, integrating the Cloudbeds booking engine and GitHub Actions CI/CD.',
      },
      {
        es: 'Manos Activas (2026): sitio web de terapia ocupacional con e-commerce de recursos digitales (pagos con Stripe API) y agenda de citas clínicas, desarrollado con specs y custom agent skills en React, TypeScript, Tailwind CSS, WordPress/PHP y Docker.',
        en: 'Manos Activas (2026): occupational therapy website with digital-resource e-commerce (Stripe API checkout) and clinical appointment scheduling, built with spec-driven AI workflows & custom skills in React, TypeScript, Tailwind CSS, WordPress/PHP, and Docker.',
      },
    ],
    tags: [
      'nextjs',
      'react',
      'typescript',
      'tailwind',
      'drizzle-orm',
      'mysql',
      'vitest',
      'stripe',
      'wordpress',
      'docker',
      'ai',
    ],
  },
  {
    id: 'freepik',
    company: 'Magnific (Freepik Company)',
    role: {
      es: 'Senior Full-Stack / Frontend & AI Engineer',
      en: 'Senior Full-Stack / Frontend & AI Engineer',
    },
    start: '2022-07',
    end: '2026-07',
    location: {
      es: 'Málaga, España (Remoto)',
      en: 'Málaga, Spain (Remote)',
    },
    summary: {
      es: 'Ecosistema de productos de IA y stock en magnific.com (+2M de usuarios, +1M de suscriptores activos y +1.000 PRs desplegadas en producción). Desarrollo frontend y full-stack abarcando múltiples proyectos: APIs de servicios de IA y stock, landings de producto de alto impacto y tráfico, playground interactivo, panel de estadísticas para APIs y proyectos de backoffice con Vue y PHP/Laravel (Freepik/Flaticon).',
      en: 'AI and creative stock product ecosystem at magnific.com (2M+ users, 1M+ active subscribers, and 1,000+ PRs shipped to production). Frontend and full-stack engineering across key initiatives: APIs for AI services and stock, high-impact product landings, interactive playground, API statistics dashboard, and backoffice projects with Vue and PHP/Laravel (Freepik/Flaticon).',
    },
    highlights: [
      {
        es: 'Webs y landings de alto impacto: desarrollo frontend para landings públicas de producto (APIs, generación y edición de imágenes/audio/video), sistema de diseño, accesibilidad, optimización de Core Web Vitals, SEO técnico, testing y puesta en producción. Playground interactivo para probar modelos desde el navegador, dashboards de consumo, límites, facturación y gestión de API keys (React, Next.js, TypeScript, TanStack Query (React Query), Zustand, Jotai).',
        en: 'High-impact web applications & landings: frontend development for public product landings (APIs, image/audio/video generation and editing), design system, accessibility, Core Web Vitals optimization, technical SEO, testing and production deployment. Interactive playground to test models from the browser, consumption dashboards, limits, billing and API key management (React, Next.js, TypeScript, TanStack Query (React Query), Zustand, Jotai).',
      },
      {
        es: 'Catálogo de IA Generativa multimodal y microservicios en GCP: integración y exposición de +40 modelos y +350 endpoints REST con FastAPI bajo DDD / arquitectura hexagonal y APISIX gateway (autenticación, autorización, caché Redis, rate-limiting y procesos asíncronos con alto tráfico).',
        en: 'Multimodal Generative AI catalog & microservices on GCP: integrating and serving 40+ models and 350+ REST endpoints with FastAPI under DDD / hexagonal architecture and APISIX gateway (authentication, authorization, Redis caching, rate-limiting, and asynchronous workflows under high traffic).',
      },
      {
        es: 'Automatización de procesos con sistemas multiagente (HITL) e integración de LLMs (Claude Code, skills y commands): pipelines para convertir especificaciones OpenAPI en endpoints FastAPI, reglas de gateway, configuración de precios/créditos, playground y documentación interactiva, reduciendo el tiempo de integración de nuevos modelos de días a horas.',
        en: 'Process automation with multi-agent systems (HITL) & LLM integration (Claude Code, skills & commands): pipelines converting OpenAPI specs into FastAPI endpoints, gateway rules, pricing/credits configuration, playground, and interactive documentation, cutting new model integration time from days to hours.',
      },
      {
        es: 'Backoffice, gestión de contenido y colaboradores (Freepik/Flaticon): ingeniería full-stack en Vue (TypeScript) y PHP/Laravel para moderación de activos digitales, control de accesos, colaboradores y portal fiscal.',
        en: 'Backoffice, content management and contributors (Freepik/Flaticon): full-stack engineering across Vue (TypeScript) and PHP/Laravel for digital asset moderation, access control, contributor management, and tax portal.',
      },
    ],
    tags: [
      'nextjs',
      'react',
      'typescript',
      'tanstack-query',
      'zustand',
      'jotai',
      'vue',
      'ai',
      'python',
      'fastapi',
      'openapi',
      'apisix',
      'redis',
      'laravel',
      'php',
    ],
  },
  {
    id: 'accelone',
    company: 'AccelOne',
    role: {
      es: 'Senior Full-Stack / Frontend Developer',
      en: 'Senior Full-Stack / Frontend Developer',
    },
    start: '2020-09',
    end: '2022-10',
    location: {
      es: 'EE. UU. (Remoto)',
      en: 'US (Remote)',
    },
    summary: {
      es: 'Desarrollo de plataformas SaaS y comercio electrónico a medida para clientes corporativos de EE. UU. y Latinoamérica.',
      en: 'Custom SaaS and e-commerce platform development for enterprise clients across the US and Latin America.',
    },
    highlights: [
      {
        es: 'Cadi: plataforma e-commerce de artículos de golf en React / Next.js / Context API / Material UI con pasarela de pago Stripe y servicios REST escalables en Node.js, Express y PostgreSQL.',
        en: 'Cadi: golf e-commerce platform built with React / Next.js / Context API / Material UI, Stripe payments, and scalable REST services in Node.js, Express, and PostgreSQL.',
      },
      {
        es: 'GDS: plataforma web para gestión operativa, seguimiento de stock y operaciones en puntos de venta en tiempo real (React, Redux, Node.js, SQL Server).',
        en: 'GDS: web platform for operational management, stock tracking, and point-of-sale operations in real time (React, Redux, Node.js, SQL Server).',
      },
      {
        es: 'Candidate Viewer: plataforma de evaluación y gestión de candidatos con control de autenticación y permisos (React, Node.js, Express, MySQL).',
        en: 'Candidate Viewer: job-candidate screening and talent management platform with authentication and permission control (React, Node.js, Express, MySQL).',
      },
      {
        es: 'DevelopIntelligence: aplicación para instructores y gestión de disponibilidad en cursos técnicos corporativos con Salesforce Lightning Components.',
        en: 'DevelopIntelligence: technical training course management and instructor scheduling app built with Salesforce Lightning Components.',
      },
    ],
    tags: [
      'react',
      'nextjs',
      'redux',
      'nodejs',
      'javascript',
      'express',
      'postgresql',
      'sql-server',
      'stripe',
      'salesforce',
    ],
  },
  {
    id: 'municipalidad-general-pueyrredon',
    company: 'Municipalidad de General Pueyrredon',
    role: {
      es: 'Analista Programador Full-Stack',
      en: 'Full-Stack Analyst Programmer',
    },
    start: '2012-07',
    end: '2021-03',
    location: {
      es: 'Argentina',
      en: 'Argentina',
    },
    summary: {
      es: 'Sistema de historia clínica electrónica y gestión hospitalaria (HIS) para la red municipal de salud pública (centros de salud y hospitales).',
      en: 'Electronic Health Record (EHR) and Hospital Information System (HIS) for the municipal public health network.',
    },
    highlights: [
      {
        es: 'Desarrollo del sistema de historia clínica electrónica (modelado de datos relacional, autenticación y control de acceso por rol), garantizando la trazabilidad médica de miles de pacientes.',
        en: 'Developed the digital health record system (relational data modeling, authentication, and role-based access control), ensuring medical traceability for thousands of patients.',
      },
      {
        es: 'Interoperabilidad clínica crítica: integración en tiempo real entre laboratorios (LIS), diagnóstico por imagen (RIS) y padrón de pacientes mediante estándares HL7 V2 y Mirth Connect.',
        en: 'Critical healthcare interoperability: real-time integration between laboratories (LIS), radiology (RIS), and patient registries via HL7 V2 and Mirth Connect.',
      },
      {
        es: 'Diseño, mantenimiento e integración de servicios web, APIs REST y capa de presentación (HTML5, CSS, Bootstrap, JavaScript, jQuery, AJAX) con PHP (CodeIgniter/Doctrine ORM) y MySQL/SQL Server.',
        en: 'Design, maintenance, and integration of web services, REST APIs, and presentation layer (HTML5, CSS, Bootstrap, JavaScript, jQuery, AJAX) with PHP (CodeIgniter/Doctrine ORM) and MySQL/SQL Server.',
      },
    ],
    tags: [
      'php',
      'javascript',
      'codeigniter',
      'hl7',
      'healthcare-it',
      'mysql',
      'sql-server',
      'doctrine',
      'mirth-connect',
    ],
  },
  {
    id: 'iac-internacional',
    company: 'IAC Internacional S.R.L.',
    role: {
      es: 'Líder de Proyecto / Analista Programador',
      en: 'Project Lead / Analyst Programmer',
    },
    start: '2013-05',
    end: '2017-12',
    location: {
      es: 'Argentina',
      en: 'Argentina',
    },
    summary: {
      es: 'I+D de un equipo de laboratorio automatizado (ELISA) financiado por créditos FONTAR, con gestión de proyecto y desarrollo de software embebido.',
      en: 'R&D of an automated laboratory device (ELISA) funded by FONTAR grants, covering project management and embedded software development.',
    },
    highlights: [
      {
        es: 'Proyectos financiados por FONTAR (ANR 800 C2 y 1600 2014 C1) para el procesamiento automatizado de muestras biológicas.',
        en: 'FONTAR-funded projects (ANR 800 C2 and 1600 2014 C1) for automated processing of biological samples.',
      },
      {
        es: 'Gestión de proyecto con SCRUM y equipo multidisciplinario, de diagnóstico a prototipo.',
        en: 'Project management with SCRUM and a multidisciplinary team, from diagnosis to prototype.',
      },
      {
        es: 'Stack: PHP, JavaScript / jQuery / AJAX, SQLite; hardware con Arduino y Raspberry Pi.',
        en: 'Stack: PHP, JavaScript / jQuery / AJAX, SQLite; hardware with Arduino and Raspberry Pi.',
      },
    ],
    tags: ['php', 'javascript', 'sqlite', 'embedded', 'arduino', 'project-management'],
  },
  {
    id: 'fares-taie',
    company: 'Laboratorio Fares Taie',
    role: {
      es: 'Líder de Proyecto / Backend Developer',
      en: 'Project Lead / Backend Developer',
    },
    start: '2007-07',
    end: '2021-04',
    location: {
      es: 'Argentina',
      en: 'Argentina',
    },
    summary: {
      es: 'Sistemas de información y soporte a la decisión clínica para laboratorios de análisis clínicos y empresas de salud.',
      en: 'Healthcare information and clinical decision support systems for laboratories and medical systems.',
    },
    highlights: [
      {
        es: 'Desarrollo de servicios de Soporte a la Toma de Decisiones Clínicas (CDSS) con HL7 FHIR y HL7 V3 Infobuttons, integrando vocabularios médicos controlados (SNOMED CT, LOINC, CIE-10).',
        en: 'Development of Clinical Decision Support Systems (CDSS) services using HL7 FHIR and HL7 V3 Infobuttons, integrating controlled medical vocabularies (SNOMED CT, LOINC, ICD-10).',
      },
      {
        es: 'Diseño, modelado de datos relacional e integración de APIs RESTful y autenticación con Java (Spring + Hibernate), PHP / Laravel, MySQL, JavaScript (AJAX / jQuery, DOM, Bootstrap) y servidores Linux.',
        en: 'Design, relational data modeling, and integration of RESTful APIs and authentication with Java (Spring + Hibernate), PHP / Laravel, MySQL, JavaScript (AJAX / jQuery, DOM, Bootstrap), and Linux servers.',
      },
    ],
    tags: [
      'php',
      'java',
      'javascript',
      'laravel',
      'mysql',
      'hl7',
      'fhir',
      'healthcare-it',
      'project-management',
    ],
  },
];

export const experience: ExperienceEntry[] = entries.map((e) => experienceEntrySchema.parse(e));
