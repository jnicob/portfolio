# ai-playground — Fase A: bootstrap + walking skeleton (mock) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el repo `ai-playground` (SPA Vite + React) con tooling en verde y un walking skeleton end-to-end del playground con el proveedor `mock` (generar imagen → resultado + traza API), más la exportación de agentes/skills a `ai-config`.

**Architecture:** SPA 100% client-side. Dominio puerto/adaptador (`GenerationService`), registry declarativo de servicios/proveedores validado con Zod, adaptador `mock` determinista contra un catálogo de assets locales, hook `useGeneration` con estado discriminado y UI de 3 zonas (rail · form · resultado con tabs Preview|API). Spec de producto: `docs/superpowers/specs/2026-07-24-phase-4-playground-design.md` (§2) del portfolio, que se migra al repo nuevo.

**Tech Stack:** pnpm · Vite 7 · React 19 · TypeScript strict · Tailwind CSS v4 (tokens semánticos) · Zod · Vitest + Testing Library · GitHub Actions.

## Global Constraints

- Repo destino: `~/workspace/formaciones/claude/superpowers/ai-playground` → `github.com:jnicob/ai-playground`. Node 22 (local: v22.23.1), pnpm 9.
- TypeScript `strict: true`; lint + typecheck + tests en verde en cada commit; TDD para todo código con lógica.
- Colores SOLO vía tokens semánticos (CSS vars + `data-theme`); prohibido color hardcodeado en componentes.
- Prohibida cualquier dependencia privada/de empresa; solo OSS público o código propio. Cero referencias a Freepik/Magnific en código o docs del repo nuevo (clean-room).
- Nunca secretos/API keys en repo, bundle o URLs compartidas (las keys de proveedor viven en `sessionStorage` — fase B, fuera de este plan).
- i18n es/en en toda UI visible; WCAG AA en ambos temas.
- Commits convencionales (`feat:`, `fix:`, `docs:`, `test:`, `chore:`) y frecuentes.
- El plan de fases del producto (A–D) vive en el repo nuevo; este plan cubre SOLO la fase A.

## Estructura de archivos del repo nuevo

```
ai-playground/
├── AGENTS.md                    # instrucciones agentes (CLAUDE.md symlink)
├── STATUS.md                    # resumen operativo
├── docs/
│   ├── specs/2026-07-24-ai-playground-design.md   # spec migrada
│   └── plans/2026-07-24-product-roadmap.md        # fases A–D
├── skills/adding-a-provider/SKILL.md
├── .github/workflows/ci.yml
├── index.html · vite.config.ts · tsconfig*.json · eslint.config.js · .prettierrc.json
├── public/mocks/                # assets del adaptador mock
└── src/
    ├── main.tsx · app.tsx
    ├── styles/globals.css       # tokens semánticos + Tailwind
    ├── i18n/messages.ts · i18n.tsx
    ├── domain/types.ts · registry.ts · factory.ts · with-mock-fallback.ts
    ├── adapters/mock.ts · mock-catalog.ts
    └── ui/generation-form.tsx · result-panel.tsx · api-trace-view.tsx · use-generation.ts
```

Fases del producto (roadmap que crea la Task 3): **A** bootstrap + skeleton mock (este plan) · **B** proveedores live (pollinations, google imagen) + gestión de API keys + `withMockFallback` cableado · **C** servicios edit-image y generate-video (media-kit CompareSlider/MediaLightbox, Veo opt-in con aviso de coste) + ejemplos precargados + share-by-URL · **D** polish (a11y audit, qa, deploy Cloudflare Pages) + integración en portfolio (case study + CTA).

---

### Task 1: Scaffold Vite + tooling de calidad

**Files:**
- Create: repo completo vía `pnpm create vite`, `tsconfig.app.json` (strict extra), `eslint.config.js`, `.prettierrc.json`, `vitest.config.ts`, `src/test/setup.ts`, `.github/workflows/ci.yml`, `.gitignore`
- Delete: `src/App.css`, `src/assets/`, contenido demo de `src/App.tsx`

**Interfaces:**
- Produces: comandos `pnpm run dev|build|lint|format|typecheck|test`; alias `@/` → `src/`.

- [ ] **Step 1: Scaffold y git init**

```bash
cd ~/workspace/formaciones/claude/superpowers
pnpm create vite ai-playground --template react-ts
cd ai-playground && git init -b main && pnpm install
```

- [ ] **Step 2: Endurecer TypeScript**

En `tsconfig.app.json`, dentro de `compilerOptions`, añadir/asegurar:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true,
  "baseUrl": ".",
  "paths": { "@/*": ["src/*"] }
}
```

- [ ] **Step 3: Instalar y configurar tooling**

```bash
pnpm add -D prettier eslint-config-prettier vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitejs/plugin-react
```

`.prettierrc.json`:

```json
{ "singleQuote": true, "printWidth": 100 }
```

`eslint.config.js`: al array generado por Vite, añadir al final `eslintConfigPrettier` (import de `eslint-config-prettier`).

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
```

`vitest.config.ts`:

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, {
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: false },
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

En `package.json`, scripts:

```json
{
  "lint": "eslint .",
  "format": "prettier --check .",
  "format:fix": "prettier --write .",
  "typecheck": "tsc -b",
  "test": "vitest run"
}
```

- [ ] **Step 4: Limpiar demo de Vite**

Borrar `src/App.css` y `src/assets/`; dejar `src/App.tsx` como `export default function App() { return <main>ai-playground</main>; }` y `src/index.css` vacío (la Task 4 lo sustituye por `styles/globals.css`). Renombrar `src/App.tsx` → `src/app.tsx` (convención kebab-case del proyecto) y actualizar el import en `src/main.tsx`.

- [ ] **Step 5: CI**

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint && pnpm run format && pnpm run typecheck && pnpm run test
      - run: pnpm run build
```

- [ ] **Step 6: Verificar y commitear**

Run: `pnpm run lint && pnpm run format:fix && pnpm run typecheck && pnpm run test && pnpm run build`
Expected: todo en verde (test: "no test files found" NO es fallo si vitest sale 0; si sale 1, añadir `passWithNoTests: true` al bloque `test` de vitest.config.ts).

```bash
git add -A && git commit -m "chore: scaffold Vite + React + TS strict con tooling de calidad"
```

---

### Task 2: Docs, AGENTS.md y skill adding-a-provider

**Files:**
- Create: `AGENTS.md`, `CLAUDE.md` (symlink), `STATUS.md`, `docs/specs/2026-07-24-ai-playground-design.md`, `docs/plans/2026-07-24-product-roadmap.md`, `skills/adding-a-provider/SKILL.md`, `.claude/skills` (symlink)

**Interfaces:**
- Consumes: spec §2 de `<portfolio>/docs/superpowers/specs/2026-07-24-phase-4-playground-design.md`.
- Produces: fuentes de verdad del repo (spec, roadmap, STATUS) que citan las tasks siguientes.

- [ ] **Step 1: Migrar la spec**

Copiar la sección «2. Diseño base del ai-playground» de la spec del portfolio a `docs/specs/2026-07-24-ai-playground-design.md`, quitando el encabezado «semilla para el repo nuevo» y las referencias al portfolio (rutas `apps/web`, F4/F5), y añadiendo cabecera: título `# ai-playground — spec de producto`, estado, y la tabla de decisiones §0 de la spec original (solo las filas Producto, Proveedores v1, API keys, Patrón ai-platform).

