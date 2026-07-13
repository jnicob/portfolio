# STATUS.md + /checkpoint v2 — Design

**Fecha:** 2026-07-13
**Estado:** Aprobado
**Alcance:** Sub-proyecto 1 de 2. El sub-proyecto 2 (repo portable `ai-config`) tiene su
propio spec en `~/workspace/ai-config/docs/2026-07-13-ai-config-design.md`.

## Problema

El estado del proyecto ("qué está hecho, qué sigue") vive hoy solo en la memoria local del
asistente (`~/.claude/projects/.../memory/portfolio-project-state.md`). Esa memoria no está
en el repo: no sobrevive a un cambio de máquina, no la ve otra persona ni otro agente, y no
queda auditada por commit. El roadmap versionado existe pero no expone un resumen operativo
de 30 segundos.

## Decisiones cerradas

1. **`STATUS.md` en la raíz del repo, versionado.** Resumen corto (~40 líneas) del estado
   actual. Apunta a las fuentes de verdad (roadmap, specs, planes); **no** duplica su
   contenido.
2. **`/checkpoint` lo mantiene y lo commitea automáticamente.** Única excepción a la regla
   "no commitear sin permiso" del comando. Sin auto-commit el archivo quedaría desfasado en
   git y perdería su razón de ser.
3. **Sin skill nueva.** El comando `/checkpoint` es el único punto de entrada y el formato
   de STATUS.md es autoexplicativo. (Evaluado y descartado: skill de proyecto
   `project-status` — duplicaría la receta.)

## STATUS.md — formato

```markdown
# STATUS — nicobehm portfolio

> Actualizado: YYYY-MM-DD · por /checkpoint

## Ahora
<fase/tarea actual en 1-2 líneas, con su estado real (empezada / no empezada)>

## Hecho
<fases completadas, 1 línea cada una, con commits/merges clave>

## Siguiente acción
<lista numerada con comandos, ramas y paths exactos>

## Pendientes del usuario (no bloqueantes)
<lista corta>

## Fuentes de verdad
<links relativos a roadmap, spec vigente y plan vigente>
```

Reglas:

- Máximo ~40 líneas. Si crece, algo está duplicando una fuente de verdad: mover el detalle
  al roadmap/plan y dejar el puntero.
- Se genera la primera vez desde `portfolio-project-state.md` (memoria local ya verificada).
- El contenido se verifica contra `git log`/`git status` antes de escribir, nunca de memoria.

## /checkpoint v2 — cambios al comando

Archivo: `~/.claude/commands/checkpoint.md` (migrará al repo `ai-config` en el
sub-proyecto 2; este cambio se hace sobre el archivo actual).

1. **Nuevo paso (entre los actuales 2 y 3) — STATUS.md:** si la raíz del repo tiene
   `STATUS.md`, actualizarlo con el mismo bloque de estado (Ahora / Hecho / Siguiente
   acción / Pendientes) y commitearlo automáticamente:
   `docs: update STATUS (checkpoint YYYY-MM-DD)`. Si no existe, ofrecer crearlo (no crear
   sin preguntar). Es genérico: aplica a cualquier repo, no solo al portfolio.
2. **Nuevo paso final — sync de memoria portable:** si `~/workspace/ai-config` existe y
   tiene cambios: `git add -A && git commit -m "mem: checkpoint YYYY-MM-DD" && git push`.
   Si el push falla (sin red, sin remote), declararlo en el checkpoint, no abortar.
3. **Corrección de redacción:** el paso 2 actual dice "no lo guardes en el repo". Se
   reformula: la memoria local guarda punteros + contexto del asistente; el estado
   compartible vive en `STATUS.md` (versionado). La excepción de auto-commit queda
   documentada en el propio comando.

## Verificación

- `STATUS.md` inicial refleja el estado real (fases 0-2 mergeadas, 2.5 planificada sin
  empezar) y pasa contraste manual contra `git log --oneline` y el roadmap.
- Ejecutar `/checkpoint` en una sesión posterior debe: actualizar STATUS.md, commitearlo,
  actualizar la memoria local y entregar prompt de continuación — sin pasos manuales.

## No-goals

- Automatizar STATUS.md por hook/CI (el checkpoint es el punto de actualización).
- STATUS.md por paquete o por app del monorepo (uno solo en la raíz).
- Cambiar el formato de la memoria local del asistente.
