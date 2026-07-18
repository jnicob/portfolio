import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';
import { SkinSwitcher } from './skin-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { NavLink } from './nav-link';

/** Header compartido: navegación principal + cambio de tema/skin/idioma. RSC-compatible. */
export function SiteHeader() {
  const t = useTranslations('nav');
  const tSwitchers = useTranslations('switchers');

  return (
    <header className="no-print border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <nav
          aria-label={t('label')}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
        >
          <NavLink href="/">{t('home')}</NavLink>
          <NavLink href="/cv">{t('cv')}</NavLink>
          <NavLink href="/projects">{t('projects')}</NavLink>
          <NavLink href="/showcase">{t('showcase')}</NavLink>
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
