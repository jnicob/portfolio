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
 * Wraps a form control with accessible label, hint, and error message.
 * The child control must receive id={htmlFor} and, when an error is present,
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