- [ ] **Step 2: Roadmap de producto**

`docs/plans/2026-07-24-product-roadmap.md` con la tabla de fases A–D descrita arriba (sección «Estructura de archivos»), columnas `# | Fase | Estado | Depende de`, fase A `en curso`, y la nota «cada fase escribe su plan just-in-time con superpowers:writing-plans usando la spec como entrada».

- [ ] **Step 3: AGENTS.md + STATUS.md + symlinks**

`AGENTS.md` (~50 líneas): qué es el repo, tabla de comandos (los scripts de Task 1), hard rules (las Global Constraints de este plan), routing a `skills/adding-a-provider`, punteros a spec/roadmap/STATUS.md. `STATUS.md`: sección Ahora (fase A en curso), Hecho, Siguiente acción, Fuentes de verdad.

```bash
ln -s AGENTS.md CLAUDE.md && mkdir -p .claude && ln -s ../skills .claude/skills
```

- [ ] **Step 4: Skill adding-a-provider**

`skills/adding-a-provider/SKILL.md` con frontmatter (`name: adding-a-provider`, `description: Use when añadiendo un proveedor o servicio de generación nuevo al registry del playground`) y checklist: 1) añadir `ProviderDefinition` a `src/domain/registry.ts` (id, auth, models por servicio); 2) crear adaptador en `src/adapters/<provider>.ts` que implemente `GenerationService` y construya su `ApiTrace`; 3) registrarlo en `src/domain/factory.ts`; 4) si `auth: 'api-key'`, integrar con el panel de keys (fase B); 5) tests: payload/URL contra fetch mockeado, fallback a mock, catálogo de modelos; 6) i18n de labels en ambos idiomas; 7) verificar lista viva de modelos del proveedor y documentarla en la spec.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "docs: spec, roadmap, AGENTS.md, STATUS.md y skill adding-a-provider"
```

---

### Task 3: Tokens semánticos + i18n base (TDD)

**Files:**
- Create: `src/styles/globals.css`, `src/i18n/messages.ts`, `src/i18n/i18n.tsx`
- Test: `src/styles/tokens.test.ts`, `src/i18n/i18n.test.tsx`
- Modify: `src/main.tsx` (importar globals.css), `index.html` (`<html lang="en" data-theme="dark">`, `<title>ai-playground</title>`)

**Interfaces:**
- Produces: clases Tailwind `bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-border`, `bg-accent`, `text-accent-fg`, `text-danger`; hook `useI18n(): { t: (key: MessageKey) => string; locale: Locale; setLocale(l: Locale): void }`; provider `<I18nProvider>`; tipo `MessageKey`.

- [ ] **Step 1: Test de contraste AA de tokens (falla)**

`src/styles/tokens.test.ts` — parsea `globals.css` con regex y valida AA con luminancia relativa:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8');

function tokensOf(theme: 'dark' | 'light'): Record<string, string> {
  const block = css.match(new RegExp(String.raw`:root\[data-theme='${theme}'\]\s*{([^}]*)}`))?.[1] ?? '';
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe.each(['dark', 'light'] as const)('tokens %s', (theme) => {
  const t = tokensOf(theme);
  it('define los 8 tokens', () => {
    for (const name of ['bg', 'surface', 'fg', 'muted', 'border', 'accent', 'accent-fg', 'danger'])
      expect(t[name], name).toBeDefined();
  });
  it('cumple AA (4.5:1) en pares de texto', () => {
    expect(ratio(t.fg!, t.bg!)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t.fg!, t.surface!)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t.muted!, t.bg!)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t['accent-fg']!, t.accent!)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t.danger!, t.bg!)).toBeGreaterThanOrEqual(4.5);
  });
});
```

Run: `pnpm run test -- tokens` → Expected: FAIL (globals.css no existe).

- [ ] **Step 2: Implementar tokens**

```bash
pnpm add tailwindcss @tailwindcss/vite
```

Añadir `tailwindcss()` a `plugins` de `vite.config.ts` (import de `@tailwindcss/vite`). `src/styles/globals.css`:

```css
@import 'tailwindcss';

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-danger: var(--danger);
}

:root[data-theme='dark'] {
  --bg: #0b0d12;
  --surface: #141821;
  --fg: #e8eaf0;
  --muted: #98a0b3;
  --border: #2a3040;
  --accent: #8fb0ff;
  --accent-fg: #0b0d12;
  --danger: #ff8f88;
}

:root[data-theme='light'] {
  --bg: #f6f7f9;
  --surface: #ffffff;
  --fg: #191d26;
  --muted: #555e70;
  --border: #d7dbe4;
  --accent: #2f4fc4;
  --accent-fg: #ffffff;
  --danger: #b91c1c;
}
```

En `src/main.tsx` sustituir `import './index.css'` por `import './styles/globals.css'` y borrar `src/index.css`. Si algún ratio falla en el test, ajustar SOLO la lightness del token que falle hasta pasar.

Run: `pnpm run test -- tokens` → Expected: PASS.

- [ ] **Step 3: Test de i18n (falla)**

`src/i18n/i18n.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { MESSAGES } from './messages';

const wrapper = ({ children }: { children: ReactNode }) => <I18nProvider>{children}</I18nProvider>;

describe('i18n', () => {
  it('es y en tienen exactamente las mismas claves', () => {
    expect(Object.keys(MESSAGES.es).sort()).toEqual(Object.keys(MESSAGES.en).sort());
  });
  it('traduce y cambia de locale persistiendo en localStorage', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('app.title')).toBe(MESSAGES.en['app.title']);
    act(() => result.current.setLocale('es'));
    expect(result.current.t('app.title')).toBe(MESSAGES.es['app.title']);
    expect(localStorage.getItem('ai-playground:locale')).toBe('es');
  });
});
```

Run: `pnpm run test -- i18n` → Expected: FAIL.

- [ ] **Step 4: Implementar i18n**

`src/i18n/messages.ts` (catálogo inicial; las Tasks 6–7 añaden claves aquí — SIEMPRE en ambos idiomas):

