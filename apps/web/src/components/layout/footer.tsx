import { useTranslations } from 'next-intl';
import { profile } from '@/data/profile';
import { Link } from '@/i18n/navigation';

/** Footer compartido: enlaces sociales y contacto. RSC-compatible. */
export function SiteFooter() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="no-print border-t border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-4 px-4 py-3 text-sm text-fg-muted">
        <Link
          href="/contact"
          className="hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {tNav('contact')}
        </Link>
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          aria-label={`${t('github')} — ${profile.name}`}
          className="hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t('github')}
        </a>
        <a
          href={profile.links.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`${t('linkedin')} — ${profile.name}`}
          className="hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t('linkedin')}
        </a>
      </div>
    </footer>
  );
}
