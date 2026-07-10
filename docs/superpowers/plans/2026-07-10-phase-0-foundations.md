# Fase 0: Fundaciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monorepo pnpm operativo con Next.js 16 + TS estricto + Tailwind v4, tooling en verde, CI, y config de agentes agnóstica (AGENTS.md + skills + agents + symlinks).

**Architecture:** pnpm workspaces con `apps/web` (Next.js) y `packages/*` (reservado para media-kit en F2). Config de agentes con fuentes de verdad en raíz y symlinks por herramienta creados por `scripts/setup-agents.sh`. La única lógica de código de esta fase es `resolveOutputMode` (runtime dual), desarrollada con TDD.

**Tech Stack:** pnpm 10, Next.js 16, React 19, TypeScript 5 (strict), Tailwind CSS 4, ESLint 9 (flat config), Prettier 3, Vitest.

## Global Constraints

- Ver sección homónima de `2026-07-10-portfolio-roadmap.md` — aplica entera.
- Todos los ficheros de config en la raíz salvo los específicos de un workspace.
- Ningún fichero de contenido dentro de `.claude/`, `.cursor/`, `.codex/` o `.github/` (solo symlinks o generados).
- Los symlinks se crean SOLO vía `scripts/setup-agents.sh` (idempotente), nunca a mano.

---

### Task 1: Esqueleto del monorepo pnpm

**Files:**

- Create: `pnpm-workspace.yaml`, `package.json`, `.gitignore`, `.npmrc`, `.editorconfig`

**Interfaces:**

- Produces: workspace raíz con scripts `lint`, `format`, `format:fix`, `typecheck`, `test`, `build`, `dev` que las demás tareas y fases invocan.

- [ ] **Step 1: Crear los ficheros raíz**

`pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

`package.json`:

```json
{
  "name": "nicobehm-portfolio",
  "private": true,
  "packageManager": "pnpm@9.9.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm -r build",
    "lint": "eslint .",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "agents:setup": "bash scripts/setup-agents.sh --all",
    "agents:validate": "bash scripts/setup-agents.sh --validate"
  }
}
```

Nota: si `pnpm --version` local difiere, usar la versión local exacta en `packageManager`.

`.gitignore`:

```gitignore
node_modules/
.next/
out/
dist/
coverage/
.env*
!.env.example
*.tsbuildinfo
.DS_Store
test-results/
playwright-report/
```

`.npmrc`:

```ini
engine-strict=true
```

`.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
```

- [ ] **Step 2: Verificar**

Run: `pnpm install`
Expected: crea `pnpm-lock.yaml` sin errores (aún sin dependencias).

- [ ] **Step 3: Commit**

```bash
git add pnpm-workspace.yaml package.json .gitignore .npmrc .editorconfig pnpm-lock.yaml
git commit -m "chore: scaffold pnpm monorepo"
```

---

### Task 2: App Next.js 16 con TS estricto y Tailwind v4

**Files:**

- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`, `apps/web/src/lib/output-mode.ts`, `apps/web/src/lib/output-mode.test.ts`, `apps/web/vitest.config.ts`, `apps/web/.env.example`

**Interfaces:**

- Produces: workspace `web`; `resolveOutputMode(env: NodeJS.ProcessEnv): 'export' | 'node'` en `apps/web/src/lib/output-mode.ts` (lo consume `next.config.ts` ahora y la F5 al documentar el dual). Página raíz provisional (F3 la sustituye por `[locale]`).

- [ ] **Step 1: Instalar dependencias**

```bash
cd apps/web  # crear carpeta primero: mkdir -p apps/web/src/app apps/web/src/lib
pnpm add next@^16 react@^19 react-dom@^19
pnpm add -D typescript @types/react @types/react-dom @types/node tailwindcss@^4 @tailwindcss/postcss postcss vitest
```

(Ejecutar desde `apps/web` tras crear su `package.json` mínimo en el paso 2, o crear el `package.json` a mano y luego `pnpm install`.)

- [ ] **Step 2: Crear config del workspace**

`apps/web/package.json` (versiones: las que resuelva pnpm en Step 1). AMENDED 2026-07-10: engines.node relajado a >=20 por entorno local (Node 20.17, engine-strict); subir a >=22 cuando el owner actualice Node (20 es EOL desde 2026-04). CI verifica con Node 22:

```json
{
  "name": "web",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

`apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noEmit": true,
    "allowJs": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Nota (AMENDED 2026-07-10): Next 16 reescribe `jsx` a `"react-jsx"` y añade
`.next/dev/types` al `include` en el primer build — el committed
`tsconfig.json` refleja eso.

