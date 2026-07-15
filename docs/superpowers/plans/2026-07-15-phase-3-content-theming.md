# Phase 3 — contenido + páginas + theming v2 + media-kit v2.2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portfolio bilingüe real — i18n `next-intl` bajo `[locale]`, contenido tipado con Zod + 3 case studies MDX, SEO completo, 4 skins + 3 vistas de CV fijables por URL, y `@nicobehm/media-kit` 0.3.0 → **0.4.0** con compare-lightbox, doble resolución y paridad con la referencia.

**Architecture:** Bloque A primero (todo el app se muda bajo `app/[locale]/` con `generateStaticParams`; contenido como datos Zod en `src/data/` y MDX compilado en RSC con `next-mdx-remote/rsc`). Bloque C después (el paquete gana un modelo `MediaSource {src, fullSrc, alt}`, modo compare dentro del `MediaLightbox` reutilizando el motor `useZoomPan` existente, y botón fullscreen por ejemplo; el showcase consume todo al final). Bloque B al cierre (los 4 skins son solo bloques CSS sobre los MISMOS tokens; `lib/appearance.ts` absorbe `theme.ts` y gobierna `{theme, skin, view}` con precedencia URL > localStorage > default).

**Tech Stack:** Next.js 16 App Router (static export default, Node opcional) · next-intl v4 · Zod v4 · next-mdx-remote v5 (`/rsc`) + gray-matter · Tailwind v4 tokens semánticos · Vitest + RTL · tsup (paquete).

**Spec:** `docs/superpowers/specs/2026-07-15-phase-3-content-pages-theming-design.md` (leer SIEMPRE antes de cada tarea).

**Decisión MDX (prueba de humo ejecutada 2026-07-15, orquestador):** `next-mdx-remote/rsc` con `parseFrontmatter` compila en build bajo `output: 'export'`; el HTML de la página de humo contenía el MDX renderizado y sus chunks JS eran IDÉNTICOS a los de la home (cero JS extra en cliente). Frontmatter tipado con genérico + validación Zod. `@next/mdx` queda descartado (frontmatter requiere plugins extra y el import dinámico por slug es más frágil con Turbopack).

## Global Constraints

- Rama de trabajo: `feature/phase-3-content-theming` (ya creada desde `main`).
- TDD estricto. Gate por tarea: `pnpm run format:fix && pnpm run lint && pnpm run typecheck && pnpm run test` en verde antes de CADA commit. Commits convencionales (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- **PII:** `apps/web/content/cv/` entra en `.gitignore` en la Task 1 y NUNCA se añade a git. Contacto público SOLO GitHub/LinkedIn — ni email ni teléfono en ningún dato, mensaje o página. Prohibido `git add .`/`git add -A`; siempre rutas explícitas. Los `.mdx` de `apps/web/content/{es,en}/` SÍ se versionan (el ignore es solo `content/cv/`).
- Colores hardcodeados SOLO en `apps/web/src/app/globals.css`, `packages/media-kit/src/styles.css` y assets de demo. Todo componente usa tokens semánticos (skill `tailwind-tokens`).
- **media-kit 0.4.0 = 0.3.0 + capacidades, cero breaking.** Los tests v1/v2/v2.1 existentes del paquete NO se modifican (ni aserciones ni comportamiento); los tests nuevos se AÑADEN en `describe` propios al final. Única excepción acotada: `children` pasa de requerido a opcional en `MediaLightboxProps` (compatible: todo código existente compila). Idioma del paquete: defaults en inglés, todo texto nuevo vía props/labels.
- Static export es el runtime por defecto: nada puede requerir servidor (skill `nextjs-static-dual`). Toda ruta dinámica lleva `generateStaticParams`.
- Dependencias nuevas permitidas (todas OSS, justificación: i18n/validación/MDX son build-time o <15 kB): `next-intl`, `zod`, `next-mdx-remote`, `gray-matter`. Ninguna otra sin consultar al orquestador.
- Los subagentes LEEN las skills antes de tocar su tema: `nextjs-static-dual` (rutas/i18n/MDX/export), `tailwind-tokens` (skins/estilos), `accessibility` (switchers, FilterableList, vistas CV, lightbox), `component-patterns` (componentes/estados), `performance` (fuentes, assets HD), `code-conventions` (todo el código).
- El campo de fecha en datos/frontmatter usa strings `YYYY-MM` o `YYYY-MM-DD`; nunca `Date` serializado.
- `pnpm --filter web` = app; `pnpm --filter @nicobehm/media-kit` = paquete. Tras cambiar el paquete, `pnpm --filter @nicobehm/media-kit build` antes de verificar nada en la app (la app consume `dist/`).

## Mapa de ficheros

```
.gitignore                                              # MODIFY (T1: content/cv)
apps/web/
├── package.json                                        # MODIFY (T1: deps)
├── next.config.ts                                      # MODIFY (T1: plugin next-intl)
├── messages/es.json · messages/en.json                 # CREATE (T1) · MODIFY (T6-T10, T23-T25)
├── content/{es,en}/projects/*.mdx                      # CREATE (T4: 3 case studies × 2)
├── src/i18n/{routing,request,navigation}.ts            # CREATE (T1)
├── src/app/
│   ├── layout.tsx                                      # MODIFY (T1: root mínimo)
│   ├── page.tsx                                        # MODIFY (T1: redirect /en)
│   ├── showcase/page.tsx                               # MODIFY (T1: redirect /en/showcase)
│   ├── globals.css                                     # MODIFY (T21: skins+fuentes; T24: print)
│   ├── globals-contrast.test.ts                        # CREATE (T21: AA 8 combos)
│   ├── sitemap.ts · robots.ts                          # CREATE (T11)
│   └── [locale]/
│       ├── layout.tsx                                  # CREATE (T1) · MODIFY (T6, T11, T20, T21)
│       ├── page.tsx                                    # CREATE (T1 provisional; T7 real)
│       ├── not-found.tsx                               # CREATE (T4)
│       ├── opengraph-image.tsx                         # CREATE (T11)
│       ├── cv/page.tsx                                 # CREATE (T9) · MODIFY (T24, T25)
│       ├── projects/page.tsx                           # CREATE (T8)
│       ├── projects/[slug]/page.tsx                    # CREATE (T4)
│       └── showcase/page.tsx                           # MOVED (T1) · MODIFY (T10, T23, T25)
├── src/data/
│   ├── schemas.ts · schemas.test.ts                    # CREATE (T2)
│   ├── {profile,experience,education,skills,projects}.ts   # CREATE (T3)
│   └── validate-content.test.ts                        # CREATE (T5)
├── src/lib/
│   ├── content.ts · content.test.ts                    # CREATE (T4)
│   ├── seo.ts · seo.test.ts                            # CREATE (T11)
│   ├── appearance.ts · appearance.test.ts              # CREATE (T20; absorbe theme.ts)
│   └── theme.ts · theme.test.ts                        # DELETE (T20)
├── src/components/
│   ├── layout/header.tsx · footer.tsx · locale-switcher.tsx (+tests)  # CREATE (T6)
│   ├── layout/theme-switcher.tsx                       # MODIFY (T20: import appearance)
│   ├── layout/appearance-init.tsx (+test)              # CREATE (T20)
│   ├── layout/skin-switcher.tsx (+test)                # CREATE (T23)
│   ├── layout/share-view-button.tsx (+test)            # CREATE (T25)
│   ├── seo/json-ld.tsx                                 # CREATE (T11)
│   ├── home/{hero,featured-projects,skills-summary}.tsx (+tests)      # CREATE (T7)
│   ├── projects/project-card.tsx (+test)               # CREATE (T8)
│   ├── cv/{experience-entry,skill-group,education-list}.tsx (+tests)  # CREATE (T9)
│   ├── cv/{cv-standard,cv-compact,cv-timeline,cv-view-switcher,cv-content}.tsx (+tests)  # CREATE (T24)
│   ├── ui/filterable-list/ (component+test+index)      # CREATE (T22)
│   ├── showcase/showcase-index.tsx (+test)             # CREATE (T23)
│   ├── showcase/media-kit-demo.tsx                     # MODIFY (T10 labels; T19 expand)
│   └── showcase/portrait-compare-demo.tsx (+test)      # MODIFY (T19: MediaSource+expand)
packages/media-kit/
├── src/media-source.ts (+test)                         # CREATE (T14)
├── src/compare-slider/compare-slider.tsx (+test)       # MODIFY (T13, T14, T15, T16, T17)
├── src/media-lightbox/media-lightbox.tsx (+test)       # MODIFY (T13, T14)
├── src/media-lightbox/use-zoom-pan.ts (+test)          # MODIFY (T12: fix pan)
├── src/styles.css                                      # MODIFY (T12, T13, T15, T16, T17)
├── src/index.ts                                        # MODIFY (T14, T15)
├── README.md · CHANGELOG.md · package.json             # MODIFY (T19: 0.4.0)
apps/web/public/demo/portrait-hd.webp                   # CREATE (T18, orquestador)
docs/superpowers/plans/2026-07-10-portfolio-roadmap.md  # MODIFY (T26)
```

Orden de ejecución: **T1–T11 (bloque A) → T12–T19 (bloque C) → T20–T25 (bloque B) → T26 (cierre)**.

---

## BLOQUE A — contenido, páginas, i18n, SEO

### Task 1: i18n bajo `[locale]` + PII a .gitignore + redirects estáticos

Leer antes: `skills/nextjs-static-dual/SKILL.md`, `skills/code-conventions/SKILL.md`.

**Files:**

- Modify: `.gitignore`, `apps/web/package.json` (deps), `apps/web/next.config.ts`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`
- Create: `apps/web/src/i18n/routing.ts` (+`routing.test.ts`), `apps/web/src/i18n/request.ts`, `apps/web/src/i18n/navigation.ts`, `apps/web/messages/es.json`, `apps/web/messages/en.json`, `apps/web/src/app/[locale]/layout.tsx`, `apps/web/src/app/[locale]/page.tsx`, `apps/web/src/app/showcase/page.tsx` (redirect)
- Move: `apps/web/src/app/showcase/` → `apps/web/src/app/[locale]/showcase/` (git mv; la traducción de sus strings es T10)

**Interfaces:**

- Consumes: layout/theme actual (se traslada intacto al layout de locale).
- Produces: `routing` (`locales: ['es','en']`, `defaultLocale: 'en'`), tipo `Locale`; `Link/redirect/usePathname/useRouter/getPathname` desde `@/i18n/navigation`; rutas `/{es,en}` y `/{es,en}/showcase`; `/` y `/showcase` redirigen estáticamente a `/en...`.

- [ ] **Step 1: PII a .gitignore ANTES de nada** — añadir al final de `.gitignore`:

```
# CV con PII: fuente local, nunca versionada (spec F3 §1)
apps/web/content/cv/
```

Run: `git check-ignore apps/web/content/cv/linkedin.pdf` → imprime la ruta (ignorado).

- [ ] **Step 2: Instalar deps**

Run: `pnpm --filter web add next-intl zod next-mdx-remote gray-matter`
Expected: instala sin conflictos de peers (verificado con React 19 en la prueba de humo).

- [ ] **Step 3: Test failing** — `apps/web/src/i18n/routing.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { routing } from './routing';

describe('routing', () => {
  it('define es y en con en como default', () => {
    expect(routing.locales).toEqual(['es', 'en']);
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('always');
  });
});
```

Run: `pnpm --filter web exec vitest run src/i18n` → FAIL (módulo inexistente).

- [ ] **Step 4: Implementación i18n**

`apps/web/src/i18n/routing.ts`:

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
```

`apps/web/src/i18n/request.ts`:

```ts
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

`apps/web/src/i18n/navigation.ts`:

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

`apps/web/next.config.ts` — envolver con el plugin (config existente intacta):

```ts
import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { resolveOutputMode } from './src/lib/output-mode';

const mode = resolveOutputMode(process.env);

const nextConfig: NextConfig = {
  ...(mode === 'export' ? { output: 'export' as const } : {}),
  images: { unoptimized: mode === 'export' },
  turbopack: { root: path.join(__dirname, '..', '..') },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
```

`apps/web/messages/en.json` (semilla; T6–T10 la amplían):

```json
{
  "nav": { "home": "Home", "cv": "CV", "projects": "Projects", "showcase": "Showcase" },
  "home": {
    "title": "Nico Behm — portfolio under construction (Phase 3)",
    "showcaseCta": "View component showcase →"
  }
}
```

`apps/web/messages/es.json`:

```json
{
  "nav": { "home": "Inicio", "cv": "CV", "projects": "Proyectos", "showcase": "Showcase" },
  "home": {
    "title": "Nico Behm — portfolio en construcción (Fase 3)",
    "showcaseCta": "Ver showcase de componentes →"
  }
}
```

- [ ] **Step 5: Mover el app bajo `[locale]`**

`apps/web/src/app/[locale]/layout.tsx` — el layout actual se traslada aquí con `lang` dinámico:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { routing } from '@/i18n/routing';
import '../globals.css';
import '@nicobehm/media-kit/styles.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// T11 sustituye esto por generateMetadata con hreflang.
export const metadata: Metadata = {
  title: 'Nico Behm — Full-stack engineer',
  description: 'Portfolio (en construcción). Fase 3.',
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`apps/web/src/app/[locale]/page.tsx` (provisional; T7 construye la home real):

```tsx
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  return (
    <main>
      <h1>{t('title')}</h1>
      <Link
        href="/showcase"
        className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t('showcaseCta')}
      </Link>
    </main>
  );
}
```

`apps/web/src/app/layout.tsx` — pasa a root mínimo (patrón next-intl para static export; el `<html>` vive en el layout de locale):

```tsx
import type { ReactNode } from 'react';

// Root mínimo: el <html lang> por locale lo renderiza app/[locale]/layout.tsx.
// Solo las páginas de redirect estático cuelgan de aquí.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

`apps/web/src/app/page.tsx` — redirect estático raíz:

```tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example-placeholder.dev';

// hreflang en la página de redirect (spec §2); si Next no lo emitiera junto al
// meta refresh, el hreflang canónico vive igualmente en todas las páginas reales (T11).
export const metadata: Metadata = {
  alternates: {
    languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}`])),
  },
  robots: { index: false },
};

