import { experienceEntrySchema, type ExperienceEntry } from './schemas';

const entries = [
  {
    id: 'freepik',
    company: 'Magnific (Freepik Company)',
    role: {
      es: 'Senior FullStack / Frontend Developer',
      en: 'Senior FullStack / Frontend Developer',
    },
    start: '2022-07',
    end: '2026-07',
    location: {
      es: 'Málaga, España (Remoto)',
      en: 'Málaga, Spain (Remote)',
    },
    summary: {
      es: 'Ecosistema de productos de IA y stock en Magnific (www.magnific.com, anteriormente Freepik). Desarrollo frontend y full-stack abarcando múltiples proyectos: APIs de servicios de IA y stock, landings de producto de alto impacto y tráfico, Playground interactivo, panel de estadísticas para APIs y proyectos de backoffice (Freepik/Flaticon).',
      en: 'AI and creative stock product ecosystem at Magnific (www.magnific.com, formerly Freepik). Frontend and full-stack engineering across key initiatives: APIs for AI services and stock, high-impact product landings, interactive AI Playground, developer dashboard and statistics for APIs and backoffice tools (Freepik/Flaticon).',
    },
    highlights: [
      {
        es: 'Webs y landings de alto impacto: desarrollo frontend de landings públicas de producto (/api, generación y upscale de imágenes), optimización de Core Web Vitals, diseño responsive accesible y SEO técnico, junto con la creación del Playground interactivo y el dashboard de analíticas y consumo en tiempo real.',
        en: 'High-impact web applications & landings: frontend development for public product landings (/api, image generation and upscaler), Core Web Vitals optimization, responsive accessible design, and technical SEO, alongside the interactive AI Playground and real-time usage dashboard.',
      },
      {
        es: 'Catálogo multimodal de IA y arquitectura de servicios: monetización y exposición de más de 40 modelos de IA y 350+ endpoints en producción con FastAPI y APISIX gateway, optimizando tiempos de respuesta mediante caching distribuido (Redis), rate-limiting y procesamiento asíncrono para soportar alto tráfico.',
        en: 'Multimodal AI catalog & service architecture: monetizing and serving 40+ AI models and 350+ endpoints in production with FastAPI and APISIX gateway, minimizing response times through distributed caching (Redis), rate-limiting, and asynchronous workflows under high traffic.',
      },
      {
        es: 'Automatización con agentes de IA: diseño del pipeline que traduce especificaciones OpenAPI a endpoints FastAPI, reglas de gateway (APISIX) y documentación interactiva, acelerando la integración de nuevos servicios de IA.',
        en: 'AI agent automation: designed pipelines translating OpenAPI specs into FastAPI endpoints, APISIX gateway rules, and interactive docs, drastically speeding up new AI service onboarding.',
      },
      {
        es: 'Backoffice y operaciones de contenido (Freepik/Flaticon): desarrollo full-stack en PHP/Laravel y Vue para gestión, moderación y producción de activos digitales, con más de 1.000 PRs entregados en producción y rigurosa cobertura de tests.',
        en: 'Content backoffice & operations (Freepik/Flaticon): full-stack engineering across PHP/Laravel and Vue for digital asset moderation, cataloguing, and production, delivering 1,000+ PRs to production with high test coverage.',
      },
    ],
    tags: [
      'nextjs',
      'react',
      'vue',
      'typescript',
      'ai',
      'python',
      'fastapi',
      'openapi',
      'apisix',
      'redis',
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
        es: 'Cadi: plataforma e-commerce de artículos de golf en React / Next.js / Material UI con servicios REST escalables en Node.js, Express y PostgreSQL.',
        en: 'Cadi: golf e-commerce platform built with React / Next.js / Material UI and scalable REST services in Node.js, Express, and PostgreSQL.',
      },
      {
        es: 'GDS: plataforma web para gestión operativa, seguimiento de stock y operaciones en puntos de venta en tiempo real (React, Node.js, SQL Server).',
        en: 'GDS: web platform for operational management, stock tracking, and point-of-sale operations in real time (React, Node.js, SQL Server).',
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
    tags: ['react', 'nextjs', 'nodejs', 'express', 'postgresql', 'sql-server', 'salesforce'],
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
      es: 'Sistema central de historia clínica electrónica y gestión hospitalaria (HIS) para la red municipal de salud pública (centros de salud y hospitales).',
      en: 'Central Electronic Health Record (EHR) and Hospital Information System (HIS) for the municipal public health network.',
    },
    highlights: [
      {
        es: 'Desarrollo e implantación del sistema de historia clínica digital, garantizando la trazabilidad médica y atención de miles de pacientes en centros municipales.',
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
    tags: ['php', 'javascript', 'codeigniter', 'hl7', 'healthcare-it', 'mysql'],
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
    id: 'fares-taie-biotecnologia',
    company: 'Fares Taie Biotecnología',
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
      es: 'Sistemas de información y soporte a la decisión clínica para laboratorios de análisis clínicos e instituciones de salud.',
      en: 'Healthcare information and clinical decision support systems for laboratories and medical institutions.',
    },
    highlights: [
      {
        es: 'Integración de vocabularios médicos controlados (SNOMED CT, LOINC, CIE-10) y desarrollo de herramientas de ayuda al diagnóstico médico (CDSS).',
        en: 'Integration of controlled medical vocabularies (SNOMED CT, LOINC, ICD-10) and development of clinical decision support systems (CDSS).',
      },
      {
        es: 'Desarrollo de servicios web y APIs con PHP / Laravel y administración de servidores Linux Debian.',
        en: 'Web services and API development with PHP / Laravel, alongside Linux Debian server administration.',
      },
    ],
    tags: ['php', 'javascript', 'laravel', 'mysql', 'hl7', 'healthcare-it'],
  },
];

export const experience: ExperienceEntry[] = entries.map((e) => experienceEntrySchema.parse(e));
