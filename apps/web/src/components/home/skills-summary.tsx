import { SKILL_CATEGORIES, type Skill } from '@/data/schemas';
import { skills } from '@/data/skills';
import type { Locale } from '@/i18n/routing';
import { SkillLevel } from '@/components/cv/skill-level';

type SkillsSummaryProps = {
  locale: Locale;
  title: string;
  /** Plantilla localizada con placeholders `{name}`/`{level}`, ej. "{name}: level {level} of 5". */
  levelTemplate: string;
  /** Etiquetas localizadas de categoría (namespace `cv.categories`) — nunca el slug crudo. */
  categoryLabels: Record<Skill['category'], string>;
};

function levelLabel(template: string, name: string, level: number): string {
  return template.replace('{name}', name).replace('{level}', String(level));
}

/** Resumen de skills agrupadas por categoría, con nivel visual + accesible. RSC-compatible. */
export function SkillsSummary({ title, levelTemplate, categoryLabels }: SkillsSummaryProps) {
  return (
    <section className="flex flex-col gap-4 py-8">
      <h2 className="text-2xl font-semibold text-fg">{title}</h2>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_CATEGORIES.map((category) => {
          const categorySkills = skills.filter((skill) => skill.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
                {categoryLabels[category]}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {categorySkills.map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between gap-4">
                    <span>{skill.name}</span>
                    <SkillLevel
                      level={skill.level}
                      label={levelLabel(levelTemplate, skill.name, skill.level)}
                    />
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