// En output:export Next emite index.html con meta refresh (__next-page-redirect).
export default function RootRedirect() {
  redirect(`/${routing.defaultLocale}`);
}
```

Mover el showcase y crear su redirect:

```bash
git mv apps/web/src/app/showcase apps/web/src/app/\[locale\]/showcase
```

`apps/web/src/app/showcase/page.tsx` (nuevo, misma técnica):

```tsx
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function ShowcaseRedirect() {
  redirect(`/${routing.defaultLocale}/showcase`);
}
```

En `[locale]/showcase/page.tsx` añadir al principio del componente (es async si no lo era):
`const { locale } = await params; setRequestLocale(locale);` con `params: Promise<{ locale: string }>` en props. Sus strings siguen hardcodeados (T10 los traduce).

- [ ] **Step 6: GREEN + verificación de build export**

Run: `pnpm --filter web exec vitest run src/i18n` → PASS.
Run: `pnpm --filter web build`
Expected: rutas `/es`, `/en`, `/es/showcase`, `/en/showcase`, `/`, `/showcase` estáticas.
Run: `grep -o 'url=/en' apps/web/out/index.html && grep -o 'url=/en/showcase' apps/web/out/showcase.html`
Expected: ambos matches (meta refresh presente). Contingencia: si `redirect()` fallara en export (no debería: patrón documentado de next-intl), PARAR y consultar al orquestador — no improvisar.

> **ENMIENDA (ejecución T1, 2026-07-15):** Next 16.2 ya NO emite meta refresh para `redirect()` en export (solo shell hidratado por JS). Se ejecutó la contingencia: ambas páginas de redirect son páginas renderizadas que emiten `<meta httpEquiv="refresh">` + `<link rel="alternate" hreflang>` (izados por React 19) + `location.replace` + enlace visible. El `noindex` se restauró como `<meta name="robots" content="noindex">` izado en ambas páginas (fix `4e1d2d8`, dentro de T1) — T11 NO tiene que tocar las páginas de redirect.

- [ ] **Step 7: Gate y commit**

Run: `pnpm run format:fix && pnpm run lint && pnpm run typecheck && pnpm run test` → verde.

```bash
git add .gitignore apps/web/package.json pnpm-lock.yaml apps/web/next.config.ts apps/web/messages apps/web/src/i18n apps/web/src/app/layout.tsx apps/web/src/app/page.tsx apps/web/src/app/showcase apps/web/src/app/\[locale\]
git commit -m "feat(web): next-intl under [locale] with static redirects and CV dir gitignored"
```

---

### Task 2: Schemas Zod + guardia de PII

Leer antes: `skills/code-conventions/SKILL.md`.

**Files:**

- Create: `apps/web/src/data/schemas.ts`, `apps/web/src/data/schemas.test.ts`

**Interfaces:**

- Consumes: `zod` (T1), tipo `Locale` implícito en `LocalizedString`.
- Produces (los usan T3–T5, T8–T9, T20, T24): `localizedStringSchema`/`LocalizedString`, `profileSchema`/`Profile`, `experienceEntrySchema`/`ExperienceEntry`, `educationEntrySchema`/`EducationEntry`, `skillSchema`/`Skill`, `projectSchema`/`Project`, `projectFrontmatterSchema`/`ProjectFrontmatter`, `THEMES`/`themeSchema`/`Theme`, `SKINS`/`skinSchema`/`Skin`, `CV_VIEWS`/`cvViewSchema`/`CvView`.

- [ ] **Step 1: Tests failing** — `schemas.test.ts` (casos clave; ampliar misma forma para education/skill/project):

```ts
import { describe, expect, it } from 'vitest';
import {
  cvViewSchema,
  experienceEntrySchema,
  localizedStringSchema,
  profileSchema,
  projectFrontmatterSchema,
  projectSchema,
  skinSchema,
} from './schemas';

const LOC = { es: 'Hola', en: 'Hello' };

describe('localizedStringSchema', () => {
  it('exige ambos idiomas no vacíos', () => {
    expect(localizedStringSchema.safeParse(LOC).success).toBe(true);
    expect(localizedStringSchema.safeParse({ es: 'Hola' }).success).toBe(false);
    expect(localizedStringSchema.safeParse({ es: '', en: 'Hello' }).success).toBe(false);
  });
});

describe('profileSchema — guardia de PII', () => {
  const base = {
    name: 'Nico Behm',
    headline: LOC,
    summary: LOC,
    location: LOC,
    links: { github: 'https://github.com/jnicob', linkedin: 'https://www.linkedin.com/in/x' },
  };
  it('acepta el perfil público', () => {
    expect(profileSchema.safeParse(base).success).toBe(true);
  });
  it('RECHAZA claves extra (email/teléfono imposibles por construcción)', () => {
    expect(profileSchema.safeParse({ ...base, email: 'a@b.com' }).success).toBe(false);
    expect(
      profileSchema.safeParse({ ...base, links: { ...base.links, email: 'mailto:a@b.com' } })
        .success,
    ).toBe(false);
  });
});

describe('experienceEntrySchema', () => {
  it('valida fechas YYYY-MM y end null = presente', () => {
    const entry = {
      id: 'freepik',
      company: 'Freepik',
      role: LOC,
      start: '2024-01',
      end: null,
      summary: LOC,
      highlights: [LOC],
      tags: ['api'],
    };
    expect(experienceEntrySchema.safeParse(entry).success).toBe(true);
    expect(experienceEntrySchema.safeParse({ ...entry, start: 'enero 2024' }).success).toBe(false);
  });
});

describe('projectSchema y frontmatter', () => {
  it('proyecto localizado con métricas y frontmatter plano por locale', () => {
    expect(
      projectSchema.safeParse({
        slug: 'freepik-api-platform',
        title: LOC,
        summary: LOC,
        role: LOC,
        stack: ['nextjs'],
        links: { live: 'https://www.freepik.com/api' },
        metrics: [{ label: LOC, value: '779 PRs' }],
        featured: true,
        date: '2026-07',
      }).success,
    ).toBe(true);
    expect(
      projectFrontmatterSchema.safeParse({
        title: 'X',
        summary: 'Y',
        role: 'Z',
        stack: ['a'],
        links: {},
        metrics: [{ label: 'PRs', value: '779' }],
        date: '2026-07',
      }).success,
    ).toBe(true);
  });
});

describe('enums de apariencia', () => {
  it('skin y view válidos e inválidos', () => {
    expect(skinSchema.safeParse('editorial').success).toBe(true);
    expect(skinSchema.safeParse('neon').success).toBe(false);
    expect(cvViewSchema.safeParse('timeline').success).toBe(true);
    expect(cvViewSchema.safeParse('full').success).toBe(false);
  });
});
```

Run: `pnpm --filter web exec vitest run src/data/schemas` → FAIL.

- [ ] **Step 2: Implementación** — `schemas.ts`:

```ts
import { z } from 'zod';

/** Un dato, dos idiomas: imposible desincronizar es/en. */
export const localizedStringSchema = z
  .object({ es: z.string().min(1), en: z.string().min(1) })
  .strict();
export type LocalizedString = z.infer<typeof localizedStringSchema>;

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'formato YYYY-MM');
const dateish = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'formato YYYY-MM o YYYY-MM-DD');

/** Contacto público SOLO GitHub/LinkedIn — strict() hace imposible añadir email/teléfono. */
export const profileSchema = z
  .object({
    name: z.string().min(1),
    headline: localizedStringSchema,
    summary: localizedStringSchema,
    location: localizedStringSchema,
    links: z.object({ github: z.string().url(), linkedin: z.string().url() }).strict(),
  })
  .strict();
export type Profile = z.infer<typeof profileSchema>;

export const experienceEntrySchema = z
  .object({
    id: z.string().min(1),
    company: z.string().min(1),
    role: localizedStringSchema,
    start: yearMonth,
    end: yearMonth.nullable(),
    summary: localizedStringSchema,
    highlights: z.array(localizedStringSchema).min(1),
    tags: z.array(z.string().min(1)),
  })
  .strict();
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;

export const educationEntrySchema = z
  .object({
    id: z.string().min(1),
    institution: z.string().min(1),
    degree: localizedStringSchema,
    start: z.string().regex(/^\d{4}$/),
    end: z
      .string()
      .regex(/^\d{4}$/)
      .nullable(),
  })
  .strict();
export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const SKILL_CATEGORIES = ['backend', 'frontend', 'ai', 'platform', 'tooling'] as const;
export const skillSchema = z
  .object({
    name: z.string().min(1),
    level: z.number().int().min(1).max(5),
    category: z.enum(SKILL_CATEGORIES),
    tags: z.array(z.string().min(1)),
  })
  .strict();
export type Skill = z.infer<typeof skillSchema>;

const projectLinksSchema = z
  .object({
    live: z.string().url().optional(),
    docs: z.string().url().optional(),
    repo: z.string().url().optional(),
  })
  .strict();

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: localizedStringSchema,
    summary: localizedStringSchema,
    role: localizedStringSchema,
    stack: z.array(z.string().min(1)).min(1),
    links: projectLinksSchema,
    metrics: z.array(z.object({ label: localizedStringSchema, value: z.string().min(1) }).strict()),
    featured: z.boolean(),
    date: dateish,
  })
  .strict();
export type Project = z.infer<typeof projectSchema>;

/** Frontmatter MDX: plano (cada fichero ya ES un locale). */
export const projectFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    role: z.string().min(1),
    stack: z.array(z.string().min(1)).min(1),
    links: projectLinksSchema,
    metrics: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) }).strict()),
    date: dateish,
  })
  .strict();
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

/** Enums de apariencia (spec §5): los reutiliza lib/appearance.ts (T20). */
export const THEMES = ['dark', 'light'] as const;
export const themeSchema = z.enum(THEMES);
export type Theme = z.infer<typeof themeSchema>;

export const SKINS = ['dev-tool', 'editorial', 'terminal', 'vibrant'] as const;
export const skinSchema = z.enum(SKINS);
export type Skin = z.infer<typeof skinSchema>;

export const CV_VIEWS = ['standard', 'compact', 'timeline'] as const;
export const cvViewSchema = z.enum(CV_VIEWS);
export type CvView = z.infer<typeof cvViewSchema>;
```

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/data/schemas` → PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/data/schemas.ts apps/web/src/data/schemas.test.ts
git commit -m "feat(web): Zod content schemas with LocalizedString and PII-proof profile"
```

---

### Task 3: Datos reales de CV (profile, experience, education, skills, projects)

Leer antes: `skills/code-conventions/SKILL.md`. **Fuentes:** los PDFs locales `apps/web/content/cv/linkedin.pdf` (ES) y `linkedin_en.pdf` (EN) — leerlos con la herramienta Read — y la spec de producto `docs/superpowers/specs/2026-07-10-portfolio-design.md` para la etapa Freepik (779 PRs) y los 3 case studies. **PROHIBIDO copiar a los datos: email, teléfono, dirección postal.** Todo lo demás del CV (empresas, fechas, roles, formación) es contenido público del portfolio.

**Files:**

- Create: `apps/web/src/data/profile.ts`, `experience.ts`, `education.ts`, `skills.ts`, `projects.ts`

**Interfaces:**

- Consumes: schemas de T2.
- Produces: constantes `profile: Profile`, `experience: ExperienceEntry[]` (orden cronológico inverso), `education: EducationEntry[]`, `skills: Skill[]`, `projects: Project[]` (3 proyectos, `featured: true` los 3; slugs EXACTOS: `freepik-api-platform`, `ai-model-onboarding`, `flows-api` — T4 los usa para los MDX).

- [ ] **Step 1: Test failing primero** — los datos se validan en el propio módulo (parse en import = build rojo si inválido), así que el test es de integración mínima. Crear `apps/web/src/data/validate-content.test.ts` NO (es T5); aquí basta un test por fichero dentro del mismo commit. Añadir a `schemas.test.ts` al final:

```ts
describe('datos reales', () => {
  it('los módulos de datos parsean contra sus schemas', async () => {
    const { profile } = await import('./profile');
    const { experience } = await import('./experience');
    const { education } = await import('./education');
    const { skills } = await import('./skills');
    const { projects } = await import('./projects');
    expect(profile.name).toBe('Nico Behm');
    expect(experience.length).toBeGreaterThanOrEqual(2);
    expect(education.length).toBeGreaterThanOrEqual(1);
    expect(skills.length).toBeGreaterThanOrEqual(8);
    expect(projects.map((p) => p.slug)).toEqual([
      'freepik-api-platform',
      'ai-model-onboarding',
      'flows-api',
    ]);
  });
});
```

Run → FAIL (módulos inexistentes).

- [ ] **Step 2: Implementación.** Patrón de cada fichero (el parse en import garantiza datos válidos o build rojo — nunca contenido silenciosamente vacío):

`profile.ts`:

```ts
import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero full-stack — plataformas de API de IA end-to-end',
    en: 'Full-stack engineer — end-to-end AI API platforms',
  },
  summary: {
    es: '<resumen real extraído del PDF ES + etapa Freepik de la spec de producto>',
    en: '<resumen real extraído del PDF EN>',
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    github: 'https://github.com/jnicob',
    linkedin: '<URL pública del PDF de LinkedIn>',
  },
});
```

`experience.ts` — la entrada Freepik se redacta desde la spec de producto (plataforma API Freepik/Magnific: specs OpenAPI, FastAPI, gateway APISIX, onboarding de modelos Kling/WAN, Flows API, 779 PRs); las entradas anteriores se extraen de los PDFs (empresa, rol, fechas reales, 2–4 highlights c/u):

```ts
import { experienceEntrySchema, type ExperienceEntry } from './schemas';

const entries = [
  {
    id: 'freepik',
    company: 'Freepik',
    role: { es: 'Ingeniero de plataforma de APIs de IA', en: 'AI API Platform Engineer' },
    start: '<YYYY-MM real del PDF>',
    end: null,
    summary: {
      es: 'Plataforma pública de APIs de IA de Freepik/Magnific: especificación, implementación, gateway, billing y documentación de endpoints de generación.',
      en: 'Freepik/Magnific public AI API platform: specification, implementation, gateway, billing and documentation of generation endpoints.',
    },
    highlights: [
      {
        es: '779 PRs en el ecosistema de la plataforma (specs, servidor FastAPI, gateway, docs).',
        en: '779 PRs across the platform ecosystem (specs, FastAPI server, gateway, docs).',
      },
      {
        es: 'Onboarding end-to-end de modelos de IA (Kling, WAN…): del spec OpenAPI a producción.',
        en: 'End-to-end AI model onboarding (Kling, WAN…): from OpenAPI spec to production.',
      },
    ],
    tags: ['python', 'fastapi', 'openapi', 'apisix', 'ai'],
  },
  // …entradas anteriores desde los PDFs, misma forma…
];

