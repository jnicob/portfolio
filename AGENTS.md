# AGENTS.md — nicobehm portfolio

Source of truth for ANY coding agent (Claude Code, Cursor, Codex, Gemini CLI, Copilot…).
`CLAUDE.md` and `GEMINI.md` are symlinks to this file. Never edit generated/symlinked copies.

## What this repo is

Bilingual (es/en) professional portfolio for Nico Behm: Next.js 16 monorepo with an AI
playground and the `@nicobehm/media-kit` npm package. The repo itself is a portfolio piece:
structure, tests, tooling and this agent config are meant to be audited.

- Spec: `docs/superpowers/specs/2026-07-10-portfolio-design.md`
- Roadmap: `docs/superpowers/plans/2026-07-10-portfolio-roadmap.md`

## Commands

| Action                      | Command                                                    |
| --------------------------- | ---------------------------------------------------------- |
| Install                     | `pnpm install`                                             |
| Dev server                  | `pnpm run dev`                                             |
| Build (static, default)     | `pnpm run build`                                           |
| Build (Node mode)           | `NEXT_OUTPUT_MODE=node pnpm run build`                     |
| Lint / format / types       | `pnpm run lint` · `pnpm run format` · `pnpm run typecheck` |
| Tests                       | `pnpm run test`                                            |
| Agent config setup/validate | `pnpm run agents:setup` · `pnpm run agents:validate`       |

## Hard rules

- TypeScript strict; lint, format, typecheck and tests must stay green.
- Mandatory local verification: execute and pass ALL local checks (`pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run format`) BEFORE committing or pushing to `main`. NEVER push changes to `main` without passing local checks first.
- Colors ONLY through semantic tokens (CSS vars + `data-theme`). Never hardcode colors.
- No private/company dependencies. Public OSS or own code only.
- Static export is the default runtime; never assume a Node server in components.
- Never put secrets in the repo or the static bundle.
- Content lives in typed data/MDX (`apps/web/src/data`, `apps/web/content`), never inline in JSX.

## Skills routing (knowledge)

Read the matching skill in `skills/<name>/SKILL.md` BEFORE working on a matching topic.

<!-- prettier-ignore -->
| Action / keywords | Skill |
|-------------------|-------|
| App Router, RSC vs client, static export, output export, route handlers, SSR, dual runtime, hosting | `nextjs-static-dual` |
| colors, theming, dark mode, light mode, design tokens, CSS variables, Tailwind, data-theme | `tailwind-tokens` |
| component, variants, cva, composition, headless, forms, empty state, loading state, error state | `component-patterns` |
| accessibility, a11y, WCAG, aria, keyboard, focus, contrast, screen reader | `accessibility` |
| performance, Core Web Vitals, LCP, bundle size, images, code splitting, Lighthouse | `performance` |
| masonry, justified, galería de alturas variables, columnas responsive, waterfall | `masonry-layouts` |
| refactor, readability, SOLID, module size, naming, single responsibility, code review | `code-principles` |
| TypeScript, types, hooks rules, naming, imports, constants, test conventions | `code-conventions` |
| deploy, ssh, scp, ftp, hosting, godaddy, cpanel, htaccess, env.php.local, prod, production, producción | `deploy-shared-hosting` |

## Review lenses (agents)

`agents/*.md` are review briefs any tool can run as a prompt (Claude Code loads them as subagents):

- `design-reviewer` — visual/taste audit: hierarchy, spacing, states, both themes.
- `qa-a11y-perf` — runs Playwright + a11y + Lighthouse audits, reports findings.

## Division of responsibilities

- **Process** (how to work: brainstorm → plan → TDD → review → verify): the
  [Superpowers](https://github.com/obra/superpowers) plugin, when available. Agents without
  Superpowers: follow the plans in `docs/superpowers/plans/` task-by-task and keep its
  spirit — small TDD steps, frequent commits, review before done.
- **Knowledge** (project-specific domain rules): `skills/`.
- **Review** (quality lenses run on demand): `agents/`.

## Tool discovery map

| Tool           | Entry point                                                                |
| -------------- | -------------------------------------------------------------------------- |
| Claude Code    | `CLAUDE.md` (symlink) + `.claude/skills`, `.claude/agents` (symlinks)      |
| Cursor         | `AGENTS.md` (native) + `.cursor/skills` (symlink)                          |
| Codex CLI      | `AGENTS.md` (native) + `.codex/skills` (symlink)                           |
| Gemini CLI     | `GEMINI.md` (symlink)                                                      |
| GitHub Copilot | `.github/copilot-instructions.md` (generated) + `.github/skills` (symlink) |
| Anything else  | read this file + `skills/` + `agents/` directly                            |

Symlinks and the generated Copilot file are managed by `scripts/setup-agents.sh`
(`--all` to create, `--validate` in CI). On checkouts without symlink support (Windows
without developer mode), run `pnpm run agents:setup` after enabling symlinks or read the
root sources directly.
