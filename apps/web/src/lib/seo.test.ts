import { describe, expect, it } from 'vitest';
import { localizedPageMetadata, personJsonLd, SITE_URL } from './seo';

describe('seo', () => {
  it('genera canonical y hreflang por locale', () => {
    const meta = localizedPageMetadata({
      locale: 'es',
      path: '/cv',
      title: 'CV',
      description: 'D',
    });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/es/cv`);
    expect(meta.alternates?.languages).toEqual({
      es: `${SITE_URL}/es/cv`,
      en: `${SITE_URL}/en/cv`,
    });
    expect(meta.openGraph?.locale).toBe('es');
  });

  it('declara la imagen OG y la twitter card por locale', () => {
    const meta = localizedPageMetadata({
      locale: 'en',
      path: '/projects',
      title: 'Projects',
      description: 'D',
    });
    expect(meta.openGraph?.images).toEqual([
      { url: `${SITE_URL}/en/opengraph-image`, width: 1200, height: 630 },
    ]);
    expect(meta.twitter).toEqual({ card: 'summary_large_image' });

    const metaEs = localizedPageMetadata({ locale: 'es', path: '', title: 'T', description: 'D' });
    expect(metaEs.openGraph?.images).toEqual([
      { url: `${SITE_URL}/es/opengraph-image`, width: 1200, height: 630 },
    ]);
  });

  it('JSON-LD Person con SOLO enlaces públicos', () => {
    const ld = personJsonLd('en');
    expect(ld['@type']).toBe('Person');
    expect(JSON.stringify(ld)).not.toMatch(/@[\w-]+\.[a-z]{2,}/i);
  });
});
