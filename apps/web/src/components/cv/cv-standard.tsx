import type { Skill } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { profile } from '@/data/profile';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skills } from '@/data/skills';
import { SKILL_CATEGORIES } from '@/data/constants';
import { ExperienceEntryBlock } from './experience-entry';
import { SkillGroup } from './skill-group';
import { EducationList } from './education-list';

/**
 * Strings localizados que la página CV (RSC) resuelve vía `getTranslations` y pasa a
 * las 3 vistas (T24) — evita que cada vista dependa de next-intl directamente, ya que
 * CvContent las monta desde un client boundary.
 */
export type CvStrings = {
  experienceTitle: string;
  educationTitle: string;
  skillsTitle: string;
  present: string;
  contactTitle: string;
  contactGithub: string;
  contactLinkedin: string;
  categories: Record<Skill['category'], string>;
};

export type CvViewProps = { locale: Locale; strings: CvStrings };

/**
 * Vista estándar del CV: secciones completas (experiencia con highlights, skills con
 * nivel, formación, contacto). Es el layout original de T9, extraído a componente para
 * que CvContent (T24) pueda alternar entre las 3 vistas sobre los mismos datos.
 */
export function CvStandard({ locale, strings }: CvViewProps) {
  return (
    <div data-cv-sections className="flex flex-col gap-10">
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
        <div className="flex flex-col gap-6">
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

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-fg">{strings.contactTitle}</h2>
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
