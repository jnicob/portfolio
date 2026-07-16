# Spec de diseño — Portfolio profesional de Nico Behm

**Fecha:** 2026-07-10
**Estado:** Aprobado por el usuario (2026-07-10), con ajustes: clean-room "similar/mejorado con autoría propia", Lighthouse > 90, config 100% agnóstica a cualquier agente
**Proceso:** Superpowers (brainstorming → writing-plans → executing-plans → TDD → code-review → verification → finishing)

---

## 1. Visión

Portfolio profesional bilingüe (es/en) de Nicolás Behm (full-stack, Freepik Company), con estética **dev-tool / API landing** (referencias: Stripe, Vercel, Linear). El hilo narrativo es su especialidad real: _construir plataformas de API de IA end-to-end_. El propio repositorio es parte del portfolio: organización, patrones, tests, config de agentes y CI/CD deben ser auditables por un revisor técnico.

**Audiencia:** recruiters técnicos y engineering managers (internacional → inglés primario en alcance, español al mismo nivel desde el día 1).

## 2. Decisiones cerradas (log)

| Decisión                | Valor                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Idioma                  | **Bilingüe es/en desde el día 1** (contenido completo en ambos)                                                                                                                                                                                                                                                                      |
| Estilo visual           | **Dev-tool / API landing**: oscuro por defecto, acentos vibrantes, bloques de código como elemento visual, grid limpio                                                                                                                                                                                                               |
| Playground              | **Dentro del portfolio** (`/playground`) + **paquete npm propio** con los componentes media (híbrido)                                                                                                                                                                                                                                |
| Playground: qué muestra | Generación/edición de **imagen y vídeo** con parámetros simples (prompt, modelo, aspect ratio, seed). Sin parametrización compleja tipo Flux                                                                                                                                                                                         |
| Edición de imagen v1    | **Solo ejemplos pregrabados** before/after (upscale, relight, remove-bg) con CompareSlider. Edición live = extensión documentada, no implementada                                                                                                                                                                                    |
| Vídeo                   | **Solo mocks** (verificado 2026-07-10: no existe API de vídeo gratuita fiable)                                                                                                                                                                                                                                                       |
| Imagen live (estático)  | **Pollinations.ai** — gratis, sin key, CORS `*` (verificado con generación real), GET por URL, con `referrer`. Fallback automático a mock                                                                                                                                                                                            |
| Imagen live (modo Node) | Proxy → **Cloudflare Workers AI** (FLUX.1-schnell, 10k neurons/día ≈ 200 img/día gratis, sin tarjeta)                                                                                                                                                                                                                                |
| Paquete npm             | **`@nicobehm/media-kit`**                                                                                                                                                                                                                                                                                                            |
| Dominio                 | Aún no existe → `SITE_URL` configurable por env con placeholder claro                                                                                                                                                                                                                                                                |
| CV                      | Etapa Freepik redactada desde los 779 PRs reales (GitHub `jnicob`) + titular público de LinkedIn. Experiencia previa y formación: **placeholders tipados** hasta que el usuario entregue el export PDF de LinkedIn (pendiente, no bloqueante). **AMENDED 2026-07-16 — ver §2.1:** LinkedIn ya entregado (`content/cv/linkedin*.pdf`); métrica global "+1.000 PRs" (GitHub + Bitbucket)                                                        |
| Case studies            | ① Plataforma web API Freepik/Magnific · ② Onboarding end-to-end de modelos IA · ③ Flows API. API keys/billing como sección del ①; Freepik Manager como entrada de experiencia, no case study. Los case studies enlazan la web real de Freepik/Magnific API. **AMENDED 2026-07-16 — ver §2.1:** Flows API sale de destacados; entran Playground y Backoffice; proyectos ampliados con todo el CV de LinkedIn                                   |
| Config agentes          | **Agnóstica a cualquier agente** (patrón `fc_freepik_web`): fuentes de verdad en raíz (`AGENTS.md`, `skills/`, `agents/`); adaptación por herramienta solo vía symlinks (`CLAUDE.md`, `GEMINI.md`, `.claude/`, `.cursor/`, `.codex/`, `.github/`) + `scripts/setup-agents.sh` que los crea/valida y genera `copilot-instructions.md` |

