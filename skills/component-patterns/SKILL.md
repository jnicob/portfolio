---
name: component-patterns
description: Component conventions — composition, cva variants, headless patterns, accessible forms, explicit empty/loading/error states. Use when creating or refactoring any UI component.
metadata:
  auto-invoke: 'component, variants, cva, composition, headless, forms, empty state, loading state, error state'
---

# Component patterns

## Structure

- Primitives in `apps/web/src/components/ui/` (one folder per component: `button/button.tsx`,
  `button.test.tsx`, `index.ts`). Feature components live with their feature
  (`features/playground/ui/`). Layout chrome in `components/layout/`.
- Composition over configuration: prefer `children`/slots over boolean-prop explosions.
  Behavior-only (headless) logic goes in hooks; the visual layer stays swappable.

## Variants & Styling

- Use `cva` for variants; export the variant type:
  `type ButtonProps = VariantProps<typeof buttonVariants> & ComponentProps<'button'>`.
- Variant classes use ONLY semantic token utilities (see `tailwind-tokens`).
- Prefer `cn(...)` (`@/lib/cn`) over template literal string interpolation (``${a} ${b}``) for conditional or dynamic CSS classes.


## States are part of the API

- Any component rendering async/remote data MUST render explicit `empty`, `loading` and
  `error` states — designed, not incidental. No spinners-only: skeletons for content
  shapes, human copy + retry affordance for errors, helpful guidance for empty.
- Model them as a discriminated union (`{ status: 'idle' | 'loading' | 'success' | 'error' }`),
  never as independent booleans.

## Forms

- Every input has a `<label>` (visible or sr-only), described errors
  (`aria-describedby` + `aria-invalid`), and keyboard-complete operation.
- Validate with Zod schemas shared with the domain layer; show messages inline.

## Definition of done for a component

Unit/RTL tests for behavior and a11y basics; entry in `/showcase` with all variants and
states; props documented (JSDoc or README table); no hardcoded colors or copy.
