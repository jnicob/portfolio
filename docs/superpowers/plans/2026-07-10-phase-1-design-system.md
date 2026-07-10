# Fase 1: Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tokens semánticos con theming dark/light, primitivas UI accesibles con variantes cva, y página `/showcase` (kitchen sink) que las demuestra todas.

**Architecture:** Tokens CSS en `globals.css`: valores por tema bajo `:root[data-theme='dark'|'light']`, expuestos a Tailwind v4 vía `@theme inline` (utilities `bg-bg`, `text-fg`, `bg-accent`…). Tipografía Geist/Geist Mono self-hosted (paquete `geist`, sin descarga en build). Theme switching: script inline pre-hidratación (sin flash) + componente client `ThemeSwitcher`; la lógica pura (`resolveInitialTheme`) se desarrolla con TDD. Primitivas en `apps/web/src/components/ui/<name>/` (carpeta por componente: impl + test + index), server-safe salvo las interactivas.

**Tech Stack:** Tailwind v4 (`@theme inline`), `geist`, `class-variance-authority` + `clsx` + `tailwind-merge`, Testing Library (react, user-event, jest-dom) + jsdom.

## Global Constraints

- Ver Global Constraints del roadmap (`2026-07-10-portfolio-roadmap.md`) — aplican enteras.
- **Cero colores hardcodeados** en componentes: ni hex, ni `rgb()`, ni clases de paleta Tailwind (`bg-zinc-900`, `text-white`). Solo utilities semánticas de los tokens (skill `tailwind-tokens`).
- Acento: **violeta eléctrico**. Fuentes: **Geist + Geist Mono**. Dark por defecto.
- Interfaz prometida a F2/F3/F4 (roadmap): tokens `--color-*`/`--font-*`/`--radius-*` vía `@theme inline`; primitivas Button, Card, Input, Select, Tabs, Badge, Skeleton en `apps/web/src/components/ui/`; showcase (en F1 vive en `/showcase`; F3 la moverá bajo `/[locale]/`).
- TDD para toda lógica y comportamiento interactivo (RED→GREEN con evidencia). Componentes puramente presentacionales: test de render + variantes.
- Tras cada task: `pnpm run lint && pnpm run format && pnpm run typecheck && pnpm run test` verdes. Commit por task.
- Los tests de componentes verifican comportamiento accesible (roles, teclado), no detalles de implementación.

---

### Task 1: Tokens semánticos + fuentes + tema por defecto

**Files:**

- Modify: `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`
- Create: (ninguno)

**Interfaces:**

- Produces: utilities Tailwind `bg-bg`, `bg-surface`, `text-fg`, `text-fg-muted`, `bg-accent`, `hover:bg-accent-hover`, `text-accent-fg`, `border-border`, `outline-ring`, `bg-danger`, `text-danger-fg`, `font-sans`, `font-mono`, `rounded-card`, `rounded-control` — las consumen TODAS las tasks siguientes y F2-F4.

- [ ] **Step 1: Instalar la fuente**

```bash
pnpm --filter web add geist
```

- [ ] **Step 2: Reemplazar `globals.css` entero**

```css
@import 'tailwindcss';

/*
 * Tokens semánticos (skill: tailwind-tokens).
 * Los componentes usan SOLO las utilities derivadas (bg-bg, text-fg, bg-accent…).
 * Valores por tema abajo; @theme inline los expone a Tailwind v4.
 */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-fg: var(--accent-fg);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-danger: var(--danger);
  --color-danger-fg: var(--danger-fg);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --radius-card: 0.75rem;
  --radius-control: 0.5rem;
}

/* Tema oscuro (por defecto) — acento violeta eléctrico */
:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0a0a0f;
  --surface: #14141c;
  --fg: #ededf2;
  --fg-muted: #a0a0b2;
  --accent: #8b7cf7;
  --accent-hover: #a396f9;
  --accent-fg: #0a0a0f;
  --border: #26262f;
  --ring: #8b7cf7;
  --danger: #f87171;
  --danger-fg: #0a0a0f;
}

:root[data-theme='light'] {
  color-scheme: light;
  --bg: #fafafa;
  --surface: #ffffff;
  --fg: #17171c;
  --fg-muted: #5c5c6b;
  --accent: #5b4bd6;
  --accent-hover: #4a3ac2;
  --accent-fg: #ffffff;
  --border: #e4e4ea;
  --ring: #5b4bd6;
  --danger: #dc2626;
  --danger-fg: #ffffff;
}

body {
  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-geist-sans);
}
```