`apps/web/postcss.config.mjs`:

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
};
```

`apps/web/.env.example`:

```bash
# 'export' (default, estático) | 'node' (SSR + route handlers)
NEXT_OUTPUT_MODE=export
# URL pública del sitio (dominio pendiente; usar la del deploy)
NEXT_PUBLIC_SITE_URL=https://example-placeholder.dev
```

- [ ] **Step 3: TDD — test de `resolveOutputMode` (failing)**

`apps/web/src/lib/output-mode.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveOutputMode } from './output-mode';

describe('resolveOutputMode', () => {
  it('devuelve export por defecto (sin variable)', () => {
    expect(resolveOutputMode({})).toBe('export');
  });

  it('devuelve node cuando NEXT_OUTPUT_MODE=node', () => {
    expect(resolveOutputMode({ NEXT_OUTPUT_MODE: 'node' })).toBe('node');
  });

  it('devuelve export ante valores desconocidos', () => {
    expect(resolveOutputMode({ NEXT_OUTPUT_MODE: 'wat' })).toBe('export');
  });
});
```

`apps/web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.{ts,tsx}'] },
});
```

Run: `pnpm --filter web test`
Expected: FAIL — `Cannot find module './output-mode'`.

- [ ] **Step 4: Implementación mínima**

`apps/web/src/lib/output-mode.ts`:

```ts
export type OutputMode = 'export' | 'node';

/** Runtime dual: 'export' (estático, default) o 'node' (SSR + route handlers). */
export function resolveOutputMode(env: Record<string, string | undefined>): OutputMode {
  return env.NEXT_OUTPUT_MODE === 'node' ? 'node' : 'export';
}
```

Run: `pnpm --filter web test`
Expected: PASS (3 tests).

- [ ] **Step 5: next.config.ts dual + app mínima**

`apps/web/next.config.ts`:

```ts
import type { NextConfig } from 'next';
import { resolveOutputMode } from './src/lib/output-mode';

const mode = resolveOutputMode(process.env);

const nextConfig: NextConfig = {
  // Modo 'export': estático puro (hosting compartido). Modo 'node': SSR + route handlers.
  ...(mode === 'export' ? { output: 'export' as const } : {}),
  // output:'export' no soporta el optimizador de imágenes server-side.
  images: { unoptimized: mode === 'export' },
};

export default nextConfig;
```

`apps/web/src/app/globals.css`:

```css
@import 'tailwindcss';
/* Tokens semánticos: se definen en Fase 1 (design system). */
```

`apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nico Behm — Full-stack engineer',
  description: 'Portfolio (en construcción). Fase 0.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
```

`apps/web/src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Nico Behm — portfolio en construcción (Fase 0)</h1>
    </main>
  );
}
```

- [ ] **Step 6: Verificar los dos builds**

Run: `pnpm --filter web build`
Expected: build OK con `output: export` → genera `apps/web/out/`.

Run: `NEXT_OUTPUT_MODE=node pnpm --filter web build`
Expected: build OK sin `out/` (server build en `.next/`).

Run: `pnpm --filter web typecheck`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add apps/web pnpm-lock.yaml
git commit -m "feat: add Next.js 16 app with strict TS, Tailwind v4 and dual output mode (TDD)"
```

---

### Task 3: ESLint (flat) + Prettier en raíz

**Files:**

- Create: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`

**Interfaces:**

- Produces: `pnpm run lint` y `pnpm run format` operativos repo-wide (los usa el CI de Task 8 y todas las fases).

- [ ] **Step 1: Instalar en raíz**

```bash
pnpm add -D -w eslint typescript-eslint @eslint/js eslint-config-next eslint-config-prettier prettier
```

- [ ] **Step 2: Crear configs**

`eslint.config.mjs`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/node_modules/', '**/.next/', '**/out/', '**/dist/', '**/coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  prettier,
);
```

Nota: `@next/eslint-plugin-next` viene como dependencia de `eslint-config-next`; si el import directo falla, añadirlo explícito con `pnpm add -D -w @next/eslint-plugin-next`.

