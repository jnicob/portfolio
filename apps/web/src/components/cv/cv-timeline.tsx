import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { languages } from '@/data/languages';
import { skills } from '@/data/skills';
import { SKILL_CATEGORIES } from '@/data/constants';
import { Badge } from '@/components/ui/badge/badge';
import { ExperienceEntryBlock, formatExperienceRange } from './experience-entry';
import { SkillGroup } from './skill-group';
import { EducationList } from './education-list';
import { LanguageList } from './language-list';
import type { CvViewProps } from './cv-standard';

/**
 * Timeline view: experience is presented as a vertical timeline
 * (`<ol>` with marker per entry); education and languages sit below.
 * Full entries (without `dense`) — the focus of this view is
 * chronological progression rather than compactness (T24).
 */
export function CvTimeline({ locale, strings }: CvViewProps) {
  return (
    <div className="cv-timeline flex flex-col gap-6 print:gap-3">
      <section className="flex flex-col gap-6 print:gap-2">
        <h2 className="text-2xl font-semibold text-fg">{strings.experienceTitle}</h2>
        <ol className="relative flex flex-col gap-6 pl-6 print:gap-2.5 print:pl-4 before:absolute before:inset-y-1 before:left-[3px] before:w-px before:rounded-full before:bg-gradient-to-b before:from-accent/60 before:to-accent/10 before:content-['']">
          {experience.map((entry) => {
            const range = formatExperienceRange(entry, strings.present);
            return (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-6 top-1.5 size-2.5 rounded-full bg-accent ring-4 ring-accent/20 print:-left-4"
                />
                <div className="flex flex-col gap-3 rounded-card border border-border p-4 print:p-2.5 print:gap-1.5">
                  <Badge data-testid="timeline-date" variant="accent" className="w-fit">
                    {range}
                  </Badge>
                  <ExperienceEntryBlock
                    entry={entry}
                    locale={locale}
                    presentLabel={strings.present}
                    hideDates
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-6 print:grid-cols-2 print:gap-x-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            {strings.educationTitle}
          </h2>
          <EducationList education={education} locale={locale} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            {strings.languagesTitle}
          </h2>
          <LanguageList languages={languages} locale={locale} />
        </section>
      </div>

      <section className="flex flex-col gap-6 print:gap-2">
        <h2 className="text-2xl font-semibold text-fg">{strings.skillsTitle}</h2>
        <div className="flex flex-col gap-6 print:grid print:grid-cols-3 print:gap-x-6 print:gap-y-2">
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
    </div>
  );
}
