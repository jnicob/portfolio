import { experienceEntrySchema, type ExperienceEntry } from './schemas';

const entries = [
  {
    id: 'freepik',
    company: 'Freepik/Magnific',
    role: {
      es: 'Senior FullStack / Frontend Developer',
      en: 'Senior FullStack / Frontend Developer',
    },
    start: '2022-07',
    end: '2026-07',
    summary: {
      es: 'Plataforma pública para desarrolladores y clientes enterprise que monetiza y expone el catálogo de APIs de IA y stock de Freepik/Magnific. Desarrollo full-stack de la web, panel de control, servicios y backoffice.',
      en: "Public platform for developers and enterprise clients monetizing and exposing Freepik/Magnific's AI and stock API catalog. Full-stack development across web landings, developer dashboard, API services, and backoffice.",
    },
    highlights: [
      {
        es: 'Catálogo multimodal con más de 40 modelos de IA y 350+ endpoints servidos en producción, soportando alto tráfico y procesamiento asíncrono.',
        en: 'Multimodal catalog serving 40+ AI models and 350+ endpoints in production, handling high traffic and asynchronous task workflows.',
      },
      {
        es: 'Automatización con agentes de IA: diseño del pipeline que traduce especificaciones OpenAPI a endpoints FastAPI, reglas de gateway (APISIX) y documentación interactiva, acelerando la integración de nuevos servicios.',
        en: 'AI agent automation: designed pipelines translating OpenAPI specs into FastAPI endpoints, APISIX gateway rules, and interactive docs, drastically speeding up service onboarding.',
      },
      {
        es: 'Liderazgo técnico práctico: definición de estándares de API (OpenAPI), revisión de código (PRs) con foco en calidad/testing y desarrollo del Playground interactivo y portal de facturación/uso.',
        en: 'Pragmatic tech leadership: defined OpenAPI standards, conducted rigorous PR code reviews focused on quality/testing, and built the interactive API Playground and billing/usage dashboard.',
      },
      {
        es: 'Más de 1.000 PRs entregados en producción con alta cobertura de tests para asegurar la estabilidad de servicios y backoffice de contenidos (Freepik/Flaticon).',
        en: '1,000+ PRs delivered to production with comprehensive automated test coverage ensuring reliability across core services and backoffice systems.',
      },
    ],
    tags: ['python', 'fastapi', 'openapi', 'apisix', 'nextjs', 'vue', 'ai'],
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
    tags: ['react', 'nextjs', 'nodejs', 'express', 'postgresql'],
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
    tags: ['php', 'embedded', 'arduino', 'project-management'],
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
    tags: ['php', 'laravel', 'mysql', 'hl7', 'healthcare-it'],
  },
];

export const experience: ExperienceEntry[] = entries.map((e) => experienceEntrySchema.parse(e));
