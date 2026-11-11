import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { resolveOutputMode } from './src/lib/output-mode';

const mode = resolveOutputMode(process.env);

// Warn during production build if NEXT_PUBLIC_SITE_URL is unset (SEO falls back to placeholder).
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn('[build] NEXT_PUBLIC_SITE_URL is not defined: SEO points to the placeholder URL');
}

const nextConfig: NextConfig = {
  trailingSlash: true,
  // 'export' mode: pure static export (shared hosting). 'node' mode: SSR + route handlers.
  ...(mode === 'export' ? { output: 'export' as const } : {}),
  // output:'export' does not support the server-side image optimizer.
  images: { unoptimized: mode === 'export' },
  // Pin the pnpm monorepo root so Turbopack does not pick up an unrelated lockfile higher up the directory tree.
  turbopack: { root: path.join(__dirname, '..', '..') },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
