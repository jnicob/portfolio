import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { projects } from '@/data/projects';
import { ProjectCard } from '@/components/projects/project-card';

type Props = { params: Promise<{ locale: Locale }> };

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('projects');

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-fg">{t('title')}</h1>
        <p className="text-fg-muted">{t('intro')}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={locale} headingLevel="h2" />
        ))}
      </div>
    </main>
  );
}
