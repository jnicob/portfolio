import { experienceEntrySchema, type ExperienceEntry } from './schemas';

const entries = [
  {
    id: 'freepik',
    company: 'Freepik',
    role: {
      es: 'Ingeniero full-stack — plataforma de APIs',
      en: 'Full-stack engineer — API platform',
    },
    start: '2022-07',
    end: null,
    summary: {
      es: 'Plataforma pública de APIs de Freepik/Magnific (IA, stock, estado de tareas) y su web: specs, servidor, gateway, facturación, documentación, Playground y panel de desarrollador. Antes, backoffice de contenido y colaboradores.',
      en: 'Freepik/Magnific public API platform (AI, stock, task status) and its web: specs, server, gateway, billing, documentation, Playground and developer dashboard. Previously, content and contributor backoffice.',
    },
    highlights: [
      {
        es: 'Más de 1.000 PRs entre GitHub y Bitbucket en el ecosistema de la plataforma y el backoffice.',
        en: '1,000+ PRs across GitHub and Bitbucket in the platform and backoffice ecosystem.',
      },
      {
        es: 'APIs públicas de generación de IA, stock y estado de tareas: del spec OpenAPI a producción (FastAPI, gateway APISIX, docs), incluida Flows API para encadenar modelos.',
        en: 'Public AI generation, stock and task-status APIs: from OpenAPI spec to production (FastAPI, APISIX gateway, docs), including the Flows API for chaining models.',
      },
      {
        es: 'Onboarding end-to-end de modelos de IA (Kling, WAN…): precios, límites, implementación y documentación.',
        en: 'End-to-end AI model onboarding (Kling, WAN…): pricing, limits, implementation and documentation.',
      },
      {
        es: 'Playground web de la API y panel de desarrollador (uso, presupuesto, límites, facturación y API keys).',
        en: 'API web Playground and developer dashboard (usage, budget, limits, billing and API keys).',
      },
      {
        es: 'Backoffice de contenido Freepik/Flaticon: catalogación, moderación, workflow de producción y portal fiscal (Laravel/Nova, Vue, Slim).',
        en: 'Freepik/Flaticon content backoffice: cataloguing, moderation, production workflow and tax portal (Laravel/Nova, Vue, Slim).',
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
      es: 'Consultora de desarrollo de software: frontend y fullstack para varios clientes de EE. UU.',
      en: 'Software development consultancy: frontend and full-stack work for several US-based clients.',
    },
    highlights: [
      {
        es: 'Cadi: plataforma e-commerce de artículos de golf. React / Next.js / Material UI con servicios REST en Node.js / Express / PostgreSQL / Sequelize / Swell.',
        en: 'Cadi: golf e-commerce platform. React / Next.js / Material UI with REST services in Node.js / Express / PostgreSQL / Sequelize / Swell.',
      },
      {
        es: 'GDS: plataforma de gestión y soporte de acciones operativas en puntos de venta. React / Material UI con Node.js / Express / SQL Server.',
        en: 'GDS: management and support platform for point-of-sale operations. React / Material UI with Node.js / Express / SQL Server.',
      },
      {
        es: 'Candidate Viewer: plataforma de gestión de candidatos. React / Material UI con Node.js / Express / MySQL / Sequelize.',
        en: 'Candidate Viewer: job-candidate management platform. React / Material UI with Node.js / Express / MySQL / Sequelize.',
      },
      {
        es: 'DevelopIntelligence: app para que instructores gestionen cursos y disponibilidad, con Lightning Component y Aura de Salesforce.',
        en: 'DevelopIntelligence: app for instructors to manage courses and availability, built with Salesforce Lightning Component and Aura.',
      },
    ],
    tags: ['react', 'nextjs', 'nodejs', 'express', 'postgresql'],
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
    id: 'municipalidad-general-pueyrredon',
    company: 'Municipalidad de General Pueyrredon',
    role: {
      es: 'Analista Programador Full-Stack',
      en: 'Full-Stack Analyst Programmer',
    },
    start: '2012-07',
    end: '2021-03',
    summary: {
      es: 'Análisis, diseño, desarrollo e implementación del Sistema de Gestión Hospitalaria Municipal (HIS).',
      en: 'Analysis, design, development and implementation of the Municipal Hospital Information System (HIS).',
    },
    highlights: [
      {
        es: 'Electronic Health Record (EHR) y mensajería HL7 V2 (ADT, OML, ORL, ORU) con Mirth Connect; Master Patient Index (MPI) y Health Information Exchange (HIE).',
        en: 'Electronic Health Record (EHR) and HL7 V2 messaging (ADT, OML, ORL, ORU) with Mirth Connect; Master Patient Index (MPI) and Health Information Exchange (HIE).',
      },
      {
        es: 'Interfaces de comunicación con otros sistemas clínicos (RIS, LIS) y de georreferenciación (GIS).',
        en: 'Communication interfaces with other clinical (RIS, LIS) and geo-referencing (GIS) systems.',
      },
      {
        es: 'Stack: PHP / CodeIgniter / Doctrine ORM, RESTful API, MySQL / SQL Server.',
        en: 'Stack: PHP / CodeIgniter / Doctrine ORM, RESTful API, MySQL / SQL Server.',
      },
    ],
    tags: ['php', 'codeigniter', 'hl7', 'healthcare-it', 'mysql'],
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
      es: 'Desarrollo, administración y consultoría de sistemas de gestión del conocimiento y soporte a la toma de decisiones en salud.',
      en: 'Development, administration and consulting for knowledge-management and decision-support systems in healthcare.',
    },
    highlights: [
      {
        es: 'HL7 Infobuttons e interoperabilidad con vocabulario médico controlado (SNOMED CT, LOINC, CIE-10) y un Clinical Decision Support System (CDSS).',
        en: 'HL7 Infobuttons and interoperability with controlled medical vocabularies (SNOMED CT, LOINC, ICD-10) and a Clinical Decision Support System (CDSS).',
      },
      {
        es: 'Stack: PHP / Laravel / WordPress, JavaScript / React / jQuery, RESTful API, PHPUnit / Jest.',
        en: 'Stack: PHP / Laravel / WordPress, JavaScript / React / jQuery, RESTful API, PHPUnit / Jest.',
      },
      {
        es: 'Administración de servidores Linux Debian con Apache y virtualización Xen.',
        en: 'Server administration on Linux Debian with Apache and Xen virtualization.',
      },
    ],
    tags: ['php', 'laravel', 'mysql', 'hl7', 'healthcare-it'],
  },
];

export const experience: ExperienceEntry[] = entries.map((e) => experienceEntrySchema.parse(e));