export const experience: ExperienceEntry[] = entries.map((e) => experienceEntrySchema.parse(e));
```

`education.ts`, `skills.ts` (≥8 skills reales agrupadas en las 5 categorías, nivel honesto 1-5), `projects.ts` (3 proyectos con métricas de la spec de producto, `links.live`/`links.docs` a las webs públicas de Freepik API / docs.freepik.com) — mismo patrón `schema.parse` por elemento o colección.

Los placeholders `<…>` de arriba NO van al código: el implementer los sustituye por el contenido real de los PDFs/spec ANTES de commitear. Si un dato no está en las fuentes, se omite la entrada (nunca inventar).

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/data` → PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/data/profile.ts apps/web/src/data/experience.ts apps/web/src/data/education.ts apps/web/src/data/skills.ts apps/web/src/data/projects.ts apps/web/src/data/schemas.test.ts
git commit -m "feat(web): real CV data as validated typed modules (no PII)"
```

---

### Task 4: Pipeline MDX + 3 case studies + página `projects/[slug]` + 404

Leer antes: `skills/nextjs-static-dual/SKILL.md` (MDX/RSC/export), `skills/code-conventions/SKILL.md`. Fuente editorial: spec de producto `2026-07-10-portfolio-design.md` (los 3 case studies están cerrados ahí).

**Files:**

- Create: `apps/web/src/lib/content.ts`, `apps/web/src/lib/content.test.ts`
- Create: `apps/web/content/{es,en}/projects/{freepik-api-platform,ai-model-onboarding,flows-api}.mdx` (6 ficheros)
- Create: `apps/web/src/app/[locale]/projects/[slug]/page.tsx`, `apps/web/src/app/[locale]/not-found.tsx`

**Interfaces:**

- Consumes: `projectFrontmatterSchema` (T2), slugs de `projects.ts` (T3), `Locale` (T1).
- Produces: `getProjectSlugs(locale, root?): Promise<string[]>`; `compileProject(locale, slug, root?): Promise<{ frontmatter: ProjectFrontmatter; content: ReactElement } | null>` — `null` si el slug no existe (la página hace `notFound()`); frontmatter inválido LANZA (build rojo).

- [ ] **Step 1: Tests failing** — `content.test.ts` usa un fixture root en el propio test para el caso inválido y el content real para el resto:

```ts
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileProject, getProjectSlugs } from './content';

describe('content', () => {
  it('lista los mismos slugs en ambos locales', async () => {
    const es = await getProjectSlugs('es');
    const en = await getProjectSlugs('en');
    expect(es).toEqual(en);
    expect(es).toContain('freepik-api-platform');
  });

  it('slug inexistente devuelve null', async () => {
    expect(await compileProject('en', 'no-existe')).toBeNull();
  });

  it('compila frontmatter tipado y contenido', async () => {
    const result = await compileProject('en', 'flows-api');
    expect(result?.frontmatter.title.length).toBeGreaterThan(0);
    expect(result?.frontmatter.stack.length).toBeGreaterThan(0);
  });

  it('frontmatter inválido LANZA (build rojo, nunca contenido vacío)', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'content-'));
    await mkdir(path.join(root, 'en/projects'), { recursive: true });
    await writeFile(path.join(root, 'en/projects/bad.mdx'), '---\ntitle: Solo título\n---\nX');
    await expect(compileProject('en', 'bad', root)).rejects.toThrow();
  });
});
```

Run: `pnpm --filter web exec vitest run src/lib/content` → FAIL.

- [ ] **Step 2: Implementación** — `content.ts`:

```ts
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReactElement } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import { projectFrontmatterSchema, type ProjectFrontmatter } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';

const DEFAULT_ROOT = path.join(process.cwd(), 'content');

export async function getProjectSlugs(locale: Locale, root = DEFAULT_ROOT): Promise<string[]> {
  const files = await readdir(path.join(root, locale, 'projects'));
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
    .sort();
}

export async function compileProject(
  locale: Locale,
  slug: string,
  root = DEFAULT_ROOT,
): Promise<{ frontmatter: ProjectFrontmatter; content: ReactElement } | null> {
  let source: string;
  try {
    source = await readFile(path.join(root, locale, 'projects', `${slug}.mdx`), 'utf8');
  } catch {
    return null; // slug inexistente → la página decide (notFound)
  }
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
  });
  // Frontmatter inválido lanza: datos rotos = build rojo, jamás página vacía.
  return { frontmatter: projectFrontmatterSchema.parse(frontmatter), content };
}
```

`app/[locale]/projects/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { compileProject, getProjectSlugs } from '@/lib/content';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const slug of await getProjectSlugs(locale)) params.push({ locale, slug });
  }
  return params;
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await compileProject(locale, slug);
  if (!project) notFound();
  const { frontmatter, content } = project;
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{frontmatter.title}</h1>
      <p className="mt-2 text-fg-muted">{frontmatter.summary}</p>
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
        {frontmatter.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-sm text-fg-muted">{metric.label}</dt>
            <dd className="font-mono">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <article className="prose-portfolio mt-10">{content}</article>
    </main>
  );
}
```

(`prose-portfolio`: clase utilitaria mínima añadida en `globals.css` para tipografía del artículo — márgenes de h2/p/ul/code con tokens, SIN plugin typography. ~15 líneas CSS.)

`app/[locale]/not-found.tsx` — 404 estática por locale con `useTranslations('notFound')` (añadir namespace `notFound` con `title`/`backHome` a ambos messages) y `Link` a `/`.

- [ ] **Step 3: Los 6 MDX.** Frontmatter EXACTO (valores EN; el ES traduce title/summary/role/labels — MISMOS value/date/stack/links):

`content/en/projects/freepik-api-platform.mdx`:

```mdx
---
title: Freepik AI API Platform
summary: Public AI API platform serving image and video generation models at scale.
role: Platform engineer — specs, server, gateway, billing, docs
stack: [python, fastapi, openapi, apisix, php]
links:
  live: https://www.freepik.com/api
  docs: https://docs.freepik.com
metrics:
  - { label: Pull requests, value: 779+ }
date: 2026-07
---
```

> **ENMIENDA (review T3):** cifras/fechas internas (p.ej. "135+ modelos", versiones exactas, fechas de lanzamiento internas) NO van en contenido público: solo hechos de la spec de producto o públicamente verificables (docs.freepik.com lista las familias de modelos Kling/WAN). Aplica a datos (T3) y a los MDX (T4).

`ai-model-onboarding.mdx`: title "End-to-end AI model onboarding", metrics `{ label: Models onboarded, value: "Kling · WAN · more" }` (SOLO familias públicas, sin versiones ni cifras internas — enmienda T3), stack `[openapi, fastapi, apisix]`, links docs.
`flows-api.mdx`: title "Flows API", summary sobre orquestación de generación multi-paso, stack `[python, fastapi, openapi]`, links live/docs.

Cuerpo de cada MDX (~40-70 líneas): secciones `## Context`, `## What I built`, `## Architecture`, `## Outcome`, redactadas desde la spec de producto y el CLAUDE.md público del workspace de la plataforma (proceso specs → server → gateway → docs). Enlazar la web real como "production version". SIN información interna no publicada (nombres de repos privados internos NO — describir el pipeline genéricamente), SIN email/teléfono.

- [ ] **Step 4: GREEN + build**

Run: `pnpm --filter web exec vitest run src/lib/content` → PASS.
Run: `pnpm --filter web build` → genera `/{es,en}/projects/<slug>` (6 páginas).

- [ ] **Step 5: Gate y commit**

```bash
git add apps/web/src/lib/content.ts apps/web/src/lib/content.test.ts apps/web/content/es apps/web/content/en apps/web/src/app/\[locale\]/projects apps/web/src/app/\[locale\]/not-found.tsx apps/web/src/app/globals.css apps/web/messages
git commit -m "feat(web): MDX case studies pipeline with typed frontmatter and static [slug] pages"
```

(Verificar con `git status` que `content/cv/` NO aparece — está ignorado desde T1.)

---

### Task 5: `validate-content` en el gate

**Files:**

- Create: `apps/web/src/data/validate-content.test.ts`

**Interfaces:**

- Consumes: todos los datos (T3), `getProjectSlugs`/`compileProject` (T4), `projects` (T3).
- Produces: gate que pone el build/test en rojo si CUALQUIER dato o frontmatter es inválido, hay slugs desparejados es/en, o se cuela PII.

- [ ] **Step 1: Test (es el entregable — el "script" del spec cableado a `pnpm run test`):**

```ts
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import { compileProject, getProjectSlugs } from '@/lib/content';
import { education } from './education';
import { experience } from './experience';
import { profile } from './profile';
import { projects } from './projects';
import { skills } from './skills';

const EMAIL = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
// 9+ dígitos con separadores = teléfono; fechas (8) y métricas cortas no disparan.
const PHONE = /\+?(?:\d[\s().-]?){9,}/;

describe('validate-content', () => {
  it('slugs de datos y MDX coinciden en ambos locales', async () => {
    const dataSlugs = projects.map((p) => p.slug).sort();
    for (const locale of routing.locales) {
      expect(await getProjectSlugs(locale)).toEqual(dataSlugs);
    }
  });

  it('todo el frontmatter MDX de ambos locales parsea', async () => {
    for (const locale of routing.locales) {
      for (const slug of await getProjectSlugs(locale)) {
        const compiled = await compileProject(locale, slug);
        expect(compiled, `${locale}/${slug}`).not.toBeNull();
      }
    }
  });

  it('GUARDIA PII: ni email ni teléfono en ningún dato serializado', () => {
    const all = JSON.stringify({ profile, experience, education, skills, projects });
    expect(all).not.toMatch(EMAIL);
    expect(all).not.toMatch(PHONE);
  });

  it('la guardia de teléfono no dispara con fechas ni métricas', () => {
    expect(JSON.stringify({ d: '2026-07-10', m: '251,122' })).not.toMatch(PHONE);
  });
});
```

Run: `pnpm --filter web exec vitest run src/data/validate-content` → PASS a la primera si T3/T4 están bien (si falla, ARREGLAR LOS DATOS, no el test).

- [ ] **Step 2: Gate y commit**

```bash
git add apps/web/src/data/validate-content.test.ts
git commit -m "test(web): validate-content gate (schemas, MDX parity, PII guard)"
```

---

### Task 6: Layout compartido — header, footer, locale-switcher

Leer antes: `skills/accessibility/SKILL.md` (i18n/landmarks), `skills/component-patterns/SKILL.md`, `skills/tailwind-tokens/SKILL.md`.

**Files:**

- Create: `apps/web/src/components/layout/header.tsx`, `footer.tsx`, `locale-switcher.tsx`, `locale-switcher.test.tsx`, `header.test.tsx`
- Modify: `apps/web/src/app/[locale]/layout.tsx` (integrar), `apps/web/messages/{es,en}.json` (namespaces `nav`, `footer`, `switchers`)

**Interfaces:**

- Consumes: `Link/usePathname/useRouter` (T1), `profile.links` (T3), `ThemeSwitcher` existente.
- Produces: `SiteHeader` (nav + ThemeSwitcher + LocaleSwitcher; T23 le añade SkinSwitcher), `SiteFooter`, `LocaleSwitcher` (conserva la ruta actual al cambiar idioma).

- [ ] **Step 1: Tests failing.** `locale-switcher.test.tsx` — envolver en `NextIntlClientProvider` con messages reales y mockear navegación:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import es from '../../../messages/es.json';
import { LocaleSwitcher } from './locale-switcher';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/projects',
  useRouter: () => ({ replace }),
}));

function renderAt(locale: 'es' | 'en') {
  render(
    <NextIntlClientProvider locale={locale} messages={es}>
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  );
}

describe('LocaleSwitcher', () => {
  it('anuncia el idioma destino y conserva la ruta', async () => {
    renderAt('es');
    const button = screen.getByRole('button', { name: 'Switch to English' });
    await userEvent.click(button);
    expect(replace).toHaveBeenCalledWith('/projects', { locale: 'en' });
  });
});
```

`header.test.tsx`: renderiza `SiteHeader` en provider ES y EN; asserts: `role="navigation"` con nombre accesible, enlaces nav con los textos del messages correspondiente, y presencia del botón del ThemeSwitcher.

Run → FAIL.

- [ ] **Step 2: Implementación.**

`locale-switcher.tsx` (client): botón que alterna al OTRO locale; `aria-label` fijo en el idioma DESTINO (skill accessibility: anuncia el destino): `useLocale()` de next-intl; `const other = locale === 'es' ? 'en' : 'es';` label: `other === 'en' ? 'Switch to English' : 'Cambiar a español'`; `onClick: router.replace(pathname, { locale: other })`; texto visible `ES ⇄ EN` según destino.

`header.tsx` (RSC): `useTranslations('nav')` (válido en RSC); `<header>` con `<nav aria-label={t('label')}>` → `Link` a `/`, `/cv`, `/projects`, `/showcase`; cluster derecho `<ThemeSwitcher /> <LocaleSwitcher />`. Clase `no-print` (T24 la usa). Estilos con tokens (`border-b border-border bg-bg`).

`footer.tsx` (RSC): `useTranslations('footer')` + enlaces `profile.links.github`/`linkedin` con `rel="noreferrer"`, `target="_blank"`, nombre accesible ("GitHub — Nico Behm"). Clase `no-print`.

Messages: añadir `nav.label` ("Main navigation"/"Navegación principal"), `footer.github`, `footer.linkedin`, `switchers.toEnglish`/`toSpanish` si se prefiere via t() — decisión: labels del switcher via messages (`switchers` namespace), el test de arriba usa los textos finales.

Integración en `[locale]/layout.tsx`: `<body>` → `<NextIntlClientProvider…><SiteHeader />{children}<SiteFooter /></NextIntlClientProvider>`.

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/components/layout` → PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/layout apps/web/src/app/\[locale\]/layout.tsx apps/web/messages
git commit -m "feat(web): shared header/footer with locale switcher preserving route"
```

---

### Task 7: Home real

Leer antes: `skills/component-patterns/SKILL.md`, `skills/tailwind-tokens/SKILL.md`, `skills/performance/SKILL.md` (hero = LCP).

**Files:**

- Create: `apps/web/src/components/home/hero.tsx`, `featured-projects.tsx`, `skills-summary.tsx` (+ un test por componente)
- Modify: `apps/web/src/app/[locale]/page.tsx`, `apps/web/messages/{es,en}.json` (namespace `home`)

**Interfaces:**

- Consumes: `profile`, `projects` (featured), `skills` (T3); `Link` (T1).
- Produces: home con hero (headline/summary del profile por locale), grid de proyectos destacados (ProjectCard simple inline aquí; T8 crea el definitivo y esta sección lo reutiliza — ver Step 2), resumen de skills por categoría, CTA a `/cv` y card placeholder del playground ("Coming in Phase 4" via messages).

- [ ] **Step 1: Tests failing.** Componentes presentacionales puros que reciben `locale` + datos como props (testables sin request context):

```tsx
// hero.test.tsx (mismo patrón para los otros dos)
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { profile } from '@/data/profile';
import { Hero } from './hero';

