# Decision: dependency pins for Node 20.17 compatibility

**Date:** 2026-07-10 · **Status:** active · **Remove when:** local/CI Node ≥ 22 everywhere

Local development runs Node 20.17.0 (`engines.node >=20`, `engine-strict`). These pins
work around that:

| Pin                                  | Where                                                              | Why                                                                                               | Removal condition                                 |
| ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `pnpm.overrides.vite: "^6"`          | root `package.json` (pnpm only allows overrides at workspace root) | vite 7/8 requires Node ≥ 20.19                                                                    | Node upgraded to 22 → drop override, unpin vitest |
| `vitest: ^3.2.7`                     | `apps/web`                                                         | vitest 4 pulls vite 7/8                                                                           | same as above                                     |
| `typescript: ^5.9.3`                 | `apps/web`                                                         | typescript 7 (tsgo) breaks `next build` on Next 16.2.10                                           | Next release notes confirm TS 7 support           |
| `eslint` / `@eslint/js` `^9.39.4`    | root `package.json`                                                | eslint 10.x requires Node ≥ 20.19                                                                 | Node upgraded to 22 → unpin to latest             |
| `typescript-eslint` `8.55.0` (exact) | root `package.json`                                                | 8.56.0+ requires Node ≥ 20.19 (transitive)                                                        | Node upgraded to 22 → unpin                       |
| `jsdom` `26.1.0` (exact)             | `apps/web`                                                         | jsdom 27.1.0+ requires Node ≥ 20.19; 27.0.x still needs it via transitive `parse5@8`/`entities@8` | Node upgraded to 22 → unpin to latest             |

Node 20 is EOL since 2026-04; upgrading to Node 22 LTS is already tracked as an owner
pending item. After upgrading: remove the pins, run `pnpm update`, verify both builds
(`pnpm run build` and `NEXT_OUTPUT_MODE=node pnpm run build`) and the test suite.
