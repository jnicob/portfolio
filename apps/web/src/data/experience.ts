import { experienceEntrySchema, type ExperienceEntry } from './schemas';

const entries = [
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
      en: 'AI and creative stock product ecosystem at magnific.com (+2M users, +1M active subscribers, and 1,000+ PRs shipped to production). Frontend and full-stack engineering across key initiatives: APIs for AI services and stock, high-impact product landings, interactive playground, API statistics dashboard, and backoffice projects with Vue and PHP/Laravel (Freepik/Flaticon).',
    },
    highlights: [
      {
        es: 'Webs y landings de alto impacto: desarrollo frontend de landings públicas de producto (APIs, generación y edición de imágenes/audio/video), optimización de Core Web Vitals, SEO técnico, testing y puesta en producción. Playground interactivo para probar modelos desde el navegador, dashboards de consumo, límites, facturación y gestión de API keys (React, Next.js, TypeScript, React Query, Zustand, Jotai).',
        en: 'High-impact web applications & landings: frontend development for public product landings (APIs, image/audio/video generation and editing), Core Web Vitals optimization, technical SEO, testing and production deployment. Interactive playground to test models from the browser, consumption dashboards, limits, billing and API key management (React, Next.js, TypeScript, React Query, Zustand, Jotai).',
      },
      {
        es: 'Catálogo multimodal de IA y arquitectura de servicios: exposición y monetización de más de 40 modelos de IA y más de 350 endpoints con FastAPI y APISIX gateway, reduciendo latencias mediante caché distribuida (Redis) y rate-limiting con alto tráfico.',
        en: 'Multimodal AI catalog & service architecture: monetizing and serving 40+ AI models and 350+ endpoints in production with FastAPI and APISIX gateway, minimizing response times through distributed caching (Redis), rate-limiting, and asynchronous workflows under high traffic.',
      },
      {
        es: 'Automatización con agentes de IA: pipelines para convertir especificaciones OpenAPI en endpoints FastAPI, reglas de gateway, configuración de precios/créditos, playground y documentación interactiva, reduciendo el tiempo de integración de nuevos modelos de días a minutos.',
        en: 'AI agent automation: pipelines converting OpenAPI specs into FastAPI endpoints, gateway rules, pricing/credits configuration, playground, and interactive documentation, cutting new model integration time from days to minutes.',
      },
      {
        es: 'Backoffice, gestión de contenido y colaboradores (Freepik/Flaticon): ingeniería full-stack en PHP/Laravel y JS/Vue para moderación y gestión de activos digitales, colaboradores y portal fiscal.',
        en: 'Backoffice, content management and contributors (Freepik/Flaticon): full-stack engineering across PHP/Laravel and JS/Vue for digital asset moderation, contributor management, and tax portal.',
      },
    ],
    tags: [
      'nextjs',
      'react',
      'typescript',
      'react-query',
      'zustand',
      'jotai',
      'vue',
      'ai',
      'javascript',
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
      es: 'Senior FullStack / Frontend Developer',
      en: 'Senior FullStack / Frontend Developer',
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
        es: 'Cadi: plataforma e-commerce de artículos de golf en React / Next.js / Context API / Material UI con servicios REST escalables en Node.js, Express y PostgreSQL.',
        en: 'Cadi: golf e-commerce platform built with React / Next.js / Context API / Material UI and scalable REST services in Node.js, Express, and PostgreSQL.',
      },
      {
        es: 'GDS: plataforma web para gestión operativa, seguimiento de stock y operaciones en puntos de venta en tiempo real (React, Redux, Node.js, SQL Server).',
        en: 'GDS: web platform for operational management, stock tracking, and point-of-sale operations in real time (React, Redux, Node.js, SQL Server).',
      },
      {
        es: 'Candidate Viewer: plataforma de evaluación y gestión de candidatos para procesos de selección (React, Node.js, Express, MySQL).',
        en: 'Candidate Viewer: job-candidate screening and talent management platform (React, Node.js, Express, MySQL).',
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
        es: 'Desarrollo e implantación del sistema de historia clínica electrónica, garantizando la trazabilidad médica y atención de miles de pacientes en centros municipales.',
        en: 'Developed and rolled out the digital health record system, ensuring medical traceability and care continuity for thousands of patients across municipal centers.',
      },
      {
        es: 'Interoperabilidad clínica crítica: integración en tiempo real entre laboratorios (LIS), diagnóstico por imagen (RIS) y padrón de pacientes mediante estándares HL7 V2 y Mirth Connect.',
        en: 'Critical healthcare interoperability: real-time integration between laboratories (LIS), radiology (RIS), and patient registries via HL7 V2 and Mirth Connect.',
      },
      {
        es: 'Servicios web y base de datos relacional de alta disponibilidad con PHP (CodeIgniter/Doctrine), JavaScript y MySQL/SQL Server.',
        en: 'High-availability web services and relational database architecture built with PHP (CodeIgniter/Doctrine), JavaScript, and MySQL/SQL Server.',
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
        es: 'Integración de vocabularios médicos controlados (SNOMED CT, LOINC, CIE-10) y desarrollo de herramientas de ayuda al diagnóstico médico (CDSS).',
        en: 'Integration of controlled medical vocabularies (SNOMED CT, LOINC, ICD-10) and development of clinical decision support systems (CDSS).',
      },
      {
        es: 'Desarrollo de servicios web y APIs con PHP / Laravel, Java y administración de servidores Linux.',
        en: 'Web services and API development with PHP / Laravel, Java and Linux server administration.',
      },
    ],
    tags: [
      'php',
      'java',
      'javascript',
      'laravel',
      'mysql',
      'hl7',
      'healthcare-it',
      'project-management',
    ],
  },
];

export const experience: ExperienceEntry[] = entries.map((e) => experienceEntrySchema.parse(e));
