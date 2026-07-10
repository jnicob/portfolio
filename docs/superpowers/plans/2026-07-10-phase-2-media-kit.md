# Fase 2: `@nicobehm/media-kit` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Paquete npm publicable `@nicobehm/media-kit` con `CompareSlider` (before/after accesible) y `MediaLightbox` (visor fullscreen imagen/vídeo con focus trap), consumido por el portfolio y demostrado en `/showcase`.

**Architecture:** Paquete workspace en `packages/media-kit`, independiente de Tailwind: estilos propios en `styles.css` con clases `mk-*` personalizables vía custom properties públicas `--mk-*`. Build con tsup (ESM+CJS+d.ts, banner `'use client'`, React como external/peer). Tests propios (vitest+jsdom+RTL, mismos pins que apps/web). El portfolio lo consume como `workspace:*` y mapea sus tokens a los `--mk-*` en el punto de uso (nunca dentro del paquete).

**Tech Stack:** tsup, React 19 (peer >=18), vitest ^3.2.7 + jsdom 26.1.0 + Testing Library (pins existentes por Node 20.17).

## Global Constraints

- Ver Global Constraints del roadmap — aplican enteras, con una excepción explícita: dentro del paquete NO hay Tailwind; los colores del paquete viven SOLO como defaults de custom properties `--mk-*` en `styles.css` (equivalente al rol de globals.css en la app).
- Contrato F2→F4 (roadmap): exporta `CompareSlider` y `MediaLightbox` con props documentadas en su README.
- Accesibilidad APG: CompareSlider = patrón slider (role, aria-value*, flechas ±1, PageUp/Down ±10, Home/End); MediaLightbox = patrón dialog modal (aria-modal, focus trap, Escape, retorno de foco, scroll lock, `prefers-reduced-motion`).
- TDD para todo comportamiento. Test de comportamiento, no de implementación.
- `pnpm -r build` debe seguir topológico: media-kit build antes que web. Cadena completa verde tras cada task.
- El paquete queda LISTO para publicar (files, license MIT, exports, types) — el publish real es acción manual del usuario (fuera de alcance).

---

### Task 1: Scaffold del paquete + pipeline de build

**Files:**

- Create: `packages/media-kit/package.json`, `packages/media-kit/tsconfig.json`, `packages/media-kit/tsup.config.ts`, `packages/media-kit/vitest.config.ts`, `packages/media-kit/vitest.setup.ts`, `packages/media-kit/src/index.ts`, `packages/media-kit/src/styles.css`, `packages/media-kit/README.md` (stub), `packages/media-kit/LICENSE`

**Interfaces:**

- Produces: workspace `@nicobehm/media-kit` con scripts `build|test|typecheck`; `dist/` con index.js/cjs/d.ts + styles.css; base CSS `--mk-*`.

- [ ] **Step 1: Ficheros de config**

`packages/media-kit/package.json`:

```json
{
  "name": "@nicobehm/media-kit",
  "version": "0.1.0",
  "description": "Accessible media components for React: before/after compare slider and fullscreen media lightbox.",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```

Nota (AMENDED 2026-07-10): exports con types anidados por condición para que los consumidores CJS resuelvan index.d.cts (hallazgo de review).

Instalar devDeps (mismos pins que apps/web — si pnpm resuelve una versión que exige Node ≥20.19, pinnear igual que la fila existente del decision-log):

```bash
pnpm --filter @nicobehm/media-kit add -D tsup typescript react react-dom @types/react @types/react-dom vitest@^3.2.7 jsdom@26.1.0 @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

`packages/media-kit/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src", "vitest.setup.ts", "*.config.ts"]
}
```

`packages/media-kit/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  // Los componentes son client components en consumidores React Server Components.
  banner: { js: "'use client';" },
  onSuccess: 'cp src/styles.css dist/styles.css',
});
```

`packages/media-kit/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

`packages/media-kit/vitest.setup.ts` (mismo patrón que apps/web — cleanup explícito sin globals):

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

