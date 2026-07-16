import type { Metadata } from 'next';
import { profile } from '@/data/profile';
import { routing, type Locale } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';

export const SITE_URL = siteUrl();

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
      /*
       * Explícita a propósito: en static export la convención file-based
       * ([locale]/opengraph-image.tsx) solo inyecta og:image en el segmento
       * home; las rutas anidadas (cv, projects…) no la heredan.
       */
      images: [{ url: `${SITE_URL}/${locale}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
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