- [ ] **Step 3: Layout con fuentes + script anti-flash**

`apps/web/src/app/layout.tsx` completo:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nico Behm — Full-stack engineer',
  description: 'Portfolio (en construcción). Fase 1.',
};

/*
 * Se ejecuta antes de la hidratación para evitar flash de tema:
 * stored > preferencia del sistema > dark (por defecto).
 * Mantener en sincronía con resolveInitialTheme (theme.ts).
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `pnpm --filter web build && pnpm run lint && pnpm run format:fix && pnpm run format && pnpm run typecheck && pnpm run test`
Expected: todo verde; el build estático genera `out/`.

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat: add semantic design tokens, Geist fonts and no-flash theme init"
```

---

### Task 2: Lógica de tema (TDD) + ThemeSwitcher

**Files:**

- Create: `apps/web/src/lib/theme.ts`, `apps/web/src/lib/theme.test.ts`, `apps/web/src/components/layout/theme-switcher.tsx`

**Interfaces:**

- Consumes: tokens de Task 1.
- Produces: `type Theme = 'dark' | 'light'`; `resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme`; `applyTheme(theme: Theme): void` (muta `documentElement.dataset.theme` + localStorage); componente `<ThemeSwitcher />` (client) que F3 colocará en el header.

- [ ] **Step 1: Test failing (jsdom se configura en Task 3 — este test es puro, corre en node)**

`apps/web/src/lib/theme.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveInitialTheme } from './theme';

describe('resolveInitialTheme', () => {
  it('respeta el tema almacenado', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
    expect(resolveInitialTheme('dark', true)).toBe('dark');
  });

  it('cae a la preferencia del sistema sin almacenado', () => {
    expect(resolveInitialTheme(null, true)).toBe('light');
    expect(resolveInitialTheme(null, false)).toBe('dark');
  });

  it('ignora valores corruptos y usa la preferencia', () => {
    expect(resolveInitialTheme('wat', false)).toBe('dark');
    expect(resolveInitialTheme('wat', true)).toBe('light');
  });
});
```

Run: `pnpm --filter web test`
Expected: FAIL — `Cannot find module './theme'`.

- [ ] **Step 2: Implementación mínima**

`apps/web/src/lib/theme.ts`:

```ts
export type Theme = 'dark' | 'light';

/** stored > preferencia del sistema > dark. Mantener en sincronía con themeInitScript (layout). */
export function resolveInitialTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersLight ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* almacenamiento no disponible (p.ej. modo privado): el tema aplica solo a la sesión */
  }
}
```

Run: `pnpm --filter web test` → PASS.

- [ ] **Step 3: ThemeSwitcher**

`apps/web/src/components/layout/theme-switcher.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { applyTheme, type Theme } from '@/lib/theme';

/** Botón de cambio de tema. El estado inicial se lee del DOM (fijado por themeInitScript). */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  if (theme === null) {
    // Aún sin hidratar: reservar espacio para evitar layout shift.
    return <span aria-hidden className="inline-block size-9" />;
  }

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      className="inline-flex size-9 items-center justify-center rounded-control border border-border text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

- [ ] **Step 4: Verificar cadena completa y commit**

Run: `pnpm run lint && pnpm run format:fix && pnpm run format && pnpm run typecheck && pnpm run test`

```bash
git add apps/web
git commit -m "feat: add theme logic (TDD) and ThemeSwitcher component"
```

---

### Task 3: Setup de tests de componentes + helper `cn` + Button (TDD)

**Files:**

- Modify: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.setup.ts`, `apps/web/src/lib/cn.ts`, `apps/web/src/components/ui/button/button.tsx`, `apps/web/src/components/ui/button/button.test.tsx`, `apps/web/src/components/ui/button/index.ts`

**Interfaces:**

- Produces: `cn(...inputs)` (clsx + tailwind-merge); `<Button variant="primary|secondary|ghost|danger" size="sm|md|lg" />` (props nativas de `button` incluidas); patrón de carpeta `ui/<name>/{impl,test,index}` que siguen las tasks 4-6.

- [ ] **Step 1: Dependencias**

```bash
pnpm --filter web add class-variance-authority clsx tailwind-merge
pnpm --filter web add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Si alguna versión exige Node ≥ 20.19 (entorno local: 20.17), pinnear a la última compatible y AÑADIR FILA a `docs/decisions/2026-07-10-dependency-pins.md` en el mismo commit.

- [ ] **Step 2: Config de vitest a jsdom**

`apps/web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

`apps/web/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Run: `pnpm --filter web test` → los 6 tests existentes siguen PASS (jsdom es superset para tests puros).

