import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { SKILL_CATEGORIES, type Skill } from '@/data/schemas';
import { profile } from '@/data/profile';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skills } from '@/data/skills';
import { ExperienceEntryBlock } from '@/components/cv/experience-entry';
import { SkillGroup } from '@/components/cv/skill-group';
import { EducationList } from '@/components/cv/education-list';

type Props = { params: Promise<{ locale: Locale }> };

export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cv');
  const tFooter = await getTranslations('footer');
  const categoryLabels = t.raw('categories') as Record<Skill['category'], string>;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
      <h1 className="text-3xl font-semibold text-fg">{t('title')}</h1>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{t('experienceTitle')}</h2>
        <div className="flex flex-col gap-8">
          {experience.map((entry) => (
            <ExperienceEntryBlock
              key={entry.id}
              entry={entry}
              locale={locale}
              presentLabel={t('present')}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{t('skillsTitle')}</h2>
        <div className="flex flex-col gap-6">
          {SKILL_CATEGORIES.map((category) => {
            const categorySkills = skills.filter((skill) => skill.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <SkillGroup
                key={category}
                category={category}
                categoryLabel={categoryLabels[category]}
                skills={categorySkills}
                locale={locale}
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-fg">{t('educationTitle')}</h2>
        <EducationList education={education} locale={locale} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-fg">{t('contactTitle')}</h2>
        <div className="flex gap-4 text-sm">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`${tFooter('github')} — ${profile.name}`}
            className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tFooter('github')}
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${tFooter('linkedin')} — ${profile.name}`}
            className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tFooter('linkedin')}
          </a>
        </div>
      </section>
    </main>
  );
}
