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
