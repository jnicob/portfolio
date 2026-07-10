---
name: accessibility
description: WCAG AA checklist applied during build and review. Use when building interactive components, reviewing UI, or auditing pages for keyboard, ARIA, contrast.
metadata:
  auto-invoke: 'accessibility, a11y, WCAG, aria, keyboard, focus, contrast, screen reader'
---

# Accessibility — WCAG AA checklist

## Keyboard

- [ ] Everything operable by keyboard alone; logical tab order; no traps.
- [ ] Visible focus ring (token `--color-ring`) on every focusable element; never `outline: none` without replacement.
- [ ] Overlays (lightbox, menus): focus trapped inside, `Escape` closes, focus returns to trigger.
- [ ] Custom widgets follow WAI-ARIA APG patterns (slider → `role="slider"` + arrow keys; tabs → roving tabindex).

## Semantics / ARIA

- [ ] Native elements first (`button`, `a`, `label`, `nav`, `main`); ARIA only when HTML can't.
- [ ] Every image: meaningful `alt` (or `alt=""` if decorative). Every icon-button: accessible name.
- [ ] Live async updates announced via `aria-live="polite"` region (playground results).
- [ ] Landmarks: one `main`, labeled `nav`s; headings hierarchical without skips.

## Visual

- [ ] Contrast in BOTH themes: text ≥ 4.5:1, large text/UI components ≥ 3:1 (check tokens when defined, not per-component).
- [ ] Information never by color alone; `prefers-reduced-motion` respected on all animations.
- [ ] Zoom 200% and 320px viewport: no loss of content or function.

## i18n

- [ ] `<html lang>` correct per locale; locale switcher announces target language.

## Verification

RTL + `vitest-axe`/`jest-axe` for components; Playwright + `@axe-core/playwright` per page
in BOTH themes (Phase 6 automates this in CI).
