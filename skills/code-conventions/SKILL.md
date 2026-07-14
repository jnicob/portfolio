---
name: code-conventions
description: Concrete TypeScript, React hooks and code-style conventions for this repo. Use when writing or reviewing any TypeScript/React code — types, hooks, naming, imports, component internals, test conventions.
metadata:
  auto-invoke: 'TypeScript, types, interface, generics, hooks, useEffect, useMemo, naming, imports, constants, conventions'
---

# Code conventions

Complements `code-principles` (the _why_); this skill is the _how_ — concrete rules.

## TypeScript

- `type` by default; `interface` only for declaration merging/augmentation.
- Const-object unions instead of duplicated enum-like pairs:
  `const FIT = ['contain', 'cover', 'actual'] as const; type Fit = (typeof FIT)[number];`
- Discriminated unions + type guards for multi-state data; never parallel booleans.
  Narrow with `value is X` predicates, not casts.
- No `any`. Use `unknown` + a guard; if truly unavoidable, a one-line comment says why.
- `import type { ... }` for type-only imports.
- Prefer utility types (`Pick`, `Omit`, `Partial`, `Record`) over hand-rolled shapes.
- Keep object types flat (one level); name nested shapes instead of inlining them.

## React

- Named exports; no default exports (App Router `page.tsx`/`layout.tsx` are the exception).
- Named React imports (`import { useState } from 'react'`), never `import React`.
- Component internal order: hooks → refs → state → derived values → effects →
  handlers → early returns → render. No hooks after conditionals.
- `useState`: lazy initializer for non-trivial initial values.
- `useEffect`: always return cleanup when subscribing/listening; deps complete and
  minimal — extract stable callbacks rather than silencing the linter.
- Derive during render instead of mirroring props/state in extra state + effects.
- Don't over-memoize: `useMemo`/`useCallback` only for referential stability that
  something depends on (deps, memoized children, context values).
- Context: `createContext<T | null>(null)` + accessor hook that throws when missing
  (see `apps/web/src/components/ui/tabs/tabs.tsx`).
- No `index` as `key` in `.map()` over dynamic lists.

## Style

- Functions with > 2 parameters take an options object; boolean props/params are
  named explicitly (`defaultControlsVisible`, not `visible2`).
- Module-level constants in `UPPER_SNAKE_CASE`; extract magic numbers.
- Files `kebab-case`; components `UpperCamelCase`; one component folder =
  `component.tsx` + `component.test.tsx` (+ `index.ts` only as public entry).
- No barrel files except a package/folder public entry point.
- Imports ordered: external → internal alias (`@/`) → relative. No unused exports.

## Tests

- Colocated next to the source (`foo.test.tsx`), never in `__tests__/`.
- Query priority: `getByRole` (with `name`) > `getByLabelText` > `getByText` >
  `getByTestId` (last resort). Interact with `userEvent`; `fireEvent` only for
  low-level events RTL can't produce (pointer gestures, non-bubbling events).
- Async UI: `findBy*`/`waitFor`, never arbitrary sleeps. No snapshot tests.
- Test names state behavior + condition; assert observable behavior, not internals.
