import type { Skill } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { SkillLevel } from './skill-level';

type SkillGroupProps = {
  category: Skill['category'];
  /** Localized category label (namespace `cv.categories`) — never raw slug. */
  categoryLabel: string;
  skills: Skill[];
  locale: Locale;
  /** Hides level dots — used by compact/timeline views (T24). */
  showLevel?: boolean;
};

/**
 * Group of skills for a category rendered as clean pills/chips ordered by proficiency
 * (or with optional level indicator when `showLevel` is true).
 * Pure presentational, RSC-compatible. Reused across the 3 CV views (T9/T24).
 */
export function SkillGroup({ categoryLabel, skills, showLevel = false }: SkillGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {categoryLabel}
      </h3>
      {showLevel ? (
        <ul className="flex flex-col gap-1.5">
          {skills.map((skill) => (
            <li key={skill.name} className="flex items-center justify-between gap-4">
              <span>{skill.name}</span>
              <SkillLevel level={skill.level} label={`${skill.name}: ${skill.level}/5`} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-wrap gap-1.5 print:gap-1">
          {skills.map((skill) => (
            <li
              key={skill.name}
              className="rounded-badge border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-fg print:px-1.5 print:py-0 print:text-[9px]"
            >
              {skill.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
