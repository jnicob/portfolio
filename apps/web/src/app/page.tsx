import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';

const SITE_URL = siteUrl();
const TARGET = `/${routing.defaultLocale}`;

// Redirect estático raíz: meta refresh (izado por React 19) + JS + enlace visible.
export default function RootRedirect() {
  return (
    <>
      <meta name="robots" content="noindex" />
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
