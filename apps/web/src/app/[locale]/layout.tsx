import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import { AppearanceInit } from '@/components/layout/appearance-init';
import { SiteFooter } from '@/components/layout/footer';
import { SiteHeader } from '@/components/layout/header';
import '../globals.css';
import '@nicobehm/media-kit/styles.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Solo metadataBase: título/descripción por página vía generateMetadata (T11).
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

/*
 * Se ejecuta antes de la hidratación para evitar flash de tema Y skin:
 * URL > stored > preferencia del sistema > default ('dark'/'dev-tool').
 * Mantener en sincronía con lib/appearance.ts (resolveAppearance/DEFAULT_APPEARANCE).
 */
const themeInitScript = `(function () {
  try {
    var q = new URLSearchParams(location.search);
    function pick(k, valid) {
      var u = q.get(k);
      if (valid.indexOf(u) > -1) return u;
      var s = localStorage.getItem(k);
      return valid.indexOf(s) > -1 ? s : null;
    }
    var t =
      pick('theme', ['dark', 'light']) ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var sk = pick('skin', ['dev-tool', 'editorial', 'terminal', 'vibrant']) || 'dev-tool';
    document.documentElement.dataset.theme = t;
    if (sk !== 'dev-tool') document.documentElement.dataset.skin = sk;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();`;

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppearanceInit />
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