- [ ] **Step 3: Helper `cn`**

`apps/web/src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases condicionales y resuelve conflictos de utilities Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Test failing de Button**

`apps/web/src/components/ui/button/button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renderiza un botón nativo con su contenido', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('dispara onClick al activarse con teclado', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('no dispara onClick cuando está disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica clases por variante y tamaño', () => {
    render(
      <Button variant="danger" size="sm">
        Borrar
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-danger');
    expect(btn.className).toContain('h-8');
  });
});
```

Run: `pnpm --filter web test` → FAIL (`Cannot find module './button'`).

- [ ] **Step 5: Implementación**

`apps/web/src/components/ui/button/button.tsx`:

```tsx
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
        secondary: 'border border-border bg-surface text-fg hover:border-fg-muted',
        ghost: 'text-fg hover:bg-surface',
        danger: 'bg-danger text-danger-fg hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

`apps/web/src/components/ui/button/index.ts`:

```ts
export { Button, type ButtonProps } from './button';
```

Run: `pnpm --filter web test` → PASS (todos).

- [ ] **Step 6: Cadena completa y commit**

Run: `pnpm run lint && pnpm run format:fix && pnpm run format && pnpm run typecheck && pnpm run test`

```bash
git add apps/web docs/decisions 2>/dev/null || git add apps/web
git commit -m "feat: add component test setup, cn helper and Button primitive (TDD)"
```

---

### Task 4: Badge, Skeleton y Card

**Files:**

- Create: `apps/web/src/components/ui/badge/{badge.tsx,badge.test.tsx,index.ts}`, `apps/web/src/components/ui/skeleton/{skeleton.tsx,skeleton.test.tsx,index.ts}`, `apps/web/src/components/ui/card/{card.tsx,card.test.tsx,index.ts}`

**Interfaces:**

- Consumes: `cn`, tokens, patrón de carpeta de Task 3.
- Produces: `<Badge variant="neutral|accent|danger">`; `<Skeleton className>` (aria-hidden, animate-pulse); `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>` (composición por children).

- [ ] **Step 1: Tests failing (los tres a la vez — misma mecánica render+clases)**

`badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renderiza el contenido con la variante', () => {
    render(<Badge variant="accent">NEW</Badge>);
    const el = screen.getByText('NEW');
    expect(el.className).toContain('bg-accent/15');
  });
});
```

`skeleton.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('está oculto para tecnologías de asistencia', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.className).toContain('animate-pulse');
  });
});
```

`card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('compone header, título y contenido', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Proyecto</CardTitle>
        </CardHeader>
        <CardContent>Detalle</CardContent>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Proyecto' })).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });
});
```

Run: `pnpm --filter web test` → FAIL (3 módulos inexistentes).

- [ ] **Step 2: Implementaciones**

`badge.tsx`:

```tsx
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'border border-border bg-surface text-fg-muted',
        accent: 'bg-accent/15 text-accent',
        danger: 'bg-danger/15 text-danger',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

`skeleton.tsx`:

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Placeholder de carga con forma del contenido. Dimensionar vía className. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-control bg-border', className)}
      {...props}
    />
  );
}
```

`card.tsx`:

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-card border border-border bg-surface text-fg', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-lg font-semibold leading-none', className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0 text-fg-muted', className)} {...props} />;
}
```

Cada `index.ts` re-exporta su componente y tipos (mismo patrón que button).

Run: `pnpm --filter web test` → PASS.

- [ ] **Step 3: Cadena completa y commit**

```bash
git add apps/web
git commit -m "feat: add Badge, Skeleton and Card primitives"
```

---

### Task 5: Input y Select (formularios accesibles)

**Files:**

- Create: `apps/web/src/components/ui/field/{field.tsx,field.test.tsx,index.ts}`, `apps/web/src/components/ui/input/{input.tsx,input.test.tsx,index.ts}`, `apps/web/src/components/ui/select/{select.tsx,select.test.tsx,index.ts}`

**Interfaces:**

- Consumes: `cn`, tokens.
- Produces: `<Field label error hint htmlFor>{control}</Field>` (label visible + error con `role='alert'` enlazado por aria-describedby); `<Input />` y `<Select options>` (nativos estilizados) que aceptan `aria-invalid` y `aria-describedby` passthrough. El playground (F4) construye su form con estos.

- [ ] **Step 1: Tests failing**

`field.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from './field';
import { Input } from '../input';

