# STATUS.md + /checkpoint v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un `STATUS.md` versionado en la raíz del portfolio que refleja siempre el estado + TODO, mantenido y auto-commiteado por el comando `/checkpoint` actualizado.

**Architecture:** Dos entregables sin código: un archivo Markdown en el repo (generado desde la memoria local verificada contra git) y una edición del comando personal `~/.claude/commands/checkpoint.md` que añade dos pasos (STATUS.md + sync del repo `ai-config`) y corrige una instrucción contradictoria.

**Tech Stack:** Markdown, git. Sin dependencias.

**Spec:** `docs/superpowers/specs/2026-07-13-status-checkpoint-design.md`

## Global Constraints

- Idioma de todos los textos: Español con ortografía completa (tildes incluidas).
- STATUS.md: máximo ~40 líneas; punteros a fuentes de verdad, nunca duplicar roadmap/planes.
- El contenido de STATUS.md se verifica contra `git log`/estado real, nunca de memoria.
- Único auto-commit permitido al checkpoint: `docs: update STATUS (checkpoint YYYY-MM-DD)` (y el sync de `~/workspace/ai-config`).

---

### Task 1: STATUS.md inicial

**Files:**

- Create: `STATUS.md` (raíz del repo portfolio)

**Interfaces:**

- Consumes: memoria local `~/.claude/projects/-home-nbehm-workspace-formaciones-claude-superpowers-portfolio/memory/portfolio-project-state.md` (solo como borrador; la verdad es git).
- Produces: `STATUS.md` con secciones exactas `Ahora / Hecho / Siguiente acción / Pendientes del usuario (no bloqueantes) / Fuentes de verdad` — el paso 3 del checkpoint v2 (Task 2) asume estos nombres de sección.

- [ ] **Step 1: Verificar el estado real del repo**

Run: `git log --oneline -8 && git status -s && git branch --show-current`
Expected: rama `main`, working tree limpio (salvo este plan), commits recientes incluyen `c64ab89` (plan fase 2.5) y `c774005` (roadmap fase 2 done).

- [ ] **Step 2: Comprobar que los archivos referenciados existen**

Run: `ls docs/superpowers/plans/2026-07-10-portfolio-roadmap.md docs/superpowers/specs/2026-07-13-media-kit-v2-design.md docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md`
Expected: los tres paths existen (STATUS.md los enlaza; un enlace roto es fallo de la task).

- [ ] **Step 3: Escribir `STATUS.md`**

```markdown
# STATUS — nicobehm portfolio

> Actualizado: 2026-07-13 · por /checkpoint

## Ahora

Fase 2.5 — media-kit v2 (zoom/pan/pinch, toolbar auto-hide, fit modes,
fullscreen nativo, slider hover). Planificada, **no empezada**.

## Hecho

- ✅ Fase 0 — fundaciones del monorepo (pnpm, Next.js 16, tooling, agent config).
- ✅ Fase 1 — design system (tokens semánticos, dark/light, acento violeta).
- ✅ Fase 2 — `@nicobehm/media-kit` v0.1.0 (CompareSlider + MediaLightbox, 0 deps)
  - demo en /showcase. Merge FF `ac82e8a..c774005`, en `github.com:jnicob/portfolio`.

## Siguiente acción

1. `git checkout main && git pull`
2. Crear rama `feature/phase-2.5-media-kit-v2`
3. Ejecutar el plan tarea-por-tarea (superpowers:subagent-driven-development
   recomendado, o executing-plans):
   `docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md`
4. Gate por tarea: `pnpm run lint && pnpm run typecheck && pnpm run test`
5. Task 10 = cierre estándar (design review + code review + roadmap + merge FF).

## Pendientes del usuario (no bloqueantes)

- Export PDF de LinkedIn (experiencia previa + formación).
- Dominio definitivo.
- Decisión: publicar `@nicobehm/media-kit` en npm.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec vigente (F2.5): [docs/superpowers/specs/2026-07-13-media-kit-v2-design.md](docs/superpowers/specs/2026-07-13-media-kit-v2-design.md)
- Plan vigente (F2.5): [docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md](docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md)
```

- [ ] **Step 4: Contrastar contenido contra las fuentes**

Run: `grep -n "2.5" docs/superpowers/plans/2026-07-10-portfolio-roadmap.md | head -5`
Expected: el roadmap lista la fase 2.5 como pendiente/planificada (coincide con la sección "Ahora"). Si el roadmap dice otra cosa, corregir STATUS.md — manda el roadmap.

- [ ] **Step 5: Commit**

```bash
git add STATUS.md
git commit -m "docs: add STATUS.md (estado operativo versionado, mantenido por /checkpoint)"
```

---

### Task 2: /checkpoint v2

**Files:**

