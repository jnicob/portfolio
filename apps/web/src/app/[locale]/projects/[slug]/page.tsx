import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { compileProject, getProjectSlugs } from '@/lib/content';
import { localizedPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const slug of await getProjectSlugs(locale)) params.push({ locale, slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await compileProject(locale, slug);
  if (!project) return {};
  return localizedPageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await compileProject(locale, slug);
  if (!project) notFound();
  const { frontmatter, content } = project;
  const t = await getTranslations('projects');
  return (
    <main data-project-article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/projects" className="text-sm text-fg-muted hover:text-fg">
        ← {t('backToList')}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">{frontmatter.title}</h1>
      <p className="mt-2 text-fg-muted">{frontmatter.summary}</p>
      {frontmatter.metrics.length > 0 && (
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          {frontmatter.metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-sm text-fg-muted">{metric.label}</dt>
              <dd className="font-mono">{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <article className="prose-portfolio mt-10">{content}</article>
    </main>
  );
}
