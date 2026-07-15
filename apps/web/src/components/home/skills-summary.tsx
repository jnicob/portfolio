import { SKILL_CATEGORIES } from '@/data/schemas';
import { skills } from '@/data/skills';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type SkillsSummaryProps = {
  locale: Locale;
  title: string;
  /** Plantilla localizada con placeholders `{name}`/`{level}`, ej. "{name}: level {level} of 5". */
  levelTemplate: string;
};

const LEVEL_DOTS = [1, 2, 3, 4, 5] as const;

function levelLabel(template: string, name: string, level: number): string {
  return template.replace('{name}', name).replace('{level}', String(level));
}

/** Resumen de skills agrupadas por categoría, con nivel visual + accesible. RSC-compatible. */
export function SkillsSummary({ title, levelTemplate }: SkillsSummaryProps) {
  return (
    <section className="flex flex-col gap-4 py-8">
      <h2 className="text-2xl font-semibold text-fg">{title}</h2>
      <div className="flex flex-col gap-6">
        {SKILL_CATEGORIES.map((category) => {
          const categorySkills = skills.filter((skill) => skill.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
                {category}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {categorySkills.map((skill) => (
                  <li
                    key={skill.name}
                    aria-label={levelLabel(levelTemplate, skill.name, skill.level)}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>{skill.name}</span>
                    <span className="flex gap-1">
                      {LEVEL_DOTS.map((dot) => (
                        <span
                          key={dot}
                          aria-hidden="true"
                          className={cn(
                            'h-2 w-2 rounded-full',
                            dot <= skill.level ? 'bg-accent' : 'bg-border',
                          )}
                        />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
