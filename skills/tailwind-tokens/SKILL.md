---
name: tailwind-tokens
description: Semantic design tokens with Tailwind v4 and dark/light theming via CSS variables + data-theme. Use when styling anything, adding colors, spacing, radii, or working on themes.
metadata:
  auto-invoke: 'colors, theming, dark mode, light mode, design tokens, CSS variables, Tailwind, data-theme'
---

# Semantic tokens + theming

## Architecture

- Tokens live in `apps/web/src/app/globals.css`: raw palette (`--palette-*`, private) →
  semantic tokens (`--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-accent`,
  `--color-border`, `--color-surface`, `--color-danger`…) mapped per theme under
  `:root[data-theme='dark']` and `:root[data-theme='light']`.
- Tailwind v4 reads them via `@theme inline` so utilities like `bg-bg`, `text-fg`,
  `border-border` resolve to the CSS vars.
- `data-theme` is set on `<html>`; the theme switcher toggles it and persists to
  localStorage; an inline pre-hydration script prevents theme flash. Dark is default.

## Hard rules

- NEVER hardcode a color in a component: no hex, no rgb(), no Tailwind palette classes
  like `bg-zinc-900` or `text-white`. Semantic utilities/vars only.
- New color needs? Add a semantic token to BOTH themes, then use it. If it only makes
  sense in one theme, the token still needs a value in both.
- Non-color scales (spacing, radius, fonts) also go through tokens when they carry
  design intent (`--radius-card`, `--font-mono`…).
- Prefer `cn(...)` (`@/lib/cn`) over template literal string interpolation for dynamic or conditional Tailwind class composition.

- media-kit components use their own `--mk-*` public custom properties; map portfolio
  tokens to them at the usage site, never inside the package.

## Review check

`grep -rnE '#[0-9a-fA-F]{3,8}|rgb\(' apps/web/src/components apps/web/src/features` must
return nothing (except token definitions in globals.css).
