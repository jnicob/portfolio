import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skills } from '@/data/skills';
import { SKILL_CATEGORIES } from '@/data/constants';
import { ExperienceEntryBlock } from './experience-entry';
import { SkillGroup } from './skill-group';
import { EducationList } from './education-list';
import type { CvViewProps } from './cv-standard';

/**
 * Vista compacta: una columna densa, sin highlights ni niveles de skill, y SIN
 * controles interactivos propios (solo enlaces de contacto) — pensada para
 * imprimir/exportar sin ruido visual (T24).
 */
export function CvCompact({ locale, strings }: CvViewProps) {
  return (
    <div className="flex flex-col gap-6 print:gap-1.5">
      <section className="flex flex-col gap-3 print:gap-1">
        <h2 className="text-lg font-semibold text-fg print:text-xs print:font-bold">
          {strings.experienceTitle}
        </h2>
        <div className="flex flex-col gap-3 print:gap-1">
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

      <section className="flex flex-col gap-3 print:gap-1">
        <h2 className="text-lg font-semibold text-fg print:text-xs print:font-bold">
          {strings.skillsTitle}
        </h2>
        <div className="flex flex-col gap-3 print:grid print:grid-cols-3 print:gap-x-4 print:gap-y-1">
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

      <section className="flex flex-col gap-3 print:gap-1">
        <h2 className="text-lg font-semibold text-fg print:text-xs print:font-bold">
          {strings.educationTitle}
        </h2>
        <EducationList education={education} locale={locale} />
      </section>
    </div>
  );
}