### 2.1 Enmiendas 2026-07-16 — revisión de contenido (feedback del usuario tras F3)

Decisiones nuevas a partir de la revisión del sitio publicado por F3. Se implementan en la **fase 3.5** del roadmap (antes de F4).

**Home**

- Orden de secciones: hero → **Skills** → **Proyectos destacados** (Skills sube por delante de destacados).
- **Eliminar** la card "Playground de IA — Próximamente" (`home.playgroundTitle/playgroundSoon`).
- En Proyectos destacados: añadir un **box-enlace a `/projects`** con el mismo estilo de card que los proyectos, adelantando algunos títulos ("y además: Backoffice, Cadi, HIS municipal…").
- Destacados quedan: ① Plataforma API Freepik/Magnific · ② Onboarding de modelos IA · ③ **Playground de la web de API** (CONFIRMADO por el usuario 2026-07-16: el playground de `fc_freepik_web` que Nico construyó, enlazando la versión live; puede ir como proyecto independiente o como parte destacada del case study global de API — decidir en el plan F3.5 con la evidencia). **Flows API sale de destacados** (CONFIRMADO): su contenido se integra como sección de "integración con la API" dentro del case study de la plataforma; desaparece como entrada/case study propio.
- **Alcance de la plataforma API** (corrección del usuario 2026-07-16): el trabajo del equipo de API **no es solo APIs de IA** — también APIs de stock, estado de tareas y otras. Reflejarlo en el copy del case study ①, el CV y el hero/summary de la home (sin perder el hilo narrativo de IA como especialidad).

**Métrica de PRs**

- Los 779 PRs son solo GitHub; los ~2 primeros años el equipo trabajó en **Bitbucket** (sin registro público) → la métrica pasa a "**+1.000 PRs**" y se muestra **solo a nivel general** (hero/summary del perfil). **Se eliminan los contadores de PRs por proyecto** en `projects.ts`.

**Skills**

- Ampliar `skills.ts` con el CV de LinkedIn y la exploración de repos (curado, no exhaustivo). Confirmadas por LinkedIn: **HL7 (V2 Messaging, Infobuttons) / interoperabilidad sanitaria**, SNOMED CT / LOINC / CIE-10, Mirth Connect, CodeIgniter, MySQL / SQL Server, WordPress / Moodle / Joomla, Salesforce Lightning/Aura, Material UI, SCRUM/gestión de proyectos. Confirmadas por la exploración de repos (2026-07-16): **Vue 2/3 + TypeScript** (tasks_web, tax_center, flaticon_manager, admin_web, freepik-manager), Laravel Nova, Slim 4 + DDD/hexagonal, Radix UI / vanilla-extract / cva, React Query, Zod, Docker + Kubernetes (Helm/Skaffold), extensiones Chrome MV3, MongoDB, BigQuery.
- Quitar cualquier skill/mención "Playground de IA" como skill.

**Proyectos (`/projects` + `projects.ts`)**

- Añadir **Backoffice Freepik**. Exploración hecha (2026-07-16, informes en `apps/web/content/cv/research-freepik-repos.md`, gitignored): freepik-manager (**680 commits, 2º contribuidor**), tasks_web (**495, 5º**), admin_web (275), tax_center (36), flaticon_manager (27), factotum (14), autologin (2); en `fc_freepik_web` (714 commits): Playground de la API, landings de API y dashboard dev-hub (usage/billing/limits). División propuesta (cerrar en el plan F3.5): ① Backoffice de contenido Freepik/Flaticon (manager + admin_web + tasks_web + flaticon_manager + factotum + autologin, con Tax Center como sub-bullet o entrada menor) · ② Playground de la API como proyecto destacado propio · ③ dev-hub (panel de desarrollador y estadísticas) como entrada propia o sección del case study de la plataforma.
- Añadir **todos los proyectos del CV de LinkedIn**: AccelOne (Cadi, GDS, Deal.me, Candidate Viewer, The Crane Club, DevelopIntelligence), Fares Taie (gestión del conocimiento en salud, CDSS), Municipalidad de Gral. Pueyrredon (HIS municipal, HL7), IAC (procesador ELISA, FONTAR).
- Los resúmenes de repos internos son **clean-room**: descripción funcional de alto nivel + stack, sin código ni datos internos. Notas de investigación en `apps/web/content/cv/` (gitignored), nunca en el repo público.

