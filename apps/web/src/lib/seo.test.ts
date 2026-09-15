import { describe, expect, it } from 'vitest';
import { localizedPageMetadata, personJsonLd, SITE_URL } from './seo';

describe('seo', () => {
  it('generates canonical and hreflang per locale', () => {
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

  it('declares OG image and twitter card per locale', () => {
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

  it('JSON-LD Person with ONLY public links and enriched geo data', () => {
    const ld = personJsonLd('en');
    expect(ld['@type']).toBe('Person');
    expect(ld.homeLocation.name).toContain('Aguadulce');
    expect(ld.homeLocation.geo.latitude).toBe(36.8167);
    expect(ld.address.addressRegion).toBe('Almería');
    expect(ld.nationality.name).toBe('Argentina');
    expect(ld.knowsAbout.length).toBeGreaterThan(10);
    expect(JSON.stringify(ld)).not.toMatch(/@[\w-]+\.[a-z]{2,}/i);
  });

  it('declares GEO metadata for accurate geographic indexing', () => {
    const meta = localizedPageMetadata({
      locale: 'es',
      path: '',
      title: 'T',
      description: 'D',
    });
    expect(meta.other?.['geo.region']).toBe('ES-AL');
    expect(meta.other?.['geo.placename']).toBe('Aguadulce, Almería');
    expect(meta.other?.['geo.position']).toBe('36.8167;-2.5667');
    expect(meta.other?.['ICBM']).toBe('36.8167, -2.5667');
  });
});