```ts
export const MESSAGES = {
  en: {
    'app.title': 'AI Playground',
    'service.generate-image': 'Generate image',
    'form.prompt': 'Prompt',
    'form.model': 'Model',
    'form.aspectRatio': 'Aspect ratio',
    'form.seed': 'Seed',
    'form.seed.random': 'Random seed',
    'form.generate': 'Generate',
    'form.generating': 'Generating…',
    'result.empty': 'Write a prompt and press Generate to see the result here.',
    'result.loading': 'Generating…',
    'result.error': 'Generation failed.',
    'result.retry': 'Retry',
    'result.alt': 'Generated image',
    'result.tab.preview': 'Preview',
    'result.tab.api': 'API',
    'result.origin.mock': 'mock',
    'result.origin.degraded': 'live → mock',
    'aspect.square_1_1': 'Square 1:1',
    'aspect.widescreen_16_9': 'Widescreen 16:9',
    'aspect.vertical_9_16': 'Vertical 9:16',
  },
  es: {
    'app.title': 'AI Playground',
    'service.generate-image': 'Generar imagen',
    'form.prompt': 'Prompt',
    'form.model': 'Modelo',
    'form.aspectRatio': 'Relación de aspecto',
    'form.seed': 'Seed',
    'form.seed.random': 'Seed aleatoria',
    'form.generate': 'Generar',
    'form.generating': 'Generando…',
    'result.empty': 'Escribe un prompt y pulsa Generar para ver aquí el resultado.',
    'result.loading': 'Generando…',
    'result.error': 'La generación falló.',
    'result.retry': 'Reintentar',
    'result.alt': 'Imagen generada',
    'result.tab.preview': 'Vista previa',
    'result.tab.api': 'API',
    'result.origin.mock': 'mock',
    'result.origin.degraded': 'live → mock',
    'aspect.square_1_1': 'Cuadrado 1:1',
    'aspect.widescreen_16_9': 'Panorámico 16:9',
    'aspect.vertical_9_16': 'Vertical 9:16',
  },
} as const;

export type Locale = keyof typeof MESSAGES;
export type MessageKey = keyof (typeof MESSAGES)['en'];
```

`src/i18n/i18n.tsx`:

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { MESSAGES, type Locale, type MessageKey } from './messages';

const STORAGE_KEY = 'ai-playground:locale';

type I18nValue = { locale: Locale; setLocale: (l: Locale) => void; t: (key: MessageKey) => string };

const I18nContext = createContext<I18nValue | null>(null);

function initialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  return navigator.language.startsWith('es') ? 'es' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);
  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: (key) => MESSAGES[locale][key] }),
    [locale, setLocale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n requires <I18nProvider>');
  return ctx;
}
```

Nota: el test corre en jsdom donde `navigator.language` es `en-US` → default `en`, como asume el test.

Run: `pnpm run test -- i18n` → Expected: PASS.

- [ ] **Step 5: Verificar todo y commitear**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test`
Expected: verde.

```bash
git add -A && git commit -m "feat: tokens semánticos AA (dark/light) + i18n es/en tipado"
```

---

### Task 4: Dominio — tipos y registry (TDD)

**Files:**
- Create: `src/domain/types.ts`, `src/domain/registry.ts`
- Test: `src/domain/registry.test.ts`

**Interfaces:**
- Produces (las usan Tasks 5–8): tipos `PlaygroundMode`, `AspectRatio`, `ProviderId`, `GenerationRequest`, `ApiTraceStep`, `GenerationResult`, `GenerationService`; constantes `ASPECT_RATIOS`, `SERVICES`, `PROVIDERS`; schema `generationRequestSchema`.

- [ ] **Step 1: Test del registry (falla)**

`src/domain/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generationRequestSchema, PROVIDERS, SERVICES } from './registry';
import { ASPECT_RATIOS } from './types';

const valid = {
  service: 'generate-image',
  provider: 'mock',
  prompt: 'a red fox',
  model: 'flux',
  aspectRatio: 'square_1_1',
  seed: 42,
};

describe('registry', () => {
  it('valida una request correcta', () => {
    expect(generationRequestSchema.parse(valid)).toEqual(valid);
  });
  it.each([
    ['prompt vacío', { ...valid, prompt: '  ' }],
    ['seed negativa', { ...valid, seed: -1 }],
    ['seed no entera', { ...valid, seed: 1.5 }],
    ['aspect ratio desconocido', { ...valid, aspectRatio: 'panoramic' }],
    ['provider desconocido', { ...valid, provider: 'openai' }],
  ])('rechaza %s', (_name, input) => {
    expect(generationRequestSchema.safeParse(input).success).toBe(false);
  });
  it('todo modelo declarado por un provider pertenece a un servicio del registry', () => {
    const serviceIds = SERVICES.map((s) => s.id);
    for (const p of PROVIDERS)
      for (const mode of Object.keys(p.models)) expect(serviceIds).toContain(mode);
  });
  it('cada aspect ratio tiene dimensiones', () => {
    for (const dims of Object.values(ASPECT_RATIOS)) {
      expect(dims.width).toBeGreaterThan(0);
      expect(dims.height).toBeGreaterThan(0);
    }
  });
});
```

Run: `pnpm run test -- registry` → Expected: FAIL (módulos no existen).

- [ ] **Step 2: Implementar tipos y registry**

```bash
pnpm add zod
```

`src/domain/types.ts`:

```ts
export const ASPECT_RATIOS = {
  square_1_1: { width: 1024, height: 1024 },
  widescreen_16_9: { width: 1280, height: 720 },
  vertical_9_16: { width: 720, height: 1280 },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;
export type PlaygroundMode = 'generate-image' | 'edit-image' | 'generate-video';
export type ProviderId = 'mock' | 'pollinations' | 'google';

export type GenerationRequest = {
  service: PlaygroundMode;
  provider: ProviderId;
  prompt: string;
  model: string;
  aspectRatio: AspectRatio;
  seed: number;
};

export type ApiTraceStep =
  | { kind: 'request'; method: 'POST'; url: string; body: unknown }
  | { kind: 'status'; state: 'IN_PROGRESS'; taskId: string }
  | { kind: 'poll'; method: 'GET'; url: string }
  | { kind: 'completed'; response: unknown };

type GenerationMeta = {
  provider: ProviderId;
  degraded: boolean;
  elapsedMs: number;
  apiTrace: ApiTraceStep[];
};

export type GenerationResult = GenerationMeta &
  (
    | { kind: 'image'; url: string; width: number; height: number }
    | { kind: 'image-pair'; before: string; after: string }
    | { kind: 'video'; url: string; poster: string }
  );

export type GenerationService = {
  generate(request: GenerationRequest, signal?: AbortSignal): Promise<GenerationResult>;
};
```

`src/domain/registry.ts` (fase A: 1 servicio, 1 provider; fases B–C amplían los enums y arrays — patrón declarativo: añadir proveedor = definición + adaptador):

