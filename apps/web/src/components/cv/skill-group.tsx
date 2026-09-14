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
 * Group of skills for a category with optional level indicator.
 * Pure presentational, RSC-compatible. Reused across the 3 CV views (T9/T24).
 *
 * Level aria-label uses the numeric format "name: level/5": the N/5 ratio
 * is understood equally in both locales without requiring an extra translated template.
 */
export function SkillGroup({ categoryLabel, skills, showLevel = true }: SkillGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {categoryLabel}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {skills.map((skill) => (
          <li key={skill.name} className="flex items-center justify-between gap-4">
            <span>{skill.name}</span>
            {showLevel && (
              <SkillLevel level={skill.level} label={`${skill.name}: ${skill.level}/5`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