`packages/media-kit/src/index.ts` (provisional, se completa en Tasks 2-3):

```ts
export {};
```

`packages/media-kit/src/styles.css` (tokens públicos + reset mínimo del paquete):

```css
/*
 * @nicobehm/media-kit — estilos base.
 * Personalización vía custom properties públicas (--mk-*): defínelas en el
 * consumidor (p.ej. mapeadas a los design tokens de tu app).
 */
:root {
  --mk-handle-color: #ffffff;
  --mk-handle-size: 2.5rem;
  --mk-divider-width: 2px;
  --mk-focus-ring: #6d5ce8;
  --mk-overlay-bg: rgb(0 0 0 / 0.8);
  --mk-radius: 0.75rem;
  --mk-z-lightbox: 50;
}
```

`packages/media-kit/LICENSE`: texto MIT estándar con `Copyright (c) 2026 Nicolás Behm`.

`packages/media-kit/README.md` stub:

```markdown
# @nicobehm/media-kit

Accessible media components for React. WIP — full docs land with the components.
```

- [ ] **Step 2: Verificar pipeline**

Run: `pnpm --filter @nicobehm/media-kit build && ls packages/media-kit/dist/`
Expected: `index.js index.cjs index.d.ts styles.css` (+sourcemaps).

Run: `pnpm run typecheck && pnpm run test && pnpm run lint && pnpm run format:fix && pnpm run format`
Expected: verde (el script `test` del paquete lleva `--passWithNoTests` porque aún no hay tests; el flag es inocuo y se queda).

- [ ] **Step 3: Commit**

```bash
git add packages/media-kit pnpm-lock.yaml
git commit -m "feat: scaffold @nicobehm/media-kit package with tsup build pipeline"
```

---

### Task 2: CompareSlider (TDD)

**Files:**

- Create: `packages/media-kit/src/compare-slider/compare-slider.tsx`, `packages/media-kit/src/compare-slider/compare-slider.test.tsx`, `packages/media-kit/src/compare-slider/index.ts`
- Modify: `packages/media-kit/src/index.ts`, `packages/media-kit/src/styles.css`

**Interfaces:**

- Produces: `CompareSlider` con props `{ before: ReactNode; after: ReactNode; label?: string; initialPosition?: number; orientation?: 'horizontal' | 'vertical'; className?: string; onPositionChange?: (pos: number) => void }`. Divisor con `role="slider"`, valores 0-100.

- [ ] **Step 1: Test failing**

`compare-slider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CompareSlider } from './compare-slider';

function renderSlider(props = {}) {
  return render(
    <CompareSlider
      before={<img src="/a.png" alt="Antes" />}
      after={<img src="/b.png" alt="Después" />}
      {...props}
    />,
  );
}

describe('CompareSlider', () => {
  it('expone un slider accesible con valor inicial 50', () => {
    renderSlider();
    const handle = screen.getByRole('slider', { name: 'Compare' });
    expect(handle).toHaveAttribute('aria-valuemin', '0');
    expect(handle).toHaveAttribute('aria-valuemax', '100');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
  });

  it('renderiza ambos medios', () => {
    renderSlider();
    expect(screen.getByAltText('Antes')).toBeInTheDocument();
    expect(screen.getByAltText('Después')).toBeInTheDocument();
  });

  it('mueve con flechas (±1) y PageUp/PageDown (±10)', async () => {
    const onPositionChange = vi.fn();
    renderSlider({ onPositionChange });
    const handle = screen.getByRole('slider');
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '51');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '49');
    await userEvent.keyboard('{PageUp}');
    expect(handle).toHaveAttribute('aria-valuenow', '59');
    await userEvent.keyboard('{PageDown}');
    expect(handle).toHaveAttribute('aria-valuenow', '49');
    expect(onPositionChange).toHaveBeenLastCalledWith(49);
  });

  it('Home/End van a los extremos y el valor queda acotado', async () => {
    renderSlider({ initialPosition: 99 });
    const handle = screen.getByRole('slider');
    handle.focus();
    await userEvent.keyboard('{PageUp}');
    expect(handle).toHaveAttribute('aria-valuenow', '100');
    await userEvent.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  it('soporta orientación vertical (flechas Up/Down)', async () => {
    renderSlider({ orientation: 'vertical' });
    const handle = screen.getByRole('slider');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    handle.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(handle).toHaveAttribute('aria-valuenow', '51');
    await userEvent.keyboard('{ArrowDown}');
    expect(handle).toHaveAttribute('aria-valuenow', '50');
  });
});
```

