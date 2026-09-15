import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { profile } from '@/data/profile';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { TechIconStrip } from '@/components/icons/tech-icons';

import { ProfileSummary, CoreTechGrid } from './profile-summary';

type HeroProps = {
  locale: Locale;
  cvLabel: string;
};

/**
 * Premium Homepage Hero:
 * - Two-column responsive layout inspired by top Dribbble & Pinterest developer showcases.
 * - Left column: Role badge, headline, summary, dual action CTAs, and official tech icon strip.
 * - Right column: Layered 3D composition with circular tech backdrop, Nico with laptop,
 *   floating glassmorphism code card, and experience badge.
 * - Hero Stats bar: 4 metric cards highlighting experience, scale, uptime, and engineering quality.
 */
export function Hero({ locale, cvLabel }: HeroProps) {
  const t = useTranslations('home');

  return (
    <section className="relative py-8 sm:py-12 md:py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-x-8 md:gap-y-6 lg:gap-x-12 lg:gap-y-6">
        {/* 1. Header & Title Block */}
        <div className="flex flex-col gap-4 md:col-span-7 md:row-start-1 lg:col-span-7 lg:row-start-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-accent uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Full-Stack &amp; AI Architect
            </span>
            <Badge variant="accent">{t('availability')}</Badge>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-5xl lg:text-6xl">
              {profile.name}
            </h1>
            <p className="text-base font-medium text-accent sm:text-xl md:text-2xl">
              {profile.headline[locale]}
            </p>
          </div>
        </div>

        {/* 2. Portrait:
            - Mobile (<md): Centered between Title and Summary
            - Tablet (md to lg): Row 1 right column (md:col-span-5 md:justify-end)
            - Desktop (lg+): Spanning all 4 rows in right column (lg:col-span-5 lg:row-span-4)
        */}
        <div className="flex justify-center my-2 md:my-0 md:col-span-5 md:row-start-1 md:justify-end lg:col-span-5 lg:row-start-1 lg:row-span-4 lg:self-center">
          <div className="group relative cursor-pointer">
            {/* Ambient colorful backlight glow that shifts with theme accent */}
            <div
              className="pointer-events-none absolute -inset-3 rounded-full bg-accent/25 dark:bg-accent/35 blur-2xl md:blur-3xl opacity-80 transition-colors duration-300"
              aria-hidden="true"
            />

            {/* Circular portrait with translucent themed border and 1.4s entrance fade-in */}
            <div className="animate-hero-fade-in relative aspect-square w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-96 lg:h-96 rounded-full p-2 sm:p-2.5 bg-accent/10 dark:bg-accent/20 border-2 border-accent/40 dark:border-accent/60 shadow-xl shadow-accent/15 dark:shadow-2xl dark:shadow-accent/30 backdrop-blur-xs transition-colors duration-300">
              <div
                data-testid="hero-portrait"
                className="relative h-full w-full rounded-full overflow-hidden bg-surface ring-1 ring-border/60 dark:ring-accent/30"
              >
                <Image
                  src="/profile/hero-portrait.webp"
                  alt={profile.name}
                  width={800}
                  height={800}
                  priority
                  unoptimized
                  className="h-full w-full object-cover select-none transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Intro Summary:
            - Mobile & Tablet: Sits below the image, full container width
            - Desktop: Sits in left column row 2
        */}
        <div className="md:col-span-12 md:row-start-2 lg:col-span-7 lg:row-start-2">
          <ProfileSummary
            summary={profile.summary}
            locale={locale}
            variant="hero"
            showCoreTech={false}
            className="max-w-3xl lg:max-w-2xl text-fg-muted"
          />
        </div>

        {/* 4. Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-1 md:col-span-12 md:row-start-3 lg:col-span-7 lg:row-start-3">
          <Link href="/showcase" className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}>
            <span>{t('projectsCta')}</span>
            <svg
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1.5"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <Link href="/cv" className={cn(buttonVariants({ variant: 'secondary', size: 'md' }))}>
            <svg
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1.5"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>{cvLabel}</span>
          </Link>

          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('availabilityCta')} — LinkedIn`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'md' }),
              'text-fg-muted hover:text-fg',
            )}
          >
            {t('availabilityCta')}
          </a>
        </div>

        {/* 5. Technology Icon Strip */}
        <div className="pt-2 md:col-span-12 md:row-start-4 lg:col-span-7 lg:row-start-4">
          <TechIconStrip label={t('technologiesLabel')} />
        </div>
      </div>

      {/* Hero Stats Bar: 4 Metric Cards */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 pt-6 border-t border-border/40">
        <div className="rounded-2xl border border-border/70 bg-surface/60 p-4.5 shadow-2xs backdrop-blur-xs transition-colors hover:border-accent/60 hover:bg-surface">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-accent">+15</div>
          <div className="mt-1 text-xs font-medium text-fg-muted">{t('stats.exp')}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/60 p-4.5 shadow-2xs backdrop-blur-xs transition-colors hover:border-accent/60 hover:bg-surface">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-accent">
            High-Scale
          </div>
          <div className="mt-1 text-xs font-medium text-fg-muted">{t('stats.architecture')}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/60 p-4.5 shadow-2xs backdrop-blur-xs transition-colors hover:border-accent/60 hover:bg-surface">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-accent">
            TDD & SOLID
          </div>
          <div className="mt-1 text-xs font-medium text-fg-muted">{t('stats.cleanCode')}</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/60 p-4.5 shadow-2xs backdrop-blur-xs transition-colors hover:border-accent/60 hover:bg-surface">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-accent">AI-Driven</div>
          <div className="mt-1 text-xs font-medium text-fg-muted">{t('stats.ai')}</div>
        </div>
      </div>

      {/* Core Tech & Expertise: Separated from the two columns */}
      <CoreTechGrid
        summary={profile.summary}
        locale={locale}
        className="mt-12 pt-6 border-t border-border/40"
      />
    </section>
  );
}
