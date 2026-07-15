import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';
import { SkinSwitcher } from './skin-switcher';
import { ThemeSwitcher } from './theme-switcher';

/** Header compartido: navegación principal + cambio de tema/skin/idioma. RSC-compatible. */
export function SiteHeader() {
  const t = useTranslations('nav');
  const tSwitchers = useTranslations('switchers');

  return (
    <header className="no-print border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <nav
          aria-label={t('label')}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg"
        >
          <Link href="/">{t('home')}</Link>
          <Link href="/cv">{t('cv')}</Link>
          <Link href="/projects">{t('projects')}</Link>
          <Link href="/showcase">{t('showcase')}</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <SkinSwitcher
            labels={{
              button: tSwitchers('skinButton'),
              inputLabel: tSwitchers('skinInputLabel'),
              placeholder: tSwitchers('skinPlaceholder'),
              emptyMessage: tSwitchers('skinEmpty'),
              skinNames: {
                'dev-tool': tSwitchers('skins.devTool'),
                editorial: tSwitchers('skins.editorial'),
                terminal: tSwitchers('skins.terminal'),
                vibrant: tSwitchers('skins.vibrant'),
              },
            }}
          />
          <ThemeSwitcher />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
