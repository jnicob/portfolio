import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Primitiva de entrada de texto multilínea (textarea) consistente con el design system.
 * Respeta tokens de tema (`bg-surface`, `border-border`, `focus-visible:outline-ring`, `aria-invalid:border-danger`).
 */
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[120px] rounded-control border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted transition-colors hover:border-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger aria-invalid:focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className,
      )}
      {...props}
    />
  );
}
