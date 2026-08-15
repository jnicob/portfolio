import { projectSchema, type Project } from './schemas';

const entries = [
  // ——— Freepik/Magnific (2022-07 → 2026-07) ———
  {
    slug: 'freepik-api-platform',
    title: {
      es: 'Plataforma de APIs de Freepik/Magnific y Landings Públicas',
      en: 'Freepik/Magnific API Platform & Public Landings',
    },
    summary: {
      es: 'Diseño e implementación integral de la plataforma de APIs de Freepik/Magnific: catálogo multimodal de IA (imagen, vídeo, audio, upscale y edición), landings públicas de producto (/api, /api/image-generation, /api/image-upscaler), tableros de gestión de API keys y analíticas (Next.js y PHP con DDD), arquitectura OpenAPI, servidor FastAPI asíncrono, gateway APISIX y agentes de IA.',
      en: "End-to-end design and implementation of Freepik/Magnific's public API platform: multimodal AI catalog (image, video, audio, upscale, and editing), public product landings (/api, /api/image-generation, /api/image-upscaler), API key management and analytics dashboards (Next.js & PHP with DDD), OpenAPI architecture, asynchronous FastAPI server, APISIX gateway, and AI agents.",
    },
    role: {
      es: 'Ingeniero de plataforma de APIs & Frontend',
      en: 'API Platform & Frontend Engineer',
    },
    stack: [
      'nextjs',
      'react',
      'typescript',
      'php',
      'python',
      'openapi',
      'apisix',
      'mysql',
      'gcp',
      'redis',
    ],
    links: {
      live: 'https://www.magnific.com/api',
      docs: 'https://docs.magnific.com',
    },
    metrics: [
      { label: { es: 'Modelos de IA servidos', en: 'AI models served' }, value: '40+' },
      { label: { es: 'Endpoints en catálogo', en: 'Catalog endpoints' }, value: '350+' },
      { label: { es: 'Fases del pipeline', en: 'Pipeline phases' }, value: '3' },
    ],
    featured: true,
    caseStudy: true,
    date: '2022-07',
  },
  {
    slug: 'ai-service-integration',
    title: {
      es: 'Integración de servicios automatizada a través de IA',
      en: 'AI-automated service integration',
    },
    summary: {
      es: 'Sistema de agentes de IA especializados desarrollado dentro de la plataforma de APIs de Freepik/Magnific que automatiza el alta y sincronización de nuevos modelos: desde la especificación OpenAPI hasta la implementación FastAPI, gateway APISIX, documentación pública y consola interactiva.',
      en: 'Specialized AI agent system developed within Freepik/Magnific’s API platform that automates the onboarding and synchronization of new models: from OpenAPI specification to FastAPI implementation, APISIX gateway, public documentation, and interactive playground.',
    },
    role: {
      es: 'Ingeniero — arquitectura y orquestación de agentes de IA',
      en: 'Engineer — AI agent architecture and orchestration',
    },
    stack: ['openapi', 'fastapi', 'apisix', 'llm-agents', 'python'],
    links: { docs: 'https://docs.magnific.com' },
    metrics: [
      {
        label: { es: 'Artefactos generados por servicio', en: 'Artifacts generated per service' },
        value: '6',
      },
    ],
    featured: true,
    caseStudy: true,
    date: '2022-07',
  },
  {
    slug: 'freepik-api-playground',
    title: {
      es: 'Playground de la web de la API de Freepik/Magnific',
      en: 'Freepik/Magnific API web Playground',
    },
    summary: {
      es: 'Consola interactiva para probar los modelos de la API de Freepik/Magnific desde el navegador: formularios generados desde la spec OpenAPI y validados con Zod, ejecución real con polling, visores por tipo de salida (imagen, vídeo, audio, before/after), ejemplos por modelo y gestión de API keys integrada.',
      en: 'Interactive console to try Freepik/Magnific API models from the browser: forms generated from the OpenAPI spec and validated with Zod, real execution with polling, per-output viewers (image, video, audio, before/after), per-model examples and built-in API key management.',
    },
    role: {
      es: 'Ingeniero frontend — desarrollo y evolución del Playground',
      en: 'Frontend engineer — built and evolved the Playground',
    },
    stack: ['nextjs', 'react', 'typescript', 'zod', 'radix-ui'],
    links: { live: 'https://www.magnific.com/api/playground' },
    metrics: [],
    featured: true,
    caseStudy: false,
    // Sin fecha pública evidenciada: inicio etapa Freepik/Magnific.
    date: '2022-07',
  },
  {
    slug: 'freepik-developer-dashboard',
    title: {
      es: 'Panel de desarrollador de la API',
      en: 'API developer dashboard',
    },
    summary: {
      es: 'Dashboard interactivo para desarrolladores y clientes de la API de Freepik/Magnific: gráficos de consumo en tiempo real, control de presupuesto y cuotas, monitorización de errores y gestión autónoma de API keys con soporte para equipos enterprise.',
      en: 'Interactive dashboard for Freepik/Magnific API developers and enterprise clients: real-time consumption charts, budget and quota management, error monitoring, and autonomous API key governance with multi-user enterprise support.',
    },
    role: { es: 'Ingeniero frontend', en: 'Frontend engineer' },
    stack: ['nextjs', 'react', 'typescript', 'react-query', 'tailwind'],
    links: { live: 'https://www.magnific.com/api', docs: 'https://docs.magnific.com' },
    metrics: [],
    featured: false,
    caseStudy: true,
    date: '2022-07',
  },
  {
    slug: 'freepik-backoffice',
    title: {
      es: 'Backoffice de contenido Freepik/Flaticon',
      en: 'Freepik/Flaticon content backoffice',
    },
    summary: {
      es: 'Suite interna para operar el contenido de Freepik/Flaticon: revisión, catalogación, moderación y publicación; producción; packs de iconos; fiscalidad de colaboradores y extensiones de productividad.',
      en: 'Internal suite for Freepik/Flaticon content operations: review, cataloguing, moderation and publishing; production; icon packs; contributor tax and productivity extensions.',
    },
    role: { es: 'Ingeniero full-stack', en: 'Full-stack engineer' },
    stack: ['php', 'laravel', 'vue', 'typescript', 'mysql', 'redis', 'kubernetes'],
    links: {},
    metrics: [],
    featured: false,
    caseStudy: true,
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
    links: { live: 'https://www.cadigolf.com/' },
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
  // ——— Proyectos independientes / Freelance ———
  {
    slug: 'manos-activas',
    title: {
      es: 'Manos Activas — plataforma web de terapia ocupacional',
      en: 'Manos Activas — occupational therapy web platform',
    },
    summary: {
      es: 'Plataforma web clínica y divulgativa de terapia ocupacional (manosactivas.es) desarrollada con metodología guiada por IA (specs y skills para agentes). Integra un backend WordPress a medida (PHP/MySQL) acoplado a componentes React, TypeScript y TailwindCSS. Incluye pasarela de pago Stripe API (con entrega tokenizada de PDFs de pago), módulo de reservas clínicas con Cal.com, sistema de modo oscuro/claro con variables CSS semánticas y entorno Dockerizado.',
      en: 'Occupational therapy web platform (manosactivas.es) built with AI spec-driven architecture and custom agent skills. Integrates a custom WordPress backend (PHP/MySQL) bridged with React, TypeScript, and TailwindCSS components. Features Stripe API integration (tokenized paid PDF downloads), Cal.com clinical booking module, semantic dark/light mode, and Docker containerization.',
    },
    role: {
      es: 'Desarrollador full-stack & arquitecto de la solución',
      en: 'Full-stack developer & solution architect',
    },
    stack: [
      'wordpress',
      'react',
      'typescript',
      'php',
      'mysql',
      'stripe',
      'docker',
      'tailwind',
      'llm-agents',
    ],
    links: { live: 'https://manosactivas.es' },
    metrics: [{ label: { es: 'Recursos clínicos', en: 'Clinical resources' }, value: '190+' }],
    featured: false,
    caseStudy: false,
    date: '2026-01',
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