- Modify: `~/.claude/commands/checkpoint.md` (reemplazo completo del contenido)

**Interfaces:**

- Consumes: formato de secciones de STATUS.md definido en Task 1.
- Produces: comando `/checkpoint` con 5 pasos; el plan de `ai-config` (repo `~/workspace/ai-config`, plan `docs/plans/2026-07-13-ai-config-v1.md`, Task 2) copia este archivo tal cual a `commands/checkpoint.md` — no editarlo allí de forma divergente.

**Nota:** `~/.claude/commands/` no es un repo git — esta task no tiene commit. El archivo queda versionado cuando el plan de ai-config lo migre y el symlink lo conecte.

- [ ] **Step 1: Reemplazar el contenido de `~/.claude/commands/checkpoint.md` por:**

```markdown
---
description: Guarda el estado de la sesión en la memoria del proyecto y en STATUS.md, y genera un prompt de continuación para una sesión nueva
---

Guarda un checkpoint de la sesión actual y entrega un prompt de continuación. Receta:

1. **Verifica el estado real antes de escribir** (no de memoria): `git log --oneline -5`, `git status -s`, rama actual, y qué checks están en verde.

2. **Actualiza la memoria persistente del proyecto** (directorio `memory/` del proyecto en `~/.claude/projects/...`): actualiza el fichero de estado existente si lo hay (no crees duplicados). Reparto de responsabilidades: la memoria local guarda punteros + contexto del asistente; el estado compartible vive en `STATUS.md` (paso 3); el detalle duradero (specs, planes, roadmap) vive en el git del proyecto. El bloque de estado REQUIERE:
   - Fecha y qué está COMPLETO (con commits/ramas exactos)
   - Qué está EN CURSO o planificado SIN empezar (con paths exactos de spec/plan)
   - SIGUIENTE ACCIÓN numerada (comandos y skills exactos)
   - Trabajo a medias o decisiones pendientes del usuario, si las hay

3. **Actualiza STATUS.md del repo**: si la raíz del repo tiene `STATUS.md`, actualízalo con el mismo bloque de estado, respetando sus secciones (`Ahora / Hecho / Siguiente acción / Pendientes del usuario (no bloqueantes) / Fuentes de verdad`), la fecha de la cabecera y el límite de ~40 líneas (punteros a roadmap/spec/plan, nunca duplicar su contenido). Commitéalo automáticamente: `docs: update STATUS (checkpoint YYYY-MM-DD)`. Si no existe `STATUS.md`, ofrece crearlo — no lo crees sin preguntar.

4. **Entrega al usuario un prompt de continuación** en un bloque de código, listo para pegar. REQUIERE:
   - Objetivo en una línea
   - Ficheros a leer primero, en orden, con path exacto (fuente de verdad primero)
   - Instrucciones de proceso (skills/plugins a invocar, rama, TDD, alcance cerrado)
   - Comando de verificación que debe pasar antes de dar nada por hecho
   - Primera acción concreta ("Empieza por…")

5. **Sincroniza la memoria portable**: si `~/workspace/ai-config` existe y `git -C ~/workspace/ai-config status --porcelain` devuelve cambios: `git -C ~/workspace/ai-config add -A && git -C ~/workspace/ai-config commit -m "mem: checkpoint YYYY-MM-DD" && git -C ~/workspace/ai-config push`. Si el push falla (sin red o sin remote), declara el fallo en el checkpoint y sigue — no abortes.

No commitees nada más salvo que el usuario lo pida — las ÚNICAS excepciones automáticas son los pasos 3 y 5. Si hay trabajo sin commitear, decláralo en el checkpoint y en el prompt de continuación.
```

- [ ] **Step 2: Verificar el archivo**

Run: `grep -c "STATUS.md" ~/.claude/commands/checkpoint.md && grep -c "ai-config" ~/.claude/commands/checkpoint.md`
Expected: ambos conteos ≥ 1 (los dos pasos nuevos están presentes).

- [ ] **Step 3: Verificación funcional (manual, fin de sesión)**

Al ejecutar `/checkpoint` en esta u otra sesión sobre el portfolio, debe: actualizar la memoria local, actualizar y commitear `STATUS.md`, entregar prompt de continuación, e intentar el sync de `~/workspace/ai-config` si existe. Anotar cualquier desviación como bug del comando.

---

## Self-review

- Cobertura del spec: STATUS.md formato/reglas → Task 1; checkpoint pasos 1-3 del spec → Task 2 (steps 1-2); verificación → Task 1 step 4 y Task 2 step 3; no-goals respetados (sin hooks/CI, un solo STATUS.md). ✓
- Sin placeholders; contenido completo de ambos archivos incluido. ✓
- Consistencia: nombres de sección de STATUS.md idénticos en Task 1 step 3 y Task 2 step 1 (paso 3 del comando). ✓
