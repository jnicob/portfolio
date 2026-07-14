# Spec de diseño — Fase 3: contenido + páginas + theming v2

**Fecha:** 2026-07-15
**Estado:** Aprobado por el usuario (2026-07-15, brainstorm sección a sección); ampliado el
2026-07-15 con el bloque C (feedback del usuario sobre media-kit/showcase), pendiente de
re-revisión
**Entrada:** spec de producto `2026-07-10-portfolio-design.md` (§4.3, §4.4, F3 del roadmap) +
diferidos de F2.6 (`2026-07-14-media-kit-v2.1-showcase-design.md`, non-goals) + feedback del
usuario 2026-07-15 con paridad vs Playground de `fc_freepik_web`/landings (clean-room)
**Proceso:** Superpowers (brainstorming → writing-plans → subagent-driven-development)

---

## 1. Alcance

Tres bloques en una sola fase (decisión del usuario, ampliada 2026-07-15):

- **Bloque A — contenido + páginas:** schemas Zod, datos de CV reales, 3 case studies MDX
  es+en, i18n con `next-intl` bajo `[locale]`, layout compartido, SEO completo.
- **Bloque B — theming v2:** 4 skins globales sobre los tokens, 3 vistas de la página CV,
  estado skin/vista/tema fijable por URL, y selector auto-filtrable reutilizable
  (showcase + skin-switcher).
- **Bloque C — media-kit v2.2 (paquete → 0.4.0) + ejemplos del showcase:** correcciones y
  paridad de features con el Playground de referencia (fullscreen por ejemplo,
  compare-lightbox, doble resolución, pausa de hover al click).

Orden: A primero (F4 depende de su layout/i18n). C es autocontenido (paquete + sección
media-kit del showcase) y conviene ejecutarlo antes que B para que el pulido del showcase
de B trabaje sobre los ejemplos ya corregidos; el plan fija el orden final por tarea.

### Decisiones cerradas en el brainstorm

| Decisión          | Valor                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Alcance           | Todo en F3, dos bloques (no se difiere theming v2)                                                     |
| PII               | `apps/web/content/cv/` a `.gitignore`; contacto público SOLO LinkedIn/GitHub (ni email ni teléfono)    |
| Skins             | 4: `dev-tool` (default, actual) + `editorial` + `terminal` + `vibrant`                                 |
| Vistas de CV      | 3: `standard` + `compact` (ATS/print) + `timeline`                                                     |
| Mecanismo URL     | Query params + `data-skin` (Opción 1); sin rutas por variante                                          |
| Descargable de CV | No hay PDF descargable; `compact` + `@media print` cuidado lo reemplaza                                |
| Slider + zoom     | El zoom/pan/toolbar del slider vive en su fullscreen (compare-lightbox); el slider inline queda simple |

## 2. Bloque A — rutas, i18n y layout

- **i18n:** `next-intl` con segmento `[locale]` y `generateStaticParams` (`es`, `en`),
  compatible con `output: 'export'`. Strings de UI en `apps/web/messages/{es,en}.json`;
  el contenido largo vive como datos/MDX (§3), nunca en los JSON de mensajes.
- **Rutas:** `/{es,en}/`, `/{es,en}/cv`, `/{es,en}/projects`, `/{es,en}/projects/[slug]`,
  `/{es,en}/showcase` (el showcase se muda bajo locale y se traduce). Raíz `/` → redirect
  estático a `/en` (página mínima con meta refresh/JS + `<link rel="alternate" hreflang>`);
  la URL antigua `/showcase` conserva un redirect estático equivalente a `/en/showcase`.
- **Layout compartido** (`components/layout/`): header con navegación, theme-switcher
  (lógica existente de `lib/theme.ts`, absorbida por `lib/appearance.ts`, §5),
  locale-switcher (conserva la ruta actual al cambiar idioma) y skin-switcher (§5);
  footer con enlaces GitHub/LinkedIn.
- **Páginas:**
  - **Home:** hero con la narrativa "plataformas de API de IA end-to-end" + proyectos
    destacados + skills resumidas + CTA a CV (y placeholder de playground hasta F4).
  - **Projects:** grid de cards desde `src/data/projects.ts`.
  - **Projects/[slug]:** case study MDX.
  - **CV:** página única con las 3 vistas (§6).

