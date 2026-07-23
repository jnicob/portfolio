# F4 — Playground de IA (spec de diseño)

> Estado: aprobada en brainstorm 2026-07-24 · Fase del roadmap: 4
> Entrada: spec global `2026-07-10-portfolio-design.md` §4.5 + contrato F4→F5 del roadmap
> + comparación con el Playground real de `fc_freepik_web` (clean-room: patrones y UX, cero código copiado).

## 1. Objetivo

Página `/[locale]/playground` que demuestra generación/edición de imagen y generación de
vídeo con parámetros simples, sobre una arquitectura puerto/adaptador
(`GenerationService` con adaptadores `mock` | `pollinations` | `proxy`) que es a la vez
el contrato F4→F5 y una pieza de portfolio: reproduce en miniatura los patrones del
Playground real de la Freepik API que Nico construyó (service registry declarativo,
form dinámico validado con Zod, ciclo task-based POST+polling, visor por tipo de salida).

## 2. Decisiones cerradas (brainstorm 2026-07-24)

| Tema | Decisión |
| --- | --- |
| Assets mock | **Híbrido**: reutilizar assets IA del showcase donde encajen + set nuevo dedicado en `apps/web/public/mocks/` |
| Navegación | **Sin entrada en el header**. Acceso por enlaces contextuales: CTA discreto en la home (zona de proyectos destacados) + enlace bidireccional en el case study del Playground de la API de Freepik («demo propia» ↔ «versión de producción») |
| Modelos del select | **IDs reales de Pollinations** (hoy `flux`, `turbo`; verificar lista viva en el plan) para que el modo live sea 1:1 con la UI. Edición usa el ID de edición real de Pollinations si su API expone uno (verificación del plan); si no, ID propio `edit-preview`. Vídeo (sin equivalente live) usa un ID propio `video-preview` |
| Cableado servicio↔UI | **Factory + hook propio** (enfoque A): `createGenerationService(env)` + decorador `withMockFallback` + hook `useGeneration` con estado discriminado. Sin dependencias nuevas |
| Comparación con el real | Cubrir las features de mayor impacto simplificadas (ver §3) |

## 3. Comparación con el Playground real (`fc_freepik_web`)

Features del Playground de producción y su tratamiento aquí:

| Feature real | Decisión F4 |
| --- | --- |
| Sidebar de servicios por categoría | **Adoptar simplificado**: rail de servicios (icono + nombre) con 3 servicios; colapsa a pills/select en móvil |
| Form dinámico desde OpenAPI + Zod | **Adoptar simplificado**: registry `PlaygroundService` declarativo (config TS tipada, no OpenAPI parseado); el form se renderiza desde la definición y valida con Zod |
| POST + polling con `task_id` | **Adoptar como traza**: los adaptadores emiten la secuencia del ciclo real (POST → `IN_PROGRESS` → GET polling → `COMPLETED`); la pestaña API la muestra estilo API reference |
| Ejemplos precargados | **Adoptar**: `ExampleSelector` por servicio rellena parámetros; en mock, resultado inmediato y determinista |
| Visor por tipo (imagen/vídeo/before-after, fullscreen) | Cubierto con `MediaLightbox` + `CompareSlider` de `@nicobehm/media-kit` (contrato F2→F4) |
| Compartir resultados | **Simplificar**: share-by-URL — parámetros en query string que rehidratan el form; el mock determinista reproduce el resultado. Sin backend |
| Links a docs por servicio | **Adoptar**: enlace por servicio a docs.freepik.com como «versión de producción» |
| Gestión de API keys + auth | **Omitir** (portfolio estático sin claves); lo sustituye el badge de origen mock/live/degradado |
| Audio y stock search | **Fuera de alcance** (spec global: imagen + vídeo) |
| Grupos colapsables / sliders | **Parcial**: parámetros simples + grupo «Avanzado» colapsable con seed |

## 4. Alcance

### Dentro

