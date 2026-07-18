import { projectSchema, type Project } from './schemas';

const entries = [
  // ——— Freepik/Magnific (2022-07 → 2026-07) ———
  {
    slug: 'freepik-api-platform',
    title: {
      es: 'Plataforma de APIs de Freepik/Magnific',
      en: 'Freepik/Magnific API Platform',
    },
    summary: {
      es: 'Diseño e implementación end-to-end de la plataforma pública de APIs de Freepik: generación de IA (imagen, vídeo, audio), stock, estado de tareas y cuenta. Especificación OpenAPI, servidor FastAPI, gateway APISIX (rate limits, costes, API keys), facturación y documentación pública.',
      en: "End-to-end design and implementation of Freepik's public API platform: AI generation (image, video, audio), stock content, task status and account APIs. OpenAPI specification, FastAPI server, APISIX gateway (rate limits, cost tracking, API keys), billing and public documentation.",
    },
    role: { es: 'Ingeniero de plataforma de APIs', en: 'API Platform Engineer' },
    stack: ['openapi', 'fastapi', 'python', 'apisix', 'rest-api'],
    links: {
      live: 'https://www.freepik.com/api',
      docs: 'https://docs.freepik.com',
    },
    metrics: [
      { label: { es: 'Modelos de IA servidos', en: 'AI models served' }, value: '25+' },
      { label: { es: 'Endpoints públicos', en: 'Public endpoints' }, value: '40+' },
    ],
    featured: true,
    caseStudy: true,
    date: '2022-07',
  },
  {
    slug: 'ai-model-onboarding',
    title: {
      es: 'Onboarding end-to-end de modelos de IA',
      en: 'End-to-end AI model onboarding',
    },
    summary: {
      es: 'Proceso repetible para llevar un modelo de IA (imagen/vídeo) desde la especificación OpenAPI hasta producción: precios, límites de uso, implementación en FastAPI, configuración de gateway y documentación pública. Aplicado a familias de modelos como Kling y WAN.',
      en: 'Repeatable process to take an AI (image/video) model from OpenAPI spec to production: pricing, rate limits, FastAPI implementation, gateway configuration and public documentation. Applied to model families such as Kling and WAN.',
    },
    role: {
      es: 'Ingeniero responsable del proceso de onboarding',
      en: 'Engineer owning the onboarding process',
    },
    stack: ['openapi', 'fastapi', 'python', 'apisix'],
    links: {
      docs: 'https://docs.freepik.com',
    },
    metrics: [
      {
        label: { es: 'Familias de modelos publicadas', en: 'Model families shipped' },
        value: 'Kling, WAN',
      },
      {
        label: { es: 'Endpoints por modelo', en: 'Endpoints per model' },
        value: '3 (create, list, get-by-id)',
      },
    ],
    featured: true,
    caseStudy: true,
    // Sin fecha de proyecto evidenciada públicamente: se usa el inicio de la etapa Freepik.
    date: '2022-07',
  },
  {
    slug: 'freepik-api-playground',
    title: { es: 'Playground de la web de la API de Freepik', en: 'Freepik API web Playground' },
    summary: {
      es: 'Consola interactiva para probar los modelos de la Freepik API desde el navegador: formularios generados desde la spec OpenAPI y validados con Zod, ejecución real con polling, visores por tipo de salida (imagen, vídeo, audio, before/after), ejemplos por modelo y gestión de API keys integrada.',
      en: 'Interactive console to try Freepik API models from the browser: forms generated from the OpenAPI spec and validated with Zod, real execution with polling, per-output viewers (image, video, audio, before/after), per-model examples and built-in API key management.',
    },
    role: {
      es: 'Ingeniero frontend — desarrollo y evolución del Playground',
      en: 'Frontend engineer — built and evolved the Playground',
    },
    stack: ['nextjs', 'react', 'typescript', 'zod', 'radix-ui'],
    links: { live: 'https://www.freepik.com/api' },
    metrics: [],
    featured: true,
    caseStudy: false,
    // Sin fecha pública evidenciada: inicio etapa Freepik.
    date: '2022-07',
  },
  {
    slug: 'freepik-developer-dashboard',
    title: {
      es: 'Panel de desarrollador de la API',
      en: 'API developer dashboard',
    },
    summary: {
      es: 'Dashboard del desarrollador de la Freepik API: uso y presupuesto con gráficos de consumo, límites de peticiones, facturación y gestión de API keys, incluidas reglas para miembros enterprise.',
      en: 'Freepik API developer dashboard: usage and budget with consumption charts, rate limits, billing and API key management, including enterprise member rules.',
    },
    role: { es: 'Ingeniero frontend', en: 'Frontend engineer' },
    stack: ['nextjs', 'react', 'typescript', 'react-query'],
    links: { live: 'https://www.freepik.com/api' },
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2022-07',
  },
  {
    slug: 'freepik-backoffice',
    title: {
      es: 'Backoffice de contenido Freepik/Flaticon',
      en: 'Freepik/Flaticon content backoffice',
    },
    summary: {
      es: 'Sistemas internos de gestión de recursos gráficos y colaboradores: revisión, catalogación, moderación y publicación (Laravel + Nova y admin histórico), workflow de tareas de producción de contenido (ilustración, vector, PSD, 3D, IA), gestión de packs de iconos de Flaticon, portal fiscal de colaboradores y extensiones Chrome de productividad interna.',
      en: 'Internal systems for managing graphic resources and contributors: review, cataloguing, moderation and publishing (Laravel + Nova and the legacy admin), content production task workflow (illustration, vector, PSD, 3D, AI), Flaticon icon-pack management, contributor tax portal and internal-productivity Chrome extensions.',
    },
    role: { es: 'Ingeniero full-stack', en: 'Full-stack engineer' },
    stack: ['php', 'laravel', 'vue', 'typescript', 'kubernetes'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2022-07',
  },
  // ——— AccelOne (2020-09 → 2022-10; fecha = inicio de etapa, sin evidencia por proyecto) ———
  {
    slug: 'cadi',
    title: { es: 'Cadi — e-commerce de golf', en: 'Cadi — golf e-commerce' },
    summary: {
      es: 'Plataforma e-commerce responsive de artículos de golf. Componentes reutilizables con React / Next.js / Material UI y servicios REST con Node.js / Express / PostgreSQL / Sequelize / Swell.',
      en: 'Responsive golf e-commerce platform. Reusable components with React / Next.js / Material UI and REST services with Node.js / Express / PostgreSQL / Sequelize / Swell.',
    },
    role: { es: 'Senior full-stack developer', en: 'Senior full-stack developer' },
    stack: ['react', 'nextjs', 'nodejs', 'express', 'postgresql'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2020-09',
  },
  {
    slug: 'gds',
    title: { es: 'GDS — operaciones en puntos de venta', en: 'GDS — point-of-sale operations' },
    summary: {
      es: 'Plataforma web de gestión y soporte de acciones operativas en puntos de venta. React / Material UI con servicios REST en Node.js / Express / SQL Server.',
      en: 'Web platform to manage and support point-of-sale operations. React / Material UI with REST services in Node.js / Express / SQL Server.',
    },
    role: { es: 'Senior full-stack developer', en: 'Senior full-stack developer' },
    stack: ['react', 'nodejs', 'express', 'sql-server'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2020-09',
  },
  {
    slug: 'deal-me',
    title: { es: 'Deal.me — marketing con influencers', en: 'Deal.me — influencer marketing' },
    summary: {
      es: 'Plataforma web responsive para la gestión de propuestas de marketing entre influencers y managers. Frontend con React y Bootstrap.',
      en: 'Responsive web platform to manage marketing proposals between influencers and managers. Frontend with React and Bootstrap.',
    },
    role: { es: 'Frontend developer', en: 'Frontend developer' },
    stack: ['react', 'bootstrap'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2020-09',
  },
  {
    slug: 'candidate-viewer',
    title: { es: 'Candidate Viewer', en: 'Candidate Viewer' },
    summary: {
      es: 'Plataforma de gestión e información detallada de candidatos de trabajo. React / Material UI con Node.js / Express / MySQL / Sequelize.',
      en: 'Platform for managing detailed job-candidate information. React / Material UI with Node.js / Express / MySQL / Sequelize.',
    },
    role: { es: 'Senior full-stack developer', en: 'Senior full-stack developer' },
    stack: ['react', 'nodejs', 'express', 'mysql'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2020-09',
  },
  {
    slug: 'the-crane-club',
    title: { es: 'The Crane Club', en: 'The Crane Club' },
    summary: {
      es: 'Plataforma web de venta, remate y alquiler de grúas. Frontend con React y Ant Design.',
      en: 'Web platform for crane sales, auctions and rentals. Frontend with React and Ant Design.',
    },
    role: { es: 'Frontend developer', en: 'Frontend developer' },
    stack: ['react', 'ant-design'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2020-09',
  },
  {
    slug: 'develop-intelligence',
    title: {
      es: 'DevelopIntelligence — gestión de cursos',
      en: 'DevelopIntelligence — course management',
    },
    summary: {
      es: 'Aplicación web responsive para que instructores gestionen cursos, disponibilidad y perfiles, construida con Lightning Component y Aura de Salesforce.',
      en: 'Responsive web app for instructors to manage courses, availability and profiles, built with Salesforce Lightning Component and Aura.',
    },
    role: { es: 'Frontend developer', en: 'Frontend developer' },
    stack: ['salesforce', 'javascript'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2020-09',
  },
  // ——— Etapa salud / Argentina ———
  {
    slug: 'his-municipal',
    title: {
      es: 'HIS municipal — gestión hospitalaria',
      en: 'Municipal HIS — hospital management',
    },
    summary: {
      es: 'Sistema de Gestión Hospitalaria Municipal: historia clínica electrónica (EHR), mensajería HL7 V2 (ADT, OML, ORL, ORU) con Mirth Connect, Master Patient Index e integración con RIS, LIS y GIS. PHP / CodeIgniter / Doctrine, MySQL / SQL Server.',
      en: 'Municipal Hospital Information System: electronic health record (EHR), HL7 V2 messaging (ADT, OML, ORL, ORU) with Mirth Connect, Master Patient Index and integration with RIS, LIS and GIS. PHP / CodeIgniter / Doctrine, MySQL / SQL Server.',
    },
    role: { es: 'Analista programador full-stack', en: 'Full-stack analyst programmer' },
    stack: ['php', 'codeigniter', 'hl7', 'mysql'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2012-07',
  },
  {
    slug: 'fares-taie-salud',
    title: {
      es: 'Gestión del conocimiento en salud (Fares Taie)',
      en: 'Healthcare knowledge management (Fares Taie)',
    },
    summary: {
      es: 'Sistemas de gestión del conocimiento y soporte a la decisión clínica (CDSS) para laboratorio: HL7 Infobuttons, vocabulario médico controlado (SNOMED CT, LOINC, CIE-10) y digitalización de la mejora continua ISO 9001/14001. PHP / Laravel, React, MySQL.',
      en: 'Knowledge-management and clinical decision support (CDSS) systems for a laboratory: HL7 Infobuttons, controlled medical vocabularies (SNOMED CT, LOINC, ICD-10) and ISO 9001/14001 continuous-improvement digitalization. PHP / Laravel, React, MySQL.',
    },
    role: { es: 'Líder de proyecto / backend developer', en: 'Project lead / backend developer' },
    stack: ['php', 'laravel', 'react', 'hl7', 'mysql'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2012-07',
  },
  {
    slug: 'elisa-processor',
    title: {
      es: 'Procesador automático de muestras ELISA',
      en: 'Automated ELISA sample processor',
    },
    summary: {
      es: 'I+D de un equipo de laboratorio automatizado para procesar muestras biológicas (metodología ELISA), financiado por créditos FONTAR: gestión del proyecto, software de control y electrónica con Arduino y Raspberry Pi.',
      en: 'R&D of an automated laboratory device to process biological samples (ELISA methodology), funded by FONTAR grants: project management, control software and electronics with Arduino and Raspberry Pi.',
    },
    role: {
      es: 'Líder de proyecto / analista programador',
      en: 'Project lead / analyst programmer',
    },
    stack: ['php', 'javascript', 'sqlite', 'arduino'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: false,
    date: '2013-05',
  },
];

export const projects: Project[] = entries.map((p) => projectSchema.parse(p));
