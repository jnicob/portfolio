import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Skill } from '@/data/schemas';
import { Hero } from '@/components/home/hero';
import { FeaturedProjects } from '@/components/home/featured-projects';
import { SkillsSummary } from '@/components/home/skills-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tCv = await getTranslations('cv');
  const categoryLabels = tCv.raw('categories') as Record<Skill['category'], string>;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
      <Hero locale={locale} cvLabel={t('cvCta')} />
      <FeaturedProjects locale={locale} title={t('featuredTitle')} />
      <SkillsSummary
        locale={locale}
        title={t('skillsTitle')}
        levelTemplate={t.raw('skillLevel')}
        categoryLabels={categoryLabels}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('playgroundTitle')}</CardTitle>
        </CardHeader>
        <CardContent>{t('playgroundSoon')}</CardContent>
      </Card>
      <Link
        href="/showcase"
        className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t('showcaseCta')}
      </Link>
    </main>
  );
}