Run: `pnpm --filter @nicobehm/media-kit test` → FAIL (módulo inexistente).

- [ ] **Step 2: Implementación**

`compare-slider.tsx`:

```tsx
'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

export type CompareSliderProps = {
  /** Medio original (típicamente <img>). Se muestra a la izquierda / arriba. */
  before: ReactNode;
  /** Medio procesado. Se revela a la derecha / abajo del divisor. */
  after: ReactNode;
  /** Nombre accesible del divisor. */
  label?: string;
  /** Posición inicial del divisor, 0-100. */
  initialPosition?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onPositionChange?: (position: number) => void;
};

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function CompareSlider({
  before,
  after,
  label = 'Compare',
  initialPosition = 50,
  orientation = 'horizontal',
  className,
  onPositionChange,
}: CompareSliderProps) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontal = orientation === 'horizontal';

  function update(next: number) {
    const clamped = clamp(next);
    setPosition(clamped);
    onPositionChange?.(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step: Record<string, number> = horizontal
      ? { ArrowRight: 1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }
      : { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key === 'Home') {
      event.preventDefault();
      update(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      update(100);
    } else if (event.key in step) {
      event.preventDefault();
      update(position + (step[event.key] ?? 0));
    }
  }

  function positionFromPointer(event: PointerEvent<HTMLDivElement>): number {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return position;
    return horizontal
      ? ((event.clientX - rect.left) / rect.width) * 100
      : ((event.clientY - rect.top) / rect.height) * 100;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    update(positionFromPointer(event));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    update(positionFromPointer(event));
  }

  return (
    <div
      ref={containerRef}
      className={['mk-compare', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      style={{ ['--mk-compare-pos' as string]: `${position}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <div className="mk-compare__before">{before}</div>
      <div className="mk-compare__after" aria-hidden="true">
        {after}
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation={orientation}
        className="mk-compare__handle"
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
```

Nota de diseño (documentar en README, Task 5): `after` va `aria-hidden` porque visualmente es un recorte del mismo contenido y duplicaría la salida del lector de pantalla; el nombre accesible del conjunto lo dan los `alt` de `before` y el `label` del slider.

Añadir a `styles.css`:

```css
/* CompareSlider */
.mk-compare {
  position: relative;
  overflow: hidden;
  border-radius: var(--mk-radius);
  touch-action: none;
  user-select: none;
}

.mk-compare__before,
.mk-compare__after {
  display: block;
}

.mk-compare__before img,
.mk-compare__before video,
.mk-compare__after img,
.mk-compare__after video {
  display: block;
  width: 100%;
  height: auto;
}

.mk-compare__after {
  position: absolute;
  inset: 0;
}

.mk-compare[data-orientation='horizontal'] .mk-compare__after {
  clip-path: inset(0 0 0 var(--mk-compare-pos));
}

.mk-compare[data-orientation='vertical'] .mk-compare__after {
  clip-path: inset(var(--mk-compare-pos) 0 0 0);
}

.mk-compare__handle {
  position: absolute;
  cursor: col-resize;
}

.mk-compare[data-orientation='horizontal'] .mk-compare__handle {
  top: 0;
  bottom: 0;
  left: var(--mk-compare-pos);
  width: var(--mk-divider-width);
  background: var(--mk-handle-color);
  transform: translateX(-50%);
}

