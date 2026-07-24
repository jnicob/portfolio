# F4 — Playground (spec de diseño) — REDEFINIDA 2026-07-24

> Estado: aprobada en brainstorm 2026-07-24 (2 rondas: diseño inicial + revisión del usuario).
> **Decisión estructural:** el playground se separa del portfolio como producto propio
> (`github.com:jnicob/ai-playground`). Este documento fija (a) la redefinición de F4/F5 del
> portfolio y (b) el diseño base del playground, que se migra al repo nuevo en su bootstrap.

## 0. Decisiones de la revisión del usuario (2026-07-24)

| Tema | Decisión |
| --- | --- |
| Producto | **Playground genérico multi-proveedor**, no demo de la Freepik API. Sin links a docs por servicio |
| Separación | **Repo propio independiente**: `ai-playground` en `~/workspace/formaciones/claude/superpowers/ai-playground` → `github.com:jnicob/ai-playground`. Consume `@nicobehm/media-kit@0.7.0` **ya publicado en npm** (verificado 2026-07-24) |
| Proveedores v1 | `mock` (default) · `pollinations` (sin key, tier gratuito) · `google` (Gemini API directa con key del usuario: imagen `gemini-2.5-flash-image`/nano banana con free tier ~500 img/día; vídeo Veo **opt-in con aviso explícito de coste** — sin free tier, $0.15–0.60/s). Nunca API de Magnific/Freepik |
| API keys | Estilo Playground de Freepik: panel inline que pide la key al seleccionar un proveedor que la requiere; se guarda **por proveedor en `sessionStorage`** (dura la navegación); sin cuentas/login. La key solo viaja navegador → API del proveedor; jamás a bundle, repo o servidor propio |
| F4 del portfolio | **Integración ligera**: proyecto destacado + case study del playground con CTA a la app desplegada. El desarrollo del playground vive en el repo nuevo con su propio ciclo spec→plan |
| F5 del portfolio | El adaptador `proxy` y el handler `/api/ai-proxy` **salen del roadmap**: con keys de usuario en runtime no hay secretos de servidor que esconder. F5 queda como runtime dual + deploys |
| Patrón ai-platform | Adoptar el patrón transversal de la plataforma (un archivo declarativo por servicio con schema + ejemplos + metadatos, consumido por factories: `ai-api-specs` 145 specs/modelo, `fc-apisix` registry YAML) → registry `PlaygroundService`. En el repo nuevo: skill `adding-a-provider` (checklist estilo «Adding New AI Model») + kit de skills de proceso inspirado en `fc-central-payments-api` |

Decisiones de la 1ª ronda que siguen vigentes: assets mock híbridos (set dedicado; los del
showcase del portfolio solo si se copian al repo nuevo), modelos con IDs reales del proveedor,
factory + hook propio (enfoque A), rail de servicios, ejemplos precargados, share-by-URL
reproducible, traza task-based en pestaña API, estados explícitos, badge de origen honesto.

## 1. Alcance de F4 en el portfolio (este repo)

1. **Proyecto destacado + case study** del ai-playground (MDX es/en) cuando exista algo
   enlazable; CTA discreto en la home. Sin entrada en el header.
2. Actualizar roadmap: F4 redefinida, F5 sin proxy (hecho en este commit).
3. Nada de `features/playground/` en `apps/web`.

Fuera: todo el desarrollo del playground (repo nuevo).

## 2. Diseño base del ai-playground (semilla para el repo nuevo)

> Esta sección se migra al repo `ai-playground` como spec inicial durante su bootstrap
> (skill `nico-project-bootstrap`) y allí se refina con decisiones de stack propias.

### 2.1 Producto

Consola genérica de generación de IA: sidebar de servicios (generar imagen, editar imagen,
generar vídeo — extensible), form de parámetros renderizado desde definición declarativa,
panel de resultado con tabs **Preview | API** (traza task-based estilo API reference),
visor por tipo de salida (`MediaLightbox`, `CompareSlider` de `@nicobehm/media-kit`),
ejemplos precargados, share-by-URL reproducible, gestión de API keys por proveedor.

### 2.2 Dominio (puerto/adaptador)

- `GenerationRequest` `{ service, provider, prompt, model, aspectRatio, seed? }` (+ imagen
  base entre muestras en edición; sin upload de usuario en v1).
- `GenerationResult`: unión discriminada `image | image-pair | video` + metadatos
  (`provider`, `degraded`, `elapsedMs`, `apiTrace`).
- `ApiTrace`: secuencia tipada del ciclo task-based (POST → `IN_PROGRESS` → polling GET →
  `COMPLETED`). En Google/Veo es el ciclo long-running real; en mock, simulada pero fiel.
- **Registry declarativo**: `PlaygroundService = { id, label, icon, schema (Zod), parameters,
  examples }` × `Provider = { id, label, auth: 'none' | 'api-key', models por servicio,
  adapter }`. Añadir proveedor = definición + adaptador (skill `adding-a-provider`).
- **Puerto** `GenerationService.generate(request, signal?)`; factory que resuelve el
  adaptador por proveedor seleccionado; decorador `withMockFallback(live, mock)`
  (timeout ~20 s o error → mock con `degraded: true`).
- Adaptadores v1: `mock` (determinista contra manifiesto de assets, no puede fallar),
  `pollinations` (GET URL; verificar lista viva de modelos del tier gratuito en el plan),
  `google` (Gemini API REST con key del usuario; imagen síncrona, vídeo Veo long-running
  con polling; aviso de coste antes de generar con Veo; sin key o error de billing → mock).

### 2.3 UI

- 3 zonas: rail de servicios · form dinámico (prompt, modelo por proveedor, aspect ratio
  1:1 | 16:9 | 9:16, grupo Avanzado con seed + aleatorio) · panel resultado Preview | API.
- Selector de proveedor visible (mock | pollinations | google) con badge de auth; panel
  «API key requerida» inline cuando falta (input tipo password, guardar/borrar,
  explicación de que solo vive en `sessionStorage`).
- Estados `empty | loading | error | success` explícitos; badge de origen
  `mock / live / live → mock`; cancelación con `AbortSignal`.
- Share-by-URL: parámetros en query string (nunca la API key); seed efectivo siempre
  incluido → toda URL compartida es reproducible en mock.
- WCAG AA, i18n es/en, theming con tokens semánticos propios (subset del sistema del
  portfolio, recreado — los componentes `ui/` del portfolio no están publicados).

### 2.4 Calidad

- TDD estricto: unit de dominio (factory, fallback, catálogo mock exhaustivo, URLs/payloads
  por proveedor contra fetch mockeado, schemas, query string) + Testing Library de UI
  (estados, keys, form dinámico, a11y).
- Riesgos: listas de modelos cambian (catálogo en un módulo; verificación en plan) ·
  coste Veo (opt-in con confirmación explícita) · CORS de proveedores (verificar en plan;
  Gemini API funciona browser-side, Pollinations tiene CORS `*`).

## 3. Cierre de F4 (portfolio)

1. Checks en verde (`lint`, `typecheck`, `test`, builds export y node).
2. Case study + CTA revisados (design review); roadmap y STATUS.md actualizados.
3. F4 del portfolio puede cerrarse cuando el ai-playground tenga URL desplegada que enlazar;
   hasta entonces la fase queda «en curso, delegada al repo ai-playground».