describe('Field', () => {
  it('asocia label y control', () => {
    render(
      <Field label="Prompt" htmlFor="prompt">
        <Input id="prompt" />
      </Field>,
    );
    expect(screen.getByLabelText('Prompt')).toBeInTheDocument();
  });

  it('expone el error como alert enlazado', () => {
    render(
      <Field label="Prompt" htmlFor="p" error="Obligatorio">
        <Input id="p" aria-describedby="p-error" aria-invalid />
      </Field>,
    );
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Obligatorio');
    expect(error).toHaveAttribute('id', 'p-error');
    expect(screen.getByLabelText('Prompt')).toHaveAttribute('aria-invalid', 'true');
  });
});
```

`input.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('acepta texto', async () => {
    render(<Input aria-label="Nombre" />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Nico');
    expect(screen.getByRole('textbox')).toHaveValue('Nico');
  });
});
```

`select.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

const options = [
  { value: '1_1', label: '1:1' },
  { value: '16_9', label: '16:9' },
];

describe('Select', () => {
  it('selecciona una opción con teclado', async () => {
    render(<Select aria-label="Aspect ratio" options={options} defaultValue="1_1" />);
    const select = screen.getByRole('combobox', { name: 'Aspect ratio' });
    await userEvent.selectOptions(select, '16_9');
    expect(select).toHaveValue('16_9');
  });
});
```

Run: `pnpm --filter web test` → FAIL.

- [ ] **Step 2: Implementaciones**

`field.tsx`:

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type FieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
};

/**
 * Envuelve un control de formulario con label, hint y error accesibles.
 * El control hijo debe recibir id={htmlFor} y, si hay error,
 * aria-invalid + aria-describedby={`${htmlFor}-error`}.
 */
export function Field({ label, htmlFor, children, hint, error, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-fg-muted">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

`input.tsx`:

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-control border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}
```

`select.tsx`:

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type SelectOption = { value: string; label: string };

export type SelectProps = ComponentProps<'select'> & { options: SelectOption[] };

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-control border border-border bg-bg px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger',
        className,
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

Cada `index.ts` re-exporta (patrón de Task 3).

Run: `pnpm --filter web test` → PASS.

- [ ] **Step 3: Cadena completa y commit**

```bash
git add apps/web
git commit -m "feat: add accessible Field, Input and Select form primitives (TDD)"
```

---

### Task 6: Tabs (patrón WAI-ARIA APG, TDD)

**Files:**

- Create: `apps/web/src/components/ui/tabs/{tabs.tsx,tabs.test.tsx,index.ts}`

**Interfaces:**

- Consumes: `cn`, tokens.
- Produces: `<Tabs defaultValue><TabList label><Tab value>…</Tab></TabList><TabPanel value>…</TabPanel></Tabs>` — client component con roving tabindex. El playground (F4) lo usa para Preview/API.

- [ ] **Step 1: Test failing (comportamiento APG, no implementación)**

`tabs.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from './tabs';

function renderTabs() {
  return render(
    <Tabs defaultValue="preview">
      <TabList label="Resultado">
        <Tab value="preview">Preview</Tab>
        <Tab value="api">API</Tab>
      </TabList>
      <TabPanel value="preview">panel-preview</TabPanel>
      <TabPanel value="api">panel-api</TabPanel>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('marca la pestaña activa y muestra solo su panel', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-preview')).toBeVisible();
    expect(screen.queryByText('panel-api')).not.toBeInTheDocument();
  });

  it('cambia con click', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('tab', { name: 'API' }));
    expect(screen.getByText('panel-api')).toBeVisible();
  });

  it('navega con flechas (roving tabindex, con wrap)', async () => {
    renderTabs();
    screen.getByRole('tab', { name: 'Preview' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'API' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'API' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveFocus();
  });

  it('solo la pestaña activa es tabulable', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'API' })).toHaveAttribute('tabindex', '-1');
  });
});
```

Run: `pnpm --filter web test` → FAIL.

- [ ] **Step 2: Implementación**

`tabs.tsx`:

```tsx
'use client';

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type TabsContextValue = {
  active: string;
  setActive: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${component} debe usarse dentro de <Tabs>`);
  return ctx;
}

export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ active, setActive, baseId }}>{children}</TabsContext.Provider>
  );
}