**CV**

- Mejorar la redacción de la experiencia Freepik/Magnific con la evidencia de la exploración de repos: tres frentes — plataforma API (specs/servidor/gateway/docs), web pública de la API (Playground, landings, dev-hub con usage/billing/limits) y backoffice de contenido/colaboradores — y sumar las skills nuevas. Experiencia previa desde LinkedIn: AccelOne (2020-2022), Fares Taie (2012-2021), Municipalidad Gral. Pueyrredon (2012-2021, HIS + HL7), IAC (2013-2017), docencia ISET, Lauquen; educación: Ing. Informática (U. FASTA), Especialista en Gestión de la Tecnología y la Innovación (UNMdP).

**Fixes UI (mismos criterios AA de siempre)**

- Header: `cursor: pointer` en hover de los switchers de skin/modo/idioma. (→ F3.5)

**Showcase + media-kit — UX v2 (detallado por el usuario 2026-07-16 → fase 3.6)**

- Showcase, UX pobre a mejorar: transiciones suaves entre estados; el menú de filtrar debe **filtrar** (no desplazar el contenido); bordes redondeados coherentes; cambiar de tab **no debe desplazar el contenido de debajo** (reservar altura / layout estable); revisar otras mejoras de UX modernas (micro-interacciones, focus states, scroll).
- media-kit: **bug** — "seguir el mouse" no funciona en fullscreen; los comandos/controles deben tener **helpText (tooltip) que se active con delay**; usar otra "**Colorización simulada**" para los 2 primeros ejemplos de demo.
- Nuevos **componentes reutilizables de gran impacto visual** para destacar el trabajo frontend — **SELECCIONADOS TODOS por el usuario (2026-07-16)**, alcance de F3.6:
  - Para `@nicobehm/media-kit` (0.5): **SpotlightReveal** (lupa/linterna before-after, accesible por teclado), **modos extra de CompareSlider** (onion-skin, diff-blink, side-by-side con zoom sincronizado), **FilterGallery** (grid/masonry con filtrado/reordenado animado FLIP o View Transitions con fallback — de paso arregla el filtro del showcase), **VideoScrubPreview** (hover-scrub de vídeo).
  - Para el portfolio (`apps/web`): **ApiRequestPlayer** (request/response animado estilo API reference, reutilizable en F4), **TiltCard/GlowCard** (cards de proyecto con tilt 3D sutil + glow que sigue el puntero), **AnimatedMetric** (contador animado al entrar en viewport, para "+1.000 PRs"), **hero canvas reactivo** (fondo de puntos token-aware, sutil).
  - Todas: tokens semánticos, AA, `prefers-reduced-motion`, sin dependencias pesadas, compatibles con export estático.

## 3. Restricciones globales

- **Next.js 16** (App Router) + **TypeScript estricto** + **Tailwind CSS v4** + **pnpm** (workspaces).
- Dark/light con **tokens semánticos**: CSS variables + `data-theme`. **Prohibido hardcodear colores** en componentes.
- **Prohibido** cualquier paquete interno de empresa (perita, etc.) o dependencia privada. Todo clean-room con OSS público o código propio.
- Runtime **dual**: por defecto `output: 'export'` (corre en hosting compartido); modo Node opcional (SSR + route handlers) activable por env/config **sin reescribir componentes**.
- **Nunca** secretos en el bundle estático. El modo live con secretos requiere runtime Node o proxy externo.
- ESLint + Prettier + typecheck **siempre en verde**.
- Reimplementación clean-room de patrones (landings de API, playground): inspiración en patrones, no copia literal de código de empresa (puede ser similar/mejorado, lo he hecho yo mismo al original).
- WCAG AA en ambos temas. Lighthouse > 90. Presupuesto de bundle vigilado.

## 4. Arquitectura — monorepo pnpm

