import type { Skill } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { languages } from '@/data/languages';
import { skills } from '@/data/skills';
import { SKILL_CATEGORIES } from '@/data/constants';
import { ExperienceEntryBlock } from './experience-entry';
import { SkillGroup } from './skill-group';
import { EducationList } from './education-list';
import { LanguageList } from './language-list';

/**
 * Localized strings resolved by the CV page (RSC) via `getTranslations` and passed to
 * the 3 views (T24) — avoids direct next-intl dependency in each view since
 * CvContent mounts them from a client boundary.
 */
export type CvStrings = {
  experienceTitle: string;
  educationTitle: string;
  languagesTitle: string;
  skillsTitle: string;
  present: string;
  contactTitle: string;
  contactGithub: string;
  contactLinkedin: string;
  briefTitle?: string;
  showBrief?: string;
  hideBrief?: string;
  showPhoto?: string;
  hidePhoto?: string;
  categories: Record<Skill['category'], string>;
};

export type CvViewProps = { locale: Locale; strings: CvStrings };

/**
 * Standard CV view: full sections (experience with highlights, skills with
 * level, education, languages, contact). Original T9 layout extracted into a component
 * so CvContent (T24) can switch between the 3 views over the same data.
 */
export function CvStandard({ locale, strings }: CvViewProps) {
  return (
    <div data-cv-sections className="flex flex-col gap-6">
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{strings.experienceTitle}</h2>
        <div data-cv-experience className="flex flex-col gap-8">
          {experience.map((entry) => (
            <ExperienceEntryBlock
              key={entry.id}
              entry={entry}
              locale={locale}
              presentLabel={strings.present}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{strings.skillsTitle}</h2>
        <div className="flex flex-col gap-6 print:grid print:grid-cols-3 print:gap-x-6 print:gap-y-4">
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
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{strings.educationTitle}</h2>
        <EducationList education={education} locale={locale} />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{strings.languagesTitle}</h2>
        <LanguageList languages={languages} locale={locale} />
      </section>
    </div>
  );
}
