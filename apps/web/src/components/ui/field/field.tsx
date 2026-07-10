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
