import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example-placeholder.dev';
const TARGET = `/${routing.defaultLocale}/showcase`;

// Redirect estático: meta refresh (izado por React 19) + JS + enlace visible.
export default function ShowcaseRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${TARGET}`} />
      {routing.locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${SITE_URL}/${locale}/showcase`}
        />
      ))}
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(TARGET)})` }} />
      <p>
        <a href={TARGET}>English version →</a>
      </p>
    </>
  );
}
