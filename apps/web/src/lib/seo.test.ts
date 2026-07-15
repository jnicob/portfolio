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

  it('JSON-LD Person con SOLO enlaces públicos', () => {
    const ld = personJsonLd('en');
    expect(ld['@type']).toBe('Person');
    expect(JSON.stringify(ld)).not.toMatch(/@[\w-]+\.[a-z]{2,}/i);
  });
});
