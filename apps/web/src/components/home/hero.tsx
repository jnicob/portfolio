import { profile } from '@/data/profile';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

type HeroProps = {
  locale: Locale;
  cvLabel: string;
};

/** Hero de home: headline + summary del profile (LCP de la página) y CTA al CV. RSC-compatible. */
export function Hero({ locale, cvLabel }: HeroProps) {
  return (
    <section className="flex flex-col gap-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-fg">{profile.headline[locale]}</h1>
      <p className="max-w-2xl text-lg text-fg-muted">{profile.summary[locale]}</p>
      <Link
        href="/cv"
        className="inline-flex w-fit items-center gap-2 rounded-control bg-accent px-4 py-2 font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {cvLabel}
      </Link>
    </section>
  );
}
