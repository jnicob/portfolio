import { cn } from '@/lib/cn';

const LEVEL_DOTS = [1, 2, 3, 4, 5] as const;

type SkillLevelProps = {
  level: number;
  label: string;
};

/**
 * Visual indicator of skill level (5 dots, bg-accent/bg-border) with accessible aria-label.
 * `role="img"` is required: a `<span aria-label>` without an implicit role has no semantic ARIA role,
 * making `aria-label` prohibited (axe: `aria-prohibited-attr`) — explicit role enables it.
 * Pure presentational, RSC-compatible.
 */
export function SkillLevel({ level, label }: SkillLevelProps) {
  return (
    <span role="img" aria-label={label} className="flex gap-1 print:hidden">
      {LEVEL_DOTS.map((dot) => (
        <span
          key={dot}
          aria-hidden="true"
          className={cn('h-2 w-2 rounded-full', dot <= level ? 'bg-accent' : 'bg-border')}
        />
      ))}
    </span>
  );
}
