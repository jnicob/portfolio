# Feedback de Nico — 2026-07-17 (tras bloques A+B de F3.6) + 2026-07-18 (post-merge)

Comentarios de revisión manual. Triage vigente (decisión de Nico 2026-07-18):

- **Sección A (Showcase):** RESUELTA en F3.6 (bloque D, T22-T27 + fixes de cierre T29-T31),
  salvo A6 (galería ampliada) → F3.7.
- **F3.7 = TODO JUNTO**: sección F (feedback showcase 2026-07-18, abajo) + secciones B-E
  - A6 + backlog de design/QA de T21 (ver ledger). Brainstorm + plan propios.

## A. Showcase (F3.6 — arreglar antes del merge)

1. **Footer siempre abajo del todo**: con el filtro activo el contenido corto deja el
   pie a media pantalla. No sticky: layout min-height que empuje el footer al fondo.
2. **Cursor en botones**: al hacer hover sobre un botón no debería cambiar el puntero
   si no hay acción asociada — revisar la convención (¿o es mala UX tener botones sin
   acción?). Decidir y aplicar coherentemente.
3. **Tabs**: el puntero no cambia al hover (debería ser pointer) y falta efecto hover.
4. **BUG: el modo onion no funciona** (demo de modos de comparación).
5. **BUG/perf: el "Revelado con foco (spotlight)" va muy lento.** Sospecha: transición
   de `clip-path` 160 ms sobre imagen grande en cada pointermove; revisar (¿quitar la
   transición durante el movimiento / usarla solo en aparición?).
6. **Galería filtrable** (ampliación de alcance, valorar si F3.6 o F3.7): más ejemplos
   y reales (no SVGs), con posibilidad de fullscreen; filtro por nombre (texto); los
   vídeos con autoplay al dejar el ratón encima (con delay de activación).
   → **DIFERIDO a F3.7** (triage 2026-07-17): son 3-4 features nuevas de paquete+app
   con assets nuevos, no polish — se planifica con el brainstorm de F3.7.
7. **Scrub de vídeo**: el ejemplo no funciona bien o no se entiende — mejorar demo y
   affordance (que se entienda qué hace y que responda bien).
8. **Lazy loading** para imágenes y componentes pesados del showcase.

## B. Menú / navegación (F3.7)

1. Destacar la página actual en el menú top (estilo activo + `aria-current`). Revisar
   además si al clicar el enlace de la página actual se re-navega/recarga (no debería).
2. Menú hamburguesa en vista mobile.
3. Efecto hover en los ítems/tabs del menú. `[quick]`

## C. Inicio (F3.7)

1. **Intro del perfil**: no sobre el trabajo actual sino sobre la experiencia de
   carrera, perfil profesional, soft skills y aspectos destacables.
2. **Skills con estrellas**: JavaScript 5★ (añadir); React + Next.js JUNTOS 4★;
   TypeScript 4★; Vue 3★ (añadir). Revisar si faltan skills importantes que destacar.

## D. CV (F3.7)

1. Mejorar el diseño de la línea de tiempo de la cronología.
2. Fecha en un badge o destacada visualmente.

## E. Proyectos (F3.7)

1. En el detalle de proyecto (ej. `/es/projects/freepik-api-platform`): link para
   volver a la lista. `[quick]`
2. Links destacados al hover. `[quick]`
3. Enlaces externos con `target="_blank"` (+ `rel="noopener noreferrer"`). `[quick]`
4. **Naming**: mencionar siempre "Freepik/Magnific" (la empresa cambió de nombre).
5. URL del API playground: <https://www.magnific.com/api/playground>
6. URL de Cadi: <https://www.cadigolf.com/>
7. **Reemplazar el proyecto "Onboarding end-to-end de modelos de IA"** (en realidad es
   parte de "Plataforma de APIs de Freepik/Magnific") por **"Integración de servicios
   automatizada a través de IA"**: agentes especializados que, ante un servicio nuevo,
   generan spec / API / precios / permisos y reglas / documentación / playground — para
   cualquier servicio, no solo Kling o WAN. Fuente de contexto (NO copiar contenido
   interno; generalizar a fuentes públicas como en F3):
   `~/workspace/freepik/freepik-ai-context/api-b2b`.
