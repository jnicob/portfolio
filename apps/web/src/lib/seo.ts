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

export const GEO_METADATA = {
  'geo.region': 'ES-AL',
  'geo.placename': 'Aguadulce, Almería',
  'geo.position': '36.8167;-2.5667',
  ICBM: '36.8167, -2.5667',
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
       * Purposefully explicit: in static export, the file-based convention
       * ([locale]/opengraph-image.tsx) only injects og:image into the home
       * segment; nested routes (cv, projects…) do not inherit it.
       */
      images: [{ url: `${SITE_URL}/${locale}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    other: {
      ...GEO_METADATA,
    },
  };
}

export function personJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline[locale],
    description: profile.summary.paragraphs[locale][0],
    url: SITE_URL,
    image: `${SITE_URL}/profile/hero-portrait.webp`,
    nationality: {
      '@type': 'Country',
      name: 'Argentina',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Aguadulce, Roquetas de Mar',
      addressRegion: 'Almería',
      addressCountry: 'ES',
    },
    homeLocation: {
      '@type': 'Place',
      name: 'Aguadulce, Almería, Spain',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 36.8167,
        longitude: -2.5667,
      },
    },
    knowsAbout: [
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'Vue.js',
      'Node.js',
      'PHP',
      'Laravel',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'MySQL',
      'Docker',
      'Kubernetes',
      'Linux',
      'AI Agent Architecture',
      'REST APIs',
      'TDD',
      'Clean Code',
    ],
    sameAs: [profile.links.github, profile.links.linkedin],
  };
}