`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

`.prettierignore`:

```
pnpm-lock.yaml
.next/
out/
dist/
coverage/
```

- [ ] **Step 3: Verificar y normalizar**

Run: `pnpm run lint`
Expected: 0 errores (arreglar lo que salga).

Run: `pnpm run format:fix && pnpm run format`
Expected: todo formateado, check en verde.

- [ ] **Step 4: Commit**

```bash
git add eslint.config.mjs .prettierrc.json .prettierignore package.json pnpm-lock.yaml
git add -u
git commit -m "chore: add ESLint flat config and Prettier"
```

---

### Task 4: AGENTS.md — fuente de verdad agnóstica

**Files:**

- Create: `AGENTS.md`

**Interfaces:**

- Produces: `AGENTS.md` con tabla de routing que referencia las skills de Task 5 y agents de Task 6 (nombres EXACTOS: `nextjs-static-dual`, `tailwind-tokens`, `component-patterns`, `accessibility`, `performance`, `code-principles`, `design-reviewer`, `qa-a11y-perf`).

- [ ] **Step 1: Crear `AGENTS.md`**

Contenido completo (es la fuente de verdad para CUALQUIER agente; en inglés, estándar del ecosistema):

```markdown
# AGENTS.md — nicobehm portfolio

Source of truth for ANY coding agent (Claude Code, Cursor, Codex, Gemini CLI, Copilot…).
`CLAUDE.md` and `GEMINI.md` are symlinks to this file. Never edit generated/symlinked copies.

## What this repo is

Bilingual (es/en) professional portfolio for Nico Behm: Next.js 16 monorepo with an AI
playground and the `@nicobehm/media-kit` npm package. The repo itself is a portfolio piece:
structure, tests, tooling and this agent config are meant to be audited.

- Spec: `docs/superpowers/specs/2026-07-10-portfolio-design.md`
- Roadmap: `docs/superpowers/plans/2026-07-10-portfolio-roadmap.md`

## Commands

| Action                      | Command                                                    |
| --------------------------- | ---------------------------------------------------------- |
| Install                     | `pnpm install`                                             |
| Dev server                  | `pnpm run dev`                                             |
| Build (static, default)     | `pnpm run build`                                           |
| Build (Node mode)           | `NEXT_OUTPUT_MODE=node pnpm run build`                     |
| Lint / format / types       | `pnpm run lint` · `pnpm run format` · `pnpm run typecheck` |
| Tests                       | `pnpm run test`                                            |
| Agent config setup/validate | `pnpm run agents:setup` · `pnpm run agents:validate`       |

## Hard rules

- TypeScript strict; lint, format, typecheck and tests must stay green.
- Colors ONLY through semantic tokens (CSS vars + `data-theme`). Never hardcode colors.
- No private/company dependencies. Public OSS or own code only.
- Static export is the default runtime; never assume a Node server in components.
- Never put secrets in the repo or the static bundle.
- Content lives in typed data/MDX (`apps/web/src/data`, `apps/web/content`), never inline in JSX.

## Skills routing (knowledge)

Read the matching skill in `skills/<name>/SKILL.md` BEFORE working on a matching topic.

<!-- prettier-ignore -->
| Action / keywords | Skill |
|-------------------|-------|
| App Router, RSC vs client, static export, output export, route handlers, SSR, dual runtime, hosting | `nextjs-static-dual` |
| colors, theming, dark mode, light mode, design tokens, CSS variables, Tailwind, data-theme | `tailwind-tokens` |
| component, variants, cva, composition, headless, forms, empty state, loading state, error state | `component-patterns` |
| accessibility, a11y, WCAG, aria, keyboard, focus, contrast, screen reader | `accessibility` |
| performance, Core Web Vitals, LCP, bundle size, images, code splitting, Lighthouse | `performance` |
| refactor, readability, SOLID, module size, naming, single responsibility, code review | `code-principles` |

## Review lenses (agents)

`agents/*.md` are review briefs any tool can run as a prompt (Claude Code loads them as subagents):

- `design-reviewer` — visual/taste audit: hierarchy, spacing, states, both themes.
- `qa-a11y-perf` — runs Playwright + a11y + Lighthouse audits, reports findings.

## Division of responsibilities

