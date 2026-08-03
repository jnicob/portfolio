'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

/** Alterna entre es/en conservando la ruta actual; anuncia el idioma DESTINO. */
export function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('switchers');

  const other = locale === 'en' ? 'es' : 'en';
  const label = other === 'en' ? t('toEnglish') : t('toSpanish');

  const handleClick = () => {
    startTransition(() => {
      router.replace(pathname, { locale: other });
    });
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={isPending}
      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control border border-border px-3 text-sm text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClick}
    >
      {isPending ? (
        <span className="flex items-center gap-1">
          <span className="size-3 animate-spin rounded-full border-2 border-fg border-t-transparent" />
          {other.toUpperCase()}
        </span>
      ) : (
        other.toUpperCase()
      )}
    </button>
  );
}