```ts
import { z } from 'zod';
import type { MessageKey } from '@/i18n/messages';
import type { PlaygroundMode, ProviderId } from './types';

export type ServiceDefinition = { id: PlaygroundMode; labelKey: MessageKey };

export type ProviderDefinition = {
  id: ProviderId;
  auth: 'none' | 'api-key';
  models: Partial<Record<PlaygroundMode, readonly string[]>>;
};

export const SERVICES: readonly ServiceDefinition[] = [
  { id: 'generate-image', labelKey: 'service.generate-image' },
];

export const PROVIDERS: readonly ProviderDefinition[] = [
  { id: 'mock', auth: 'none', models: { 'generate-image': ['flux', 'turbo'] } },
];

export const generationRequestSchema = z.object({
  service: z.literal('generate-image'),
  provider: z.literal('mock'),
  prompt: z.string().trim().min(1).max(1000),
  model: z.string().min(1),
  aspectRatio: z.enum(['square_1_1', 'widescreen_16_9', 'vertical_9_16']),
  seed: z.number().int().min(0).max(999_999),
});
```

Run: `pnpm run test -- registry` → Expected: PASS.

- [ ] **Step 3: Verificar y commitear**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test` → verde.

```bash
git add -A && git commit -m "feat: dominio — tipos, registry declarativo y schema de request"
```

---

### Task 5: Adaptador mock + catálogo + assets (TDD)

**Files:**
- Create: `src/adapters/mock-catalog.ts`, `src/adapters/mock.ts`, `public/mocks/*.webp` (6 imágenes)
- Test: `src/adapters/mock.test.ts`

**Interfaces:**
- Consumes: tipos y `ASPECT_RATIOS` de Task 4.
- Produces: `createMockAdapter(options?: { latencyMs?: number }): GenerationService`; `MOCK_CATALOG: Record<AspectRatio, readonly string[]>`.

- [ ] **Step 1: Copiar assets desde el portfolio**

```bash
mkdir -p public/mocks
PF=~/workspace/formaciones/claude/superpowers/portfolio/apps/web/public/demo/gallery
for f in "$PF"/*-hd.webp "$PF"/*.webp; do identify -format "%f %wx%h\n" "$f" 2>/dev/null || file "$f"; done | sort -u
```

Elegir 2 por ratio según dimensiones reportadas (cuadradas → `square-1.webp`/`square-2.webp`; apaisadas → `wide-1.webp`/`wide-2.webp`; verticales → `tall-1.webp`/`tall-2.webp`; preferir las variantes NO `-hd` por peso) y copiarlas con esos nombres a `public/mocks/`. Si no hay 2 candidatas de un ratio, usar también `~/workspace/.../portfolio/apps/web/public/demo/{landscape,portrait}.webp`. Presupuesto: ≤1,5 MB total en fase A.

- [ ] **Step 2: Test del adaptador (falla)**

`src/adapters/mock.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createMockAdapter } from './mock';
import { MOCK_CATALOG } from './mock-catalog';
import { ASPECT_RATIOS, type AspectRatio, type GenerationRequest } from '@/domain/types';
import { PROVIDERS } from '@/domain/registry';

const req = (over: Partial<GenerationRequest> = {}): GenerationRequest => ({
  service: 'generate-image',
  provider: 'mock',
  prompt: 'a red fox',
  model: 'flux',
  aspectRatio: 'square_1_1',
  seed: 7,
  ...over,
});

const adapter = createMockAdapter({ latencyMs: 0 });

describe('mock adapter', () => {
  it('es determinista: misma request → misma url', async () => {
    const [a, b] = await Promise.all([adapter.generate(req()), adapter.generate(req())]);
    expect(a.kind === 'image' && b.kind === 'image' && a.url === b.url).toBe(true);
  });
  it('seeds distintas pueden dar assets distintos (cobertura del catálogo)', async () => {
    const urls = new Set<string>();
    for (let seed = 0; seed < 10; seed++) {
      const r = await adapter.generate(req({ seed }));
      if (r.kind === 'image') urls.add(r.url);
    }
    expect(urls.size).toBe(MOCK_CATALOG.square_1_1.length);
  });
  it('cubre TODA combinación servicio×modelo×ratio del registry sin fallar', async () => {
    for (const p of PROVIDERS)
      for (const models of Object.values(p.models))
        for (const model of models)
          for (const aspectRatio of Object.keys(ASPECT_RATIOS) as AspectRatio[]) {
            const r = await adapter.generate(req({ model, aspectRatio }));
            expect(r.kind).toBe('image');
            if (r.kind === 'image') {
              expect(r.width).toBe(ASPECT_RATIOS[aspectRatio].width);
              expect(r.url).toMatch(/^\/mocks\//);
            }
          }
  });
  it('emite la traza task-based completa', async () => {
    const r = await adapter.generate(req());
    expect(r.apiTrace.map((s) => s.kind)).toEqual(['request', 'status', 'poll', 'completed']);
    expect(r.provider).toBe('mock');
    expect(r.degraded).toBe(false);
  });
  it('aborta con AbortSignal', async () => {
    const slow = createMockAdapter({ latencyMs: 5_000 });
    const controller = new AbortController();
    const promise = slow.generate(req(), controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow(/abort/i);
  });
});
```

Run: `pnpm run test -- adapters/mock` → Expected: FAIL.

- [ ] **Step 3: Implementar catálogo y adaptador**

`src/adapters/mock-catalog.ts`:

```ts
import type { AspectRatio } from '@/domain/types';

export const MOCK_CATALOG: Record<AspectRatio, readonly string[]> = {
  square_1_1: ['/mocks/square-1.webp', '/mocks/square-2.webp'],
  widescreen_16_9: ['/mocks/wide-1.webp', '/mocks/wide-2.webp'],
  vertical_9_16: ['/mocks/tall-1.webp', '/mocks/tall-2.webp'],
};
```

`src/adapters/mock.ts`:

```ts
import { ASPECT_RATIOS, type ApiTraceStep, type GenerationRequest, type GenerationResult, type GenerationService } from '@/domain/types';
import { MOCK_CATALOG } from './mock-catalog';

const DEFAULT_LATENCY_MS = 600;

function hashString(input: string): number {
  let h = 0;
  for (const ch of input) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => resolve(), ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

function buildTrace(req: GenerationRequest, url: string): ApiTraceStep[] {
  const taskId = `task_${req.seed.toString(16).padStart(6, '0')}`;
  const base = 'https://api.playground.local/v1';
  return [
    {
      kind: 'request',
      method: 'POST',
      url: `${base}/${req.service}`,
      body: { prompt: req.prompt, model: req.model, aspect_ratio: req.aspectRatio, seed: req.seed },
    },
    { kind: 'status', state: 'IN_PROGRESS', taskId },
    { kind: 'poll', method: 'GET', url: `${base}/${req.service}/${taskId}` },
    { kind: 'completed', response: { task_id: taskId, status: 'COMPLETED', generated: [url] } },
  ];
}

export function createMockAdapter(options: { latencyMs?: number } = {}): GenerationService {
  const latencyMs = options.latencyMs ?? DEFAULT_LATENCY_MS;
  return {
    async generate(request, signal) {
      const started = performance.now();
      await sleep(latencyMs, signal);
      const assets = MOCK_CATALOG[request.aspectRatio];
      const url = assets[(request.seed + hashString(request.model)) % assets.length]!;
      const { width, height } = ASPECT_RATIOS[request.aspectRatio];
      return {
        kind: 'image',
        url,
        width,
        height,
        provider: 'mock',
        degraded: false,
        elapsedMs: Math.round(performance.now() - started),
        apiTrace: buildTrace(request, url),
      };
    },
  };
}
```

Run: `pnpm run test -- adapters/mock` → Expected: PASS.

- [ ] **Step 4: Verificar y commitear**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test` → verde.

```bash
git add -A && git commit -m "feat: adaptador mock determinista con catálogo de assets y traza task-based"
```

---

### Task 6: withMockFallback + factory (TDD)

**Files:**
- Create: `src/domain/with-mock-fallback.ts`, `src/domain/factory.ts`
- Test: `src/domain/with-mock-fallback.test.ts`, `src/domain/factory.test.ts`

**Interfaces:**
- Consumes: `GenerationService`, `createMockAdapter`.
- Produces: `withMockFallback(live: GenerationService, mock: GenerationService, timeoutMs?: number): GenerationService`; `createGenerationService(provider: ProviderId): GenerationService`.

- [ ] **Step 1: Tests (fallan)**

`src/domain/with-mock-fallback.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMockFallback } from './with-mock-fallback';
import type { GenerationRequest, GenerationResult, GenerationService } from './types';

const REQ: GenerationRequest = {
  service: 'generate-image', provider: 'mock', prompt: 'x', model: 'flux',
  aspectRatio: 'square_1_1', seed: 1,
};

const result = (url: string): GenerationResult => ({
  kind: 'image', url, width: 1, height: 1, provider: 'mock', degraded: false, elapsedMs: 0, apiTrace: [],
});

const stub = (fn: GenerationService['generate']): GenerationService => ({ generate: fn });

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('withMockFallback', () => {
  it('devuelve el resultado live si responde', async () => {
    const svc = withMockFallback(stub(async () => result('/live')), stub(async () => result('/mock')));
    await expect(svc.generate(REQ)).resolves.toMatchObject({ url: '/live', degraded: false });
  });
  it('cae a mock con degraded=true si live lanza', async () => {
    const svc = withMockFallback(stub(async () => { throw new Error('boom'); }), stub(async () => result('/mock')));
    await expect(svc.generate(REQ)).resolves.toMatchObject({ url: '/mock', degraded: true });
  });
  it('cae a mock si live supera el timeout', async () => {
    const never = stub((_r, signal) => new Promise((_res, rej) =>
      signal?.addEventListener('abort', () => rej(new DOMException('Aborted', 'AbortError'))),
    ));
    const svc = withMockFallback(never, stub(async () => result('/mock')), 20_000);
    const promise = svc.generate(REQ);
    await vi.advanceTimersByTimeAsync(20_001);
    await expect(promise).resolves.toMatchObject({ url: '/mock', degraded: true });
  });
  it('si el CALLER aborta, propaga el abort sin degradar', async () => {
    const never = stub((_r, signal) => new Promise((_res, rej) =>
      signal?.addEventListener('abort', () => rej(new DOMException('Aborted', 'AbortError'))),
    ));
    const controller = new AbortController();
    const svc = withMockFallback(never, stub(async () => result('/mock')));
    const promise = svc.generate(REQ, controller.signal);
    controller.abort();
    await expect(promise).rejects.toThrow(/abort/i);
  });
});
```

`src/domain/factory.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createGenerationService } from './factory';

describe('createGenerationService', () => {
  it('crea el servicio mock', () => {
    expect(createGenerationService('mock')).toHaveProperty('generate');
  });
  it('rechaza proveedores aún no implementados', () => {
    expect(() => createGenerationService('pollinations')).toThrow(/not implemented/i);
    expect(() => createGenerationService('google')).toThrow(/not implemented/i);
  });
});
```

Run: `pnpm run test -- domain` → Expected: FAIL.

- [ ] **Step 2: Implementar**

`src/domain/with-mock-fallback.ts` (fase A lo deja listo; se cablea a la factory en fase B con el primer provider live):

```ts
import type { GenerationService } from './types';

const DEFAULT_TIMEOUT_MS = 20_000;

export function withMockFallback(
  live: GenerationService,
  mock: GenerationService,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): GenerationService {
  return {
    async generate(request, signal) {
      const controller = new AbortController();
      const onCallerAbort = () => controller.abort();
      signal?.addEventListener('abort', onCallerAbort);
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await live.generate(request, controller.signal);
      } catch (error) {
        if (signal?.aborted) throw error;
        const fallback = await mock.generate(request, signal);
        return { ...fallback, degraded: true };
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onCallerAbort);
      }
    },
  };
}
```

`src/domain/factory.ts`:

```ts
import { createMockAdapter } from '@/adapters/mock';
import type { GenerationService, ProviderId } from './types';

const ADAPTERS: Partial<Record<ProviderId, () => GenerationService>> = {
  mock: () => createMockAdapter(),
};

export function createGenerationService(provider: ProviderId): GenerationService {
  const create = ADAPTERS[provider];
  if (!create) throw new Error(`Provider "${provider}" not implemented yet`);
  return create();
}
```

Run: `pnpm run test -- domain` → Expected: PASS.

- [ ] **Step 3: Verificar y commitear**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test` → verde.

```bash
git add -A && git commit -m "feat: withMockFallback con timeout/abort y factory de proveedores"
```

---

### Task 7: Hook useGeneration (TDD)

**Files:**
- Create: `src/ui/use-generation.ts`
- Test: `src/ui/use-generation.test.ts`

**Interfaces:**
- Consumes: `GenerationService`, `GenerationRequest`, `GenerationResult`.
- Produces: `useGeneration(service): { state: GenerationState; generate(req: GenerationRequest): void }` con `GenerationState = { status: 'idle' } | { status: 'loading' } | { status: 'success'; result: GenerationResult } | { status: 'error'; message: string }` (exportado).

- [ ] **Step 1: Test (falla)**

`src/ui/use-generation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useGeneration } from './use-generation';
import type { GenerationRequest, GenerationResult, GenerationService } from '@/domain/types';

const REQ: GenerationRequest = {
  service: 'generate-image', provider: 'mock', prompt: 'x', model: 'flux',
  aspectRatio: 'square_1_1', seed: 1,
};

const ok: GenerationResult = {
  kind: 'image', url: '/mocks/square-1.webp', width: 1024, height: 1024,
  provider: 'mock', degraded: false, elapsedMs: 5, apiTrace: [],
};

describe('useGeneration', () => {
  it('idle → loading → success', async () => {
    const service: GenerationService = { generate: async () => ok };
    const { result } = renderHook(() => useGeneration(service));
    expect(result.current.state.status).toBe('idle');
    act(() => result.current.generate(REQ));
    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));
  });
  it('error con mensaje', async () => {
    const service: GenerationService = { generate: async () => { throw new Error('boom'); } };
    const { result } = renderHook(() => useGeneration(service));
    act(() => result.current.generate(REQ));
    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', message: 'boom' }));
  });
  it('re-generar aborta la petición anterior (no pisa el resultado nuevo)', async () => {
    let calls = 0;
    const service: GenerationService = {
      generate: (_req, signal) =>
        new Promise((resolve, reject) => {
          calls += 1;
          if (calls === 1)
            signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          else resolve(ok);
        }),
    };
    const { result } = renderHook(() => useGeneration(service));
    act(() => result.current.generate(REQ));
    act(() => result.current.generate({ ...REQ, seed: 2 }));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(calls).toBe(2);
  });
});
```

Run: `pnpm run test -- use-generation` → Expected: FAIL.

- [ ] **Step 2: Implementar**

`src/ui/use-generation.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GenerationRequest, GenerationResult, GenerationService } from '@/domain/types';

export type GenerationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: GenerationResult }
  | { status: 'error'; message: string };

export function useGeneration(service: GenerationService) {
  const [state, setState] = useState<GenerationState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    (request: GenerationRequest) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ status: 'loading' });
      service
        .generate(request, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setState({ status: 'success', result });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
        });
    },
    [service],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  return { state, generate };
}
```

Run: `pnpm run test -- use-generation` → Expected: PASS.

- [ ] **Step 3: Verificar y commitear**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test` → verde.

```bash
git add -A && git commit -m "feat: hook useGeneration con estado discriminado y cancelación"
```

---

### Task 8: UI — form, panel de resultado y traza API (TDD)

**Files:**
- Create: `src/ui/generation-form.tsx`, `src/ui/result-panel.tsx`, `src/ui/api-trace-view.tsx`
- Test: `src/ui/generation-form.test.tsx`, `src/ui/result-panel.test.tsx`

**Interfaces:**
- Consumes: `useI18n`, registry (`SERVICES`, `PROVIDERS`), `GenerationState`, tipos del dominio.
- Produces: `<GenerationForm service provider busy onGenerate />` (props: `service: ServiceDefinition`, `provider: ProviderDefinition`, `busy: boolean`, `onGenerate(req: GenerationRequest): void`); `<ResultPanel state onRetry />` (props: `state: GenerationState`, `onRetry(): void`); `<ApiTraceView trace />` (props: `trace: ApiTraceStep[]`).

- [ ] **Step 1: Tests (fallan)**

`src/ui/generation-form.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { GenerationForm } from './generation-form';
import { I18nProvider } from '@/i18n/i18n';
import { PROVIDERS, SERVICES } from '@/domain/registry';
import type { GenerationRequest } from '@/domain/types';

const wrap = (ui: ReactNode) => render(<I18nProvider>{ui}</I18nProvider>);
const service = SERVICES[0]!;
const provider = PROVIDERS[0]!;

describe('GenerationForm', () => {
  it('envía la request con seed explícita', async () => {
    const onGenerate = vi.fn<(r: GenerationRequest) => void>();
    wrap(<GenerationForm service={service} provider={provider} busy={false} onGenerate={onGenerate} />);
    await userEvent.type(screen.getByLabelText('Prompt'), 'a red fox');
    await userEvent.selectOptions(screen.getByLabelText('Model'), 'turbo');
    await userEvent.type(screen.getByLabelText('Seed'), '42');
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(onGenerate).toHaveBeenCalledWith({
      service: 'generate-image', provider: 'mock', prompt: 'a red fox',
      model: 'turbo', aspectRatio: 'square_1_1', seed: 42,
    });
  });
  it('sin seed, resuelve una aleatoria (0..999999)', async () => {
    const onGenerate = vi.fn<(r: GenerationRequest) => void>();
    wrap(<GenerationForm service={service} provider={provider} busy={false} onGenerate={onGenerate} />);
    await userEvent.type(screen.getByLabelText('Prompt'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    const seed = onGenerate.mock.calls[0]?.[0]?.seed;
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(999_999);
  });
  it('con prompt vacío no envía y el botón busy se deshabilita', async () => {
    const onGenerate = vi.fn();
    const { rerender } = wrap(
      <GenerationForm service={service} provider={provider} busy={false} onGenerate={onGenerate} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(onGenerate).not.toHaveBeenCalled();
    rerender(
      <I18nProvider>
        <GenerationForm service={service} provider={provider} busy={true} onGenerate={onGenerate} />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Generating…' })).toBeDisabled();
  });
});
```

`src/ui/result-panel.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { ResultPanel } from './result-panel';
import { I18nProvider } from '@/i18n/i18n';
import type { GenerationState } from './use-generation';

const wrap = (state: GenerationState, onRetry = vi.fn()) =>
  render(
    <I18nProvider>
      <ResultPanel state={state} onRetry={onRetry} />
    </I18nProvider>,
  );

const success: GenerationState = {
  status: 'success',
  result: {
    kind: 'image', url: '/mocks/square-1.webp', width: 1024, height: 1024,
    provider: 'mock', degraded: false, elapsedMs: 12,
    apiTrace: [{ kind: 'status', state: 'IN_PROGRESS', taskId: 'task_1' }],
  },
};

describe('ResultPanel', () => {
  it('empty state', () => {
    wrap({ status: 'idle' });
    expect(screen.getByText(/press Generate/i)).toBeInTheDocument();
  });
  it('loading con aria-live', () => {
    wrap({ status: 'loading' });
    expect(screen.getByRole('status')).toHaveTextContent('Generating…');
  });
  it('error con botón de reintento', async () => {
    const onRetry = vi.fn();
    wrap({ status: 'error', message: 'boom' }, onRetry);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });
  it('success: imagen + badge de origen + tab API con la traza', async () => {
    wrap(success);
    expect(screen.getByRole('img', { name: 'Generated image' })).toHaveAttribute('src', '/mocks/square-1.webp');
    expect(screen.getByText('mock')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'API' }));
    expect(screen.getByText(/IN_PROGRESS/)).toBeInTheDocument();
  });
  it('badge degradado', () => {
    wrap({ ...success, result: { ...success.result, degraded: true } });
    expect(screen.getByText('live → mock')).toBeInTheDocument();
  });
});
```

Run: `pnpm run test -- src/ui` → Expected: FAIL.

- [ ] **Step 2: Implementar los tres componentes**

`src/ui/generation-form.tsx`:

```tsx
import { useState, type FormEvent } from 'react';
import { useI18n } from '@/i18n/i18n';
import type { ProviderDefinition, ServiceDefinition } from '@/domain/registry';
import { ASPECT_RATIOS, type AspectRatio, type GenerationRequest } from '@/domain/types';

type Props = {
  service: ServiceDefinition;
  provider: ProviderDefinition;
  busy: boolean;
  onGenerate: (request: GenerationRequest) => void;
};

const MAX_SEED = 999_999;
export const randomSeed = () => Math.floor(Math.random() * (MAX_SEED + 1));

export function GenerationForm({ service, provider, busy, onGenerate }: Props) {
  const { t } = useI18n();
  const models = provider.models[service.id] ?? [];
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(models[0] ?? '');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square_1_1');
  const [seedInput, setSeedInput] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({
      service: service.id,
      provider: provider.id,
      prompt: prompt.trim(),
      model,
      aspectRatio,
      seed: seedInput === '' ? randomSeed() : Number(seedInput),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="prompt" className="text-sm text-muted">{t('form.prompt')}</label>
        <textarea
          id="prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
          className="rounded-md border border-border bg-surface p-2 text-fg"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="model" className="text-sm text-muted">{t('form.model')}</label>
        <select
          id="model" value={model} onChange={(e) => setModel(e.target.value)}
          className="rounded-md border border-border bg-surface p-2 text-fg"
        >
          {models.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="aspect" className="text-sm text-muted">{t('form.aspectRatio')}</label>
        <select
          id="aspect" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          className="rounded-md border border-border bg-surface p-2 text-fg"
        >
          {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ar) => (
            <option key={ar} value={ar}>{t(`aspect.${ar}`)}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="seed" className="text-sm text-muted">{t('form.seed')}</label>
        <div className="flex gap-2">
          <input
            id="seed" type="number" min={0} max={MAX_SEED} value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            className="w-32 rounded-md border border-border bg-surface p-2 text-fg"
          />
          <button
            type="button" onClick={() => setSeedInput(String(randomSeed()))}
            className="rounded-md border border-border px-3 text-sm text-muted"
          >
            {t('form.seed.random')}
          </button>
        </div>
      </div>
      <button
        type="submit" disabled={busy}
        className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-60"
      >
        {busy ? t('form.generating') : t('form.generate')}
      </button>
    </form>
  );
}
```

`src/ui/api-trace-view.tsx`:

```tsx
import type { ApiTraceStep } from '@/domain/types';

const label = (step: ApiTraceStep): string => {
  switch (step.kind) {
    case 'request': return `${step.method} ${step.url}`;
    case 'status': return `status: ${step.state}`;
    case 'poll': return `${step.method} ${step.url}`;
    case 'completed': return 'response';
  }
};

export function ApiTraceView({ trace }: { trace: ApiTraceStep[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {trace.map((step, i) => (
        <li key={i}>
          <p className="font-mono text-xs text-muted">{label(step)}</p>
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-3 font-mono text-xs text-fg">
            {JSON.stringify('body' in step ? step.body : 'response' in step ? step.response : step, null, 2)}
          </pre>
        </li>
      ))}
    </ol>
  );
}
```

`src/ui/result-panel.tsx`:

```tsx
import { useState } from 'react';
import { useI18n } from '@/i18n/i18n';
import { ApiTraceView } from './api-trace-view';
import type { GenerationState } from './use-generation';

type Props = { state: GenerationState; onRetry: () => void };
type TabId = 'preview' | 'api';

export function ResultPanel({ state, onRetry }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>('preview');
  const tabs: { id: TabId; label: string }[] = [
    { id: 'preview', label: t('result.tab.preview') },
    { id: 'api', label: t('result.tab.api') },
  ];
  const result = state.status === 'success' ? state.result : null;

  return (
    <section className="flex flex-col gap-3">
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map(({ id, label }) => (
          <button
            key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className="px-3 py-1.5 text-sm text-muted aria-selected:border-b-2 aria-selected:border-accent aria-selected:text-fg"
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'preview' && (
        <div>
          {state.status === 'idle' && <p className="text-muted">{t('result.empty')}</p>}
          {state.status === 'loading' && (
            <div role="status" aria-live="polite">
              <p className="text-muted">{t('result.loading')}</p>
              <div className="mt-2 aspect-square max-w-md animate-pulse rounded-md bg-surface" />
            </div>
          )}
          {state.status === 'error' && (
            <div role="alert" className="flex flex-col items-start gap-2">
              <p className="text-danger">{t('result.error')} ({state.message})</p>
              <button onClick={onRetry} className="rounded-md border border-border px-3 py-1.5 text-fg">
                {t('result.retry')}
              </button>
            </div>
          )}
          {result?.kind === 'image' && (
            <figure className="flex flex-col gap-2">
              <img
                src={result.url} alt={t('result.alt')} width={result.width} height={result.height}
                className="max-w-full rounded-md border border-border"
              />
              <figcaption className="font-mono text-xs text-muted">
                <span className="rounded-sm border border-border px-1.5 py-0.5">
                  {result.degraded ? t('result.origin.degraded') : t(`result.origin.${result.provider}` as 'result.origin.mock')}
                </span>{' '}
                · {result.elapsedMs} ms
              </figcaption>
            </figure>
          )}
        </div>
      )}
      {tab === 'api' && <ApiTraceView trace={result?.apiTrace ?? []} />}
    </section>
  );
}
```

Run: `pnpm run test -- src/ui` → Expected: PASS.

- [ ] **Step 3: Verificar y commitear**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test` → verde.

```bash
git add -A && git commit -m "feat: GenerationForm, ResultPanel con tabs Preview|API y ApiTraceView"
```

---

### Task 9: App integrada (rail + theme/locale toggles) + verificación visual

**Files:**
- Modify: `src/app.tsx`, `src/main.tsx`
- Test: `src/app.test.tsx`

**Interfaces:**
- Consumes: todo lo anterior. `App` acepta `service?: GenerationService` (inyección para tests; default `createGenerationService('mock')`).

- [ ] **Step 1: Test de integración (falla)**

`src/app.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './app';
import { createMockAdapter } from './adapters/mock';

describe('App', () => {
  it('flujo completo: prompt → Generate → imagen mock + traza en tab API', async () => {
    render(<App service={createMockAdapter({ latencyMs: 0 })} />);
    await userEvent.type(screen.getByLabelText('Prompt'), 'a red fox');
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('img', { name: 'Generated image' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'API' }));
    expect(screen.getByText(/COMPLETED/)).toBeInTheDocument();
  });
  it('el rail lista los servicios del registry y marca el activo', () => {
    render(<App service={createMockAdapter({ latencyMs: 0 })} />);
    expect(screen.getByRole('button', { name: 'Generate image' })).toHaveAttribute('aria-current', 'true');
  });
});
```

Run: `pnpm run test -- app` → Expected: FAIL.

- [ ] **Step 2: Implementar App**

`src/app.tsx`:

```tsx
import { useMemo, useRef, useState } from 'react';
import { I18nProvider, useI18n } from './i18n/i18n';
import { PROVIDERS, SERVICES } from './domain/registry';
import { createGenerationService } from './domain/factory';
import type { GenerationRequest, GenerationService, PlaygroundMode } from './domain/types';
import { GenerationForm } from './ui/generation-form';
import { ResultPanel } from './ui/result-panel';
import { useGeneration } from './ui/use-generation';

function Playground({ service }: { service: GenerationService }) {
  const { t, locale, setLocale } = useI18n();
  const [activeService, setActiveService] = useState<PlaygroundMode>('generate-image');
  const { state, generate } = useGeneration(service);
  const lastRequest = useRef<GenerationRequest | null>(null);
  const serviceDef = SERVICES.find((s) => s.id === activeService) ?? SERVICES[0]!;
  const provider = PROVIDERS[0]!;

  function handleGenerate(request: GenerationRequest) {
    lastRequest.current = request;
    generate(request);
  }

  function toggleTheme() {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="font-semibold">{t('app.title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            className="rounded-md border border-border px-2 py-1 text-sm text-muted" aria-label="Locale">
            {locale.toUpperCase()}
          </button>
          <button onClick={toggleTheme}
            className="rounded-md border border-border px-2 py-1 text-sm text-muted" aria-label="Theme">
            ◐
          </button>
        </div>
      </header>
      <main className="grid gap-6 p-6 lg:grid-cols-[12rem_minmax(20rem,24rem)_1fr]">
        <nav aria-label="Services" className="flex flex-col gap-1">
          {SERVICES.map((s) => (
            <button
              key={s.id} onClick={() => setActiveService(s.id)}
              aria-current={s.id === activeService ? 'true' : undefined}
              className="rounded-md px-3 py-2 text-left text-sm text-muted aria-[current]:bg-surface aria-[current]:text-fg"
            >
              {t(s.labelKey)}
            </button>
          ))}
        </nav>
        <GenerationForm
          service={serviceDef} provider={provider} busy={state.status === 'loading'} onGenerate={handleGenerate}
        />
        <ResultPanel
          state={state}
          onRetry={() => lastRequest.current && handleGenerate(lastRequest.current)}
        />
      </main>
    </div>
  );
}

export default function App({ service }: { service?: GenerationService }) {
  const svc = useMemo(() => service ?? createGenerationService('mock'), [service]);
  return (
    <I18nProvider>
      <Playground service={svc} />
    </I18nProvider>
  );
}
```

Run: `pnpm run test -- app` → Expected: PASS.

- [ ] **Step 3: Verificación visual**

```bash
pnpm run dev
```

Abrir la URL, verificar manualmente (o con Playwright MCP): generar con seed fija → misma imagen; tab API muestra la traza; toggles de tema e idioma funcionan; estados loading/empty visibles. Cerrar el server.

- [ ] **Step 4: Verificar todo y commitear**

Run: `pnpm run lint && pnpm run format && pnpm run typecheck && pnpm run test && pnpm run build`
Expected: verde.

```bash
git add -A && git commit -m "feat: App integrada — rail de servicios, toggles y flujo mock end-to-end"
```

---

### Task 10: Repo en GitHub + CI verde

**Files:**
- Modify: `STATUS.md` del repo nuevo (fase A hecha)

- [ ] **Step 1: Crear repo remoto y push**

```bash
gh repo create jnicob/ai-playground --public --source . --push
```

Si `gh` falla (auth/SAML), fallback: crear el repo vacío en github.com con la cuenta jnicob y `git remote add origin git@github.com:jnicob/ai-playground.git && git push -u origin main`.

- [ ] **Step 2: Verificar CI**

Run: `gh run watch --exit-status` (o comprobar en la web) → Expected: workflow CI en verde.

- [ ] **Step 3: Actualizar STATUS.md del repo nuevo y commitear**

Marcar fase A como hecha, siguiente acción = plan de fase B (pollinations + google + keys, just-in-time).

```bash
git add STATUS.md && git commit -m "docs: cierra fase A en STATUS" && git push
```

---

### Task 11: Exportación a ai-config (agentes generalizados + evaluación de skills)

**Files:**
- Create (en `~/workspace/ai-config`): agentes `design-reviewer` y `qa-a11y-perf` generalizados; skills nuevas SOLO si la evaluación las justifica
- Modify: índice/README de ai-config donde corresponda (inspeccionar su estructura primero)

**Interfaces:**
- Consumes: `<portfolio>/agents/design-reviewer.md`, `<portfolio>/agents/qa-a11y-perf.md`, `~/workspace/freepik/fc-central-payments-api/.claude/skills/*` (SOLO lectura para evaluación clean-room).

- [ ] **Step 1: Inspeccionar estructura de ai-config**

```bash
ls ~/workspace/ai-config && cat ~/workspace/ai-config/README.md 2>/dev/null | head -40
```

Localizar dónde viven agents/skills exportados (si no hay convención, crear `agents/` junto a `commands/` siguiendo el patrón existente del repo).

- [ ] **Step 2: Generalizar los dos agentes del portfolio**

Copiar `agents/design-reviewer.md` y `agents/qa-a11y-perf.md` del portfolio a ai-config eliminando toda referencia específica del portfolio (rutas `apps/web`, nombres de skins, comandos pnpm concretos → parametrizarlos como «los comandos del repo»); mantener frontmatter compatible con subagentes Claude. Criterio de éxito: un agente aplicable tal cual en ai-playground.

- [ ] **Step 3: Evaluar las 8 skills de fc-central-payments-api (clean-room)**

Leer cada `SKILL.md` de `api-spec-generator, feature-implement, integration-test-write, pr-create, pr-review, security-scan, unit-test-write, workflow-development-feature` y compararlas con las skills `nico-*` ya instaladas (`nico-api-design`, `nico-testing`, `nico-code-review`, `nico-security`, `open-pr`…). Regla de decisión: exportar SOLO si aporta técnica/checklist que ninguna `nico-*` cubre; en ese caso REESCRIBIR desde cero en ai-config (cero copia literal, cero referencias a Freepik/empresa, ejemplos genéricos). Registrar la decisión por skill (exportada/descartada y por qué) en el mensaje de commit o en una nota del README de ai-config.

- [ ] **Step 4: Commit + push de ai-config**

```bash
cd ~/workspace/ai-config && git add -A && git commit -m "feat: agentes design-reviewer y qa-a11y-perf generalizados + evaluación skills payments" && git push
```

- [ ] **Step 5: Cierre en el portfolio**

En `<portfolio>/STATUS.md`: anotar fase A del ai-playground completada con URL del repo, y refrescar el pendiente «Upgrade Node 22» (ya hecho: local v22.23.1 — evaluar retirar pins de `docs/decisions/2026-07-10-dependency-pins.md` como follow-up, no en este plan).

```bash
cd <portfolio> && git add STATUS.md && git commit -m "docs: registra bootstrap de ai-playground (fase A) en STATUS"
```
