import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { Skill } from '@/data/schemas';
import { CvContent } from '@/components/cv/cv-content';
import type { CvStrings } from '@/components/cv/cv-standard';
import type { CvViewSwitcherLabels } from '@/components/cv/cv-view-switcher';
import { JsonLd } from '@/components/seo/json-ld';
import { localizedPageMetadata, personJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cv' });
  return localizedPageMetadata({
    locale,
    path: '/cv',
    title: t('meta.title'),
    description: t('meta.description'),
  });
}

export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cv');
  const tFooter = await getTranslations('footer');
  const tShare = await getTranslations('share');
  const categoryLabels = t.raw('categories') as Record<Skill['category'], string>;

  const strings: CvStrings = {
    experienceTitle: t('experienceTitle'),
    educationTitle: t('educationTitle'),
    skillsTitle: t('skillsTitle'),
    present: t('present'),
    contactTitle: t('contactTitle'),
    contactGithub: tFooter('github'),
    contactLinkedin: tFooter('linkedin'),
    categories: categoryLabels,
  };

  const switcherLabels: CvViewSwitcherLabels = {
    groupLabel: t('viewsLabel'),
    standard: t('views.standard'),
    compact: t('views.compact'),
    timeline: t('views.timeline'),
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
      <JsonLd data={personJsonLd(locale)} />
      <h1 className="text-3xl font-semibold text-fg">{t('title')}</h1>
      <CvContent
        locale={locale}
        strings={strings}
        switcherLabels={switcherLabels}
        shareLabels={{ share: tShare('share'), copied: tShare('copied'), error: tShare('error') }}
      />
    </main>
  );
}