.mk-compare[data-orientation='vertical'] .mk-compare__handle {
  left: 0;
  right: 0;
  top: var(--mk-compare-pos);
  height: var(--mk-divider-width);
  background: var(--mk-handle-color);
  transform: translateY(-50%);
  cursor: row-resize;
}

/* Zona de agarre táctil ampliada + indicador circular */
.mk-compare__handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--mk-handle-size);
  height: var(--mk-handle-size);
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: var(--mk-handle-color);
  opacity: 0.9;
}

.mk-compare__handle:focus-visible {
  outline: 2px solid var(--mk-focus-ring);
  outline-offset: 2px;
}
```

`compare-slider/index.ts`: `export { CompareSlider, type CompareSliderProps } from './compare-slider';`
`src/index.ts`: sustituir por `export { CompareSlider, type CompareSliderProps } from './compare-slider';`

Run: `pnpm --filter @nicobehm/media-kit test` → PASS.

- [ ] **Step 3: Cadena + commit**

Run: `pnpm --filter @nicobehm/media-kit build && pnpm run lint && pnpm run format:fix && pnpm run format && pnpm run typecheck && pnpm run test`

```bash
git add packages/media-kit
git commit -m "feat(media-kit): add accessible CompareSlider (TDD)"
```

---

### Task 3: MediaLightbox (TDD)

**Files:**

- Create: `packages/media-kit/src/media-lightbox/media-lightbox.tsx`, `packages/media-kit/src/media-lightbox/media-lightbox.test.tsx`, `packages/media-kit/src/media-lightbox/index.ts`
- Modify: `packages/media-kit/src/index.ts`, `packages/media-kit/src/styles.css`

**Interfaces:**

- Produces: `MediaLightbox` controlado: `{ open: boolean; onClose: () => void; label: string; closeLabel?: string; children: ReactNode }`. Dialog modal APG (portal a body, focus trap, Escape, click en overlay, scroll lock, retorno de foco).

- [ ] **Step 1: Test failing**

`media-lightbox.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { MediaLightbox } from './media-lightbox';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <MediaLightbox open={open} onClose={() => setOpen(false)} label="Vista de imagen">
        <img src="/full.png" alt="Resultado completo" />
        <a href="/download">Descargar</a>
      </MediaLightbox>
    </>
  );
}