export function TabList({ label, children }: { label: string; children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);

  // Activación con flechas siguiendo APG: selección sigue al foco, con wrap.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(current + delta + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="inline-flex gap-1 rounded-control border border-border bg-surface p-1"
    >
      {children}
    </div>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { active, setActive, baseId } = useTabs('Tab');
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActive(value)}
      className={cn(
        'rounded-control px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected ? 'bg-accent text-accent-fg' : 'text-fg-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { active, baseId } = useTabs('TabPanel');
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className="mt-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </div>
  );
}
```

`index.ts` re-exporta los cuatro.

Run: `pnpm --filter web test` → PASS.

- [ ] **Step 3: Cadena completa y commit**

```bash
git add apps/web
git commit -m "feat: add accessible Tabs following WAI-ARIA APG (TDD)"
```

---

### Task 7: Página showcase (kitchen sink)

**Files:**

- Create: `apps/web/src/app/showcase/page.tsx`
- Modify: `apps/web/src/app/page.tsx` (enlazar showcase)

**Interfaces:**

- Consumes: TODAS las primitivas (tasks 2-6).
- Produces: ruta `/showcase` con cada componente en todas sus variantes y estados (incl. disabled, error, loading). F3 la moverá bajo `[locale]`. Es la página que audita el agent `design-reviewer`.

- [ ] **Step 1: Página**

`apps/web/src/app/showcase/page.tsx` — server component; secciones por primitiva. Estructura exacta:

```tsx
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/tabs';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

export const metadata: Metadata = { title: 'Showcase — UI primitives' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">UI primitives</h1>
          <p className="mt-1 text-fg-muted">
            Kitchen sink del design system — todas las variantes y estados, en ambos temas.
          </p>
        </div>
        <ThemeSwitcher />
      </header>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-3">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Case study</CardTitle>
            </CardHeader>
            <CardContent>Composición por children: header, título y contenido.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado loading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Formulario (Field + Input + Select)">
        <div className="grid max-w-md gap-4">
          <Field label="Prompt" htmlFor="demo-prompt" hint="Describe la imagen a generar.">
            <Input id="demo-prompt" placeholder="A serene mountain landscape" />
          </Field>
          <Field label="Aspect ratio" htmlFor="demo-ratio">
            <Select
              id="demo-ratio"
              options={[
                { value: '1_1', label: '1:1' },
                { value: '16_9', label: '16:9' },
                { value: '9_16', label: '9:16' },
              ]}
            />
          </Field>
          <Field label="Con error" htmlFor="demo-error" error="Este campo es obligatorio.">
            <Input id="demo-error" aria-invalid aria-describedby="demo-error-error" />
          </Field>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="preview">
          <TabList label="Ejemplo de resultado">
            <Tab value="preview">Preview</Tab>
            <Tab value="api">API</Tab>
          </TabList>
          <TabPanel value="preview">
            <Card>
              <CardContent className="pt-6">Contenido del preview.</CardContent>
            </Card>
          </TabPanel>
          <TabPanel value="api">
            <pre className="overflow-x-auto rounded-card border border-border bg-surface p-4 font-mono text-sm text-fg-muted">
              {`{ "status": "ok" }`}
            </pre>
          </TabPanel>
        </Tabs>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Enlazar desde la home provisional**

En `apps/web/src/app/page.tsx`, dentro de `<main>`, añadir tras el `<h1>`:

```tsx
<a
  href="/showcase"
  className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
>
  Ver showcase de componentes →
</a>
```

- [ ] **Step 3: Verificar builds + cadena y commit**

Run: `pnpm --filter web build && NEXT_OUTPUT_MODE=node pnpm --filter web build && pnpm run lint && pnpm run format:fix && pnpm run format && pnpm run typecheck && pnpm run test`
Expected: `/showcase` aparece como ruta estática (○) en ambos builds; todo verde.

```bash
git add apps/web
git commit -m "feat: add showcase page exercising all UI primitives"
```

---

### Task 8: Cierre de fase

- [ ] **Step 1: Grep de colores hardcodeados (check de la skill tailwind-tokens)**

Run: `grep -rnE '#[0-9a-fA-F]{3,8}|rgb\(' apps/web/src/components apps/web/src/app --include='*.tsx' | grep -v globals.css`
Expected: sin resultados.

- [ ] **Step 2: Cadena completa de verificación** (comando del Task 7 Step 3) — verde.

- [ ] **Step 3: Design review** — ejecutar la lente `agents/design-reviewer.md` sobre `/showcase` en ambos temas + review de código de la fase. Arreglar Critical/Important.

- [ ] **Step 4: Actualizar roadmap** (F1 → ✅ hecha) y commitear:

```bash
git add docs/superpowers/plans/2026-07-10-portfolio-roadmap.md
git commit -m "docs: mark phase 1 as done in roadmap"
```
