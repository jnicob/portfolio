# Nico Behm — portfolio

> ⚠️ Work in progress — Phase 0 (foundations) done. See
> `docs/superpowers/plans/2026-07-10-portfolio-roadmap.md` for the roadmap.

Bilingual (es/en) professional portfolio: Next.js 16 monorepo with an AI playground
and the `@nicobehm/media-kit` package. Agent-agnostic config: see [AGENTS.md](AGENTS.md).

## Run locally

```bash
pnpm install
pnpm run dev        # http://localhost:3000
pnpm run build      # static export (default) → apps/web/out/
NEXT_OUTPUT_MODE=node pnpm run build   # optional Node mode
```

Quality gates: `pnpm run lint && pnpm run format && pnpm run typecheck && pnpm run test`
