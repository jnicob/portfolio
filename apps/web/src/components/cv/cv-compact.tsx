import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { languages } from '@/data/languages';
import { skills } from '@/data/skills';
import { SKILL_CATEGORIES } from '@/data/constants';
import { ExperienceEntryBlock } from './experience-entry';
import { SkillGroup } from './skill-group';
import { EducationList } from './education-list';
import { LanguageList } from './language-list';
import type { CvViewProps } from './cv-standard';

/**
 * Compact view: a dense single column without highlights or skill levels, and
 * without own interactive controls (contact links only) — designed for
 * clean print/export without visual noise (T24).
 */
export function CvCompact({ locale, strings }: CvViewProps) {
  return (
    <div className="cv-compact flex flex-col gap-6 print:gap-2">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">{strings.experienceTitle}</h2>
        <div className="flex flex-col gap-4">
          {experience.map((entry) => (
            <ExperienceEntryBlock
              key={entry.id}
              entry={entry}
              locale={locale}
              presentLabel={strings.present}
              dense
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">{strings.skillsTitle}</h2>
        <div className="flex flex-col gap-3 print:grid print:grid-cols-3 print:gap-x-6 print:gap-y-4">
          {SKILL_CATEGORIES.map((category) => {
            const categorySkills = skills.filter((skill) => skill.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <SkillGroup
                key={category}
                category={category}
                categoryLabel={strings.categories[category]}
                skills={categorySkills}
                locale={locale}
                showLevel={false}
              />
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 print:grid-cols-2 print:gap-x-8 print:gap-y-2">
        <section className="flex flex-col gap-3 print:gap-1">
          <h2 className="text-lg font-semibold text-fg">{strings.educationTitle}</h2>
          <EducationList education={education} locale={locale} />
        </section>

        <section className="flex flex-col gap-3 print:gap-1">
          <h2 className="text-lg font-semibold text-fg">{strings.languagesTitle}</h2>
          <LanguageList languages={languages} locale={locale} />
        </section>
      </div>
    </div>
  );
}
