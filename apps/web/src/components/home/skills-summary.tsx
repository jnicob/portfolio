import { SKILL_CATEGORIES } from '@/data/constants';
import type { Skill } from '@/data/schemas';
import { skills } from '@/data/skills';
import type { Locale } from '@/i18n/routing';

type SkillsSummaryProps = {
  locale: Locale;
  title: string;
  /** Optional legacy localized template with `{name}`/`{level}` placeholders. */
  levelTemplate?: string;
  /** Localized category labels (`cv.categories` namespace) — never the raw slug. */
  categoryLabels: Record<Skill['category'], string>;
};

/** Skills summary grouped by category and rendered as clean pills/chips ordered by proficiency. RSC-compatible. */
export function SkillsSummary({ title, categoryLabels }: SkillsSummaryProps) {
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
              <ul className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <li
                    key={skill.name}
                    className="rounded-badge border border-border bg-surface px-3 py-1 text-sm font-medium text-fg"
                  >
                    {skill.name}
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
