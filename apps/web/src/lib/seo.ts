import type { Metadata } from 'next';
import { profile } from '@/data/profile';
import { routing, type Locale } from '@/i18n/routing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example-placeholder.dev';

type LocalizedPageMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
};

export function localizedPageMetadata({
  locale,
  path,
  title,
  description,
}: LocalizedPageMetadataInput): Metadata {
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${SITE_URL}/${loc}${path}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages,
    },
    openGraph: {
      title,
      description,
      locale,
      type: 'website',
    },
  };
}

export function personJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline[locale],
    url: SITE_URL,
    sameAs: [profile.links.github, profile.links.linkedin],
  };
}
