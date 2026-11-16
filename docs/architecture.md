# Base de Conocimiento Técnica y Arquitectura — Portfolio & `@nicobehm/media-kit`

> **Propósito de este documento:** Servir como fuente de verdad arquitectónica, registro de justificaciones técnicas, auditoría crítica de decisiones y manual operativo de extensión para explicar el proyecto en entrevistas técnicas, auditarlo o continuar desarrollándolo en el futuro.

---

## 1. Visión y Propósito del Sistema

Este repositorio cumple una **doble función estratégica**:

1. **Producto web público (`jnicob.dev`)**: Portfolio profesional bilingüe (`es` / `en`) de Nicolás Behm (Senior Full-Stack & AI Engineer), con estética **dev-tool / API landing** (inspirada en Stripe, Vercel y Linear), optimizado para recruiters técnicos y engineering managers internacionales.
2. **Pieza de ingeniería auditable**: El propio código fuente demuestra en vivo las competencias declaradas en el CV: arquitectura de monorepo, diseño de librerías UI publicadas en npm (`@nicobehm/media-kit`), validación estricta en tiempo de compilación, accesibilidad WCAG AA verificada matemáticamente en tests, runtime dual (estático/Node), calibración de impresión PDF y configuración agnóstica para agentes de IA.

---

## 2. Topología del Monorepo y Stack Tecnológico

