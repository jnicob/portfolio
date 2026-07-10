---
name: code-principles
description: Readability, SOLID, single responsibility and module-size rules for this repo. Use when writing, refactoring or reviewing any code.
metadata:
  auto-invoke: 'refactor, readability, SOLID, module size, naming, single responsibility, code review'
---

# Code principles

## Readability first

- Code reads top-down like prose: intent-revealing names, no abbreviations
  (`generationRequest`, not `genReq`), early returns over nesting.
- Comments explain WHY, never WHAT. If a comment explains what, rename/extract instead.

## Responsibility & size

- One reason to change per module. A file > ~150 lines or a component doing fetch+state+layout
  is a split signal (extract hook, extract presentational child).
- Dependencies point inward: `domain/` imports nothing from `ui/` or `adapters/`;
  adapters implement domain ports (see playground architecture in the spec).

## SOLID, pragmatically

- SRP and DIP (ports/adapters) are load-bearing here; interfaces stay minimal (ISP) —
  don't add abstraction ceremony where a function suffices (YAGNI).
- Extend via composition/variants, not by editing stable code into flag-soup (OCP).

## Errors

- No silent failures: catch only where you can handle or translate; typed error results
  (`{ ok: false, reason }`) over thrown strings; degraded paths (live→mock) surface a
  visible notice, never a console-only warning.

## Tests

- Test behavior through the public API, not implementation details. Every bug fix starts
  with a failing test. Table-driven cases for pure logic.