describe('Hero', () => {
  it('renderiza headline y summary del locale y CTA al CV', () => {
    render(<Hero locale="es" cvLabel="Ver CV" cvHref="/es/cv" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.headline.es);
    expect(screen.getByRole('link', { name: 'Ver CV' })).toHaveAttribute('href', '/es/cv');
  });
});
```

`featured-projects.test.tsx`: con `locale="en"` renderiza un link por proyecto `featured` apuntando a `/en/projects/<slug>`. `skills-summary.test.tsx`: agrupa por categoría y muestra `name` (nivel como `aria-label` "TypeScript: level 4 of 5" + puntos visuales con tokens).

Run → FAIL.

- [ ] **Step 2: Implementación.** Los tres componentes son RSC-compatibles (sin hooks): reciben `{ locale: Locale }` (+ strings de CTA por props) y leen los datos importados directamente. `Hero`: `<section>` con h1 headline, p summary, CTA `<Link href="/cv">` estilizado como botón primario (clases del Button, o Button asChild NO existe — usar `Link` con clases de utilidades token). `FeaturedProjects`: usa `projects.filter((p) => p.featured)` con Card existente. `SkillsSummary`: `SKILL_CATEGORIES` → grupos con nivel visual (5 puntos `bg-accent`/`bg-border`).

La página compone: `setRequestLocale`, `getTranslations('home')`, `<Hero locale cvLabel={t('cvCta')} cvHref={…getPathname o Link>}` — simplificar: Hero recibe `cvLabel` y usa `Link` de `@/i18n/navigation` internamente con `href="/cv"` (navigation añade el prefijo; el test pasa el href esperado ya prefijado → ajustar test para usar el provider + navigation real: en jsdom `Link` de next-intl renderiza `<a href="/es/cv">` dentro de `NextIntlClientProvider locale="es"`). Placeholder playground: Card con `t('playgroundTitle')`/`t('playgroundSoon')`.

Messages `home`: `cvCta`, `featuredTitle`, `skillsTitle`, `playgroundTitle`, `playgroundSoon` (+ los de T1).

- [ ] **Step 3: GREEN + build** — `pnpm --filter web exec vitest run src/components/home` → PASS; `pnpm --filter web build` → verde.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/home apps/web/src/app/\[locale\]/page.tsx apps/web/messages
git commit -m "feat(web): real home with hero, featured projects, skills and CV CTA"
```

---

### Task 8: Página Projects (grid)

Leer antes: `skills/component-patterns/SKILL.md`, `skills/tailwind-tokens/SKILL.md`.

**Files:**

- Create: `apps/web/src/components/projects/project-card.tsx`, `project-card.test.tsx`, `apps/web/src/app/[locale]/projects/page.tsx`
- Modify: `apps/web/messages/{es,en}.json` (namespace `projects`), `apps/web/src/components/home/featured-projects.tsx` (reutilizar ProjectCard)

**Interfaces:**

- Consumes: `projects`/`Project` (T3), Card/Badge existentes, `Link` (T1).
- Produces: `ProjectCard({ project, locale })` — card con título, summary, stack como Badges, métricas y link al case study; página `/{locale}/projects` con grid.

- [ ] **Step 1: Test failing** — `project-card.test.tsx`: renderiza (en provider `es`) título ES, summary ES, un Badge por item de stack, link a `/es/projects/flows-api`. Run → FAIL.

- [ ] **Step 2: Implementación** — ProjectCard sobre `Card`; el título es el link (patrón card clickable accesible: link en el heading). Página: `setRequestLocale` + `getTranslations('projects')` + grid `sm:grid-cols-2` de ProjectCard. `FeaturedProjects` pasa a mapear `ProjectCard` (borrar su markup ad-hoc; sus tests siguen verdes — asserts por rol/nombre).

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/components/projects src/components/home` → PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/projects apps/web/src/app/\[locale\]/projects/page.tsx apps/web/src/components/home/featured-projects.tsx apps/web/messages
git commit -m "feat(web): projects grid page with reusable ProjectCard"
```

---

### Task 9: Página CV (vista standard; sub-bloques compartidos)

Leer antes: `skills/accessibility/SKILL.md`, `skills/component-patterns/SKILL.md`. (T24 añade las otras 2 vistas SOBRE los sub-bloques de esta task — diseñarlos sin asunciones de layout.)

**Files:**

- Create: `apps/web/src/components/cv/experience-entry.tsx`, `skill-group.tsx`, `education-list.tsx` (+ un test c/u), `apps/web/src/app/[locale]/cv/page.tsx`
- Modify: `apps/web/messages/{es,en}.json` (namespace `cv`: `title`, `experienceTitle`, `educationTitle`, `skillsTitle`, `present`, `contactTitle`)

**Interfaces:**

- Consumes: datos T3, `Locale`.
- Produces (T24 los reutiliza en las 3 vistas): `ExperienceEntryBlock({ entry, locale, presentLabel, dense? })` — `dense` compacta márgenes y oculta highlights de nivel 2; `SkillGroup({ category, skills, locale, showLevel? })`; `EducationList({ education, locale })`.

- [ ] **Step 1: Tests failing.** `experience-entry.test.tsx`: renderiza rol ES, empresa, rango de fechas con `presentLabel` cuando `end === null` (formato `2024-01 — Actualidad`), highlights como lista; con `dense` no renderiza la lista de highlights. `skill-group.test.tsx`: título de categoría + skills con nivel accesible; `showLevel={false}` omite los puntos. Run → FAIL.

- [ ] **Step 2: Implementación.** Componentes presentacionales puros (RSC-compatibles). Fechas: mostrar el string `YYYY-MM` tal cual con `—` (sin librerías de fechas; YAGNI). Página CV: `<main>` con h1 `t('title')`, secciones Experience (map ExperienceEntryBlock), Skills (SKILL_CATEGORIES → SkillGroup), Education, y bloque de contacto SOLO GitHub/LinkedIn (desde `profile.links`). Sin email/teléfono — la guardia de T5 lo garantiza en datos; aquí simplemente no existe el markup.

- [ ] **Step 3: GREEN + build** — `pnpm --filter web exec vitest run src/components/cv` → PASS; `pnpm --filter web build` → `/{es,en}/cv` generadas.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/cv apps/web/src/app/\[locale\]/cv apps/web/messages
git commit -m "feat(web): CV page (standard view) with shared experience/skill blocks"
```

---

### Task 10: Showcase traducido bajo `[locale]`

Leer antes: `skills/nextjs-static-dual/SKILL.md`.

**Files:**

- Modify: `apps/web/src/app/[locale]/showcase/page.tsx`, `apps/web/src/components/showcase/media-kit-demo.tsx`, `apps/web/messages/{es,en}.json` (namespace `showcase`)

**Interfaces:**

- Consumes: página ya movida (T1), messages.
- Produces: showcase con TODOS sus strings via `getTranslations('showcase')`; `MediaKitDemo` recibe `labels: MediaLightboxLabels` y `strings` por props desde la página (los objetos ES/EN viven en messages, no inline).

- [ ] **Step 1: Test failing** — en `media-kit-demo` no hay test propio hoy; añadir `media-kit-demo.test.tsx` mínimo: renderiza con un objeto `labels` EN y verifica que el CTA de fullscreen del demo usa el label pasado (no el hardcodeado ES). Run → FAIL.

- [ ] **Step 2: Implementación.** Mover el objeto `labels` ES inline de `media-kit-demo.tsx` a `messages/es.json` bajo `showcase.lightboxLabels` (22 claves) + traducción EN en `en.json`. La página construye `labels` desde `t.raw('lightboxLabels')` (validar shape con cast tipado) y lo pasa como prop. Resto de strings del showcase (títulos de sección, descripciones, TOC labels) → `t('…')`. El TOC pasa a construirse desde messages (T23 lo hace filtrable).

- [ ] **Step 3: GREEN + build** — tests showcase PASS; `pnpm --filter web build` verde; abrir `/es/showcase` y `/en/showcase` en el HTML de `out/` y grep de un string por locale.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/app/\[locale\]/showcase apps/web/src/components/showcase apps/web/messages
git commit -m "feat(web): translated showcase under [locale] via messages"
```

---

### Task 11: SEO completo — `lib/seo.ts`, sitemap, robots, OG, JSON-LD

Leer antes: `skills/nextjs-static-dual/SKILL.md` (metadata en export), `skills/performance/SKILL.md`.

**Files:**

- Create: `apps/web/src/lib/seo.ts`, `seo.test.ts`, `apps/web/src/app/sitemap.ts`, `apps/web/src/app/robots.ts`, `apps/web/src/app/[locale]/opengraph-image.tsx`, `apps/web/src/components/seo/json-ld.tsx`
- Modify: `apps/web/src/app/[locale]/layout.tsx` (quitar `metadata` const), todas las páginas de `[locale]` (añadir `generateMetadata`), `apps/web/src/app/[locale]/page.tsx` y `cv/page.tsx` (JSON-LD)

**Interfaces:**

- Consumes: `routing` (T1), `profile` (T3), `getProjectSlugs`/`compileProject` (T4).
- Produces: `SITE_URL` (de `NEXT_PUBLIC_SITE_URL`, fallback placeholder documentado), `localizedPageMetadata({ locale, path, title, description }): Metadata` (canonical + `alternates.languages` con es/en + openGraph), `personJsonLd(locale): object`.

- [ ] **Step 1: Tests failing** — `seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { localizedPageMetadata, personJsonLd, SITE_URL } from './seo';

describe('seo', () => {
  it('genera canonical y hreflang por locale', () => {
    const meta = localizedPageMetadata({
      locale: 'es',
      path: '/cv',
      title: 'CV',
      description: 'D',
    });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/es/cv`);
    expect(meta.alternates?.languages).toEqual({
      es: `${SITE_URL}/es/cv`,
      en: `${SITE_URL}/en/cv`,
    });
    expect(meta.openGraph?.locale).toBe('es');
  });

  it('JSON-LD Person con SOLO enlaces públicos', () => {
    const ld = personJsonLd('en');
    expect(ld['@type']).toBe('Person');
    expect(JSON.stringify(ld)).not.toMatch(/@[\w-]+\.[a-z]{2,}/i);
  });
});
```

Y test de sitemap (importa el default de `app/sitemap.ts`, es async): contiene `${SITE_URL}/es`, `/en`, `/en/cv`, `/en/projects/flows-api`… (todas las rutas × locales).

Run → FAIL.

- [ ] **Step 2: Implementación.**

`seo.ts`: como el contrato de arriba; `openGraph: { title, description, locale, images: ['/${locale}/opengraph-image.png'] }` — hmm: la imagen OG file-based se autoinyecta; NO declararla a mano en `images` (Next la añade). Dejar `openGraph: { title, description, locale, type: 'website' }`. `personJsonLd`: `{'@context':'https://schema.org','@type':'Person', name, jobTitle: headline[locale], url: SITE_URL, sameAs: [github, linkedin]}`.

`sitemap.ts`: async; rutas fijas `['', '/cv', '/projects', '/showcase']` × locales + slugs dinámicos; `lastModified` omitido (no hay fuente honesta). `robots.ts`: allow all + `sitemap: ${SITE_URL}/sitemap.xml`.

`opengraph-image.tsx` en `[locale]/`: `ImageResponse` (import de `next/og`) 1200×630 con nombre + headline del locale sobre fondo `#0a0a0f` (hardcode permitido: es un asset). `export const size`, `contentType`, `alt`. Nota export estático: se genera en build; si `next build` fallara aquí, contingencia: sustituir por `public/og-{es,en}.png` estáticos (Card simple exportada a mano) + `openGraph.images` manual — PARAR y anotar en el ledger antes de aplicar la contingencia.

`json-ld.tsx`: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.

`generateMetadata` en cada página (home, cv, projects, projects/[slug] — usa frontmatter title/summary —, showcase), títulos/descripciones desde messages (`meta` sub-keys por namespace). El layout de locale pierde su `metadata` const.

- [ ] **Step 3: GREEN + build** — tests PASS; `pnpm --filter web build`; verificar: `ls apps/web/out/sitemap.xml apps/web/out/robots.txt` y `grep hreflang apps/web/out/en/cv.html || grep 'alternate' apps/web/out/en.html` (alternates presentes en el HTML).

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/lib/seo.ts apps/web/src/lib/seo.test.ts apps/web/src/app/sitemap.ts apps/web/src/app/robots.ts apps/web/src/app/\[locale\] apps/web/src/components/seo apps/web/messages
git commit -m "feat(web): full SEO — per-locale metadata, hreflang, sitemap, robots, OG, JSON-LD"
```

---

## BLOQUE C — media-kit v2.2 (0.4.0)

> Regla clean-room (spec §8): se igualan COMPORTAMIENTOS de la referencia, JAMÁS se copia código de `fc_freepik_web`. Los subagentes de este bloque NO leen ese repo.

### Task 12: Auditoría del pan con ratón (systematic-debugging) + fix + regresión

**REQUIRED SUB-SKILL: superpowers:systematic-debugging** — reproducir → causa raíz → fix mínimo → test de regresión. NO construir features encima antes de cerrar esto (por eso es la primera del bloque).

**Files:**

- Modify: `packages/media-kit/src/media-lightbox/use-zoom-pan.ts`, `use-zoom-pan.test.tsx` (describes nuevos al final), `packages/media-kit/src/styles.css`

**Interfaces:**

- Consumes: implementación actual (listeners nativos sobre `viewportRef` en un solo `useEffect`).
- Produces: pan con ratón fiable (arrastre con botón, con zoom > 100 %), cursor `grab`/`grabbing` siempre que `canPan`, y atributo `data-can-pan` en el viewport (lo usan el CSS y T13).

**Hipótesis a verificar EN ORDEN (del reconocimiento del orquestador, 2026-07-15 — verificar, no asumir):**

1. **Drag nativo del `<img>`:** arrastrar una imagen dispara el drag-and-drop HTML nativo, que CANCELA los `pointermove` → el pan con ratón muere a mitad de gesto. `use-zoom-pan` no registra `dragstart` y `styles.css` no aplica `-webkit-user-drag: none` / `user-select: none` al media. Candidata principal (touch funciona, ratón falla — cuadra con el reporte).
2. **Clamp sin desborde:** con `fit: contain` a zoom 1, `bounds()` da `maxTx/maxTy = 0` → arrastrar no mueve nada (comportamiento CORRECTO, pero sin affordance: el usuario percibe "no funciona"). Fix de UX: cursor `grab` SOLO cuando `canPan`, `default` cuando no.
3. **Captura/orden de listeners:** `setPointerCapture` sobre el viewport vs `onOverlayClick`/`consumeDrag`.

- [ ] **Step 1: Reproducir con tests de caracterización** (añadir describe `useZoomPan v2.2 — auditoría pan con ratón (C4)` al final de `use-zoom-pan.test.tsx`; usar el polyfill PointerEvent del setup):

```tsx
it('el dragstart nativo sobre el media queda prevenido (el drag de img no mata el pan)', () => {
  // render del harness con overflow (mockSizes 800×600 vs 1600×1200, patrón existente)
  const event = new Event('dragstart', { bubbles: true, cancelable: true });
  viewport.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});