8. **Métricas infravaloradas**: hay muchos más de 25 "Modelos de IA servidos" y 40
   "Endpoints públicos" — verificar cifras reales en spec/docs/playground públicos
   antes de actualizar (regla de procedencia de F3: solo datos derivables de fuentes
   públicas).

## F. Showcase — feedback 2026-07-18 (post-merge F3.6, sobre main 287b240)

1. **BUG: retrato desfasado en fullscreen** — el ejemplo del retrato (compare) se ve
   desfasado/desalineado al abrirlo en pantalla completa.
2. **Modo "lado a lado" en mobile**: debe pasar a disposición arriba/abajo en pantallas
   pequeñas (hoy dos mitades horizontales).
3. **Galería filtrable con ejemplos reales generados con IA** (absorbe y concreta A6):
   - Imágenes: Google NBP y Seedream 5 Pro. Vídeo: Google Veo y Kling V3 (vía AI API
     de Freepik/Magnific). Audio: cualquier servicio, puede no ser de IA.
   - Referencia de cómo generar si hace falta: `~/workspace/freepik/freepik-ai-context/api-b2b`
     (NO copiar contenido interno al repo; regla de procedencia de F3).
   - Cada ítem con opción de fullscreen, mostrando SOLO el icono (sin etiqueta de texto).
4. **Calidad/resolución para fullscreen**: assets con más resolución cuando el usuario
   tiene pantalla grande/retina; posible preload de la versión HD al hacer hover sobre
   el botón de fullscreen.
5. **VideoScrubPreview: mala UX persistente** — no va fluido y no se entiende el sentido
   del efecto. Mejorarlo; si no se consigue, eliminarlo o sustituirlo por otra demo.
6. **API player muy lejos del Playground real**: diseño mejorado, simplificado pero con
   las funcionalidades de más impacto (p.ej. visor de resultados con fullscreen). El Run
   mostrando el resultado gusta, pero el tamaño de la sección NO debe cambiar (cero
   desplazamiento vertical al correr/completar).

## G. Feedback 2026-07-18 (durante el cierre de F3.7 → F3.8)

> **Resuelto en F3.8 (2026-07-21):** G1–G5 implementados y verificados. Punteros de
> implementación y evidencia: plan F3.8, inventario transversal F3.7 y ledger
> `.superpowers/sdd/progress.md` (Tasks 1–15).

**Showcase**

1. **Posible BUG tema+idioma**: al cambiar dark/light y a continuación cambiar idioma,
   el tema parece cambiar junto con el idioma en vez de solo cambiar el idioma —
   verificar y arreglar si se confirma (sospecha: interacción del theme aplicado con la
   navegación del LocaleSwitcher / appearance-init).
2. **Selector de layouts en la galería IA** («AI-generated example gallery»): mostrar
   distintos layouts con un selector — p. ej. masonry (buenos ejemplos de implementación
   en los proyectos internos pikaso y fc_freepik_web como REFERENCIA de patrón, sin
   copiar código; crear un skill del proyecto y en ai-config si hace falta). Menos filas,
   reduciendo la cantidad según tamaño/resolución de pantalla (máximo 4-5 para destacar
   el visual del layout).
3. **API player — más ejemplos**: añadir ejemplos de vídeo, audio y error. En una etapa
   posterior: code viewer y parámetros personalizables.

**Proyectos**

4. **«Panel de desarrollador de la API»**: página de detalle como la de otros proyectos,
   contando las características más destacadas de los paneles de gestión y estadísticas
   para API (dev-hub y profile), tanto en B2B como en consumo de créditos y adecuación a
   distintos planes. Añadir además todas las landings de API como enlaces en la página
   de detalle.
5. **«Backoffice de contenido Freepik/Flaticon»**: página de detalle como la de otros
   proyectos con las características más destacadas de cada proyecto que lo compone.

## Requisito transversal del plan F3.7 (pedido 2026-07-18)

Al final del plan definitivo de F3.7: **listado de ítems con TODAS las features del
portfolio** y referencias a las decisiones técnicas de diseño / arquitectura /
performance / seguridad / testing / observabilidad (punteros a specs, planes, decisiones
en `docs/` y ledger — no duplicar contenido).
