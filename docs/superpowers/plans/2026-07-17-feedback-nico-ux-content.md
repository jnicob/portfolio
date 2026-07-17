# Feedback de Nico — 2026-07-17 (tras bloques A+B de F3.6)

Comentarios de revisión manual sobre la rama `feature/phase-3.6-showcase-mediakit`.
Triage propuesto:

- **Sección A (Showcase):** bugs y polish de lo construido en F3.6 → resolver ANTES del
  merge FF de la fase (tareas nuevas previas a T21, enmendando el plan F3.6).
- **Secciones B-E (Menú/Inicio/CV/Proyectos):** UX global + contenido → fase nueva
  (F3.7) con brainstorm + plan propios tras cerrar F3.6. Los ítems marcados `[quick]`
  son candidatos a colarse en F3.6 si el usuario lo prefiere.

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