## 3. Bloque A — contenido como datos

- **`src/data/schemas.ts` (Zod):** `Profile` (nombre, titular, resumen, enlaces públicos —
  solo GitHub/LinkedIn), `ExperienceEntry`, `EducationEntry`, `Skill` (nombre, nivel 1-5,
  categoría, tags), `Project` (slug, resumen, stack, enlaces, métricas, rol).
- **Bilingüe por dato:** `LocalizedString = { es: string; en: string }` en cada campo de
  texto — una sola fuente por dato, los idiomas no pueden desincronizarse.
- **CV real:** experiencia previa y formación extraídas de los PDFs de LinkedIn
  (`apps/web/content/cv/`, ignorados por git, fuente local); etapa Freepik redactada desde
  los 779 PRs reales (spec de producto). Desaparecen los placeholders `TODO_CV:`.
- **Case studies (3, cerrados en spec de producto):** ① Plataforma web API Freepik/Magnific
  · ② Onboarding end-to-end de modelos IA · ③ Flows API. MDX por locale en
  `content/{es,en}/projects/`, frontmatter validado por Zod (title, summary, stack, links,
  métricas, fecha), enlazando la web real de Freepik/Magnific API como "versión de
  producción".
- **Compilación MDX:** estática, compatible con export y RSC; el plan fija la librería
  (`@next/mdx` o `next-mdx-remote`) tras una prueba de humo con el criterio: cero JS
  innecesario en cliente y frontmatter tipado.
- **`validate-content`:** script que valida con Zod todos los datos + frontmatter MDX de
  ambos locales; cableado al gate (`pnpm run test`) y CI. Datos inválidos = build en rojo,
  nunca contenido silenciosamente vacío.

## 4. Bloque A — SEO (`lib/seo.ts`)

- `generateMetadata` por página y locale; `alternates.languages` (hreflang) en todas.
- OpenGraph con imágenes OG estáticas generadas en build.
- `sitemap.xml` + `robots.txt` estáticos con todas las rutas × locales.
- JSON-LD `Person` en home y CV.
- `NEXT_PUBLIC_SITE_URL` por env, placeholder documentado hasta que exista dominio.

## 5. Bloque B — skins y estado de apariencia

- **4 skins**, cada uno un set alternativo de valores para los MISMOS tokens semánticos en
  `globals.css` bajo `:root[data-skin='X'][data-theme='dark' | 'light']`:
  - `dev-tool` — el actual; **sin atributo** (ausencia de `data-skin` = default, cero
    regresión visual).
  - `editorial` — serif en títulos, radios suaves, pensado para leer el CV.
  - `terminal` — monospace, alto contraste, radios 0, brutalist.
  - `vibrant` — acentos saturados, playful.
- Componentes intactos: la regla "cero color hardcodeado" hace que los skins se apliquen
  solos. Las **8 combinaciones** skin×tema cumplen contraste WCAG AA (verificado en el
  cierre, §9). Fuentes extra (serif/mono) autoalojadas con subsetting, dentro del
  presupuesto de performance.
- **`lib/appearance.ts`** (evolución de `theme.ts`, que queda absorbido): estado
  `{ theme, skin, view }`.
  - Al cargar: lee `?skin=&view=&theme=` con precedencia **URL > localStorage > default**;
    aplica `data-theme`/`data-skin`, persiste en localStorage y limpia la URL con
    `history.replaceState`.
  - Valores inválidos en query: se ignoran con fallback silencioso al siguiente nivel de
    precedencia (validación con los mismos enums Zod de §3).
  - **Compartir explícito:** botón "Compartir esta vista" (en CV y showcase) que construye
    la URL con el estado actual y la copia al portapapeles.
  - `?view=` solo tiene efecto en `/cv`; en el resto de rutas se ignora.

## 6. Bloque B — vistas de la página CV

Tres componentes de layout sobre los MISMOS datos, con sub-bloques compartidos (entrada de
experiencia, grupo de skills):

- **`standard`** — completa y visual (default): skills con nivel, métricas, enlaces.
- **`compact`** — una columna, densidad alta, print-friendly: `@media print` cuidado
  (sin controles interactivos, tinta razonable) — "imprimir a PDF" sustituye al descargable.
- **`timeline`** — trayectoria vertical cronológica.