it('con zoom > 1 el arrastre de ratón panea y clampa en los límites', () => {
  // zoomTo(2) → pointerdown(400,300) → pointermove(300,300) → transform translate(-100px …)
  // seguir moviendo más allá del límite → translate clampa a maxTx
});

it('expone data-can-pan en el viewport solo cuando hay desborde', () => {
  // zoom 1 sin overflow → sin atributo; zoomTo(2) → data-can-pan presente
});
```

Run: `pnpm --filter @nicobehm/media-kit exec vitest run src/media-lightbox/use-zoom-pan`
Expected: FAIL (dragstart no prevenido, `data-can-pan` inexistente). Si el test 2 de pan YA pasa, anotarlo: la causa raíz es la 1/2, no la mecánica del arrastre.

- [ ] **Step 2: Causa raíz confirmada → fix mínimo.** En el `useEffect` de gestos de `use-zoom-pan.ts`: añadir listener `dragstart` → `event.preventDefault()` (registrado/limpiado con los otros 6). Sincronizar `data-can-pan`: en el mismo hook, effect que hace `vp.toggleAttribute('data-can-pan', canPan)` (y limpia al desmontar). En `styles.css`:

```css
/* C4: pan con ratón — el drag nativo de img está prevenido en JS; affordance solo si hay desborde. */
.mk-lightbox__viewport[data-can-pan] {
  cursor: grab;
}

.mk-lightbox__viewport[data-can-pan]:active {
  cursor: grabbing;
}

.mk-lightbox__media :is(img, video) {
  -webkit-user-drag: none;
  user-select: none;
}
```

(La regla `[data-space-pan]` existente de F2.6 se mantiene; gana por orden en cascada al ser igual de específica y posterior — verificar visualmente en cierre.)

- [ ] **Step 3: GREEN** — todos los tests del paquete PASS (v1/v2/v2.1 intactos).

- [ ] **Step 4: Gate y commit**

```bash
git add packages/media-kit/src/media-lightbox/use-zoom-pan.ts packages/media-kit/src/media-lightbox/use-zoom-pan.test.tsx packages/media-kit/src/styles.css
git commit -m "fix(media-kit): mouse pan audit — prevent native img drag, canPan cursor affordance"
```

---

### Task 13: Compare-lightbox — `compare` en MediaLightbox + `dragTarget` en CompareSlider

Leer antes: `skills/accessibility/SKILL.md`, `skills/component-patterns/SKILL.md`, `skills/code-conventions/SKILL.md`.

**Files:**

- Modify: `packages/media-kit/src/compare-slider/compare-slider.tsx` (+test, describes al final), `packages/media-kit/src/media-lightbox/media-lightbox.tsx` (+test), `packages/media-kit/src/styles.css`

**Interfaces:**

- Consumes: motor `useZoomPan` intacto (UN solo motor de viewport, spec C2 — el compare vive DENTRO de `.mk-lightbox__media`, así hereda zoom/pan/toolbar sin duplicar nada), `data-can-pan` (T12).
- Produces:
  - `CompareSliderProps.dragTarget?: 'surface' | 'handle'` (default `'surface'` = comportamiento actual, cero regresión). Con `'handle'`: el divisor SOLO se mueve arrastrando el handle (o flechas con el handle enfocado); el resto de la superficie no lo mueve.
  - El handle lleva SIEMPRE `data-mk-drag-exempt` (escape hatch genérico).
  - `useZoomPan` ignora gestos originados en `[data-mk-drag-exempt]` (los listeners son nativos: el `stopPropagation` de React no los frena — el filtro va DENTRO de `onPointerDown` del hook).
  - `MediaLightboxProps.compare?: { before: ReactNode; after: ReactNode; label?: string }` y `children?: ReactNode` pasa a opcional (compare gana si están ambos; sin ninguno → no renderiza media). El compare renderiza `<CompareSlider dragTarget="handle" …>` dentro del wrapper `.mk-lightbox__media`.
  - Flechas: con foco en el handle mueven el divisor (keydown del slider con `stopPropagation` — sí funciona aquí: el keydown del lightbox es React en el root); fuera del handle panean (comportamiento existente).

- [ ] **Step 1: Tests failing.**

En `compare-slider.test.tsx` (describe `CompareSlider v2.2 — dragTarget handle (C2)`):

```tsx
it("con dragTarget='handle' el drag sobre la superficie NO mueve el divisor", () => {
  // render dragTarget="handle"; pointerdown+move sobre el contenedor lejos del handle
  // → aria-valuenow sigue en 50
});

it("con dragTarget='handle' arrastrar el handle SÍ mueve el divisor", () => {
  // pointerdown sobre .mk-compare__handle + move → aria-valuenow cambia
});

it('el handle expone data-mk-drag-exempt en ambos modos', () => {});

it("dragTarget por defecto ('surface') conserva el drag actual", () => {
  // pointerdown en superficie mueve el divisor (regresión)
});
```

En `media-lightbox.test.tsx` (describe `MediaLightbox v2.2 — compare (C2)`):

```tsx
it('con compare renderiza el slider dentro del viewport con toolbar completa', () => {
  // render <MediaLightbox open compare={{ before: <img/>, after: <img/> }} label="Compare" />
  // → role slider presente DENTRO de .mk-lightbox__media; botones Zoom in/out presentes
});

it('las flechas con el handle enfocado mueven el divisor y NO panean', () => {
  // focus handle → ArrowRight → aria-valuenow 51 y transform del media sin cambios
});

it('los gestos de pointer sobre el handle no arrancan el pan del visor', () => {
  // zoomTo vía botones hasta >1 con mockSizes; pointerdown/move sobre handle →
  // aria-valuenow cambia y transform del media NO cambia
});

