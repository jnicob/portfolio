import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type SelectOption = { value: string; label: string };

export type SelectProps = ComponentProps<'select'> & { options: SelectOption[] };

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger aria-invalid:focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-50',
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