Selector de vista en la propia página CV (segmented control accesible). Sin email ni
teléfono en ninguna vista (§1); contacto = LinkedIn/GitHub.

## 7. Bloque B — selector auto-filtrable

- **Primitiva headless `FilterableList`** en `components/ui/`: input + lista filtrada en
  vivo; teclado completo (↑/↓ recorren, Enter selecciona, Escape limpia/cierra); ARIA
  patrón combobox/listbox; estado vacío explícito ("sin resultados").
- **Dos consumidores** (demo de reutilización):
  - Índice del showcase: filtra secciones/componentes del kitchen sink.
  - Skin-switcher del header: lista de skins con swatch de preview por skin.

## 8. Bloque C — media-kit v2.2 (0.4.0) + ejemplos del showcase

Origen: feedback del usuario (2026-07-15) tras usar el showcase de F2.6, con el Playground
de `fc_freepik_web` (proyecto landings) como referencia de paridad. Regla clean-room del
spec de producto: se igualan **comportamientos**, nunca se copia código de empresa.

### C1 — Fullscreen por ejemplo

- Cada ejemplo de la sección media-kit del showcase lleva SU botón de pantalla completa
  **dentro del ejemplo** (overlay sobre la esquina del media), con icono expand (SVG
  inline, como los de F2.6) + texto "Full Screen" (localizable vía `labels`).
- Desaparece el botón suelto "Ampliar con zoom" (`media-kit-demo.tsx`): era la demo del
  `MediaLightbox` pero desconectada de los ejemplos — UX confusa confirmada. Su función la
  absorben los botones por ejemplo.
- El patrón se empaqueta en media-kit (no ad-hoc en el showcase): prop opcional del
  paquete que renderiza el botón overlay y abre el fullscreen correspondiente.

### C2 — Compare-lightbox (decisión: fullscreen, no inline)

- `MediaLightbox` acepta un par before/after y renderiza el `CompareSlider` DENTRO del
  visor con toda la barra de comandos: zoom, pan, fit, reset, ojo, ayuda, fullscreen
  nativo, atajos.
- Resolución del conflicto de gestos (lo que F2.6 difirió): el divisor se mueve SOLO con
  drag directo sobre el handle (y flechas cuando el handle tiene foco); el pan usa
  Espacio+drag, flechas fuera del handle y el gesto existente; el zoom usa rueda/botones/
  `+`/`−`. El slider inline queda simple (drag/hover), como la referencia.
- Internamente se comparte UN motor de viewport (zoom/pan/toolbar) entre imagen simple y
  compare — sin duplicar la máquina de estados.

### C3 — Doble resolución (estándar inline, HD en fullscreen)

- Nuevo modelo de fuente de imagen en el paquete: `{ src, fullSrc?, alt }` aceptado por
  `CompareSlider` (before/after) y `MediaLightbox`. Inline usa `src`; el fullscreen usa
  `fullSrc ?? src`, con **preload del `fullSrc` al interactuar con el CTA** (patrón de la
  referencia) para que la entrada a fullscreen no muestre un salto de calidad tardío.
- La API actual por `ReactNode` sigue funcionando (sin breaking); el modelo estructurado es
  la vía recomendada y lo que usan los ejemplos del showcase.

### C4 — Verificación del panning con ratón

- Reporte del usuario: el pan con ratón puede no funcionar bien. Se audita con
  `superpowers:systematic-debugging` ANTES de construir encima (reproducir → causa raíz →
  fix con test de regresión). Cubre: drag con Espacio, pan con zoom > 100 %, límites de
  desborde y cursor grab/grabbing.

### C5 — Paridad con la referencia (mismas features o más)

Checklist de paridad a cerrar (inventario del `ImageComparisonSlider` + fullscreen del
Playground de landings, 2026-07-15):

| Feature de la referencia                                     | Estado en media-kit → acción                 |
| ------------------------------------------------------------ | -------------------------------------------- |
| Hover sigue al ratón; **click pausa/reanuda** (por defecto)  | Falta → C6                                   |
| Doble resolución `src`/`src2x` + preload antes de fullscreen | Falta → C3                                   |
| Labels Before/After superpuestos configurables               | Falta → prop `overlayLabels` opcional        |
| `objectFit` configurable                                     | Falta → prop opcional                        |
| Estado de carga con transición de opacidad                   | Falta → estado de carga explícito            |
| Soporte touch en el divisor                                  | Existe (pointer events) → verificar con test |
| Botón fullscreen con icono expand                            | Parcial (solo demo retrato) → C1             |
| Precedencia de Escape (ayuda > fullscreen > visor)           | Existe desde F2.6 → sin acción               |
| Zoom/pan/fit/atajos/ayuda en el visor                        | Existe y SUPERA a la referencia → sin acción |

