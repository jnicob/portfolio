import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Multiline text input primitive (textarea) consistent with the design system.
 * Respects theme tokens (`bg-surface`, `border-border`, `focus-visible:outline-ring`, `aria-invalid:border-danger`).
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
