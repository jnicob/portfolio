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
    name: 'Hooks & State Management (React Query / Zustand / Jotai / Redux)',
    level: 4,
    category: 'frontend',
    tags: ['hooks', 'react-query', 'zustand', 'jotai', 'redux', 'context-api'],
  },
  { name: 'Vue', level: 3, category: 'frontend', tags: ['vue', 'typescript', 'ui'] },
  {
    name: 'HTML5 / CSS3 / DOM / AJAX / jQuery',
    level: 5,
    category: 'frontend',
    tags: ['html5', 'css3', 'dom', 'ajax', 'jquery'],
  },
  { name: 'PHP / Laravel', level: 4, category: 'backend', tags: ['php', 'laravel', 'rest-api'] },
  {
    name: 'Node.js / Express',
    level: 4,
    category: 'backend',
    tags: ['nodejs', 'express', 'rest-api'],
  },
  {
    name: 'RESTful APIs, Hexagonal Arch. & ORMs (Doctrine / Eloquent / Prisma / Drizzle)',
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
    name: 'SQL, NoSQL & ERD (PostgreSQL / MySQL / SQL Server / MongoDB)',
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
    name: 'AI Engineering & Agent Orchestration',
    level: 4,
    category: 'ai',
    tags: ['openapi', 'ai-agents', 'llm', 'api-design'],
  },
  {
    name: 'Claude Code / Codex / Gemini',
    level: 3,
    category: 'ai',
    tags: ['claude', 'claude-code', 'codex', 'gemini', 'llm'],
  },
  {
    name: 'Google Cloud (GCP) & Gateway APISIX',
    level: 3,
    category: 'platform',
    tags: ['gcp', 'cloud', 'apisix', 'gateway', 'rate-limiting'],
  },
  {
    name: 'Linux server administration',
    level: 4,
    category: 'platform',
    tags: ['linux', 'apache', 'server-admin'],
  },
  {
    name: 'HL7 (V2 / V3 / FHIR) & Healthcare Interoperability',
    level: 4,
    category: 'platform',
    tags: ['hl7', 'fhir', 'infobuttons', 'mirth-connect', 'snomed-ct', 'cdss'],
  },
  {
    name: 'Docker & CI/CD (GitHub Actions / Tekton / Jenkins)',
    level: 2,
    category: 'platform',
    tags: ['docker', 'cicd', 'github-actions', 'jenkins', 'tekton', 'spinnaker'],
  },
  {
    name: 'Observability (OpenSearch / Kibana / Analytics)',
    level: 3,
    category: 'platform',
    tags: ['opensearch', 'kibana', 'gcp-logs', 'posthog', 'calibre', 'web-vitals'],
  },
  {
    name: 'SCRUM & Agile Methodologies',
    level: 5,
    category: 'tooling',
    tags: ['scrum', 'agile'],
  },
  {
    name: 'Testing (Jest / PHPUnit / Vitest)',
    level: 3,
    category: 'tooling',
    tags: ['jest', 'phpunit', 'vitest', 'testing'],
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