describe('MediaLightbox', () => {
  it('no renderiza nada cerrado', () => {
    render(
      <MediaLightbox open={false} onClose={() => {}} label="X">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('abre como dialog modal etiquetado y enfoca el botón de cerrar', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Vista de imagen' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Escape cierra y devuelve el foco al trigger', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('el foco queda atrapado dentro (Tab cicla)', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const close = screen.getByRole('button', { name: 'Close' });
    const link = screen.getByRole('link', { name: 'Descargar' });
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(link).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(link).toHaveFocus();
  });

  it('click en el overlay cierra, click en el contenido no', async () => {
    const onClose = vi.fn();
    render(
      <MediaLightbox open onClose={onClose} label="V">
        <img src="/a.png" alt="contenido" />
      </MediaLightbox>,
    );
    await userEvent.click(screen.getByAltText('contenido'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

Run: `pnpm --filter @nicobehm/media-kit test` → FAIL.

- [ ] **Step 2: Implementación**

`media-lightbox.tsx`:

```tsx
'use client';

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type MediaLightboxProps = {
  open: boolean;
  onClose: () => void;
  /** Nombre accesible del dialog. */
  label: string;
  closeLabel?: string;
  /** Contenido a pantalla completa: <img>, <video> o composición. */
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function MediaLightbox({
  open,
  onClose,
  label,
  closeLabel = 'Close',
  children,
}: MediaLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Al abrir: guardar el foco previo, bloquear scroll, enfocar Close. Al cerrar: restaurar ambos.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    // Focus trap: ciclar dentro del dialog.
    const focusables = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function onOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="mk-lightbox"
      onKeyDown={onKeyDown}
      onClick={onOverlayClick}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label={closeLabel}
        className="mk-lightbox__close"
        onClick={onClose}
      >
        ✕
      </button>
      <div className="mk-lightbox__content">{children}</div>
    </div>,
    document.body,
  );
}
```

Añadir a `styles.css`:

```css
/* MediaLightbox */
.mk-lightbox {
  position: fixed;
  inset: 0;
  z-index: var(--mk-z-lightbox);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--mk-overlay-bg);
  animation: mk-fade-in 150ms ease-out;
}

.mk-lightbox__content {
  max-width: 100%;
  max-height: 100%;
}

.mk-lightbox__content img,
.mk-lightbox__content video {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 4rem);
  border-radius: var(--mk-radius);
}

.mk-lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 9999px;
  background: var(--mk-handle-color);
  cursor: pointer;
  font-size: 1rem;
}

.mk-lightbox__close:focus-visible,
.mk-lightbox__content :focus-visible {
  outline: 2px solid var(--mk-focus-ring);
  outline-offset: 2px;
}

@keyframes mk-fade-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mk-lightbox {
    animation: none;
  }
}
```

`media-lightbox/index.ts`: `export { MediaLightbox, type MediaLightboxProps } from './media-lightbox';`
`src/index.ts` añade: `export { MediaLightbox, type MediaLightboxProps } from './media-lightbox';`

Run: `pnpm --filter @nicobehm/media-kit test` → PASS.

- [ ] **Step 3: Cadena + commit**

```bash
git add packages/media-kit
git commit -m "feat(media-kit): add accessible MediaLightbox modal (TDD)"
```

---

### Task 4: Integración en el portfolio (showcase)

**Files:**

- Modify: `apps/web/package.json` (dep `"@nicobehm/media-kit": "workspace:*"`), `apps/web/src/app/layout.tsx` (importar css del paquete y mapear tokens), `apps/web/src/app/globals.css` (mapeo `--mk-*`), `apps/web/src/app/showcase/page.tsx`
- Create: `apps/web/src/components/showcase/media-kit-demo.tsx` (client wrapper con estado del lightbox), `apps/web/public/demo/before.svg`, `apps/web/public/demo/after.svg`

**Interfaces:**

- Consumes: exports del paquete (Tasks 2-3), tokens F1.
- Produces: sección "media-kit" en `/showcase` con CompareSlider (SVGs demo) y MediaLightbox; mapeo de tokens del portfolio a `--mk-*` en globals.css (patrón que F4 reutiliza).

- [ ] **Step 1: Dependencia + css**

```bash
pnpm --filter web add @nicobehm/media-kit@workspace:*
```

En `apps/web/src/app/layout.tsx`, tras `import './globals.css';` añadir:

```ts
import '@nicobehm/media-kit/styles.css';
```

En `apps/web/src/app/globals.css`, añadir al final (mapeo en el CONSUMIDOR, cumpliendo la skill tailwind-tokens):

```css
/* Mapeo de design tokens del portfolio a la API pública de @nicobehm/media-kit */
:root[data-theme='dark'],
:root[data-theme='light'] {
  --mk-focus-ring: var(--ring);
  --mk-handle-color: var(--surface);
  --mk-radius: var(--radius-card);
}
```

- [ ] **Step 2: SVGs de demo**

`apps/web/public/demo/before.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#3f3f52"/><circle cx="400" cy="225" r="120" fill="#5c5c78"/><text x="24" y="428" font-family="monospace" font-size="24" fill="#ffffff">before · low-res</text></svg>
```

`apps/web/public/demo/after.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#5b4bd6"/><circle cx="400" cy="225" r="120" fill="#a396f9"/><text x="24" y="428" font-family="monospace" font-size="24" fill="#ffffff">after · upscaled</text></svg>
```

(Los hex aquí son CONTENIDO de imagen demo, no estilos de componente — permitido, igual que lo será una foto.)

- [ ] **Step 3: Demo client component**

`apps/web/src/components/showcase/media-kit-demo.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { CompareSlider, MediaLightbox } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';

export function MediaKitDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <CompareSlider
        before={<img src="/demo/before.svg" alt="Imagen original en baja resolución" />}
        after={<img src="/demo/after.svg" alt="" />}
        label="Comparar antes y después"
      />
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir en fullscreen
        </Button>
        <MediaLightbox
          open={open}
          onClose={() => setOpen(false)}
          label="Resultado a pantalla completa"
        >
          <img src="/demo/after.svg" alt="Resultado procesado a pantalla completa" />
        </MediaLightbox>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Sección en showcase**

En `apps/web/src/app/showcase/page.tsx`, importar `MediaKitDemo` y añadir antes del cierre de `<main>`:

```tsx
<Section title="@nicobehm/media-kit">
  <p className="text-fg-muted">
    Componentes media del paquete propio: CompareSlider (before/after) y MediaLightbox.
  </p>
  <MediaKitDemo />
</Section>
```

- [ ] **Step 5: Verificar builds duales + cadena y commit**

Run: `pnpm run build && NEXT_OUTPUT_MODE=node pnpm run build && pnpm run lint && pnpm run format:fix && pnpm run format && pnpm run typecheck && pnpm run test`
Expected: `pnpm run build` construye media-kit ANTES que web (topológico); `/showcase` sigue ○ en ambos modos.

```bash
git add apps/web pnpm-lock.yaml
git commit -m "feat: integrate @nicobehm/media-kit demo into showcase with token mapping"
```

---

### Task 5: README del paquete (documentación de API)

**Files:**

- Modify: `packages/media-kit/README.md`

**Interfaces:**

- Produces: README publicable: instalación, quick start, tabla de props de cada componente, tabla de custom properties `--mk-*`, notas de a11y (incl. por qué `after` va aria-hidden), SSR/RSC (`'use client'` banner), licencia.

- [ ] **Step 1: Escribir README completo** con esta estructura exacta (contenido en inglés, es la cara pública del paquete):

```markdown
# @nicobehm/media-kit

Accessible media components for React 18+: a before/after **CompareSlider** and a
fullscreen **MediaLightbox**. Zero styling dependencies — plain CSS with public
custom properties. Built as part of [nicobehm's portfolio](../../README.md).

## Install / Quick start / Components (props tables) / Styling (--mk-* table) /

## Accessibility / SSR & RSC notes / License
```

Cada tabla de props: columnas Prop · Type · Default · Description, una fila por prop REAL de los tipos exportados (verificar contra el código, no inventar). Tabla `--mk-*`: una fila por custom property de styles.css con su default y qué controla. Sección Accessibility: patrón APG usado por cada componente y el razonamiento del `aria-hidden` del `after`. Sección SSR: el bundle lleva banner `'use client'`; en Next.js App Router se importa directamente en Server Components como frontera client.

- [ ] **Step 2: Verificar formato y commit**

Run: `pnpm run format:fix && pnpm run format`

```bash
git add packages/media-kit/README.md
git commit -m "docs(media-kit): document component APIs, styling hooks and a11y"
```

---

### Task 6: Cierre de fase

- [ ] **Step 1: Cadena completa** (comando del Task 4 Step 5) — verde.
- [ ] **Step 2: Grep colores hardcodeados en la app** (permitidos: globals.css, styles.css del paquete, SVGs de demo):
      `grep -rnE '#[0-9a-fA-F]{3,8}|rgb\(' apps/web/src --include='*.tsx' | grep -v globals.css` → vacío.
- [ ] **Step 3: Design review** — lente `agents/design-reviewer.md` sobre la sección media-kit de `/showcase` (ambos temas, incl. teclado en slider y lightbox) + review final de rama (requesting-code-review). Arreglar Critical/Important.
- [ ] **Step 4: Roadmap** — F2 → ✅ hecha; commit `docs: mark phase 2 as done in roadmap`.