```
portfolio/
├── AGENTS.md                      # FUENTE DE VERDAD para cualquier agente
├── CLAUDE.md -> AGENTS.md         # symlink (Claude Code)
├── GEMINI.md -> AGENTS.md         # symlink (Gemini CLI)
├── README.md                      # qué es, cómo correr, matriz de deploy, mapa arquitectura, lista componentes
├── pnpm-workspace.yaml
├── .github/
│   ├── workflows/                 # ci.yml, deploy-cloudflare.yml, deploy-vps.yml
│   ├── copilot-instructions.md    # GENERADO desde AGENTS.md (setup-agents.sh, no editar)
│   └── skills -> ../skills        # symlink (Copilot)
├── .claude/
│   ├── skills -> ../skills        # symlink
│   └── agents -> ../agents        # symlink
├── .cursor/skills -> ../skills    # symlink (Cursor)
├── .codex/skills -> ../skills     # symlink (Codex)
├── skills/                        # 6 skills de dominio (carpeta por skill, SKILL.md) — única copia real
├── agents/                        # design-reviewer.md, qa-a11y-perf.md — única copia real
├── docs/
│   ├── superpowers/{specs,plans}/
│   ├── architecture.md
│   └── deploy/                    # vercel-cloudflare.md, shared-hosting.md, vps.md
├── scripts/                       # setup-agents.sh, deploy-shared-hosting.sh, proxy PHP de ejemplo
├── packages/media-kit/            # @nicobehm/media-kit
│   ├── src/                       # CompareSlider, MediaLightbox, primitivas
│   ├── __tests__/
│   ├── README.md                  # API documentada (props, ejemplos)
│   └── (build con tsup, exports ESM+CJS, types)
└── apps/web/
    ├── next.config.ts             # NEXT_OUTPUT_MODE: 'export' (default) | 'node'
    ├── content/{es,en}/projects/  # case studies MDX
    ├── public/mocks/              # imágenes/vídeos pregrabados del playground
    ├── e2e/                       # Playwright (flujos + visual + axe)
    └── src/
        ├── app/[locale]/          # home, cv, projects, projects/[slug], playground, showcase
        ├── components/{ui,layout,sections}/
        ├── features/playground/   # domain/ adapters/{mock,pollinations,proxy}/ ui/
        ├── data/                  # profile, experience, education, skills, projects + schemas Zod
        └── lib/                   # i18n, seo (metadata/JSON-LD/sitemap), theme
```

### 4.1 `@nicobehm/media-kit`

Componentes media reutilizables, accesibles, headless-friendly:

- **`CompareSlider`** — slider before/after para pares imagen/imagen. Accesible (teclado: flechas mueven el divisor; `role="slider"` + aria). Variantes horizontal/vertical.
- **`MediaLightbox`** — visor fullscreen para imagen **y vídeo**: focus trap, `Escape` cierra, navegación por teclado, scroll lock, respeta `prefers-reduced-motion`.
- Primitivas de soporte que surjan (p.ej. `AspectRatio`).

Requisitos: cero dependencia de Tailwind — estilos propios mínimos encapsulados, personalizables vía CSS custom properties públicas documentadas (`--mk-*`); tests unitarios propios, README con tabla de props y ejemplos, build publicable en npm (tsup, ESM+CJS+d.ts). El portfolio es su demo pública.

### 4.2 Runtime dual

- `next.config.ts` lee `NEXT_OUTPUT_MODE`:
  - `export` (default): `output: 'export'`, imágenes con loader compatible estático, sin route handlers dinámicos.
  - `node`: SSR disponible + route handler `/api/ai-proxy` (proxy a Cloudflare Workers AI con secretos en env server-side).
- Los componentes no cambian entre modos; la variación vive en config + selección de adaptador.
- `docs/architecture.md` documenta qué se degrada en estático (sin proxy con secretos, sin SSR, imágenes sin optimización server-side).

### 4.3 Contenido como datos

- `src/data/*` en TypeScript, validado con **Zod** en build (script `validate-content` en CI). Nada de contenido hardcodeado en JSX.
- Schemas: `Profile`, `ExperienceEntry`, `EducationEntry`, `Skill` (nombre, nivel 1-5, tags, categoría), `Project` (slug, resumen, stack, enlaces, métricas, rol).
- Case studies: MDX por locale en `content/{es,en}/projects/`, con frontmatter validado por Zod.
- Placeholders de CV pendientes de LinkedIn: marcados con convención visible (`TODO_CV:`) y listados en README hasta completarse.

### 4.4 i18n y SEO

