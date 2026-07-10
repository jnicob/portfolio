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
