import { profile } from '@/data/profile';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skills } from '@/data/skills';
import { SKILL_CATEGORIES } from '@/data/schemas';
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
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">{strings.experienceTitle}</h2>
        <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-3">
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fg">{strings.educationTitle}</h2>
        <EducationList education={education} locale={locale} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-fg">{strings.contactTitle}</h2>
        <div className="flex gap-4 text-sm">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`${strings.contactGithub} — ${profile.name}`}
            className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {strings.contactGithub}
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${strings.contactLinkedin} — ${profile.name}`}
            className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {strings.contactLinkedin}
          </a>
        </div>
      </section>
    </div>
  );
}
