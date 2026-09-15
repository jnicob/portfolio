import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getProjectSlugs } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';

// Required by `output: 'export'`: this route does not support dynamic request data.
export const dynamic = 'force-static';

const STATIC_PATHS = ['', '/cv', '/projects', '/showcase'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${SITE_URL}/${locale}${path}` });
    }
    for (const slug of await getProjectSlugs(locale)) {
      entries.push({ url: `${SITE_URL}/${locale}/projects/${slug}` });
    }
  }

  return entries;
}
