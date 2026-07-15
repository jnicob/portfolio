import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example-placeholder.dev';
const TARGET = `/${routing.defaultLocale}`;

// Redirect estático raíz: meta refresh (izado por React 19) + JS + enlace visible.
export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${TARGET}`} />
      {routing.locales.map((locale) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={`${SITE_URL}/${locale}`} />
      ))}
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(TARGET)})` }} />
      <p>
        <a href={TARGET}>English version →</a>
      </p>
    </>
  );
}
