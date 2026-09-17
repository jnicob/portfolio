# STATUS — nicobehm portfolio

> Actualizado: 2026-09-17 · Optimización de propuesta de valor profesional (ingeniería, IA y productos digitales), impacto con métricas y claridad de negocio en experiencia laboral; calibración A4 intacta

## Ahora

**Auditoría y Validación Visual**

- Validar en navegador y móvil las nuevas vistas: Hero con avatar integrado en mobile, sección Idiomas en las 3 vistas del CV e impresión en PDF (1 página compacto, 2 páginas estándar y timeline).

## Hecho

- ✅ **Propuesta de valor e impacto en el CV**: Actualizados `profile.ts` y `experience.ts` incorporando foco en productos digitales completos, rigor técnico (performance, observabilidad, seguridad, TDD y Clean Code) y aceleración con agentes de IA. Reforzadas las métricas reales (40+ modelos de IA, 350+ endpoints en producción, 1.000+ PRs) y el propósito de negocio de cada proyecto (Freepik, AccelOne, HIS municipal y Fares Taie).
- ✅ **Foto del CV en espejo**: Invertida horizontalmente (`sharp.flop()`) en `avatar-cv.jpg` y `avatar-cv.webp` para que el torso y mirada se orienten hacia el interior del documento (hacia el nombre y contenido).
- ✅ **Espaciado en CV compacto**: Incrementada la separación entre las tarjetas de experiencia laboral (`gap-4`) para una lectura más desahogada.
- ✅ **Encuadre de Nico en el Home**: Re-extracción de `hero-portrait.webp` (`left: 760`) para posicionar a Nico apenas más a la derecha, logrando un encuadre circular perfectamente centrado y equilibrado.
- ✅ **UX & diseño Mobile en el Hero**: En pantallas móviles (`< lg`), el avatar se muestra integrado junto al nombre y titular (`flex items-center gap-4 sm:gap-6`) con el mismo patrón visual del encabezado del CV, ocultando la columna derecha grande descolgada al final.
- ✅ **Sección de Idiomas en CV**: Incorporación de `languages.ts` y `languageEntrySchema` (Español nativo + Inglés B2 Upper Intermediate) con tipografía semántica y componente `LanguageList` en las 3 vistas (Compacta, Estándar y Cronológica).
- ✅ **Calibración de impresión A4 garantizada**:
  - Compacto: Formación e Idiomas en dos columnas (`print:grid-cols-2`), asegurando estrictamente **1 página A4**.
  - Estándar: Exactamente **2 páginas A4**.
  - Cronológico (Timeline): Cards compactadas en impresión (`print:p-2.5 print:gap-1.5`), resolviendo el salto de 1 línea y asegurando exactamente **2 páginas A4**.
- ✅ **Tests automatizados**:
  - `cv-print-pages.test.ts`: Validación automatizada con Google Chrome headless y `pdfinfo` comprobando que las 3 vistas generan exactamente 1, 2 y 2 páginas.
  - `language-list.test.tsx` y tests en `schemas.test.ts` y `cv-views.test.tsx`.
- ✅ **100% verde en local**: 75 suites de test (484 tests pasados), TypeScript estricto, ESLint 0 warnings, Prettier y build estático (28/28 páginas en 15.9s).

## Pendientes del usuario (no bloqueantes)

- Actualizar en LinkedIn la intro (About) y la experiencia de Freepik/Magnific (EN/ES).

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Skill de Despliegue: [skills/deploy-shared-hosting/SKILL.md](skills/deploy-shared-hosting/SKILL.md)