- Feature `apps/web/src/features/playground/` con `domain/`, `adapters/`, `ui/`.
- Página `apps/web/src/app/[locale]/playground/page.tsx` (RSC + isla cliente), metadata SEO por locale, compatible `output: 'export'`.
- 3 servicios: `generate-image`, `edit-image`, `generate-video`.
- Adaptadores `mock` (default), `pollinations` (live imagen), `proxy` (cliente completo de `POST /api/ai-proxy`, con tests; el handler llega en F5).
- Set de assets mock + manifiesto tipado.
- CTA en home + enlace en case study de la API.
- i18n completo es/en; WCAG AA; colores solo vía tokens; correcto en los 4 skins y ambos temas.

### Fuera

- Handler `/api/ai-proxy` (F5, modo Node).
- E2E Playwright del flujo (F6); F4 sí pasa la lente `qa-a11y-perf`.
- Audio, stock search, historial de generaciones, galería de resultados, cuentas/claves, parametrización compleja tipo Flux.
- Upload de imágenes del usuario: la edición parte siempre de imágenes de muestra del catálogo.

## 5. Arquitectura

### 5.1 Dominio (`features/playground/domain/`)

- `PlaygroundMode = 'generate-image' | 'edit-image' | 'generate-video'`.
- `GenerationRequest`: `{ mode, prompt, model, aspectRatio, seed? }` + en edición la imagen base (id de imagen de muestra).
- `GenerationResult`: unión discriminada por `kind`:
  - `image` → `{ url, width, height }`
  - `image-pair` → `{ before, after }` (edición, alimenta `CompareSlider`)
  - `video` → `{ url, poster }`
  - Metadatos comunes: `adapter` (`mock` | `pollinations` | `proxy`), `degraded: boolean`, `elapsedMs`, `apiTrace`.
- `ApiTrace`: secuencia tipada de pasos del ciclo task-based (`request` POST con payload, `status` IN_PROGRESS, `poll` GET, `completed` con response final) que alimenta la pestaña API. Los adaptadores la construyen; en mock es simulada pero fiel al contrato real de la Freepik API.
- **Registry de servicios**: `PlaygroundService = { id, label(i18n key), icon, schema (Zod), parameters (declarativos: tipo de control, opciones, grupo), examples, docsUrl }`. Tres definiciones en config TS tipada. El form se renderiza desde aquí; añadir un servicio = añadir una definición (mismo argumento de escalabilidad que el real).
- **Puerto**: `GenerationService = { generate(request, signal?): Promise<GenerationResult> }`.
- **Factory** `createGenerationService(env)`:
  - default → `mock`;
  - `NEXT_PUBLIC_PLAYGROUND_LIVE=pollinations` → `withMockFallback(pollinations, mock)` **solo** para `generate-image`; edición y vídeo siempre mock (decisión cerrada en spec global);
  - `NEXT_PUBLIC_PLAYGROUND_LIVE=proxy` **y** modo Node → `withMockFallback(proxy, mock)`.
- **Decorador** `withMockFallback(live, mock)`: timeout ~20 s (AbortSignal) o error → responde mock con `degraded: true`. La degradación nunca vive en la UI.

### 5.2 Adaptadores (`features/playground/adapters/`)

- `mock.ts`: resolución **determinista** — misma `(mode, model, aspectRatio, seed)` → mismo asset del manifiesto (`mock-catalog.ts`), que mezcla assets del showcase y `public/mocks/`. Latencia simulada breve + `apiTrace` simulada task-based. No puede fallar (assets locales; cobertura total del catálogo garantizada por test exhaustivo).
- `pollinations.ts`: GET URL con `prompt`, `model`, `width/height` (según aspect ratio), `seed`, `nologo`, `referrer`; espera de carga con timeout; construye `apiTrace` con la petición real.
- `proxy.ts`: `POST /api/ai-proxy` con `GenerationRequest` JSON; parsea respuesta al dominio. Tests contra fetch mockeado (contrato F4→F5).

### 5.3 UI (`features/playground/ui/`)

