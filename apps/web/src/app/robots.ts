import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Requerido por `output: 'export'`: esta ruta no admite datos dinámicos por request.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