- `next-intl` con segmento `[locale]` (`/es/…`, `/en/…`), prerenderizado vía `generateStaticParams` (compatible export). Redirección de raíz por defecto a `/en` (mercado internacional) con selector visible.
- Metadata por página y locale, OpenGraph (imágenes OG estáticas generadas en build), `sitemap.xml` + `robots.txt` estáticos, JSON-LD `Person` (+ `SoftwareSourceCode` en case studies si aporta).
- `SITE_URL` por env (`NEXT_PUBLIC_SITE_URL`), placeholder documentado hasta que exista dominio.

### 4.5 Playground (`/playground`)

**UX:** panel de parámetros (prompt, modo generar-imagen | editar-imagen | generar-vídeo, modelo mock, aspect ratio, seed) → botón Generar → panel resultado con pestañas **Preview** y **API** (request/response JSON que se enviaría/recibiría, estilo API reference). Resultado clicable → **MediaLightbox fullscreen**. En modo edición, resultado con **CompareSlider** before/after. Estados **empty / loading / error** explícitos y diseñados.

**Arquitectura de datos (puerto/adaptador):**

```
features/playground/
├── domain/          # tipos: GenerationRequest, GenerationResult, PlaygroundMode
├── adapters/
│   ├── mock.ts          # respuestas/medios pregrabados de public/mocks (default)
│   ├── pollinations.ts  # live imagen desde navegador (GET URL, referrer, timeout + fallback a mock)
│   └── proxy.ts         # live vía /api/ai-proxy (solo modo Node)
└── ui/              # form, result panel, api tab, estados
```

- Selección de adaptador: mock por defecto; `pollinations` activable por env pública (`NEXT_PUBLIC_PLAYGROUND_LIVE=pollinations`); `proxy` solo si modo Node + secretos configurados.
- Vídeo y edición: siempre adaptador mock en v1 (decisión cerrada).
- Resiliencia: timeout y error del adaptador live degradan a mock con aviso en UI.
- Los case studies enlazan el playground real de Freepik/Magnific como "versión de producción".

## 5. Config de agentes (agnóstica a cualquier agente)

**Principio:** ningún contenido vive en carpetas propietarias de una herramienta. Las fuentes de verdad están en la raíz del repo (`AGENTS.md`, `skills/`, `agents/`) en markdown estándar; cada herramienta (Claude Code, Cursor, Codex, Gemini CLI, Copilot…) las descubre vía symlink o archivo generado. Añadir soporte a una herramienta nueva = añadir un symlink, nunca duplicar contenido.