it('sin compare, children sigue funcionando (regresión v2)', () => {});
```

Run → FAIL.

- [ ] **Step 2: Implementación.**

`compare-slider.tsx`:

- Prop `dragTarget = 'surface'`. En `onPointerDown` del contenedor: si `dragTarget === 'handle'` y `!(event.target as Element).closest('.mk-compare__handle')` → return (no capture, no update). En modo handle además `event.stopPropagation()` NO hace falta para el hook (filtro nativo del hook), pero SÍ conservar `handleRef.current?.focus(...)` solo cuando el down es válido.
- `followsHover` en modo handle: sin cambios (el compare-lightbox usa mode drag por defecto; hover+handle no se combina — documentar en JSDoc).
- Handle: añadir `data-mk-drag-exempt=""` y en su `onKeyDown` existente añadir `event.stopPropagation()` tras el `preventDefault` de cada tecla gestionada (solo las flechas/Home/End/PageUp/Down ya capturadas).

`use-zoom-pan.ts` — en `onPointerDown`, primera línea tras el filtro de botón:

```ts
if (event.target instanceof Element && event.target.closest('[data-mk-drag-exempt]')) return;
```

`media-lightbox.tsx`:

- Tipo: `children?: ReactNode;` + `compare?: { before: ReactNode; after: ReactNode; label?: string };` (JSDoc: compare gana sobre children).
- En el JSX del wrapper media: `{compare ? <CompareSlider before={compare.before} after={compare.after} label={compare.label ?? 'Compare'} dragTarget="handle" /> : children}`.
- Import de `CompareSlider` desde `../compare-slider` (dependencia interna del paquete, sin ciclo: compare-slider no importa lightbox — T15 invierte la relación con lazy import, ver esa task).

`styles.css`: `.mk-lightbox__media .mk-compare { max-width: 100%; max-height: 100%; }` y que el media del compare respete `data-fit` (el slider dimensiona por su contenido; verificar visual en cierre).

- [ ] **Step 3: GREEN** — `pnpm --filter @nicobehm/media-kit exec vitest run` → PASS completo.

- [ ] **Step 4: Gate y commit**

```bash
git add packages/media-kit/src/compare-slider packages/media-kit/src/media-lightbox packages/media-kit/src/styles.css
git commit -m "feat(media-kit): compare-lightbox — compare prop with handle-only divider drag"
```

---

### Task 14: Modelo `MediaSource {src, fullSrc, alt}` + preload + selección por pantalla

Leer antes: `skills/performance/SKILL.md`, `skills/code-conventions/SKILL.md`.

**Files:**

- Create: `packages/media-kit/src/media-source.ts`, `media-source.test.ts`
- Modify: `compare-slider.tsx` (+test), `media-lightbox.tsx` (+test), `packages/media-kit/src/index.ts`

**Interfaces:**

- Consumes: `compare` (T13).
- Produces (T15/T19 los usan):

```ts
// media-source.ts
export type MediaSource = { src: string; fullSrc?: string; alt: string };
export function isMediaSource(value: unknown): value is MediaSource;
/** C3: pantalla efectiva (css px × dpr) ≥ umbral → merece el asset HD. */
export const FULL_SRC_MIN_EFFECTIVE_WIDTH = 2000;
export function shouldUseFullSrc(screenWidth: number, devicePixelRatio: number): boolean;
/** Elige la URL para fullscreen según la pantalla actual (SSR-safe: sin window → src). */
export function pickFullscreenSrc(source: MediaSource): string;
/** Precarga los fullSrc que la pantalla justifica (new Image()). Idempotente. */
export function preloadFullSources(sources: readonly MediaSource[]): void;
```

- `CompareSliderProps.before/after: ReactNode | MediaSource` — con `MediaSource` el slider renderiza su `<img src alt draggable={false}>` internamente. API `ReactNode` intacta.
- `MediaLightboxProps.media?: MediaSource` (alternativa a `children`; prioridad: `compare` > `media` > `children`) y `compare.before/after` también aceptan `MediaSource`. En fullscreen el lightbox usa `pickFullscreenSrc` (fullSrc si la pantalla lo justifica).
- `index.ts` exporta `type MediaSource`, `isMediaSource`, `shouldUseFullSrc`, `preloadFullSources`.

- [ ] **Step 1: Tests failing.** `media-source.test.ts`: `isMediaSource` (positivo/negativos), `shouldUseFullSrc(1170, 3) === true` (móvil 3x ≥ 2000? 3510 → true — CUIDADO: el spec dice "en un móvil no abriremos 4K"; el criterio es ancho efectivo, y un móvil 1170×3 tiene 3510px efectivos… decisión de diseño: usar `Math.min(screenWidth * dpr, screenWidth * 2)` — cap del multiplicador a 2× para no sobre-servir a móviles con dpr 3+; con eso 1170 → 2340 ≥ 2000 true… sigue true). **Criterio final (cerrado aquí):** `shouldUseFullSrc = screenWidth >= 1024 && screenWidth * Math.min(devicePixelRatio, 2) >= FULL_SRC_MIN_EFFECTIVE_WIDTH` — pantallas < 1024 css px (móviles) NUNCA cargan el HD; desktop retina o 4K sí. Tests: `(390, 3) → false`, `(1024, 2) → true`, `(1920, 1) → false`, `(2560, 1) → true`, `(1440, 2) → true`. `pickFullscreenSrc`: sin `fullSrc` → `src`; con fullSrc y pantalla grande (mockear `window.screen.width`/`devicePixelRatio` con `vi.stubGlobal`) → `fullSrc`; pantalla chica → `src`. `preloadFullSources`: espía el constructor `Image` (`vi.stubGlobal('Image', class { set src(v){calls.push(v)} }`)) → precarga solo lo justificado y no repite URL ya precargada.

En `compare-slider.test.tsx` (describe nuevo): `before={{ src:'/a.png', alt:'Antes' }}` renderiza `img[src="/a.png"][alt="Antes"]` con `draggable=false`; ReactNode sigue funcionando. En `media-lightbox.test.tsx`: `media={{src, fullSrc, alt}}` renderiza `img` con `src` elegido por pantalla (stub de screen grande → fullSrc).

Run → FAIL.

- [ ] **Step 2: Implementación.** `media-source.ts` puro (módulo sin React). `preloadFullSources` guarda las URLs ya pedidas en un `Set` a nivel de módulo. En `compare-slider.tsx`: helper interno `renderSide(side: ReactNode | MediaSource, extraStyle?)` → `isMediaSource(side) ? <img src={side.src} alt={side.alt} draggable={false} /> : side`. En `media-lightbox.tsx`: si `media` (o compare con sources) → render interno de `<img src={pickFullscreenSrc(source)} alt />`; el compare con sources pasa cada lado por `pickFullscreenSrc` también (fullscreen = contexto HD).

- [ ] **Step 3: GREEN** — suite completa del paquete PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add packages/media-kit/src/media-source.ts packages/media-kit/src/media-source.test.ts packages/media-kit/src/compare-slider packages/media-kit/src/media-lightbox packages/media-kit/src/index.ts
git commit -m "feat(media-kit): MediaSource model with screen-aware fullSrc and preload"
```

---

### Task 15: Fullscreen por ejemplo — prop `expand` del CompareSlider

Leer antes: `skills/accessibility/SKILL.md`, `skills/component-patterns/SKILL.md`.

**Files:**

- Modify: `compare-slider.tsx` (+test), `packages/media-kit/src/styles.css`, `packages/media-kit/src/index.ts` (export de `CompareSliderExpand` type)

**Interfaces:**

- Consumes: `compare` del lightbox (T13), `MediaSource`/`preloadFullSources` (T14).
- Produces:

```ts
export type CompareSliderExpand = {
  /** aria-label del dialog del compare-lightbox. */
  lightboxLabel: string;
  /** Texto del botón overlay. Default 'Full Screen'. */
  buttonLabel?: string;
  /** Labels del MediaLightbox interno (i18n). */
  lightboxLabels?: Partial<MediaLightboxLabels>;
};
// CompareSliderProps.expand?: CompareSliderExpand
```

Con `expand`, el slider renderiza un botón overlay (esquina superior derecha DENTRO de la figura, hermano del divisor, con `data-mk-drag-exempt`) con icono expand SVG inline (`currentColor`, patrón F2.6) + texto `buttonLabel`; al click abre un `MediaLightbox` interno con `compare={{ before, after }}` (el estado `open` vive en el slider). `pointerenter`/`focus` del botón → `preloadFullSources([before, after].filter(isMediaSource))`.

- [ ] **Step 1: Tests failing** (describe `CompareSlider v2.2 — expand (C1)`):

```tsx
it('sin expand no hay botón (regresión)', () => {});
it('con expand renderiza el botón con icono y label, y abre el compare-lightbox', async () => {
  // click botón "Full Screen" → role dialog con aria-label lightboxLabel y role slider dentro
});
it('el hover/focus del botón dispara el preload de los fullSrc', () => {
  // stub Image; fireEvent.pointerEnter(botón) → fullSrc precargado
});
it('el click del botón NO mueve el divisor', () => {});
```

Run → FAIL.

- [ ] **Step 2: Implementación.** En `compare-slider.tsx`: estado `const [expanded, setExpanded] = useState(false);` (solo si `expand` — el hook se declara incondicional). Botón `.mk-compare__expand` con `type="button"`, `data-mk-drag-exempt`, `onPointerDown={(e) => e.stopPropagation()}` (que el down del botón no dispare el drag del slider en modo surface), `onPointerEnter`/`onFocus` → preload. Icono:

```tsx
const EXPAND_ICON = (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);
```

Import del lightbox: `import { MediaLightbox } from '../media-lightbox';` — **ciclo de imports** compare-slider ↔ media-lightbox (T13 importó slider en lightbox). Romperlo: el lightbox NO importa el slider directamente — `media-lightbox.tsx` recibe el slider por render (revisar T13: mover el render del compare a un subcomponente `LightboxCompare` que importa el slider — el ciclo es slider → lightbox → LightboxCompare → slider… sigue). **Solución cerrada:** extraer el render interno del compare del lightbox a inyección: `MediaLightbox` acepta `compare` y usa `CompareSlider` importado — y `compare-slider.tsx` importa `MediaLightbox`. ESM tolera ciclos si no hay side-effects en carga (ambos son funciones puras) y tsup los compila bien; AÑADIR test de humo de import (`import { CompareSlider, MediaLightbox } from '../index'` en un test) y verificar `pnpm --filter @nicobehm/media-kit build` sin warnings de circular deps. Si tsup avisara: mover el botón+estado expand a un subcomponente `compare-expand.tsx` que importa ambos y se inyecta — anotar en ledger.

`styles.css`:

```css
/* C1: CTA fullscreen por ejemplo, overlay dentro de la figura. */
.mk-compare__expand {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border: 0;
  border-radius: var(--mk-radius);
  background: var(--mk-control-bg);
  color: var(--mk-control-color);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.mk-compare__expand:hover {
  background: rgb(255 255 255 / 0.12);
}

.mk-compare__expand:focus-visible {
  outline: 2px solid var(--mk-focus-ring);
  outline-offset: 2px;
}
```

- [ ] **Step 3: GREEN + build del paquete** — suite PASS; `pnpm --filter @nicobehm/media-kit build` sin warnings.

- [ ] **Step 4: Gate y commit**

```bash
git add packages/media-kit/src/compare-slider packages/media-kit/src/styles.css packages/media-kit/src/index.ts
git commit -m "feat(media-kit): per-example expand button opening the compare-lightbox"
```

---

### Task 16: `pauseOnClick` en modo hover (C6)

Leer antes: `skills/accessibility/SKILL.md` (estado anunciado), `skills/code-conventions/SKILL.md`.

**Files:**

- Modify: `compare-slider.tsx` (+test), `packages/media-kit/src/styles.css`

**Interfaces:**

- Consumes: modo hover existente (`followsHover`).
- Produces: `CompareSliderProps.pauseOnClick?: boolean` (default `true`, solo aplica a `mode="hover"`); `pauseLabel?: string` (default `'Comparison paused'`), `resumeLabel?: string` (default `'Comparison following pointer'`). Click (down+up sin arrastre) alterna pausa; en pausa el hover no sigue; atributo `data-paused` en el root + región `aria-live="polite"` que anuncia el cambio.

- [ ] **Step 1: Tests failing** (describe `CompareSlider v2.2 — pauseOnClick (C6)`):

```tsx
it('en hover, click pausa el seguimiento y otro click lo reanuda', () => {
  // mode="hover": move(60%) → valuenow ~60; click → data-paused; move(30%) → sigue en 60;
  // click → sin data-paused; move(30%) → 30
});
it('el estado se anuncia por aria-live con los labels', () => {});
it('pauseOnClick={false} desactiva la pausa', () => {});
it('en mode="drag" el click no pausa (sin data-paused)', () => {});
```

Run → FAIL.

- [ ] **Step 2: Implementación.** Estado `paused` + `announcement`. Detección de click: en `onPointerUp` del contenedor (handler nuevo), si `mode==='hover'` y `pauseOnClick` y el gesto no fue drag de touch/pen (guardar posición del down; umbral 4px como el resto del paquete) → toggle. `followsHover(event)` pasa a `mode === 'hover' && event.pointerType === 'mouse' && !paused`. Cue visual: `.mk-compare[data-paused] .mk-compare__divider { opacity: 0.85; }` + anillo en el handle (`box-shadow` con `--mk-handle-ring` — sutil, no informa SOLO por color: el aria-live es la fuente accesible). Región: `<span className="mk-visually-hidden" aria-live="polite">{announcement}</span>` (vaciar-y-rellenar para re-anunciar el mismo texto no hace falta: alterna entre dos strings).

- [ ] **Step 3: GREEN.**

- [ ] **Step 4: Gate y commit**

```bash
git add packages/media-kit/src/compare-slider packages/media-kit/src/styles.css
git commit -m "feat(media-kit): hover pauseOnClick with accessible announcement"
```

---

### Task 17: Paridad C5 restante — `overlayLabels`, `objectFit`, estado de carga, test touch

Leer antes: `skills/component-patterns/SKILL.md` (estados explícitos), `skills/accessibility/SKILL.md`.

**Files:**

- Modify: `compare-slider.tsx` (+test), `packages/media-kit/src/styles.css`

**Interfaces:**

- Consumes: `MediaSource` interno (T14 — carga y objectFit solo aplican a los `<img>` que renderiza el paquete).
- Produces: `overlayLabels?: { before: string; after: string }` (badges superpuestos en cada lado, `aria-hidden` — el nombre accesible ya lo dan los `alt`); `objectFit?: 'cover' | 'contain'` (default `'cover'`, aplicado a los img internos); estado de carga: root con `data-loading` hasta que los img internos (si los hay) disparan `load`, transición de opacidad respetando `prefers-reduced-motion`; test de touch del divisor (verificar comportamiento existente).

- [ ] **Step 1: Tests failing** (describe `CompareSlider v2.2 — paridad C5`):

```tsx
it('overlayLabels renderiza badges Before/After ocultos a lectores', () => {});
it('objectFit contain llega al img interno', () => {});
it('data-loading desaparece cuando ambos img internos cargan', () => {
  // render con sources → data-loading; fireEvent.load en ambos img → sin data-loading
});
it('touch: pointerdown+move con pointerType touch mueve el divisor (paridad, sin regresión)', () => {});
```

Run → FAIL (salvo quizá el touch — si pasa, es la confirmación de paridad; se queda como regresión).

- [ ] **Step 2: Implementación.** Contador de cargas pendientes derivado de cuántos lados son `MediaSource` (`useState` + `onLoad`); si 0 lados estructurados → nunca `data-loading` (API ReactNode no puede rastrear carga: documentado). CSS:

```css
/* C5: carga con transición de opacidad (paridad referencia). */
.mk-compare[data-loading] :is(.mk-compare__before, .mk-compare__after) {
  opacity: 0;
}

.mk-compare :is(.mk-compare__before, .mk-compare__after) {
  transition: opacity 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .mk-compare :is(.mk-compare__before, .mk-compare__after) {
    transition: none;
  }
}

.mk-compare__overlay-label {
  position: absolute;
  bottom: 0.5rem;
  z-index: 1;
  padding: 0.25rem 0.5rem;
  border-radius: var(--mk-radius);
  background: var(--mk-control-bg);
  color: var(--mk-control-color);
  font-size: 0.75rem;
  pointer-events: none;
}
```

(before a `left: 0.5rem`, after a `right: 0.5rem` con clases modificadoras.)

- [ ] **Step 3: GREEN.**

- [ ] **Step 4: Gate y commit**

```bash
git add packages/media-kit/src/compare-slider packages/media-kit/src/styles.css
git commit -m "feat(media-kit): overlay labels, objectFit, loading state and touch parity"
```

---

### Task 18: Asset HD del retrato (ORQUESTADOR, no subagente)

La ejecuta el **orquestador** (MCP Magnific no disponible en subagentes). Leer antes: `skills/performance/SKILL.md`.

**Files:**

- Create: `apps/web/public/demo/portrait-hd.webp`

**Interfaces:**

- Consumes: `apps/web/public/demo/portrait.webp` (1600×900, F2.6) o el creation original en Magnific.
- Produces: `portrait-hd.webp` 3200×1800, ≤ 600 kB (solo se descarga bajo demanda en pantallas grandes — justificado; skill performance: lazy + preload explícito).

- [ ] **Step 1:** Upscale ×2 del retrato con `mcp__claude_ai_Magnific__images_upscale` (o regenerar si el creation no está) + `creations_wait` → URL.
- [ ] **Step 2:** `curl -sL <URL> -o $SCRATCH/portrait-hd-src.png && cwebp -q 75 -resize 3200 0 $SCRATCH/portrait-hd-src.png -o apps/web/public/demo/portrait-hd.webp && ls -la apps/web/public/demo/portrait-hd.webp` → ≤ 614400 bytes (bajar `-q` si excede).
- [ ] **Step 3:**

```bash
git add apps/web/public/demo/portrait-hd.webp
git commit -m "feat(web): HD portrait asset for compare-lightbox fullscreen (webp, 3200px)"
```

---

### Task 19: Empaquetado 0.4.0 + ejemplos del showcase al modelo nuevo

Leer antes: `skills/performance/SKILL.md`, `skills/component-patterns/SKILL.md`, `skills/tailwind-tokens/SKILL.md`.

**Files:**

- Modify: `packages/media-kit/package.json` (0.4.0), `README.md`, `CHANGELOG.md`
- Modify: `apps/web/src/components/showcase/media-kit-demo.tsx`, `portrait-compare-demo.tsx`, `portrait-compare-demo.test.tsx`, `apps/web/messages/{es,en}.json` (labels expand/compare)

**Interfaces:**

- Consumes: TODO el bloque C; `portrait-hd.webp` (T18); labels showcase (T10).
- Produces: media-kit 0.4.0 documentado; showcase sin "Ampliar con zoom"; cada slider con su botón expand; retrato con `{src: '/demo/portrait.webp', fullSrc: '/demo/portrait-hd.webp'}`.

- [ ] **Step 1: Tests de la app failing.** Reescribir `portrait-compare-demo.test.tsx`: ya NO hay fullscreen nativo propio; ahora asserts: img antes con `filter: grayscale(1)` (se conserva vía ReactNode… **decisión:** el lado B-N sigue siendo ReactNode `<img style grayscale>` sobre `src` estándar y el lado color pasa a `MediaSource {src, fullSrc}` — el expand abre compare-lightbox con ambos); botón con nombre accesible del label expand pasado por props. Añadir en `media-kit-demo.test.tsx`: NO existe botón "Ampliar con zoom"; cada demo de slider muestra su botón expand. Run → FAIL.

- [ ] **Step 2: Actualizar los demos.**
  - `media-kit-demo.tsx`: borrar el botón "Ampliar con zoom", su `useState(open)` y el `MediaLightbox` suelto. Cada `CompareSlider` gana `expand={{ lightboxLabel: strings.compareLightboxLabel, buttonLabel: strings.fullScreen, lightboxLabels: labels }}` (nuevas claves en messages: `showcase.fullScreen` = "Full Screen"/"Pantalla completa", `showcase.compareLightboxLabel`).
  - `portrait-compare-demo.tsx`: eliminar TODO el código de fullscreen nativo (`requestFullscreen`, `fullscreenchange`, botón absoluto); pasar `after={{ src: '/demo/portrait.webp', fullSrc: '/demo/portrait-hd.webp', alt: '' }}` … los `alt`: antes "Retrato en blanco y negro" (ReactNode con grayscale), after alt `''`+`aria-hidden` ya lo gestiona el slider. `expand` con labels de messages via props.
- [ ] **Step 3: Versionado y docs del paquete.** `package.json` → `"version": "0.4.0"`. `CHANGELOG.md` entrada 0.4.0: Added (compare in lightbox, dragTarget, MediaSource + screen-aware fullSrc + preload, expand, pauseOnClick, overlayLabels, objectFit, loading state), Fixed (mouse pan / native img drag), sin breaking (children ahora opcional — ampliación compatible). `README.md`: tabla de props nuevas + receta "Compare lightbox" + receta "Dual resolution" (código de uso completo con `{src, fullSrc}`), keyboard del compare (handle: flechas; visor: el mapa existente).
- [ ] **Step 4: GREEN total** — `pnpm --filter @nicobehm/media-kit build && pnpm run test` → verde (¡rebuild del paquete ANTES de los tests de la app — la app consume dist!).
- [ ] **Step 5: Gate y commit**

```bash
git add packages/media-kit/package.json packages/media-kit/README.md packages/media-kit/CHANGELOG.md apps/web/src/components/showcase apps/web/messages
git commit -m "feat(media-kit)!: release 0.4.0 and migrate showcase examples to MediaSource + expand"
```

(El `!` es solo énfasis de release; NO hay breaking — quitarlo si el linter de commits protesta: `feat(media-kit): release 0.4.0 …`.)

---

## BLOQUE B — theming v2

### Task 20: `lib/appearance.ts` (absorbe `theme.ts`) + init anti-flash + switcher migrado

Leer antes: `skills/code-conventions/SKILL.md`, `skills/nextjs-static-dual/SKILL.md` (script inline pre-hidratación).

**Files:**

- Create: `apps/web/src/lib/appearance.ts`, `appearance.test.ts`, `apps/web/src/components/layout/appearance-init.tsx`, `appearance-init.test.tsx`
- Modify: `apps/web/src/components/layout/theme-switcher.tsx` (import), `apps/web/src/app/[locale]/layout.tsx` (script + `<AppearanceInit />`)
- Delete: `apps/web/src/lib/theme.ts`, `theme.test.ts`

**Interfaces:**

- Consumes: `themeSchema`/`skinSchema`/`cvViewSchema` + tipos (T2).
- Produces (T23/T24/T25 los usan):

```ts
export type Appearance = { theme: Theme; skin: Skin };
export const DEFAULT_APPEARANCE: Appearance; // { theme: 'dark', skin: 'dev-tool' }
export const STORAGE_KEYS: { theme: 'theme'; skin: 'skin'; cvView: 'cv-view' };

/** Precedencia URL > localStorage > default; inválidos caen en cascada al siguiente nivel. */
export function resolveAppearance(input: {
  params: URLSearchParams;
  stored: { theme: string | null; skin: string | null; view: string | null };
  prefersLight: boolean;
}): { theme: Theme; skin: Skin; view: CvView; hadUrlParams: boolean };

/** Aplica data-theme y data-skin (dev-tool = SIN atributo) y persiste. */
export function applyAppearance(appearance: Appearance): void;
/** Compat con ThemeSwitcher: cambia solo el tema conservando el skin aplicado. */
export function applyTheme(theme: Theme): void;
export function applySkin(skin: Skin): void;
export function persistCvView(view: CvView): void;

/** URL compartible con el estado actual; view solo si se pasa (páginas ≠ /cv no lo pasan). */
export function buildShareUrl(input: {
  origin: string;
  pathname: string;
  theme: Theme;
  skin: Skin;
  view?: CvView;
}): string;
```

- `AppearanceInit` (client, sin render): al montar lee `location.search` + localStorage, `resolveAppearance`, `applyAppearance`, y si `hadUrlParams` limpia `skin/theme/view` de la URL con `history.replaceState` (conservando el resto de la query). Expone el `view` resuelto vía callback opcional `onView?: (view: CvView) => void` (T24 lo consume en `/cv`; en el resto de páginas nadie lo lee = "`?view=` se ignora fuera de /cv").

- [ ] **Step 1: Tests failing** — `appearance.test.ts` (matriz completa):

```ts
import { afterEach, describe, expect, it } from 'vitest';
import { buildShareUrl, resolveAppearance, applyAppearance, applyTheme } from './appearance';

function resolve(search: string, stored: Partial<Record<'theme' | 'skin' | 'view', string>> = {}) {
  return resolveAppearance({
    params: new URLSearchParams(search),
    stored: { theme: stored.theme ?? null, skin: stored.skin ?? null, view: stored.view ?? null },
    prefersLight: false,
  });
}

describe('resolveAppearance — precedencia URL > storage > default', () => {
  it('URL válida gana a storage', () => {
    const r = resolve('?theme=light&skin=terminal&view=timeline', {
      theme: 'dark',
      skin: 'vibrant',
    });
    expect(r).toMatchObject({
      theme: 'light',
      skin: 'terminal',
      view: 'timeline',
      hadUrlParams: true,
    });
  });
  it('URL inválida cae a storage; storage inválido cae a default', () => {
    expect(resolve('?skin=neon', { skin: 'editorial' }).skin).toBe('editorial');
    expect(resolve('?skin=neon', { skin: 'wat' }).skin).toBe('dev-tool');
    expect(resolve('', {}).theme).toBe('dark');
  });
  it('prefersLight solo decide sin URL ni storage', () => {
    expect(
      resolveAppearance({
        params: new URLSearchParams(''),
        stored: { theme: null, skin: null, view: null },
        prefersLight: true,
      }).theme,
    ).toBe('light');
  });
  it('view default standard', () => {
    expect(resolve('').view).toBe('standard');
  });
});

describe('applyAppearance / applyTheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.skin;
    localStorage.clear();
  });
  it('dev-tool NO pone data-skin; otros sí', () => {
    applyAppearance({ theme: 'dark', skin: 'editorial' });
    expect(document.documentElement.dataset.skin).toBe('editorial');
    applyAppearance({ theme: 'dark', skin: 'dev-tool' });
    expect(document.documentElement.dataset.skin).toBeUndefined();
  });
  it('applyTheme conserva el skin aplicado (paridad con el ThemeSwitcher actual)', () => {
    applyAppearance({ theme: 'dark', skin: 'terminal' });
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.dataset.skin).toBe('terminal');
  });
  it('persiste en localStorage y tolera storage roto (try/catch)', () => {});
});

describe('buildShareUrl', () => {
  it('incluye theme y skin siempre, view solo si se pasa', () => {
    expect(
      buildShareUrl({
        origin: 'https://x.dev',
        pathname: '/es/cv',
        theme: 'light',
        skin: 'terminal',
        view: 'compact',
      }),
    ).toBe('https://x.dev/es/cv?theme=light&skin=terminal&view=compact');
    expect(
      buildShareUrl({
        origin: 'https://x.dev',
        pathname: '/en/showcase',
        theme: 'dark',
        skin: 'dev-tool',
      }),
    ).toBe('https://x.dev/en/showcase?theme=dark&skin=dev-tool');
  });
});
```

`appearance-init.test.tsx`: con `window.history.replaceState` espiado y URL `/es/cv?skin=terminal&utm=x` → aplica skin, llama a `onView`, y la URL final es `/es/cv?utm=x` (conserva params ajenos). Sin params de apariencia → NO llama a replaceState.

Run → FAIL.

- [ ] **Step 2: Implementación.** `resolveAppearance`: cada campo = `parse(url) ?? parse(stored) ?? default` usando `schema.safeParse`. `applyAppearance`: dataset + `try { localStorage.setItem }` (patrón theme.ts actual). `applyTheme`/`applySkin`: lecturas del dataset actual + `applyAppearance` parcial. `AppearanceInit`: `'use client'`, `useEffect` una vez; props `{ onView?: (view: CvView) => void }`; render `null`.

Migrar `theme-switcher.tsx`: `import { applyTheme } from '@/lib/appearance';` (API idéntica). Borrar `theme.ts`/`theme.test.ts` (los casos de `resolveInitialTheme` quedan cubiertos por la matriz de `resolveAppearance`).

Ampliar `themeInitScript` en `[locale]/layout.tsx` (anti-flash de tema Y skin; comentario "mantener en sincronía con lib/appearance.ts"):

```js
(function () {
  try {
    var q = new URLSearchParams(location.search);
    function pick(k, valid) {
      var u = q.get(k);
      if (valid.indexOf(u) > -1) return u;
      var s = localStorage.getItem(k);
      return valid.indexOf(s) > -1 ? s : null;
    }
    var t =
      pick('theme', ['dark', 'light']) ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var sk = pick('skin', ['dev-tool', 'editorial', 'terminal', 'vibrant']) || 'dev-tool';
    document.documentElement.dataset.theme = t;
    if (sk !== 'dev-tool') document.documentElement.dataset.skin = sk;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
```

Montar `<AppearanceInit />` en el body del layout de locale (sin `onView`; T24 monta el suyo en /cv — `AppearanceInit` es idempotente: aplicar dos veces es inocuo; la limpieza de URL solo ocurre una vez porque la segunda ya no ve params).

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/lib/appearance src/components/layout` → PASS (y NINGÚN import roto de `@/lib/theme`: `grep -rn "lib/theme" apps/web/src` vacío).

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/lib/appearance.ts apps/web/src/lib/appearance.test.ts apps/web/src/components/layout apps/web/src/app/\[locale\]/layout.tsx
git rm apps/web/src/lib/theme.ts apps/web/src/lib/theme.test.ts
git commit -m "feat(web): appearance state (theme+skin+view) with URL>storage>default precedence"
```

---

### Task 21: 4 skins + fuente serif + test AA de 8 combos

Leer antes: `skills/tailwind-tokens/SKILL.md` (OBLIGATORIO), `skills/performance/SKILL.md` (fuentes), `skills/accessibility/SKILL.md` (contraste).

**Files:**

- Modify: `apps/web/src/app/globals.css`, `apps/web/src/app/[locale]/layout.tsx` (fuente serif)
- Create: `apps/web/src/app/globals-contrast.test.ts`

**Interfaces:**

- Consumes: `data-skin` aplicado por T20.
- Produces: skins `editorial`/`terminal`/`vibrant` como bloques `:root[data-skin='X'][data-theme='Y']` redefiniendo las MISMAS 11 variables de color (+ radios y fuentes vía indirección). `dev-tool` = sin atributo (bloques actuales intactos → cero regresión visual). Swatches `.skin-swatch[data-skin='…']` para T23.

- [ ] **Step 1: Refactor de indirección (sin cambio visual).** En `globals.css`:
  - Radios: `@theme inline` pasa de literales a `--radius-card: var(--radius-card-value); --radius-control: var(--radius-control-value);` y un bloque base `:root { --radius-card-value: 0.75rem; --radius-control-value: 0.5rem; --font-heading: var(--font-geist-sans); --font-body: var(--font-geist-sans); }`.
  - `@theme inline` añade `--font-serif: var(--font-source-serif);`.
  - `body { font-family: var(--font-body); }` y regla nueva `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }`.

En `[locale]/layout.tsx`: `import { Source_Serif_4 } from 'next/font/google';` → `const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' });` y añadir `${sourceSerif.variable}` al className del `<html>`. (3ª familia autoalojada con subsetting — presupuesto: solo se usa en el skin editorial pero el `@font-face` es global; `display: swap` y subset latin la dejan en ~30-45 kB woff2. Anotar en el commit body.)

Run tras el refactor: `pnpm --filter web build` + tests → verde (aún sin skins).

- [ ] **Step 2: Test AA failing** — `globals-contrast.test.ts` lee `globals.css` con `fs`, extrae cada bloque `:root[...]` con regex de bloques, resuelve las 11 variables por combo (skin ausente = dev-tool → bloques base), y calcula el ratio WCAG (funciones `hexToLuminance`/`contrast` implementadas en el test, fórmula WCAG 2.x estándar). Para CADA uno de los 8 combos (4 skins × 2 temas) asserts:

```
fg/bg ≥ 4.5 · fg-muted/bg ≥ 4.5 · fg/surface ≥ 4.5 · fg-muted/surface ≥ 4.5
accent-fg/accent ≥ 4.5 · danger-fg/danger ≥ 4.5 · accent/bg ≥ 3 · ring/bg ≥ 3
```

Run → FAIL (skins inexistentes: el parser encuentra 2 combos, el test exige 8 — assert inicial `expect(combos).toHaveLength(8)`).

- [ ] **Step 3: Los 6 bloques de skins.** Añadir tras el bloque light actual (valores de partida; si el test AA marca un par en rojo, AJUSTAR LUMINOSIDAD conservando el matiz — los valores finales los fija el test):

```css
/* ── Skin: editorial — serif en títulos, radios suaves, cálido para leer el CV ── */
:root[data-skin='editorial'][data-theme='dark'] {
  --bg: #1b1712;
  --surface: #262019;
  --fg: #ece4d6;
  --fg-muted: #b3a894;
  --accent: #d9a05b;
  --accent-hover: #e4b273;
  --accent-fg: #1b1712;
  --border: #3a3227;
  --ring: #d9a05b;
  --danger: #f08a75;
  --danger-fg: #1b1712;
  --radius-card-value: 1rem;
  --radius-control-value: 0.625rem;
  --font-heading: var(--font-serif);
}

:root[data-skin='editorial'][data-theme='light'] {
  --bg: #f7f3ec;
  --surface: #fffdf8;
  --fg: #211d16;
  --fg-muted: #5f584a;
  --accent: #8a3033;
  --accent-hover: #6d2427;
  --accent-fg: #fffdf8;
  --border: #ddd3c2;
  --ring: #8a3033;
  --danger: #a02c2c;
  --danger-fg: #fffdf8;
  --radius-card-value: 1rem;
  --radius-control-value: 0.625rem;
  --font-heading: var(--font-serif);
}

/* ── Skin: terminal — monospace, alto contraste, radios 0, brutalist ── */
:root[data-skin='terminal'][data-theme='dark'] {
  --bg: #050805;
  --surface: #0c120c;
  --fg: #4ef14e;
  --fg-muted: #8fbf8f;
  --accent: #ffd54e;
  --accent-hover: #ffe28a;
  --accent-fg: #050805;
  --border: #1d2a1d;
  --ring: #4ef14e;
  --danger: #ff6b6b;
  --danger-fg: #050805;
  --radius-card-value: 0;
  --radius-control-value: 0;
  --font-heading: var(--font-geist-mono);
  --font-body: var(--font-geist-mono);
}

:root[data-skin='terminal'][data-theme='light'] {
  --bg: #f4f7f2;
  --surface: #ffffff;
  --fg: #0c2b0f;
  --fg-muted: #3f5d43;
  --accent: #8a5d00;
  --accent-hover: #6f4a00;
  --accent-fg: #ffffff;
  --border: #cfdccc;
  --ring: #8a5d00;
  --danger: #b3261e;
  --danger-fg: #ffffff;
  --radius-card-value: 0;
  --radius-control-value: 0;
  --font-heading: var(--font-geist-mono);
  --font-body: var(--font-geist-mono);
}

/* ── Skin: vibrant — acentos saturados, playful ── */
:root[data-skin='vibrant'][data-theme='dark'] {
  --bg: #140a20;
  --surface: #1f1130;
  --fg: #f4ecff;
  --fg-muted: #bda8d6;
  --accent: #ff5da2;
  --accent-hover: #ff7ab5;
  --accent-fg: #140a20;
  --border: #392153;
  --ring: #ff5da2;
  --danger: #ff7a66;
  --danger-fg: #140a20;
  --radius-card-value: 1.25rem;
  --radius-control-value: 0.75rem;
}

:root[data-skin='vibrant'][data-theme='light'] {
  --bg: #fff5fb;
  --surface: #ffffff;
  --fg: #2a1033;
  --fg-muted: #6b4a7a;
  --accent: #b4126b;
  --accent-hover: #93094f;
  --accent-fg: #ffffff;
  --border: #f0d5e7;
  --ring: #b4126b;
  --danger: #b3123f;
  --danger-fg: #ffffff;
  --radius-card-value: 1.25rem;
  --radius-control-value: 0.75rem;
}

/* Swatches para el skin-switcher (T23): único lugar permitido, es definición de tokens. */
.skin-swatch[data-skin='dev-tool'] {
  background: #8b7cf7;
}
.skin-swatch[data-skin='editorial'] {
  background: #d9a05b;
}
.skin-swatch[data-skin='terminal'] {
  background: #4ef14e;
}
.skin-swatch[data-skin='vibrant'] {
  background: #ff5da2;
}
```

- [ ] **Step 4: GREEN AA** — `pnpm --filter web exec vitest run src/app/globals-contrast` → PASS los 8 combos × 8 pares. Iterar valores (solo luminosidad) hasta verde.

- [ ] **Step 5: Gate y commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/app/globals-contrast.test.ts apps/web/src/app/\[locale\]/layout.tsx
git commit -m "feat(web): editorial/terminal/vibrant skins over semantic tokens, AA-verified in 8 combos"
```

---

### Task 22: Primitiva `FilterableList` (headless, combobox/listbox)

Leer antes: `skills/accessibility/SKILL.md` (patrón APG combobox), `skills/component-patterns/SKILL.md`, `skills/code-conventions/SKILL.md`.

**Files:**

- Create: `apps/web/src/components/ui/filterable-list/filterable-list.tsx`, `filterable-list.test.tsx`, `index.ts`

**Interfaces:**

- Consumes: tokens/utilidades existentes.
- Produces (T23 lo consume 2 veces):

```ts
export type FilterableItem = { id: string; label: string; keywords?: readonly string[] };
export type FilterableListProps<T extends FilterableItem> = {
  items: readonly T[];
  /** Label accesible del input (visible u oculto via labelClassName sr-only). */
  inputLabel: string;
  emptyMessage: string;
  onSelect: (item: T) => void;
  placeholder?: string;
  /** Contenido custom del item (swatches…); default: item.label. */
  renderItem?: (item: T, active: boolean) => ReactNode;
  className?: string;
};
export function FilterableList<T extends FilterableItem>(props: FilterableListProps<T>): ReactNode;
```

Comportamiento: input `role="combobox"` (`aria-expanded`, `aria-controls`, `aria-activedescendant`) + `role="listbox"` SIEMPRE visible debajo con `role="option"` por item; filtro en vivo case-insensitive sobre `label` + `keywords`; ↑/↓ mueven el activo (con wrap), Enter selecciona el activo (o el único resultado), Escape limpia el filtro; sin resultados → mensaje `emptyMessage` con `role="status"` (estado vacío explícito, no lista muda).

- [ ] **Step 1: Tests failing:**

```tsx
const ITEMS = [
  { id: 'button', label: 'Button', keywords: ['cta'] },
  { id: 'badge', label: 'Badge' },
  { id: 'tabs', label: 'Tabs' },
];

it('filtra en vivo por label y keywords', async () => {
  // type 'cta' → solo la opción Button visible
});
it('teclado completo: ↓↓ activa la tercera, Enter la selecciona', async () => {
  // aria-activedescendant sigue al activo; onSelect llamado con ITEMS[2]
});
it('Escape limpia el filtro y restaura la lista completa', async () => {});
it('sin resultados muestra el estado vacío con role status', async () => {
  // type 'zzz' → screen.getByRole('status') con emptyMessage; sin options
});
it('ARIA: combobox apunta al listbox y las opciones tienen id estable', () => {});
```

Run → FAIL.

- [ ] **Step 2: Implementación.** Estado `query` + `activeIndex` (clamp al filtrar; `useMemo` para `filtered`). IDs: `useId()` como prefijo (`${id}-option-${item.id}`). Estilos SOLO tokens: input como `Input` existente (reutilizar el componente `Input` si sus props encajan; si no, clases equivalentes), opciones `aria-selected` + activo con `bg-surface`/`outline-ring`. Sin portal ni popover: lista inline (los dos consumidores la usan desplegada — el skin-switcher la mete en un popover propio en T23).

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/components/ui/filterable-list` → PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/ui/filterable-list
git commit -m "feat(web): FilterableList primitive — live filter, full keyboard, combobox ARIA"
```

---

### Task 23: Skin-switcher (header) + índice filtrable del showcase

Leer antes: `skills/accessibility/SKILL.md` (disclosure + focus), `skills/tailwind-tokens/SKILL.md`.

**Files:**

- Create: `apps/web/src/components/layout/skin-switcher.tsx`, `skin-switcher.test.tsx`, `apps/web/src/components/showcase/showcase-index.tsx`, `showcase-index.test.tsx`
- Modify: `apps/web/src/components/layout/header.tsx`, `apps/web/src/app/[locale]/showcase/page.tsx`, `apps/web/messages/{es,en}.json` (`switchers.skin*`, `showcase.filter*`)

**Interfaces:**

- Consumes: `FilterableList` (T22), `applySkin`/`SKINS` (T20/T2), swatches CSS (T21), TOC del showcase (T10).
- Produces: `SkinSwitcher` — botón disclosure en el header (`aria-expanded`, cierra con Escape/click fuera, foco al abrir en el input) con `FilterableList` de los 4 skins (renderItem: swatch `<span className="skin-swatch" data-skin={id} aria-hidden />` + label); seleccionar aplica `applySkin` y cierra. `ShowcaseIndex` — client component que sustituye el `<nav>` TOC: `FilterableList` con las secciones; `onSelect` navega al ancla (`location.hash`) sin perder el filtro.

- [ ] **Step 1: Tests failing.** `skin-switcher.test.tsx`: abre con click (aria-expanded true), filtra "term", Enter → `document.documentElement.dataset.skin === 'terminal'` y cerrado con foco devuelto al botón; seleccionar "Dev tool" elimina el atributo. `showcase-index.test.tsx`: renderiza una opción por sección del TOC; filtrar "media" deja solo media-kit; select cambia `location.hash`. Run → FAIL.

- [ ] **Step 2: Implementación.** `SkinSwitcher`: labels de skins legibles via messages (`switchers.skinDevTool` = "Dev tool"…); keywords por skin (p.ej. `['serif','cv']` para editorial). Popover: div posicionado `absolute` bajo el botón (`relative` en el wrapper), `useEffect` para click-fuera y Escape. Integrar en `header.tsx` junto al ThemeSwitcher. `ShowcaseIndex`: recibe `items` (id/label del TOC ya localizado) por props desde la página (RSC pasa datos, isla client filtra — skill nextjs-static-dual).

- [ ] **Step 3: GREEN** — tests de layout y showcase PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/layout apps/web/src/components/showcase apps/web/src/app/\[locale\]/showcase/page.tsx apps/web/messages
git commit -m "feat(web): skin switcher and filterable showcase index (FilterableList consumers)"
```

---

### Task 24: Las 3 vistas del CV + selector + print

Leer antes: `skills/accessibility/SKILL.md`, `skills/component-patterns/SKILL.md`, `skills/tailwind-tokens/SKILL.md`.

**Files:**

- Create: `apps/web/src/components/cv/cv-standard.tsx`, `cv-compact.tsx`, `cv-timeline.tsx`, `cv-view-switcher.tsx`, `cv-content.tsx` (+ tests: `cv-views.test.tsx`, `cv-view-switcher.test.tsx`)
- Modify: `apps/web/src/app/[locale]/cv/page.tsx`, `apps/web/src/app/globals.css` (print), `apps/web/messages/{es,en}.json` (`cv.view*`)

**Interfaces:**

- Consumes: sub-bloques de T9 (`ExperienceEntryBlock` con `dense`, `SkillGroup` con `showLevel`, `EducationList`), `CvView`/`CV_VIEWS` (T2), `AppearanceInit onView` + `persistCvView` (T20).
- Produces: `CvContent({ locale, strings })` — isla client que posee `view` (init desde `AppearanceInit onView`), renderiza el switcher + la vista activa; `CvViewSwitcher({ view, onChange, labels })` — `role="radiogroup"` con 3 radios (segmented, teclado nativo de radios); las 3 vistas sobre los MISMOS datos.

- [ ] **Step 1: Tests failing.**

```tsx
// cv-views.test.tsx
it('las 3 vistas renderizan las mismas entradas de experiencia', () => {
  // render each; screen.getAllByRole('heading', { level: 3 }) — mismo count = experience.length
});
it('compact no renderiza controles interactivos (print-safe)', () => {
  // render CvCompact → queryAllByRole('button') vacío
});
it('timeline marca la cronología como lista ordenada', () => {
  // <ol> con un item por entrada
});

// cv-view-switcher.test.tsx
it('radiogroup con 3 opciones, cambio por click y por teclado', async () => {});
```

`cv-content.test.tsx`: al montar con `?view=timeline` en la URL (stub location + AppearanceInit real), muestra la vista timeline; cambiar en el switcher llama a `persistCvView`. Run → FAIL.

- [ ] **Step 2: Implementación.** `CvStandard`: lo que hoy renderiza la página (T9) extraído a componente. `CvCompact`: una columna densa, `dense` en entradas, `showLevel={false}`, sin botones. `CvTimeline`: `<ol>` vertical con marcador (`border-l border-border` + punto `bg-accent`), entradas cronológicas. `CvViewSwitcher`: radios nativos visualmente segmented (inputs sr-only + labels estilizados, `:checked` → `bg-accent text-accent-fg`). `CvContent`: `'use client'`; `useState<CvView>('standard')`; `<AppearanceInit onView={setView} />` local (el del layout no gestiona view); al cambiar → `persistCvView`. La página CV (RSC) pasa strings/locale y renderiza `<CvContent …>`; el switcher y el share button llevan clase `no-print`.

Print en `globals.css`:

```css
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #fff;
    color: #000;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  main {
    max-width: none;
    padding: 0;
  }
}
```

(Únicos hex fuera de bloques de tema: tinta de impresión, permitido — es definición global, no componente.)

- [ ] **Step 3: GREEN** — `pnpm --filter web exec vitest run src/components/cv` → PASS.

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/cv apps/web/src/app/\[locale\]/cv apps/web/src/app/globals.css apps/web/messages
git commit -m "feat(web): CV standard/compact/timeline views with accessible switcher and print CSS"
```

---

### Task 25: Botón "Compartir esta vista" (CV + showcase)

Leer antes: `skills/component-patterns/SKILL.md` (estados), `skills/accessibility/SKILL.md`.

**Files:**

- Create: `apps/web/src/components/layout/share-view-button.tsx`, `share-view-button.test.tsx`
- Modify: `apps/web/src/components/cv/cv-content.tsx`, `apps/web/src/app/[locale]/showcase/page.tsx`, `apps/web/messages/{es,en}.json` (`share.*`)

**Interfaces:**

- Consumes: `buildShareUrl` (T20), estado actual del DOM (`dataset.theme`/`dataset.skin`), `view` (solo en CV, por prop).
- Produces: `ShareViewButton({ view?: CvView; labels: { share: string; copied: string; error: string } })` — construye la URL con `location.origin/pathname` + apariencia actual (+ `view` si llega), `navigator.clipboard.writeText`, feedback "Copiado" 2 s con `aria-live="polite"`, estado de error explícito si clipboard falla.

- [ ] **Step 1: Tests failing:** clipboard mockeado (`vi.stubGlobal('navigator', …writeText`) → click copia `…/es/cv?theme=dark&skin=terminal&view=compact` (dataset preparado en el test); anuncia `copied`; clipboard que rechaza → anuncia `error` (sin romper). Sin `view` prop → URL sin `view=`. Run → FAIL.

- [ ] **Step 2: Implementación.** `'use client'`; estado `idle | copied | error` (union, no booleanos); `Button variant="secondary" size="sm"`. Colocar en `CvContent` (con `view`) y en el header del showcase (sin view), ambos `no-print`.

- [ ] **Step 3: GREEN.**

- [ ] **Step 4: Gate y commit**

```bash
git add apps/web/src/components/layout/share-view-button.tsx apps/web/src/components/layout/share-view-button.test.tsx apps/web/src/components/cv/cv-content.tsx apps/web/src/app/\[locale\]/showcase/page.tsx apps/web/messages
git commit -m "feat(web): share-this-view button building appearance URL to clipboard"
```

---

## CIERRE

### Task 26: Cierre de fase — builds duales, verificación en vivo, reviews, roadmap, merge

La coordina el **orquestador** (usa Playwright MCP, agentes de review y decisiones de merge). REQUIRED SUB-SKILL: `superpowers:verification-before-completion` — nada se declara hecho sin comando ejecutado.

- [ ] **Step 1: Gate completo + builds duales**

```bash
pnpm run format:fix && pnpm run lint && pnpm run typecheck && pnpm run test
pnpm --filter @nicobehm/media-kit build
pnpm --filter web build                          # export (default)
NEXT_OUTPUT_MODE=node pnpm --filter web build    # node
```

Expected: todo verde; el build export lista TODAS las rutas × locales.

Además: `grep -rn 'TODO_CV' apps/web/src apps/web/content --include='*.ts*' --include='*.mdx'` → vacío (spec §3: los placeholders desaparecen), y `grep -rnE '#[0-9a-fA-F]{3,8}|rgb\(' apps/web/src/components apps/web/src/features 2>/dev/null` → vacío (regla de tokens).

- [ ] **Step 2: Verificación en vivo (Playwright MCP sobre `pnpm run dev` o `serve out/`)** — matriz spec §9, TODA:
  - 4 skins × 2 temas en home y CV (via `?skin=&theme=` — verifica también la precedencia URL y la limpieza de query).
  - 3 vistas de CV + vista print de `compact` (emulación print o screenshot con `media: print`).
  - Navegación es↔en conservando ruta (desde `/es/projects` → `/en/projects`).
  - Redirects `/` → `/en` y `/showcase` → `/en/showcase` (sobre `serve out/`).
  - Filtro del showcase por teclado (↓/Enter navega a la sección).
  - Bloque C en vivo: botón expand por ejemplo → compare-lightbox (divisor SOLO desde el handle; flechas en handle mueven divisor; zoom con rueda; Espacio+drag panea; Escape con precedencia); pauseOnClick en el slider hover; **pan con ratón verificado a zoom > 100 %** (reporte original del usuario); fullSrc en pantalla grande (request de `portrait-hd.webp` al abrir el expand en viewport grande emulado).
  - Botón compartir copia URL con el estado.
- [ ] **Step 3: Design review** — agente `design-reviewer` sobre home/CV/projects/showcase en los 8 combos skin×tema. Corregir blockers antes de seguir.
- [ ] **Step 4: Code review final de rama** — `superpowers:requesting-code-review` sobre `git diff main...HEAD`. Corregir blockers.
- [ ] **Step 5: Roadmap + docs** — marcar F3 ✅ en `2026-07-10-portfolio-roadmap.md` (fila 3 → `2026-07-15-phase-3-content-theming.md`, estado ✅ hecha); commit `docs: mark phase 3 done in roadmap`.
- [ ] **Step 6: Merge FF a main + push**

```bash
git checkout main && git pull --ff-only
git merge --ff-only feature/phase-3-content-theming
git push origin main
```

- [ ] **Step 7: `/checkpoint`** (STATUS.md + memoria + prompt de continuación para F4).

---

## Notas de riesgo (leer antes de dispatchar)

1. **Ciclo de imports compare-slider ↔ media-lightbox (T13/T15):** vigilado con test de humo de `index.ts` y build de tsup; plan de contingencia descrito en T15.
2. **`redirect()` en export (T1) y `opengraph-image` en export (T11):** patrones documentados; ambas tasks llevan verificación de build con contingencia explícita — PARAR y anotar en ledger si fallan, no improvisar.
3. **Los valores hex de los skins (T21) son de partida:** el test AA es la fuente de verdad; ajustar luminosidad conservando matiz.
4. **`NextIntlClientProvider` y RSC en tests:** los componentes se diseñan presentacionales (datos por props) para testearse sin request context; las páginas se verifican por build. No pelearse con mocks de `next-intl/server`.
5. **Rebuild del paquete:** cualquier verificación de la app tras tocar media-kit exige `pnpm --filter @nicobehm/media-kit build` previo (la app consume `dist/`).
