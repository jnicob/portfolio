import { useTranslations } from 'next-intl';
import { profile } from '@/data/profile';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { HeroCanvas } from './hero-canvas';

type HeroProps = {
  locale: Locale;
  cvLabel: string;
};

/**
 * Hero de home: headline + summary del profile (LCP de la página), badge de
 * disponibilidad, CTA a LinkedIn y CTA al CV. RSC-compatible: `HeroCanvas` es
 * el único client island, montado como primer hijo detrás del contenido
 * (`position: relative` en ambos para el stacking).
 */
export function Hero({ locale, cvLabel }: HeroProps) {
  const t = useTranslations('home');

  return (
    <section className="relative overflow-hidden">
      <HeroCanvas />
      <div className="relative flex flex-col gap-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-fg">{profile.headline[locale]}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent">{t('availability')}</Badge>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('availabilityCta')} — LinkedIn`}
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
          >
            {t('availabilityCta')}
          </a>
        </div>
        <p className="max-w-2xl text-lg text-fg-muted">{profile.summary[locale]}</p>
        <Link
          href="/cv"
          className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'w-fit')}
        >
          {cvLabel}
        </Link>
      </div>
    </section>
  );
}
