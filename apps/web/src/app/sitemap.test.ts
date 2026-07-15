import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import { getProjectSlugs } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('incluye todas las rutas fijas y dinámicas por locale, en absoluto', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(`${SITE_URL}/es`);
    expect(urls).toContain(`${SITE_URL}/en`);
    expect(urls).toContain(`${SITE_URL}/en/cv`);
    expect(urls).toContain(`${SITE_URL}/en/projects/flows-api`);

    const slugCounts = await Promise.all(
      routing.locales.map(async (locale) => (await getProjectSlugs(locale)).length),
    );
    const expectedLength = slugCounts.reduce((total, count) => total + 4 + count, 0);
    expect(entries).toHaveLength(expectedLength);
  });
});