El proyecto se estructura como un monorepo gestionado con **pnpm workspaces** ([pnpm-workspace.yaml](file:///home/nico/workspace/portfolio/pnpm-workspace.yaml)):

```text
portfolio/
├── apps/
│   └── web/                   # Aplicación Next.js 16 (App Router, React 19, Tailwind v4, next-intl)
├── packages/
│   ├── media-kit/             # Librería UI @nicobehm/media-kit (v0.7.0, publicada en npm, zero-Tailwind)
│   └── core/                  # Semilla de dominio @ai-playground/core (tipos y schemas de generación IA)
├── skills/                    # 9 skills de conocimiento de dominio para agentes de IA (fuente única)
├── agents/                    # Lentes de auditoría (design-reviewer, qa-a11y-perf)
├── docs/                      # Specs, planes por fase, ADRs (decisions/) y esta base de conocimiento
├── scripts/                   # Automatización multi-agente (setup-agents.sh)
└── AGENTS.md                  # Configuración maestra agnóstica de agentes (symlinks: CLAUDE.md, GEMINI.md)
```

### 2.1 Matriz del Stack Tecnológico y su Justificación

| Capa                     | Tecnología                                    | Versión           | Justificación Arquitectónica                                                                                                                                                                                                     |
| :----------------------- | :-------------------------------------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo & Gestor**    | `pnpm` Workspaces                             | `9.9.0`           | Aislamiento estricto de dependencias, resolución rápida mediante enlaces duros y ejecución en topología (`pnpm -r build \| test \| typecheck`).                                                                                  |
| **Framework Web**        | Next.js (App Router) + React                  | `16.x` / `19.x`   | Permite usar **React Server Components (RSC)** para compilar MDX y validar datos en build con coste cero de JS en cliente, soportando exportación 100 % estática (`output: 'export'`) o servidor Node (`NEXT_OUTPUT_MODE=node`). |
| **Lenguaje**             | TypeScript (`strict: true`)                   | `5.9.x`           | Seguridad de tipos de extremo a extremo, incluyendo `noUncheckedIndexedAccess` y contratos inferidos automáticamente desde schemas de Zod.                                                                                       |
| **Estilos & Temas**      | Tailwind CSS v4 + CSS Vars                    | `4.x`             | Motor CSS-first (`@theme inline`) acoplado a variables CSS semánticas (`--bg`, `--fg`, `--accent`, etc.) que permite cambiar entre **4 skins × 2 temas** e impresión A4 sin re-renderizar componentes React.                     |
| **Variantes UI**         | `class-variance-authority` + `tailwind-merge` | `0.7.x` / `3.6.x` | Composición declarativa de primitivas UI (`Button`, `Badge`, `Card`, `Input`, `Select`, `Tabs`) sin colisiones de clases utilitarias.                                                                                            |
| **Validación & Datos**   | `zod` + `next-mdx-remote`                     | `4.4.x` / `6.0.x` | Validación en tiempo de compilación (_fail-fast build_) tanto de datos estructurados (`src/data/*.ts`) como del frontmatter de los casos de estudio en MDX (`content/{es,en}/projects/*.mdx`).                                   |
| **Internacionalización** | `next-intl`                                   | `4.13.x`          | Enrutado estático por segmento `/[locale]/` (`es` / `en`) compatible con `generateStaticParams` y mensajes tipados libres de runtime server-side obligatorio.                                                                    |
| **Empaquetado Librería** | `tsup`                                        | `8.5.x`           | Compilación de `@nicobehm/media-kit` a doble formato (`ESM` + `CJS`), declaraciones `.d.ts` y bundle CSS independiente (`dist/styles.css`).                                                                                      |
| **Testing & QA**         | Vitest + Testing Library + Chrome Headless    | `3.2.x`           | Suite de 91 archivos de test que valida lógica unitaria, componentes interactivos, accesibilidad de teclado, paridad i18n, contraste matemático WCAG AA, ausencia de PII y conteo real de páginas PDF A4.                        |

---

## 3. Decisiones de Arquitectura e Implementaciones Clave (con Ejemplos Reales)

### 3.1 Runtime Dual (`export` estático por defecto vs. `node` opcional)

- **Problema:** Desplegar en un hosting compartido económico (Apache/cPanel en GoDaddy) exige archivos estáticos puros (`.html`, `.css`, `.js`), pero el desarrollo moderno y futuros despliegues en Vercel/VPS se benefician de capacidades server-side.
- **Solución implementada:**
  - En [output-mode.ts](file:///home/nico/workspace/portfolio/apps/web/src/lib/output-mode.ts) y [next.config.ts](file:///home/nico/workspace/portfolio/apps/web/next.config.ts), la función `resolveOutputMode(process.env)` conmuta dinámicamente `output: 'export'` e `images: { unoptimized: true }` cuando `NEXT_OUTPUT_MODE !== 'node'`.
  - Se activa `trailingSlash: true` en [next.config.ts](file:///home/nico/workspace/portfolio/apps/web/next.config.ts#L14) para que Next.js genere directorios físicos (`/es/cv/index.html`) en lugar de archivos sueltos (`/es/cv.html`), evitando redirecciones `301`/`403 Forbidden` de `mod_dir` en Apache ([.htaccess](file:///home/nico/workspace/portfolio/apps/web/public/.htaccess)).
  - En CI ([ci.yml](file:///home/nico/workspace/portfolio/.github/workflows/ci.yml#L31-L46)), una matriz de GitHub Actions compila el proyecto en **ambos modos** (`matrix.output-mode: [export, node]`) en cada push o PR para garantizar que ningún componente introduzca acoplamientos que rompan cualquiera de los dos runtimes.

### 3.2 Arquitectura de Backend Dual en el Formulario de Contacto

El formulario de contacto ([contact-form.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/contact/contact-form.tsx)) es el mejor ejemplo de resiliencia entre runtimes:

1. **Resolución inteligente de endpoint (`resolveContactEndpoint`)**:
   - En desarrollo local (`localhost` / `127.0.0.1` / `NODE_ENV === 'development'`), apunta al Route Handler de Next.js (`/api/contact/`), evitando el error `405 Method Not Allowed` que da el servidor de desarrollo de Next.js al recibir un `POST` sobre un archivo estático `.php`.
   - En producción estática (`jnicob.dev`), apunta a `/api/contact.php`.
   - **Fallback automático en cliente** ([contact-form.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/contact/contact-form.tsx#L186-L192)): Si el endpoint primario responde `404` o `405`, el cliente reintenta automáticamente contra el endpoint alternativo (`/api/contact/` ↔ `/api/contact.php`).
2. **Doble implementación de servidor sin secretos en el repositorio**:
   - **Modo Node** ([route.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/api/contact/route.ts) + [contact-security.ts](file:///home/nico/workspace/portfolio/apps/web/src/lib/contact-security.ts)): Valida con `contactSchema` (Zod), verifica honeypot, aplica rate-limiting por IP, sanitiza cabeceras CRLF y HTML, y envía vía API de Resend o Webhook.
   - **Modo Hosting Compartido** ([contact.php](file:///home/nico/workspace/portfolio/apps/web/public/api/contact.php)): Script PHP 8.1 sin dependencias externas que espeja las reglas de `contactSchema`, implementa **rate-limiting en ventana deslizante sobre disco con bloqueo exclusivo `flock` (`LOCK_EX`)**, defensa anti-symlink (`is_link`), validación temporal anti-bot (`ts` mínimo de 3 segundos), honeypot silencioso (`HTTP 200` falso para bots) y cliente SMTP con `STARTTLS` nativo o `mail()`, cargando credenciales desde `.env.php.local` fuera de Git.

### 3.3 Sistema de Diseño Tokenizado: 4 Skins × 2 Temas + Impresión A4

- **Regla de oro:** Ningún componente de `apps/web` puede usar colores literales de Tailwind (`bg-zinc-900`, `#fff`, etc.). Todo color pasa por los **11 tokens semánticos** definidos en [globals.css](file:///home/nico/workspace/portfolio/apps/web/src/app/globals.css#L9-L27) mediante `@theme inline`:
  - Superficie y texto: `--color-bg`, `--color-surface`, `--color-fg`, `--color-fg-muted`.
  - Acento y foco: `--color-accent`, `--color-accent-hover`, `--color-accent-fg`, `--color-ring`.
  - Bordes y estado: `--color-border`, `--color-danger`, `--color-danger-fg`.
  - Geometría y tipografía: `--radius-card`, `--radius-control`, `--radius-badge`, `--font-heading`, `--font-body`.
- **8 combinaciones visuales garantizadas AA**:
  - `dev-tool` (default, acento violeta eléctrico y tipografía Geist Sans).
  - `editorial` (inspirada en _The New York Times_: blanco/negro + azul periodístico, tipografía `Source Serif 4` en titulares, radios rectos y layout de periódico CSS-only en [editorial.css](file:///home/nico/workspace/portfolio/apps/web/src/app/skins/editorial.css) con masthead de doble filete, experiencia a 2 columnas con `column-rule` y capitular `::first-letter` en artículos).
  - `terminal` (brutalista, monospace `Geist Mono`, verde fósforo / ámbar sobre negro, radios `0`).
  - `vibrant` (acentos magenta saturados, radios amplios de `1.25rem`).
- **Prevención de FOUC y sincronización de estado ([appearance.ts](file:///home/nico/workspace/portfolio/apps/web/src/lib/appearance.ts) y [appearance-init.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/layout/appearance-init.tsx))**:
  - Un script síncrono (`themeInitScript` en [layout.tsx](file:///home/nico/workspace/portfolio/apps/web/src/app/%5Blocale%5D/layout.tsx#L43-L61)) se ejecuta en `<head>` antes de la hidratación aplicando `data-theme` y `data-skin` en `<html>`.
  - Tras hidratar, `AppearanceInit` resuelve con precedencia `URL (?theme=&skin=&view=) > localStorage > prefers-color-scheme > default` usando una caché de módulo _one-shot_ (`resolvedOnce`) para que múltiples instancias (`LocaleLayout` y `CvContent`) no compitan al limpiar los parámetros de la URL con `history.replaceState`.

### 3.4 Content-as-Data Tipado y Bilingüismo por Construcción

- **Imposibilidad de desincronizar idiomas:**
  - En los datos estructurados ([schemas.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/schemas.ts#L9-L12)), todo texto visible se define con `localizedStringSchema = z.object({ es: z.string().min(1), en: z.string().min(1) }).strict()`. Si falta una traducción en [profile.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/profile.ts), [experience.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/experience.ts), [projects.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/projects.ts) o [beyond-code.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/beyond-code.ts), el archivo falla al evaluarse en build y en tests.
  - Separación de constantes para el bundle cliente: Los literales (`THEMES`, `SKINS`, `CV_VIEWS`, `SKILL_CATEGORIES`) viven en [constants.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/constants.ts) sin importar `zod`, evitando que los componentes `'use client'` arrastren la librería de validación al navegador.
- **Pipeline MDX para Casos de Estudio ([content.ts](file:///home/nico/workspace/portfolio/apps/web/src/lib/content.ts))**:
  - Los 5 _case studies_ (`freepik-api-platform`, `ai-service-integration`, `freepik-developer-dashboard`, `freepik-backoffice`, `lauquen-transporte`) viven en `apps/web/content/{es,en}/projects/*.mdx`.
  - Se compilan en servidor mediante `compileMDX` (`next-mdx-remote/rsc`) y su frontmatter es validado estrictamente con `projectFrontmatterSchema.parse()`.

### 3.5 Ingeniería de `@nicobehm/media-kit`

El paquete [packages/media-kit](file:///home/nico/workspace/portfolio/packages/media-kit/package.json) fue diseñado como una librería OSS real de nivel producción:

1. **Cero acoplamiento a Tailwind**: Sus estilos viven en [styles.css](file:///home/nico/workspace/portfolio/packages/media-kit/src/styles.css) bajo el namespace `.mk-*` y exponen una API pública de CSS Custom Properties (`--mk-focus-ring`, `--mk-radius`, `--mk-filter-bg`, etc.) que el portfolio mapea a sus propios tokens en [globals.css](file:///home/nico/workspace/portfolio/apps/web/src/app/globals.css#L367-L381).
2. **`CompareSlider` ([compare-slider.tsx](file:///home/nico/workspace/portfolio/packages/media-kit/src/compare-slider/compare-slider.tsx))**:
   - Soporta 4 modos de comparación (`wipe`, `onion`, `blink` con interruptor accesible `role="switch"`, y `side-by-side` adaptable a móvil mediante `ResizeObserver`).
   - Resuelve un bug sutil de SSR/Static Export: cuando la imagen en caché carga antes de que React hidrate el árbol, el evento `onLoad` nunca se dispara; el callback `ref` comprueba `node.complete && node.naturalWidth > 0` para marcar el lado como cargado de forma idempotente.
   - Coordina eventos con portales de React: usa `event.currentTarget.contains(event.target)` sobre el DOM real para ignorar eventos de puntero que burbujean virtualmente en React desde el `MediaLightbox` hijo montado en `document.body`.
3. **`MediaLightbox` ([media-lightbox.tsx](file:///home/nico/workspace/portfolio/packages/media-kit/src/media-lightbox/media-lightbox.tsx))**:
   - Implementa un visor modal con zoom (`1x`–`8x`), pan con ratón/táctil o manteniendo pulsada la barra espaciadora (`Space + mover`), modos de ajuste (`contain`, `cover`, `actual`) y pantalla completa nativa.
   - Gestiona accesibilidad avanzada: cuando los controles se auto-ocultan por inactividad (`useAutoHide`), aplica el atributo HTML nativo `inert` a la barra de controles, pero **antes reubica el foco** al botón persistente de mostrar/ocultar para que el navegador no envíe el foco a `document.body` rompiendo el focus trap.
4. **Motor matemático puro en `FilterGallery` ([layout-engine.ts](file:///home/nico/workspace/portfolio/packages/media-kit/src/filter-gallery/layout-engine.ts))**:
   - Calcula las cajas (`x, y, width, height`) de los layouts `masonry` y `justified` como funciones puras a partir de los `aspectRatios` declarados en los datos, sin tocar ni medir cada nodo del DOM.
   - Mantiene el orden natural de los elementos en el DOM para que la navegación con `Tab` sea predecible, aplicando las coordenadas únicamente como posicionamiento visual y animando los cambios de filtro con la técnica **FLIP** (`First, Last, Invert, Play`).

### 3.6 Optimización de Rendimiento y Estabilidad Visual (Zero CLS)

- **Hidratación diferida sin perder SSG**: En [showcase/page.tsx](file:///home/nico/workspace/portfolio/apps/web/src/app/%5Blocale%5D/showcase/page.tsx#L31-L48) y [page.tsx](file:///home/nico/workspace/portfolio/apps/web/src/app/%5Blocale%5D/page.tsx#L16-L21), los bloques interactivos pesados (`ApiRequestPlayer`, `GalleryDemo`, `BeyondCodeSection`, etc.) se cargan con `next/dynamic` manteniendo `ssr: true`. El HTML estático sigue pre-renderizándose completo en el build, pero el navegador divide los chunks JS y libera el hilo principal para priorizar el LCP del Hero.
- **Cero Layout Shift (CLS = 0)**:
  - `html { scrollbar-gutter: stable; }` en [globals.css](file:///home/nico/workspace/portfolio/apps/web/src/app/globals.css#L39-L41) evita saltos horizontales al navegar entre páginas cortas (`/contact`) y largas (`/cv`).
  - En `Tabs` ([tabs.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/ui/tabs/tabs.tsx#L100-L124)), todos los `TabPanel` permanecen montados compartiendo la misma celda de CSS Grid (`col-start-1 row-start-2`), alternando `invisible opacity-0` vs `opacity-100`. Así, el contenedor adopta siempre la altura del panel más alto y cambiar de pestaña jamás desplaza el contenido inferior.
  - En `HeroCanvas` ([hero-canvas.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/home/hero-canvas.tsx)), el bucle `requestAnimationFrame` solo corre cuando el puntero está dentro del Hero, la pestaña está visible (`!document.hidden`) y el usuario no tiene `prefers-reduced-motion`; en reposo dibuja un único fotograma estático consumiendo 0 % de CPU.

### 3.7 Suite de Tests de Invariantes Arquitectónicas

El proyecto destaca por testear **reglas del sistema** de forma automatizada:

- **Contraste WCAG AA real ([globals-contrast.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/globals-contrast.test.ts))**: Lee `globals.css` con `fs`, extrae los bloques `:root[data-skin=...][data-theme=...]`, calcula la luminancia relativa sRGB y verifica que los 8 pares de color críticos superen `4.5:1` (texto) y `3.0:1` (elementos gráficos/anillos) en las **8 combinaciones** de skin y tema.
- **Invariantes CSS de Skin ([editorial-css.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/skins/editorial-css.test.ts))**: Verifica que ninguna regla de `editorial.css` escape del ámbito `[data-skin='editorial']` ni introduzca colores hexadecimales literales.
- **Paridad de traducciones ([messages-parity.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/i18n/messages-parity.test.ts))**: Aplana recursivamente las claves de `messages/es.json` y `messages/en.json` y exige igualdad matemática de conjuntos (`onlyInEs: [], onlyInEn: []`).
- **Integridad de contenido y PII Guard ([validate-content.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/validate-content.test.ts))**: Asegura que cada proyecto con `caseStudy: true` tenga su archivo `.mdx` en ambos idiomas y que ningún dato serializado contenga direcciones de email o teléfonos personales.
- **Presupuesto físico de páginas de impresión ([cv-print-pages.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/components/cv/cv-print-pages.test.ts))**: Imprime con Google Chrome Headless las 3 vistas del CV y verifica con `pdfinfo` que `compact` genere exactamente **1 página A4** y `standard`/`timeline` exactamente **2 páginas A4**.

---

## 4. Evaluación Crítica: ¿Tomamos las Mejores Decisiones?

A continuación se cuestionan de forma crítica las decisiones adoptadas, identificando sus aciertos reales y los puntos donde existe fricción o deuda técnica actual.

### 4.1 Aciertos Estructurales que Deben Mantenerse

1. **Separación del AI Playground a su propio repositorio (`ai-playground`) y publicación de `@nicobehm/media-kit` en npm:**
   - Inicialmente (Fases 0–3) el playground iba a vivir dentro de `apps/web`. Redefinir la Fase 4 ([2026-07-24-phase-4-playground-design.md](file:///home/nico/workspace/portfolio/docs/superpowers/specs/2026-07-24-phase-4-playground-design.md)) para extraerlo a un monorepo dedicado (`Vite + Hono en Cloudflare Workers`) fue una **excelente decisión arquitectónica**: evitó acoplar un backend de polling asíncrono a un hosting estático compartido y demostró que `@nicobehm/media-kit@0.7.0` se consume desde el registro público de npm como cualquier librería profesional.
2. **Tokens semánticos en CSS Variables en lugar de clases condicionales `dark:` en componentes:**
   - Si hubiéramos usado `bg-white dark:bg-slate-900` en cada componente, añadir 4 skins habría requerido multiplicar clases por cuatro en decenas de archivos TSX. Con la indirección de variables CSS en `globals.css`, añadir una skin nueva requiere ~25 líneas de CSS y cero cambios en React.
3. **Configuración Agent-Agnostic (`AGENTS.md` + `scripts/setup-agents.sh`):**
   - Mantener una sola copia real de instrucciones y skills en la raíz y exponerla por symlinks validados en CI permite alternar entre Claude Code, Gemini, Cursor, Codex y Copilot sin deriva documental.

### 4.2 Decisiones Cuestionables y Deuda Técnica Detectada en la Auditoría

#### 1. Paquete huérfano `packages/core` y divergencia de versiones mayores de `zod` (`v3` vs `v4`)

- **Evidencia:** [packages/core/package.json](file:///home/nico/workspace/portfolio/packages/core/package.json) define `@ai-playground/core` con `"zod": "^3.24.2"`, mientras que [apps/web/package.json](file:///home/nico/workspace/portfolio/apps/web/package.json) utiliza `"zod": "^4.4.3"`. Ningún archivo de `apps/web` ni de `packages/media-kit` importa `@ai-playground/core`.
- **Por qué ocurrió:** Quedó como semilla cuando el desarrollo del Playground se trasladó al repositorio independiente `ai-playground`.
- **Impacto:** Obliga a pnpm a instalar y mantener dos versiones mayores distintas de Zod en el mismo workspace y ejecuta builds/tests sobre código que ya pertenece a otro repositorio.

#### 2. Divergencia funcional y de contrato entre los dos endpoints de contacto (`route.ts` vs `contact.php`)

- **Evidencia:**
  - [contact.php](file:///home/nico/workspace/portfolio/apps/web/public/api/contact.php#L118-L123) valida que el formulario haya tardado al menos 3 segundos en rellenarse (`$elapsedS < $config['min_seconds']`) usando el campo `ts`, y devuelve `{ ok: true }` o `{ ok: false, error: '...' }`.
  - [route.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/api/contact/route.ts) ignora por completo el campo `ts` tras parsear con Zod, devuelve `{ success: true }` o `{ success: false }` (lo que obligó a programar un parche `data?.ok !== false && data?.success !== false` en [contact-form.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/contact/contact-form.tsx#L196)), tiene mensajes de error hardcodeados en español y su rate-limiter en memoria ([contact-security.ts](file:///home/nico/workspace/portfolio/apps/web/src/lib/contact-security.ts#L9)) nunca purga claves expiradas de `rateLimitMap`.

#### 3. Fuga de PII en un test unitario fuera del alcance del PII Guard

- **Evidencia:** En [route.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/api/contact/route.test.ts#L19-L20), el payload del test contiene un email y teléfono reales (`j.nicob@gmail.com` y `672814490`).
- **Por qué ocurrió:** El test `PII GUARD` en [validate-content.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/validate-content.test.ts#L35-L39) solo inspecciona el `JSON.stringify` de los módulos de `src/data/*`, dejando sin auditar los archivos de test y componentes.

#### 4. Pins de dependencias obsoletos (ADR Node 20.17) y warning de `pnpm.overrides`

- **Evidencia:** [2026-07-10-dependency-pins.md](file:///home/nico/workspace/portfolio/docs/decisions/2026-07-10-dependency-pins.md) documenta pins temporales (`vite: "^6"`, `vitest: ^3.2.7`, `jsdom: 26.1.0`, `typescript-eslint: 8.55.0`) con condición de retirada: _"Remove when: local/CI Node >= 22 everywhere"_. Hoy el entorno local corre **Node v24.19.0** y CI corre **Node 22**, por lo que la condición ya se cumplió. Además, `pnpm.overrides` en el `package.json` raíz genera un warning en ejecuciones modernas de pnpm.

#### 5. Fragilidad de selectores posicionales en `editorial.css` y parche de `console.error`

- **Evidencia:**
  - En [editorial.css](file:///home/nico/workspace/portfolio/apps/web/src/app/skins/editorial.css#L32-L41), reglas como `[data-skin='editorial'] [data-home-content] > section:first-of-type > div > div` dependen de la profundidad exacta de etiquetas `<div>` dentro de `Hero`. Además, al ser CSS fuera de `@layer`, pisa cualquier utilidad de Tailwind sin aviso.
  - En [appearance-init.tsx](file:///home/nico/workspace/portfolio/apps/web/src/components/layout/appearance-init.tsx#L16-L27), se muta `window.console.error` en desarrollo para ocultar el warning de React 19 sobre `<script>` en `<head>`.

#### 6. Cumplimiento incompleto de la regla de comentarios en inglés y de la Fase 6 (E2E)

- **Evidencia:**
  - `AGENTS.md` exige que todos los comentarios y JSDoc estén en inglés. Aunque `apps/web/src/data` y varios módulos fueron traducidos, persisten comentarios en español en `packages/media-kit/src/*` (`compare-slider.tsx`, `media-lightbox.tsx`, `spotlight-reveal.tsx`, `video-scrub-preview.tsx`) y en algunos archivos de `apps/web/src/` (`appearance.ts`, `tabs.tsx`, `api-request-player.tsx`, `editorial.css`).
  - La suite E2E con Playwright + `@axe-core/playwright` prevista en el diseño original para la Fase 6 aún no ha sido creada.
  - En [.github/workflows/deploy.yml](file:///home/nico/workspace/portfolio/.github/workflows/deploy.yml), el despliegue no ejecuta `pnpm run format` ni `pnpm run agents:validate`, y corre los tests después de haber hecho el build.

---

## 5. Plan de Mejora Accionable

### Fase Inmediata (Quick Wins — ejecutables hoy mismo sin riesgo de regresión)

1. **Sanitizar PII en tests y ampliar el PII Guard**:
   - Reemplazar el email y teléfono reales en [route.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/api/contact/route.test.ts#L19-L20) por valores ficticios (`contact@example.com`, `+34 600 000 000`).
   - Ampliar [validate-content.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/validate-content.test.ts) para escanear también archivos de código/tests o patrones de datos sensibles.
2. **Retirar `packages/core` del monorepo del portfolio**:
   - Dado que el dominio de `ai-playground` ya vive en su propio repositorio independiente, eliminar `packages/core` de este workspace elimina la doble versión de `zod` (`v3` vs `v4`) y simplifica el grafo del monorepo.
3. **Unificar contrato y endurecer `/api/contact/route.ts`**:
   - Validar el umbral anti-bot `ts` (mínimo 3 segundos, igual que en `contact.php`).
   - Unificar la respuesta JSON devolviendo `{ ok: true, success: true }` para simetría total entre Node y PHP.
   - Añadir poda automática de entradas caducadas en `rateLimitMap` ([contact-security.ts](file:///home/nico/workspace/portfolio/apps/web/src/lib/contact-security.ts)) para evitar fugas de memoria.
4. **Completar traducción de comentarios/JSDoc al inglés**:
   - Realizar un barrido de los comentarios restantes en español en `packages/media-kit/src/` y `apps/web/src/` para cumplir al 100 % la regla dura de `AGENTS.md` (e incluso añadir un test estático o regla de lint que lo verifique).

### Corto Plazo (Cierre de Fases 4 y 5 del Roadmap)

5. **Modernización de dependencias post-Node 20 ([2026-07-10-dependency-pins.md](file:///home/nico/workspace/portfolio/docs/decisions/2026-07-10-dependency-pins.md))**:
   - Actualizar `"engines": { "node": ">=22" }` en `package.json`, retirar los pins heredados de Node 20.17 (`vite`, `vitest`, `jsdom`, `eslint`, `typescript-eslint`), mover cualquier override necesario a `pnpm-workspace.yaml` y archivar el ADR como `superseded`.
6. **Endurecimiento del Pipeline CI/CD ([deploy.yml](file:///home/nico/workspace/portfolio/.github/workflows/deploy.yml))**:
   - Añadir `pnpm run format` y `pnpm run agents:validate` antes del empaquetado `tar.gz`.
   - Crear un backup automático del release anterior en el servidor remoto (`cp -r ~/public_html/jnicob.dev ~/backups/jnicob.dev-prev`) antes de extraer el nuevo `deploy-portfolio.tar.gz` para disponer de rollback en 1 comando.
7. **Integración ligera del AI Playground (Fase 4)**:
   - Una vez desplegado el repo `ai-playground`, añadir su entrada destacada en `projects.ts` y su caso de estudio bilingüe en `apps/web/content/{es,en}/projects/ai-playground.mdx`.

### Medio Plazo (Fase 6 — QA Final y Resiliencia de Diseño)

8. **Refactorizar `editorial.css` hacia atributos `data-slot`**:
   - Sustituir selectores posicionales frágiles (`> section:first-of-type > div > p`) por selectores semánticos explícitos (`[data-slot="hero-lead"]`, `[data-slot="hero-actions"]`) y envolver las reglas en `@layer components` o mantener sus invariantes testeadas.
9. **Incorporar Playwright + Axe E2E**:
   - Añadir un job de verificación E2E sobre el build estático servido localmente que valide navegación i18n, envío del formulario de contacto, apertura del `MediaLightbox` y auditoría `@axe-core/playwright` con 0 violaciones en los 8 combos de apariencia.

---

## 6. Guía Operativa de Extensión ("Cómo seguir desarrollando sobre el sistema")

### 6.1 Cómo añadir un nuevo Proyecto o Caso de Estudio (MDX)

1. **Añadir los metadatos del proyecto** en [projects.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/projects.ts):
   - Definir `slug` (kebab-case), `title` (`{ es, en }`), `summary` (`{ es, en }`), `role` (`{ es, en }`), `stack`, `links`, `metrics`, `featured` y `date`.
   - Si lleva página de detalle completa, establecer `caseStudy: true`.
2. **Si `caseStudy: true`, crear ambos archivos MDX**:
   - Crear `apps/web/content/es/projects/<slug>.mdx` y `apps/web/content/en/projects/<slug>.mdx`.
   - Incluir el frontmatter obligatorio validado por `projectFrontmatterSchema` (`title`, `summary`, `role`, `stack`, `links`, `metrics`, `date`).
3. **Verificar**:
   - Ejecutar `pnpm --filter web test -- validate-content`. Este test fallará automáticamente si falta alguno de los dos idiomas o si el frontmatter tiene algún error de esquema.

### 6.2 Cómo añadir una nueva Skin visual

1. **Registrar el identificador** en el array `SKINS` de [constants.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/constants.ts).
2. **Definir los tokens dark y light** en [globals.css](file:///home/nico/workspace/portfolio/apps/web/src/app/globals.css):
   - Añadir `:root[data-skin='<nueva-skin>'][data-theme='dark']` y `:root[data-skin='<nueva-skin>'][data-theme='light']` + el color de muestra `.skin-swatch[data-skin='<nueva-skin>']`.
3. **Añadir la skin al script anti-FOUC** en [layout.tsx](file:///home/nico/workspace/portfolio/apps/web/src/app/%5Blocale%5D/layout.tsx#L55) y sus etiquetas de traducción en `messages/es.json` y `messages/en.json` (`skin.<nueva-skin>`).
4. **Ajustar y validar contraste WCAG AA**:
   - Actualizar el número esperado de combinaciones en [globals-contrast.test.ts](file:///home/nico/workspace/portfolio/apps/web/src/app/globals-contrast.test.ts) y ejecutar `pnpm --filter web test -- globals-contrast`. El test calculará automáticamente el ratio de contraste de los 8 pares de color en ambos temas.

### 6.3 Cómo modificar el CV sin romper la calibración de impresión A4

1. Editar los datos en [profile.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/profile.ts), [experience.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/experience.ts), [education.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/education.ts) o [skills.ts](file:///home/nico/workspace/portfolio/apps/web/src/data/skills.ts).
2. Con el servidor de desarrollo corriendo (`pnpm run dev`), ejecutar el test de calibración PDF:
   ```bash
   pnpm --filter web test -- cv-print-pages
   ```
3. Si al añadir contenido la vista `compact` supera 1 página A4 o `standard`/`timeline` superan 2 páginas, ajustar los márgenes o tamaños de fuente bajo `@media print` en [globals.css](file:///home/nico/workspace/portfolio/apps/web/src/app/globals.css#L203-L323).

### 6.4 Cómo evolucionar `@nicobehm/media-kit`

1. Desarrollar el componente o hook en `packages/media-kit/src/<componente>/` siguiendo TDD (`*.test.tsx` junto al archivo).
2. Mantener **cero dependencias de Tailwind**: estilizar en [packages/media-kit/src/styles.css](file:///home/nico/workspace/portfolio/packages/media-kit/src/styles.css) con prefijo `.mk-*` y variables `--mk-*` con fallback.
3. Exportar el componente y sus tipos públicos en [packages/media-kit/src/index.ts](file:///home/nico/workspace/portfolio/packages/media-kit/src/index.ts).
4. Compilar y verificar:
   ```bash
   pnpm --filter @nicobehm/media-kit build
   pnpm --filter @nicobehm/media-kit test
   pnpm --filter @nicobehm/media-kit typecheck
   ```

### 6.5 Checklist Obligatorio antes de cada Commit / Push

Por regla dura de [AGENTS.md](file:///home/nico/workspace/portfolio/AGENTS.md), ningún cambio se da por terminado sin ejecutar y pasar en local los 5 controles de calidad:

```bash
pnpm run agents:validate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run format
```
