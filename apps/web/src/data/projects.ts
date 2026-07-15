import { projectSchema, type Project } from './schemas';

const entries = [
  {
    slug: 'freepik-api-platform',
    title: {
      es: 'Plataforma de APIs de IA de Freepik/Magnific',
      en: 'Freepik/Magnific AI API Platform',
    },
    summary: {
      es: 'Diseño e implementación end-to-end de la plataforma pública de APIs de generación de IA de Freepik: especificación OpenAPI, servidor FastAPI, gateway APISIX (rate limits, costes, API keys) y documentación pública de los modelos de generación de imagen y vídeo.',
      en: "End-to-end design and implementation of Freepik's public AI generation API platform: OpenAPI specification, FastAPI server, APISIX gateway (rate limits, cost tracking, API keys) and public documentation for the image and video generation models.",
    },
    role: { es: 'Ingeniero de plataforma de APIs de IA', en: 'AI API Platform Engineer' },
    stack: ['openapi', 'fastapi', 'python', 'apisix', 'rest-api'],
    links: {
      live: 'https://www.freepik.com/api',
      docs: 'https://docs.freepik.com',
    },
    metrics: [{ label: { es: 'Pull requests', en: 'Pull requests' }, value: '779' }],
    featured: true,
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
        value: 'Kling, WAN…',
      },
      {
        label: { es: 'Endpoints por modelo', en: 'Endpoints per model' },
        value: '3 (create, list, get-by-id)',
      },
    ],
    featured: true,
    // Sin fecha de proyecto evidenciada públicamente: se usa el inicio de la etapa Freepik.
    date: '2022-07',
  },
  {
    slug: 'flows-api',
    title: { es: 'Flows API', en: 'Flows API' },
    summary: {
      es: 'Componente de la plataforma de APIs de IA de Freepik/Magnific orientado a flujos de generación encadenados: combinar varios modelos de IA en una sola llamada de API.',
      en: 'Component of the Freepik/Magnific AI API platform focused on chained generation flows: combining multiple AI models in a single API call.',
    },
    role: { es: 'Ingeniero de plataforma', en: 'Platform engineer' },
    stack: ['openapi', 'fastapi', 'python'],
    links: {
      docs: 'https://docs.freepik.com',
    },
    metrics: [],
    featured: true,
    // Sin fecha de proyecto evidenciada públicamente: se usa el inicio de la etapa Freepik.
    date: '2022-07',
  },
];

export const projects: Project[] = entries.map((p) => projectSchema.parse(p));
