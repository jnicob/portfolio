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
    <TabsContext.Provider value={{ active, setActive, baseId }}>
      {/* Root en grid: fila 1 auto para `TabList`, fila 2 (1fr) compartida por
          todos los `TabPanel` (misma celda, ver comentario en TabPanel). */}
      <div className="grid grid-rows-[auto_1fr]">{children}</div>
    </TabsContext.Provider>
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
        // Cursor + hover reutilizan el lenguaje de Button (T14): activo ~ variante primary
        // (bg-accent + hover:bg-accent-hover). El inactivo NO puede copiar el hover
        // `hover:bg-surface` de Button ghost tal cual: `TabList` ya pinta su fondo con
        // `bg-surface`, así que ese hover quedaría invisible sobre sí mismo (verificado en
        // navegador). Se usa el siguiente escalón semántico, `border` (ya usado en todo el
        // repo como el paso "surface → un poco más marcado"), que sí contrasta. `cursor-pointer`
        // explícito porque en Tailwind v4 `<button>` ya no lo trae por defecto (A2/A3).
        'cursor-pointer rounded-control px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected
          ? 'bg-accent text-accent-fg hover:bg-accent-hover'
          : 'text-fg-muted hover:bg-border hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { active, baseId } = useTabs('TabPanel');
  const selected = active === value;
  // Ambos paneles quedan montados y comparten la misma celda de grid
  // (`col-start-1 row-start-2`, ver `Tabs`): la altura del contenedor pasa a
  // ser la del panel más alto, así que cambiar de tab no la desplaza. El
  // inactivo usa `invisible` (visibility:hidden) en vez de `hidden`
  // (display:none) — conserva su caja para que el grid siga midiéndola.
  // `aria-hidden` lo saca del árbol de accesibilidad y `tabIndex` desaparece
  // (undefined) para que no sea focusable. El activo hace fade-in 150ms.
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      aria-hidden={!selected}
      tabIndex={selected ? 0 : undefined}
      className={cn(
        'col-start-1 row-start-2 mt-3 transition-opacity duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected ? 'opacity-100' : 'invisible opacity-0',
      )}
    >
      {children}
    </div>
  );
}
