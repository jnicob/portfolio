'use client';

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';

export type MobileMenuLabels = { open: string; close: string };

/**
 * Botón hamburguesa + panel disclosure (WAI-ARIA APG): sin focus trap, el foco
 * fluye libremente. Escape cierra y devuelve el foco al botón; clicar un
 * enlace del panel también cierra.
 */
export function MobileMenu({
  labels,
  children,
}: {
  labels: MobileMenuLabels;
  children: ReactNode;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function closeAndFocusButton() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAndFocusButton();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('a')) {
      closeAndFocusButton();
    }
  }

  return (
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-control border border-border text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          onClick={handlePanelClick}
          className="flex flex-col gap-4 border-t border-border py-4"
        >
          {children}
        </div>
      )}
    </div>
  );
}
