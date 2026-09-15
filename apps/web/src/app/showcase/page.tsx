import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';

const SITE_URL = siteUrl();
const TARGET = `/${routing.defaultLocale}/showcase`;

// Static redirect: meta refresh (hoisted by React 19) + JS + visible link.
export default function ShowcaseRedirect() {
  return (
    <>
      <meta name="robots" content="noindex" />
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
