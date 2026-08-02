import { cn } from '@/lib/cn';

const LEVEL_DOTS = [1, 2, 3, 4, 5] as const;

type SkillLevelProps = {
  level: number;
  label: string;
};

/**
 * Indicador visual de nivel de skill (5 puntos, bg-accent/bg-border) con aria-label
 * accesible. `role="img"` es necesario: un `<span aria-label>` sin rol implícito no
 * tiene semántica ARIA propia, así que `aria-label` queda "prohibido" ahí (axe:
 * `aria-prohibited-attr`) — el rol explícito lo habilita. Extraído de T7
 * (`SkillsSummary`) para compartirlo con `SkillGroup` (T9/T24). Presentacional puro,
 * RSC-compatible.
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