### C6 — Pausa del hover al click

- En `mode="hover"`, click sobre el slider pausa el seguimiento (el divisor se queda);
  otro click lo reanuda. Prop `pauseOnClick` (default `true`, opt-out). Indicación
  accesible del estado (aria + cue visual sutil).

### C7 — Empaquetado

- media-kit → **0.4.0**: README (nuevas props, receta compare-lightbox y doble
  resolución), CHANGELOG, sin breaking (la API v2 por `ReactNode` se conserva).
- Los ejemplos del showcase se actualizan para usar el modelo nuevo (assets demo en
  resolución estándar + HD dentro del presupuesto de performance).

## 9. Testing y cierre

**TDD por unidad:**

- Schemas Zod: casos válidos/inválidos; test que FALLA si `Profile` contiene email o
  teléfono (guardia de PII).
- `appearance.ts`: precedencia URL > storage > default; params inválidos → fallback;
  construcción de la URL de compartir; `?view=` ignorado fuera de `/cv`.
- `FilterableList`: filtrado, teclado completo, ARIA, estado vacío.
- Layout: locale-switcher conserva la ruta; header/footer renderizan en ambos locales.
- Vistas CV: las 3 renderizan las mismas entradas; `compact` sin interactivos rotos en print.
- `seo.ts`: metadata por locale, hreflang, sitemap con todas las rutas.
- `validate-content` en el gate.
- Bloque C: compare-lightbox (divisor solo desde el handle; pan/zoom no lo mueven);
  `fullSrc` usado en fullscreen y preload disparado desde el CTA; `pauseOnClick`
  (pausa/reanuda + aria); regresión del pan con ratón (C4); labels overlay y estado de
  carga; los tests v2/v2.1 existentes del paquete pasan sin modificarse.

**Errores explícitos:** slug MDX inexistente → `notFound()` (404 estática por locale);
datos inválidos → build falla; query params inválidos → fallback silencioso.

**Cierre de fase** (además del gate `lint+typecheck+test` y builds duales export/node):

- Verificación visual en vivo (Playwright): matriz crítica — 4 skins × 2 temas en home y
  CV; 3 vistas de CV; navegación es↔en conservando ruta; filtro del showcase por teclado;
  vista print de `compact`; bloque C — fullscreen por ejemplo, compare-lightbox con
  teclado completo, pausa de hover al click y pan con ratón verificado en vivo.
- Design review + code review final de rama; roadmap F3 → hecha; merge FF a main.
- E2E formales, axe y Lighthouse siguen siendo F6 (roadmap).

## 10. Fuera de alcance (F3)

- Playground (F4) — solo CTA/placeholder en home.
- E2E/axe/Lighthouse formales (F6).
- PDF de CV descargable (lo cubre `compact` + print).
- Publicación en npm de media-kit; dominio/DNS.
- Skins adicionales a los 4 definidos; editor de skins.
- Resto del backlog v2.2/v3 del ledger de F2.6 no pedido aquí (Tabs grid-stack, foco
  condicional al cerrar ayuda, EmptyState/ErrorState reutilizable…) — salvo que una tarea
  del bloque C lo toque de paso.
- Zoom/compare inline en el `CompareSlider` (decisión: solo en compare-lightbox).

## 11. Contratos que esta fase deja para F4/F6

- Rutas `/{es,en}/{'', cv, projects, projects/[slug], showcase}` + layout con header
  (theme/locale/skin switchers) y footer.
- `lib/seo.ts`, `lib/appearance.ts`, `src/data/schemas.ts`, `messages/{es,en}.json`.
- `FilterableList` como primitiva reutilizable.
- media-kit 0.4.0 con compare-lightbox y doble resolución — F4 (playground) lo consume
  para el resultado editar-imagen (before/after fullscreen) y previews estándar+HD.
