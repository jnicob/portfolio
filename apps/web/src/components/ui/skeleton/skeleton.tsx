import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Loading placeholder shaped after content. Size via className. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-control bg-fg-muted/20', className)}
      {...props}
    />
  );
}