- **Process** (how to work: brainstorm → plan → TDD → review → verify): the
  [Superpowers](https://github.com/obra/superpowers) plugin, when available. Agents without
  Superpowers: follow the plans in `docs/superpowers/plans/` task-by-task and keep its
  spirit — small TDD steps, frequent commits, review before done.
- **Knowledge** (project-specific domain rules): `skills/`.
- **Review** (quality lenses run on demand): `agents/`.

## Tool discovery map

| Tool           | Entry point                                                                |
| -------------- | -------------------------------------------------------------------------- |
| Claude Code    | `CLAUDE.md` (symlink) + `.claude/skills`, `.claude/agents` (symlinks)      |
| Cursor         | `AGENTS.md` (native) + `.cursor/skills` (symlink)                          |
| Codex CLI      | `AGENTS.md` (native) + `.codex/skills` (symlink)                           |
| Gemini CLI     | `GEMINI.md` (symlink)                                                      |
| GitHub Copilot | `.github/copilot-instructions.md` (generated) + `.github/skills` (symlink) |
| Anything else  | read this file + `skills/` + `agents/` directly                            |

Symlinks and the generated Copilot file are managed by `scripts/setup-agents.sh`
(`--all` to create, `--validate` in CI). On checkouts without symlink support (Windows
without developer mode), run `pnpm run agents:setup` after enabling symlinks or read the
root sources directly.
```

- [ ] **Step 2: Verificar formato**

Run: `pnpm run format:fix`
Expected: sin cambios inesperados (la tabla de routing está protegida con `<!-- prettier-ignore -->`).

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md as tool-agnostic source of truth"
```

---

### Task 5: Las 6 skills de conocimiento

**Files:**

- Create: `skills/nextjs-static-dual/SKILL.md`, `skills/tailwind-tokens/SKILL.md`, `skills/component-patterns/SKILL.md`, `skills/accessibility/SKILL.md`, `skills/performance/SKILL.md`, `skills/code-principles/SKILL.md`

**Interfaces:**

- Consumes: nombres de skill de la tabla de routing de `AGENTS.md` (Task 4) — deben coincidir EXACTAMENTE.
- Produces: 6 `SKILL.md` con frontmatter portable (`name`, `description`, `metadata.auto-invoke`).

Formato común de frontmatter (mismo patrón en las 6):

```yaml
---
name: <slug>
description: <qué es + "Use when ..." con triggers concretos>
metadata:
  auto-invoke: '<keywords de la tabla de AGENTS.md, verbatim>'
---
```

- [ ] **Step 1: `skills/nextjs-static-dual/SKILL.md`**

```markdown
---
name: nextjs-static-dual
description: Next.js 16 App Router with dual runtime — static export (default) and optional Node mode. Use when creating routes/pages, choosing RSC vs client components, or touching next.config, route handlers, images or anything runtime-dependent.
metadata:
  auto-invoke: 'App Router, RSC vs client, static export, output export, route handlers, SSR, dual runtime, hosting'
---

# Next.js static-first dual runtime

## Model

- `resolveOutputMode(process.env)` (`apps/web/src/lib/output-mode.ts`) decides the mode:
  `export` (default) or `node` (`NEXT_OUTPUT_MODE=node`). Components NEVER branch on this —
  only config and the playground adapter selection do.
- Write every feature so it works in static export. Node mode only ADDS capabilities
  (SSR, `/api/ai-proxy`); it must never be required for a page to render.

## Static export restrictions (the default — respect them everywhere)

- No dynamic route handlers, no server actions at request time, no middleware at runtime,
  no `headers()`/`cookies()`, no ISR.
- Every dynamic segment needs `generateStaticParams` (e.g. `[locale]`, `projects/[slug]`).
- `images.unoptimized = true` in export mode: pre-size images, provide width/height,
  use modern formats committed to the repo (or generated at build time).
- Root `/` redirect to a locale must be a static HTML meta-refresh page or client redirect.

## RSC vs client

- Default to Server Components (they render fine at build time in export mode).
- `"use client"` only for interactivity (theme switcher, playground form, lightbox, slider).
- Keep client islands small and at the leaves; pass data down from server components.

## Node-only surface

- `/api/ai-proxy` route handler (playground live-premium) exists but is excluded from the
  build in export mode. Anything server-secret-dependent belongs ONLY here.
```

- [ ] **Step 2: `skills/tailwind-tokens/SKILL.md`**

```markdown
---
name: tailwind-tokens
description: Semantic design tokens with Tailwind v4 and dark/light theming via CSS variables + data-theme. Use when styling anything, adding colors, spacing, radii, or working on themes.
metadata:
  auto-invoke: 'colors, theming, dark mode, light mode, design tokens, CSS variables, Tailwind, data-theme'
---

# Semantic tokens + theming

## Architecture

- Tokens live in `apps/web/src/app/globals.css`: raw palette (`--palette-*`, private) →
  semantic tokens (`--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-accent`,
  `--color-border`, `--color-surface`, `--color-danger`…) mapped per theme under
  `:root[data-theme='dark']` and `:root[data-theme='light']`.
- Tailwind v4 reads them via `@theme inline` so utilities like `bg-bg`, `text-fg`,
  `border-border` resolve to the CSS vars.
- `data-theme` is set on `<html>`; the theme switcher toggles it and persists to
  localStorage; an inline pre-hydration script prevents theme flash. Dark is default.

## Hard rules

- NEVER hardcode a color in a component: no hex, no rgb(), no Tailwind palette classes
  like `bg-zinc-900` or `text-white`. Semantic utilities/vars only.
- New color needs? Add a semantic token to BOTH themes, then use it. If it only makes
  sense in one theme, the token still needs a value in both.
- Non-color scales (spacing, radius, fonts) also go through tokens when they carry
  design intent (`--radius-card`, `--font-mono`…).
- media-kit components use their own `--mk-*` public custom properties; map portfolio
  tokens to them at the usage site, never inside the package.

## Review check

`grep -rnE '#[0-9a-fA-F]{3,8}|rgb\(' apps/web/src/components apps/web/src/features` must
return nothing (except token definitions in globals.css).
```

- [ ] **Step 3: `skills/component-patterns/SKILL.md`**

```markdown
---
name: component-patterns
description: Component conventions — composition, cva variants, headless patterns, accessible forms, explicit empty/loading/error states. Use when creating or refactoring any UI component.
metadata:
  auto-invoke: 'component, variants, cva, composition, headless, forms, empty state, loading state, error state'
---

# Component patterns

## Structure

- Primitives in `apps/web/src/components/ui/` (one folder per component: `button/button.tsx`,
  `button.test.tsx`, `index.ts`). Feature components live with their feature
  (`features/playground/ui/`). Layout chrome in `components/layout/`.
- Composition over configuration: prefer `children`/slots over boolean-prop explosions.
  Behavior-only (headless) logic goes in hooks; the visual layer stays swappable.

## Variants

- Use `cva` for variants; export the variant type:
  `type ButtonProps = VariantProps<typeof buttonVariants> & ComponentProps<'button'>`.
- Variant classes use ONLY semantic token utilities (see `tailwind-tokens`).

## States are part of the API

- Any component rendering async/remote data MUST render explicit `empty`, `loading` and
  `error` states — designed, not incidental. No spinners-only: skeletons for content
  shapes, human copy + retry affordance for errors, helpful guidance for empty.
- Model them as a discriminated union (`{ status: 'idle' | 'loading' | 'success' | 'error' }`),
  never as independent booleans.

## Forms

- Every input has a `<label>` (visible or sr-only), described errors
  (`aria-describedby` + `aria-invalid`), and keyboard-complete operation.
- Validate with Zod schemas shared with the domain layer; show messages inline.

## Definition of done for a component

Unit/RTL tests for behavior and a11y basics; entry in `/showcase` with all variants and
states; props documented (JSDoc or README table); no hardcoded colors or copy.
```

- [ ] **Step 4: `skills/accessibility/SKILL.md`**

```markdown
---
name: accessibility
description: WCAG AA checklist applied during build and review. Use when building interactive components, reviewing UI, or auditing pages for keyboard, ARIA, contrast.
metadata:
  auto-invoke: 'accessibility, a11y, WCAG, aria, keyboard, focus, contrast, screen reader'
---

# Accessibility — WCAG AA checklist

## Keyboard

- [ ] Everything operable by keyboard alone; logical tab order; no traps.
- [ ] Visible focus ring (token `--color-ring`) on every focusable element; never `outline: none` without replacement.
- [ ] Overlays (lightbox, menus): focus trapped inside, `Escape` closes, focus returns to trigger.
- [ ] Custom widgets follow WAI-ARIA APG patterns (slider → `role="slider"` + arrow keys; tabs → roving tabindex).

## Semantics / ARIA

- [ ] Native elements first (`button`, `a`, `label`, `nav`, `main`); ARIA only when HTML can't.
- [ ] Every image: meaningful `alt` (or `alt=""` if decorative). Every icon-button: accessible name.
- [ ] Live async updates announced via `aria-live="polite"` region (playground results).
- [ ] Landmarks: one `main`, labeled `nav`s; headings hierarchical without skips.

## Visual

- [ ] Contrast in BOTH themes: text ≥ 4.5:1, large text/UI components ≥ 3:1 (check tokens when defined, not per-component).
- [ ] Information never by color alone; `prefers-reduced-motion` respected on all animations.
- [ ] Zoom 200% and 320px viewport: no loss of content or function.

## i18n

- [ ] `<html lang>` correct per locale; locale switcher announces target language.

## Verification

RTL + `vitest-axe`/`jest-axe` for components; Playwright + `@axe-core/playwright` per page
in BOTH themes (Phase 6 automates this in CI).
```

- [ ] **Step 5: `skills/performance/SKILL.md`**

```markdown
---
name: performance
description: Core Web Vitals, image discipline, bundle budget and code splitting for a static-first Next.js site. Use when adding dependencies, images, fonts, client components, or investigating slowness.
metadata:
  auto-invoke: 'performance, Core Web Vitals, LCP, bundle size, images, code splitting, Lighthouse'
---

# Performance

## Budgets (CI-enforced in Phase 6, respected always)

- Lighthouse (mobile, static build): Performance > 90, A11y = 100, Best Practices > 95, SEO > 95.
- First Load JS per route: ≤ 130 kB gzip. New dependency > 10 kB gzip needs justification
  in the PR/commit body (and prefer dynamic import).

## Images & media

- Static export ⇒ no server optimizer: commit pre-sized modern formats (AVIF/WebP) with
  explicit width/height (no CLS). Mock playground media: images ≤ 200 kB, videos ≤ 2 MB
  (H.264/AV1, `preload="none"`, poster image).
- LCP element (hero) preloaded/priority; below-the-fold media lazy.

## JS discipline

- Server Components by default; client islands at the leaves (see `nextjs-static-dual`).
- Heavy client-only pieces (lightbox, slider, playground panel) load via `next/dynamic`.
- Fonts: `next/font` self-hosted subsets, `display: swap`, max 2 families.

## Verify

`pnpm --filter web build` prints route sizes — check them on every feature. Run Lighthouse
locally on `out/` before phase close (`pnpm dlx serve apps/web/out`).
```

- [ ] **Step 6: `skills/code-principles/SKILL.md`**

```markdown
---
name: code-principles
description: Readability, SOLID, single responsibility and module-size rules for this repo. Use when writing, refactoring or reviewing any code.
metadata:
  auto-invoke: 'refactor, readability, SOLID, module size, naming, single responsibility, code review'
---

# Code principles

## Readability first

- Code reads top-down like prose: intent-revealing names, no abbreviations
  (`generationRequest`, not `genReq`), early returns over nesting.
- Comments explain WHY, never WHAT. If a comment explains what, rename/extract instead.

## Responsibility & size

- One reason to change per module. A file > ~150 lines or a component doing fetch+state+layout
  is a split signal (extract hook, extract presentational child).
- Dependencies point inward: `domain/` imports nothing from `ui/` or `adapters/`;
  adapters implement domain ports (see playground architecture in the spec).

## SOLID, pragmatically

- SRP and DIP (ports/adapters) are load-bearing here; interfaces stay minimal (ISP) —
  don't add abstraction ceremony where a function suffices (YAGNI).
- Extend via composition/variants, not by editing stable code into flag-soup (OCP).

## Errors

- No silent failures: catch only where you can handle or translate; typed error results
  (`{ ok: false, reason }`) over thrown strings; degraded paths (live→mock) surface a
  visible notice, never a console-only warning.

## Tests

- Test behavior through the public API, not implementation details. Every bug fix starts
  with a failing test. Table-driven cases for pure logic.
```

- [ ] **Step 7: Verificar y commitear**

Run: `ls skills/*/SKILL.md | wc -l`
Expected: `6`.

Run: `pnpm run format:fix`

```bash
git add skills/
git commit -m "docs: add 6 domain knowledge skills"
```

---

### Task 6: Los 2 agents (lentes de revisión)

**Files:**

- Create: `agents/design-reviewer.md`, `agents/qa-a11y-perf.md`

**Interfaces:**

- Produces: briefs markdown con frontmatter compatible con subagentes Claude, ejecutables como prompt por cualquier herramienta. Referenciados desde `AGENTS.md` (Task 4).

- [ ] **Step 1: `agents/design-reviewer.md`**

```markdown
---
name: design-reviewer
description: Visual and taste audit of the portfolio UI. Use after building or changing any page/component — checks hierarchy, spacing, states and coherence across both themes. Read-only reviewer; reports findings, does not fix.
tools: Read, Grep, Glob, Bash
---

You are a demanding design reviewer for a developer portfolio with a dev-tool / API-landing
aesthetic (Stripe/Vercel/Linear bar). You review, you do NOT fix. Any tool can run this file
as a review prompt.

## Procedure

1. Run the app or build (`pnpm run dev` or serve `apps/web/out/`), or read the relevant
   JSX/CSS if a browser is unavailable. Review every changed page/component in BOTH themes
   (`data-theme='dark'` and `'light'`) and at 375px, 768px, 1440px widths.
2. Audit against the checklist. For each finding: severity (blocker/major/minor),
   location (file or route), what's wrong, and a concrete suggestion.

## Checklist

- **Hierarchy:** one clear primary action per view; type scale consistent (no ad-hoc sizes);
  headings tell the page story alone.
- **Spacing:** rhythm from spacing tokens only — no arbitrary margins; consistent gaps in
  lists/grids; breathing room around hero and section boundaries.
- **States:** hover/focus/active/disabled visibly distinct; empty/loading/error states
  designed (per `component-patterns`), not defaulted.
- **Both themes:** nothing unreadable or washed out in either theme; imagery works on both
  backgrounds; borders/surfaces keep contrast (per `accessibility` tokens).
- **Coherence:** components reused, not near-duplicated; icon set and radii consistent;
  copy tone uniform (no lorem ipsum, no `TODO_CV` leaking into a "done" claim).
- **Taste:** does it look like a product a staff engineer shipped? Flag anything generic,
  cramped, or template-like — with a specific improvement.

## Output

Markdown report: summary verdict (ship / fix-first), findings grouped by severity,
top 3 improvements with the highest visual payoff.
```

- [ ] **Step 2: `agents/qa-a11y-perf.md`**

```markdown
---
name: qa-a11y-perf
description: QA lens that runs the automated quality gates — Playwright e2e, accessibility (axe) and performance (Lighthouse) — and reports findings. Use before closing a phase or PR that touches UI or build config. Read-only reviewer; reports findings, does not fix.
tools: Read, Grep, Glob, Bash
---

You are the QA gate for this repo. You execute the real audits and report evidence —
never estimate results you didn't measure. Any tool can run this file as a prompt.

## Procedure

1. **Checks:** `pnpm run lint && pnpm run typecheck && pnpm run test` — record pass/fail.
2. **Build both modes:** `pnpm run build` and `NEXT_OUTPUT_MODE=node pnpm run build`.
3. **E2E:** if Playwright specs exist (`apps/web/e2e/`), run `pnpm --filter web exec playwright test`
   against the static build. Note failures with trace paths.
4. **A11y:** run the axe-based specs in both themes; additionally spot-check keyboard-only
   operation of lightbox, compare slider and playground form.
5. **Performance:** serve `apps/web/out/` (`pnpm dlx serve`) and run Lighthouse
   (`pnpm dlx lighthouse <url> --preset=perf --form-factor=mobile`) on home, one case study
   and the playground. Record scores and the failing audits.
6. Compare against budgets in `skills/performance/SKILL.md` (Lighthouse > 90,
   First Load JS ≤ 130 kB/route) and WCAG AA per `skills/accessibility/SKILL.md`.

## Output

Markdown report: table of gates (gate → result → evidence), findings with severity and
repro steps, and a final verdict: PASS / FAIL with the exact blockers.
```

- [ ] **Step 3: Commit**

```bash
git add agents/
git commit -m "docs: add design-reviewer and qa-a11y-perf review lenses"
```

---

### Task 7: `scripts/setup-agents.sh` + symlinks multi-herramienta

**Files:**

- Create: `scripts/setup-agents.sh`
- Create (vía script): `CLAUDE.md`, `GEMINI.md`, `.claude/skills`, `.claude/agents`, `.cursor/skills`, `.codex/skills`, `.github/skills` (symlinks), `.github/copilot-instructions.md` (generado)

**Interfaces:**

- Consumes: `AGENTS.md` (Task 4), `skills/` (Task 5), `agents/` (Task 6).
- Produces: `pnpm run agents:setup` y `pnpm run agents:validate` (usado por CI en Task 8).

- [ ] **Step 1: Crear el script**

`scripts/setup-agents.sh`:

```bash
#!/usr/bin/env bash
# Manages tool-specific entry points for the agent-agnostic config.
# Sources of truth: AGENTS.md, skills/, agents/ (repo root). Everything else is a
# symlink or generated file. Usage: setup-agents.sh [--all|--validate|--copilot]
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# link target: relative path from link's directory to the real source
LINKS=(
  "CLAUDE.md:AGENTS.md"
  "GEMINI.md:AGENTS.md"
  ".claude/skills:../skills"
  ".claude/agents:../agents"
  ".cursor/skills:../skills"
  ".codex/skills:../skills"
  ".github/skills:../skills"
)
COPILOT_FILE=".github/copilot-instructions.md"

create_links() {
  for entry in "${LINKS[@]}"; do
    local link="${entry%%:*}" target="${entry##*:}"
    mkdir -p "$(dirname "$link")"
    if [ -e "$link" ] && [ ! -L "$link" ]; then
      echo "ERROR: $link exists and is not a symlink. Move it away first." >&2
      exit 1
    fi
    ln -sfn "$target" "$link"
    echo "link: $link -> $target"
  done
}

generate_copilot() {
  {
    echo "<!-- Auto-generated from AGENTS.md and skills/ by scripts/setup-agents.sh. Do not edit. -->"
    cat AGENTS.md
    echo
    echo "## Skills index (full content in skills/<name>/SKILL.md)"
    echo
    for skill in skills/*/SKILL.md; do
      name="$(basename "$(dirname "$skill")")"
      # description: from frontmatter
      desc="$(awk -F': ' '/^description:/ {sub(/^description: /, ""); print; exit}' "$skill")"
      echo "- **${name}**: ${desc}"
    done
  } > "$COPILOT_FILE"
  echo "generated: $COPILOT_FILE"
}

validate() {
  local ok=0
  for entry in "${LINKS[@]}"; do
    local link="${entry%%:*}" target="${entry##*:}"
    if [ "$(readlink "$link" 2>/dev/null)" != "$target" ]; then
      echo "FAIL: $link should be a symlink to $target" >&2
      ok=1
    fi
  done
  if [ ! -f "$COPILOT_FILE" ]; then
    echo "FAIL: $COPILOT_FILE missing (run --copilot)" >&2
    ok=1
  elif ! head -1 "$COPILOT_FILE" | grep -q "Auto-generated"; then
    echo "FAIL: $COPILOT_FILE lost its auto-generated header" >&2
    ok=1
  fi
  [ "$ok" -eq 0 ] && echo "agent config OK"
  return "$ok"
}

case "${1:---all}" in
  --all) create_links; generate_copilot ;;
  --copilot) generate_copilot ;;
  --validate) validate ;;
  *) echo "usage: $0 [--all|--validate|--copilot]" >&2; exit 2 ;;
esac
```

- [ ] **Step 2: Ejecutar y verificar**

```bash
chmod +x scripts/setup-agents.sh
pnpm run agents:setup
pnpm run agents:validate
```

Expected: 7 `link:` + 1 `generated:` y después `agent config OK`.

Run: `ls -la CLAUDE.md GEMINI.md .claude/ .cursor/ .codex/ .github/`
Expected: todos symlinks correctos; `.github/copilot-instructions.md` regular file.

- [ ] **Step 3: Commit**

```bash
git add scripts/setup-agents.sh CLAUDE.md GEMINI.md .claude .cursor .codex .github/skills .github/copilot-instructions.md
git commit -m "feat: add setup-agents.sh managing multi-tool symlinks and generated Copilot file"
```

---

### Task 8: CI base (GitHub Actions)

**Files:**

- Create: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: scripts raíz (Task 1), builds duales (Task 2), `agents:validate` (Task 7).
- Produces: workflow `ci` que las fases siguientes amplían (Playwright y Lighthouse se añaden en F6).

- [ ] **Step 1: Crear workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run agents:validate
      - run: pnpm run lint
      - run: pnpm run format
      - run: pnpm run typecheck
      - run: pnpm run test

  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        output-mode: [export, node]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
        env:
          NEXT_OUTPUT_MODE: ${{ matrix.output-mode }}
```

- [ ] **Step 2: Verificar localmente lo que el CI hará**

Run: `pnpm run agents:validate && pnpm run lint && pnpm run format && pnpm run typecheck && pnpm run test && pnpm run build && NEXT_OUTPUT_MODE=node pnpm run build`
Expected: todo en verde.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add base workflow (checks + dual-mode build matrix)"
```

---

### Task 9: README provisional + cierre de fase

**Files:**

- Create: `README.md`

**Interfaces:**

- Produces: README mínimo honesto (la versión completa con matriz de deploy es entregable de F6).

- [ ] **Step 1: Crear README**

````markdown
# Nico Behm — portfolio

> ⚠️ Work in progress — Phase 0 (foundations) done. See
> `docs/superpowers/plans/2026-07-10-portfolio-roadmap.md` for the roadmap.

Bilingual (es/en) professional portfolio: Next.js 16 monorepo with an AI playground
and the `@nicobehm/media-kit` package. Agent-agnostic config: see [AGENTS.md](AGENTS.md).

## Run locally

```bash
pnpm install
pnpm run dev        # http://localhost:3000
pnpm run build      # static export (default) → apps/web/out/
NEXT_OUTPUT_MODE=node pnpm run build   # optional Node mode
```

Quality gates: `pnpm run lint && pnpm run format && pnpm run typecheck && pnpm run test`
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add provisional README"
```

- [ ] **Step 3: Cierre de fase (verification-before-completion)**

1. Ejecutar la cadena completa de checks (comando del Task 8 Step 2) — todo verde.
2. Code review de la fase (superpowers:requesting-code-review).
3. Actualizar Estado de F0 en `2026-07-10-portfolio-roadmap.md` a ✅ y commitear:

```bash
git add docs/superpowers/plans/2026-07-10-portfolio-roadmap.md
git commit -m "docs: mark phase 0 as done in roadmap"
```
