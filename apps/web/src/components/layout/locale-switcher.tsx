'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

/** Alterna entre es/en conservando la ruta actual; anuncia el idioma DESTINO. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('switchers');

  const other = locale === 'en' ? 'es' : 'en';
  const label = other === 'en' ? t('toEnglish') : t('toSpanish');

  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control border border-border px-3 text-sm text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => router.replace(pathname, { locale: other })}
    >
      {other.toUpperCase()}
    </button>
  );
}
