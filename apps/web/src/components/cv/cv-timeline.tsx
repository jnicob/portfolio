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
 * Vista cronológica: la experiencia se recorre como una línea de tiempo vertical
 * (`<ol>` con marcador por entrada); formación queda en una sección propia más
 * discreta debajo. Entradas completas (sin `dense`) — el foco de esta vista es el
 * orden temporal, no la densidad (T24).
 */
export function CvTimeline({ locale, strings }: CvViewProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{strings.experienceTitle}</h2>
        <ol className="flex flex-col gap-8 border-l border-fg-muted pl-6">
          {experience.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.9rem] top-1.5 size-2.5 rounded-full bg-accent"
              />
              <ExperienceEntryBlock entry={entry} locale={locale} presentLabel={strings.present} />
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {strings.educationTitle}
        </h2>
        <EducationList education={education} locale={locale} />
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
