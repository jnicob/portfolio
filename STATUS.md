# STATUS — nicobehm portfolio

> Actualizado: 2026-07-29 · deuda técnica saldada e integrada en main (rama `fix/tech-debt`)

## Ahora

**Despliegue inicial en `https://jnicob.dev` completado y verificado (2026-08-02)**
- Dominio oficial `https://jnicob.dev` configurado en `site-url.ts` y `.env.example`.
- Build de exportación estática (`apps/web/out/`) sincronizado y desplegado en `/public_html/jnicob.dev/` vía SSH/SCP.
- `.htaccess` y estructura de directorios/rutas indexadas (`/es/`, `/en/`, `/es/cv/`, `/es/projects/`) verificadas con `HTTP 200 OK`.

## Hecho

- ✅ Fases 0–3.9 implementadas (ver roadmap) · media-kit 0.7.0 integrada en main.
- ✅ F3.9 T1-T6 con review Approved por tarea; veredictos en `.superpowers/sdd/progress.md`.
- ✅ Configuración de dominio `jnicob.dev` y despliegue inicial en GoDaddy.

## Siguiente acción

1. **Formulario de contacto y privacidad de datos de contacto**:
   - Ocultar/retirar teléfono y correo directo explícito de la UI pública.
   - Implementar Formulario de Contacto (con validaciones frontend Zod + sanitización/seguridad en backend/endpoint).
   - Requisitos: Asunto (obligatorio), Email (obligatorio), Teléfono (opcional), Mensaje.
   - Referencia visual y funcional: Form de contacto en `hotel.montecervino.net/contacto/` y `manosactivas.es/contacto/`.

## Pendientes del usuario (no bloqueantes)

- Actualizar en LinkedIn la intro (About) y la experiencia de Freepik/Magnific (EN/ES) alineadas con las propuestas de la sesión.
- Implementar el Formulario de contacto en la próxima sesión.

## Fuentes de verdad

- Plan F3.9: [docs/superpowers/plans/2026-07-23-phase-3.9-editorial-nyt-fullbleed.md](docs/superpowers/plans/2026-07-23-phase-3.9-editorial-nyt-fullbleed.md)
- Spec F3.9: [docs/superpowers/specs/2026-07-23-phase-3.9-editorial-nyt-fullbleed-design.md](docs/superpowers/specs/2026-07-23-phase-3.9-editorial-nyt-fullbleed-design.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`