- Layout de 3 zonas (patrón del real, simplificado): **rail de servicios** (izq.; pills/select en móvil) · **form de parámetros** (renderizado desde el registry: textarea prompt, select modelo, aspect ratio 1:1 | 16:9 | 9:16, grupo Avanzado con seed + botón aleatorio; en edición, selector de imagen base entre muestras) · **panel de resultado** con tabs **Preview | API** (componente `Tabs` de `ui/`).
- Pestaña API: la `apiTrace` renderizada estilo API reference (request/response JSON), mismo lenguaje visual que el `api-request-player` del showcase sin acoplarse a él.
- Estados explícitos: `empty` (invitación + ejemplos precargados clicables), `loading` (skeleton del aspect ratio elegido, `aria-live="polite"`, botón «Generando…» deshabilitado), `error` (mensaje + reintentar), `success`.
- Badge de origen honesto: `mock` / `live` / `live → mock` (degradado, con aviso).
- Preview clicable → `MediaLightbox`; en edición → `CompareSlider`.
- Compartir: botón que copia URL con los parámetros en query string; al cargar con query, el form se rehidrata (y en mock el resultado es reproducible). Si el usuario no fijó seed, al generar se resuelve un seed efectivo aleatorio que queda en el estado y en la URL compartida — toda URL compartida es reproducible.
- Hook `useGeneration(service)`: estado discriminado `idle | loading | success | error`, cancelación con `AbortSignal` al re-generar o desmontar.
- Link «Ver la versión de producción» por servicio → docs.freepik.com / playground real.

## 6. Assets mock

- Manifiesto tipado `mock-catalog.ts`: `(mode, model, aspectRatio, seed) → asset`.
- Reutilizar assets IA del showcase donde encajen; set nuevo en `public/mocks/`: imágenes por aspect ratio y modelo, ≥1 par before/after para edición, 1 vídeo corto con poster.
- Presupuesto del set nuevo: ~3 MB total. Carga bajo demanda (no afecta al First Load JS).
- La curación/generación de assets es tarea del plan; validación visual del usuario en review.

## 7. Testing (TDD estricto)

- **Unit (Vitest)**: factory por env (todas las ramas), `withMockFallback` (éxito live, timeout, error → degraded), resolución determinista del catálogo (test exhaustivo modo×modelo×ratio), construcción de URL de Pollinations (todos los parámetros), `proxy.ts` contra fetch mockeado, schemas Zod del registry, serialización/rehidratación de query string.
- **Componentes (Testing Library)**: `useGeneration` (4 estados + cancelación), form dinámico desde registry (validación, grupo avanzado, selector de imagen en edición), `ResultPanel` (tabs, badge de origen, lightbox/compare según `kind`), estados empty/loading/error, a11y (labels, aria-live, foco).
- **E2E**: fuera (F6). Cierre de F4 pasa la lente `qa-a11y-perf` (primer uso).

## 8. Cierre de fase (DoD)

1. `pnpm run lint && pnpm run typecheck && pnpm run test` en verde (hoy 418 web + 242 media-kit; crecerán) + builds `export` y `node`.
2. Code review (superpowers) + design review + lente `qa-a11y-perf`.
3. Verificación en vivo (Playwright MCP): flujo completo en ambos temas y los 4 skins, es/en; share-URL reproducible; degradación live→mock forzando error.
4. Actualizar roadmap (Estado F4) y `STATUS.md`; escribir plan de F5 justo antes de ejecutarla.

## 9. Riesgos y mitigaciones

- **Lista de modelos de Pollinations cambia** → catálogo en un solo módulo de domain; el mock cubre cualquier modelo del catálogo; verificación de la lista viva como tarea del plan.
- **Peso de assets** → presupuesto explícito (~3 MB) y carga bajo demanda; el gate de bundle de F6 no se ve afectado.
- **First Load JS ya >2× presupuesto (arrastrado)** → F4 no añade dependencias; la página playground es una ruta nueva code-splitted. La palanca real se acomete en F6 (registrado en STATUS.md).
- **Skin editorial** → si necesita ajustes, mínimos y dentro de `editorial.css` respetando sus invariantes (scoping, cero hex, hooks vivos).
