import { skillSchema, type Skill } from './schemas';

const entries = [
  { name: 'JavaScript', level: 5, category: 'frontend', tags: ['javascript', 'es2024'] },
  {
    name: 'React / Next.js',
    level: 4,
    category: 'frontend',
    tags: ['react', 'nextjs', 'ssr', 'ui'],
  },
  { name: 'TypeScript', level: 4, category: 'frontend', tags: ['typescript', 'javascript'] },
  {
    name: 'TanStack / React Query, Zustand, Jotai, Redux',
    level: 4,
    category: 'frontend',
    tags: ['hooks', 'tanstack-query', 'react-query', 'zustand', 'jotai', 'redux', 'context-api'],
  },
  {
    name: 'Design Systems, WCAG AA & Technical SEO',
    level: 4,
    category: 'frontend',
    tags: ['design-systems', 'wcag', 'a11y', 'seo', 'core-web-vitals'],
  },
  { name: 'Vue 2/3', level: 3, category: 'frontend', tags: ['vue', 'typescript', 'ui'] },
  {
    name: 'HTML5 / CSS3 (Semantic HTML, DOM)',
    level: 5,
    category: 'frontend',
    tags: ['html5', 'css3', 'dom'],
  },
  { name: 'PHP / Laravel', level: 4, category: 'backend', tags: ['php', 'laravel', 'rest-api'] },
  {
    name: 'Node.js / Express',
    level: 4,
    category: 'backend',
    tags: ['nodejs', 'express', 'rest-api'],
  },
  {
    name: 'REST APIs, Hexagonal Arch. & ORMs',
    level: 4,
    category: 'backend',
    tags: [
      'rest-api',
      'microservices',
      'hexagonal',
      'doctrine',
      'eloquent',
      'prisma',
      'drizzle',
      'orm',
    ],
  },
  {
    name: 'SQL / NoSQL (Postgres, MySQL, Mongo, Redis)',
    level: 4,
    category: 'backend',
    tags: ['mysql', 'postgresql', 'mariadb', 'sql-server', 'mongodb', 'redis', 'erd', 'database'],
  },
  {
    name: 'Python / FastAPI',
    level: 2,
    category: 'backend',
    tags: ['python', 'fastapi', 'openapi'],
  },
  {
    name: 'Java (Spring / Hibernate)',
    level: 2,
    category: 'backend',
    tags: ['java', 'spring', 'hibernate'],
  },
  {
    name: 'Generative AI (LLMs), Multi-Agent & MCPs',
    level: 4,
    category: 'ai',
    tags: ['openapi', 'ai-agents', 'multi-agent', 'mcp', 'llm', 'generative-ai', 'api-design'],
  },
  {
    name: 'Claude Code / Codex / Gemini',
    level: 3,
    category: 'ai',
    tags: ['claude', 'claude-code', 'codex', 'gemini', 'llm'],
  },
  {
    name: 'GCP & Gateway APISIX',
    level: 3,
    category: 'platform',
    tags: ['gcp', 'cloud', 'apisix', 'gateway', 'rate-limiting'],
  },
  {
    name: 'Linux & Kubernetes',
    level: 4,
    category: 'platform',
    tags: ['linux', 'apache', 'server-admin', 'kubernetes'],
  },
  {
    name: 'HL7 (V2 / V3 / FHIR) & Healthcare IT',
    level: 4,
    category: 'platform',
    tags: ['hl7', 'fhir', 'infobuttons', 'mirth-connect', 'snomed-ct', 'cdss'],
  },
  {
    name: 'Docker & CI/CD (GitHub Actions / Jenkins)',
    level: 2,
    category: 'platform',
    tags: ['docker', 'cicd', 'github-actions', 'jenkins', 'tekton', 'spinnaker'],
  },
  {
    name: 'Observability (OpenSearch / Kibana)',
    level: 3,
    category: 'platform',
    tags: ['opensearch', 'kibana', 'gcp-logs', 'posthog', 'calibre', 'web-vitals'],
  },
  {
    name: 'SCRUM & Agile',
    level: 5,
    category: 'tooling',
    tags: ['scrum', 'agile'],
  },
  {
    name: 'Vitest / Jest / Testing Library / PHPUnit',
    level: 3,
    category: 'tooling',
    tags: ['vitest', 'jest', 'testing-library', 'phpunit', 'testing'],
  },
  {
    name: 'Tailwind CSS / Bootstrap',
    level: 4,
    category: 'tooling',
    tags: ['tailwind', 'bootstrap', 'css', 'ui'],
  },
  { name: 'Git', level: 5, category: 'tooling', tags: ['git', 'version-control'] },
];

export const skills: Skill[] = entries.map((s) => skillSchema.parse(s));
