import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-24">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <Link
        href="/"
        className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t('backHome')}
      </Link>
    </main>
  );
}