- **`AGENTS.md`** (fuente de verdad, [estándar agents.md](https://agents.md) que ya leen Codex/Cursor/Copilot/Gemini de forma nativa): descripción del proyecto, comandos, restricciones, **tabla de enrutado** `| Action | Skill |` por keywords (formato `fc_freepik_web`, con `<!-- prettier-ignore -->`), y la división de responsabilidades: **Superpowers = proceso · skills = conocimiento de dominio · agents = lentes de revisión**. Nota explícita para agentes sin Superpowers: la tabla de skills y las lentes de revisión funcionan como documentación normal (leer y aplicar).
- **Symlinks por herramienta** (creados y validados por `scripts/setup-agents.sh`):
  - `CLAUDE.md → AGENTS.md` · `GEMINI.md → AGENTS.md`
  - `.claude/skills → ../skills` · `.cursor/skills → ../skills` · `.codex/skills → ../skills` · `.github/skills → ../skills`
  - `.claude/agents → ../agents`
- **`.github/copilot-instructions.md`**: generado por `setup-agents.sh --copilot` concatenando `AGENTS.md` + índice de skills (cabecera "Auto-generated, do not edit").
- **`scripts/setup-agents.sh`**: idempotente; `--validate` comprueba que symlinks y generado están al día (se ejecuta en CI); documentado en README para checkouts sin symlinks (Windows).
- **`skills/`** (raíz, única copia real), cada una con frontmatter portable `name`, `description` ("Use when…"), `metadata.auto-invoke` (los campos extra no molestan a herramientas que no los usan):
  - `nextjs-static-dual` — App Router, RSC vs client, restricciones de `output:'export'`, modo Node opcional.
  - `tailwind-tokens` — tokens semánticos, theming CSS vars + `data-theme`, prohibición de color hardcodeado.
  - `component-patterns` — composición, headless, variantes con cva, formularios accesibles, estados empty/error/loading.
  - `accessibility` — checklist WCAG AA aplicable en review.
  - `performance` — Core Web Vitals, imágenes, presupuesto de bundle.
  - `code-principles` — legibilidad, SOLID, responsabilidad única, tamaño de módulos.
  - Solo conocimiento; **no duplican proceso de Superpowers**.
- **`agents/`** (raíz, única copia real; `.claude/agents` es symlink). Cada agente es un brief markdown ejecutable por cualquier herramienta como prompt de revisión (el frontmatter de subagente Claude es compatible y opcionalmente ignorable por otras):
  - `design-reviewer` — auditoría visual y de taste: jerarquía, espaciado, estados, coherencia en ambos temas.
  - `qa-a11y-perf` — ejecuta Playwright + auditoría a11y y Lighthouse, reporta hallazgos.

## 6. Calidad (Definition of Done)

- **Vitest + Testing Library**: unidad y componentes (TDD durante implementación).
- **Playwright**: flujo completo del playground, navegación i18n, visual regression, **axe** en ambos temas.
- **WCAG AA**: teclado completo, roles/aria, contraste verificado en dark y light.
- **Performance**: imágenes optimizadas (estático-compatibles), code-splitting, presupuesto de bundle en CI, Lighthouse > 90.
- Cada componente UI: ejemplo de uso + entrada en la página **showcase** (kitchen sink).
- Typecheck + lint + tests en verde en cada commit a main (CI).

## 7. Deploy + CI/CD (3 targets documentados con workflows reales)

| Target                                      | Modo                      | CI/CD                                                                                  | Qué funciona                                                                           |
| ------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Cloudflare Pages / Vercel** (recomendado) | export (o node en Vercel) | Nativo + previews por PR (`deploy-cloudflare.yml` o config Vercel)                     | Todo lo estático; en Vercel-node también proxy live                                    |
| **GoDaddy / hosting compartido**            | export                    | Sin CI/CD: `scripts/deploy-shared-hosting.sh` (build local + subida FTP/SFTP + backup) | Solo estático: sin SSR, sin previews, sin secretos → playground live solo Pollinations |
| **VPS básico**                              | export o node             | `deploy-vps.yml` (SSH/rsync)                                                           | Con Node: todo. Sin Node: estático + **proxy PHP mínimo de ejemplo** para el modo live |

README raíz con matriz target → qué funciona → pasos.

## 8. Fases de implementación

| Fase                       | Entregable verificable                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0. Fundaciones**         | Monorepo pnpm, Next 16 + TS estricto, Tailwind v4, ESLint/Prettier, CI base, AGENTS.md + skills + agents + setup-agents.sh (symlinks multi-herramienta) |
| **1. Design system**       | Tokens semánticos + dark/light, primitivas UI (cva), página showcase                                                                                    |
| **2. media-kit**           | CompareSlider + MediaLightbox (TDD, a11y), build publicable, README                                                                                     |
| **3. Contenido + páginas** | Schemas Zod, datos CV/skills/projects, 3 case studies MDX es+en, Home/CV/Projects, SEO completo                                                         |
| **4. Playground**          | Puerto+adaptadores (mock/pollinations/proxy), UI form→preview, estados, fullscreen + before/after                                                       |
| **5. Dual + deploys**      | Modo export/node, workflows de los 3 targets, docs de deploy, proxy PHP ejemplo                                                                         |
| **6. QA final**            | E2E + visual + axe, auditoría qa-a11y-perf, design review, Lighthouse > 90, README final                                                                |

Cada fase cierra con code review y verification-before-completion (Superpowers).

## 9. Fuera de alcance (v1)

- Edición de imagen live (remove-bg client-side, inpainting vía proxy) — documentada como extensión.
- Vídeo live por API (no existe opción gratuita fiable; re-evaluar si aparece).
- Blog/escritos.
- Publicación efectiva en npm de media-kit (queda **listo para publicar**; el publish es acción manual del usuario).
- Compra de dominio y configuración DNS.

## 10. Pendientes del usuario (no bloqueantes)

1. **Export PDF de LinkedIn** (perfil → Más → Guardar como PDF) para experiencia previa + formación.
2. **Dominio** definitivo (mientras: `SITE_URL` por env).
3. Decidir si publicar `@nicobehm/media-kit` en npm al final.
