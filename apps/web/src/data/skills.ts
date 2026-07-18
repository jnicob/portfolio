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
  { name: 'Vue 2/3', level: 3, category: 'frontend', tags: ['vue', 'typescript', 'ui'] },
  { name: 'PHP / Laravel', level: 5, category: 'backend', tags: ['php', 'laravel', 'rest-api'] },
  {
    name: 'Node.js / Express',
    level: 4,
    category: 'backend',
    tags: ['nodejs', 'express', 'rest-api'],
  },
  {
    name: 'MySQL / SQL Server',
    level: 4,
    category: 'backend',
    tags: ['mysql', 'sql-server', 'database'],
  },
  {
    name: 'Python / FastAPI',
    level: 3,
    category: 'backend',
    tags: ['python', 'fastapi', 'openapi'],
  },
  {
    name: 'AI API platform design',
    level: 4,
    category: 'ai',
    tags: ['openapi', 'ai-models', 'api-design'],
  },
  { name: 'Anthropic Claude', level: 3, category: 'ai', tags: ['claude', 'llm', 'anthropic'] },
  {
    name: 'Gateway APISIX',
    level: 3,
    category: 'platform',
    tags: ['apisix', 'gateway', 'rate-limiting'],
  },
  {
    name: 'Linux server administration',
    level: 4,
    category: 'platform',
    tags: ['linux', 'apache', 'server-admin'],
  },
  {
    name: 'HL7 / healthcare interoperability',
    level: 4,
    category: 'platform',
    tags: ['hl7', 'mirth-connect', 'snomed-ct'],
  },
  {
    name: 'Docker / Kubernetes',
    level: 3,
    category: 'platform',
    tags: ['docker', 'kubernetes', 'helm'],
  },
  {
    name: 'Testing (Jest / PHPUnit)',
    level: 4,
    category: 'tooling',
    tags: ['jest', 'phpunit', 'testing'],
  },
  { name: 'Git', level: 5, category: 'tooling', tags: ['git', 'version-control'] },
];

export const skills: Skill[] = entries.map((s) => skillSchema.parse(s));
