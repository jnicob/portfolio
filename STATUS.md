# STATUS — nicobehm portfolio

> Actualizado: 2026-11-19 · CV unificado, PDFs pregenerados (públicos en Git / privados locales) y experiencia Freelance 2026

## Ahora

**Validación en producción (`jnicob.dev`)**

- Verificar publicación en producción tras el merge a `main` y completar la actualización pendiente en LinkedIn.

## Hecho

- ✅ **CV unificado y orientado a Frontend / Full-Stack / AI**: Titular unificado (`Senior Frontend Engineer · Full-Stack & AI Engineer · Technical Analyst`), intro optimizada de 2 párrafos y experiencia `Freelance` desde `2026-08` integrando Lauquen Transporte, Hotel Monte Cervino y Manos Activas.
- ✅ **Generación dual de PDFs (`pnpm run cv:pdf`) y descarga directa**:
  - Opción B: 8 PDFs públicos sin PII en `apps/web/public/cv/` (2 idiomas × `compact`/`standard` × con/sin foto) + `manifest.json` con huella SHA-256 de fuentes y checksums por archivo.
  - 8 PDFs privados equivalentes en `apps/web/content/cv/pdf/` (gitignored) con `CV_EMAIL` / `CV_PHONE` desde `.env.local`, preservando archivos manuales y sirviéndolos en desarrollo local vía `POST /api/cv-pdf-local/` (bloqueado a loopback y desarrollo con `CV_INCLUDE_PRIVATE=true`).
  - Rediseño de cabecera (ubicación condicional), escala tipográfica A4 coherente (`1` pág. Compacto, `2` págs. Estándar/Timeline), limpieza de `!important` innecesarios en `globals.css` (`83 → 5`) y reset `@media print` por skin en `editorial.css`.
  - Verificación automática en Vitest (`cv-pdfs.test.ts`, `cv-print-pages.test.ts`, `route.test.ts`, `local-private-cv.test.ts`) y hook `pre-push` (`pnpm run hooks:setup`, verifica el SHA del commit enviado).
- ✅ **Higiene y PII**: Sanitizados `.env.example` y `schemas.test.ts`, ampliado `PII GUARD` a `.env.example`, y traducidos al inglés los comentarios restantes en repo.

## Pendientes del usuario (no bloqueantes)

- Reflejar en LinkedIn la nueva intro (About) y los proyectos freelance de 2026.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Arquitectura: [docs/architecture.md](docs/architecture.md)
- Skill de Despliegue: [skills/deploy-shared-hosting/SKILL.md](skills/deploy-shared-hosting/SKILL.md)
