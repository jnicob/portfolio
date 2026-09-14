import type { ProfileSummary as ProfileSummaryData } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type ProfileSummaryProps = {
  summary: ProfileSummaryData;
  locale: Locale;
  variant?: 'hero' | 'cv';
  showCoreTech?: boolean;
  className?: string;
};

/**
 * Declarative component to render structured profile summary (Hero and CV):
 * - Renders narrative biography paragraphs.
 * - Optionally renders "Core Tech & Expertise" bullets (default true, can be false when rendered separately).
 */
export function ProfileSummary({
  summary,
  locale,
  variant = 'hero',
  showCoreTech = true,
  className,
}: ProfileSummaryProps) {
  const isHero = variant === 'hero';
  const paragraphs = summary.paragraphs[locale];
  const title = summary.coreTechTitle[locale];
  const bullets = summary.coreTechBullets;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'space-y-3 leading-relaxed',
          isHero ? 'text-base sm:text-lg text-fg-muted' : 'text-sm text-fg',
        )}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {showCoreTech && title && (
        <div className="pt-1">
          <h3
            className={cn(
              'font-semibold text-fg mb-2',
              isHero ? 'text-base sm:text-lg' : 'text-sm',
            )}
          >
            {title}
          </h3>
          {bullets.length > 0 && (
            <ul
              className={cn(
                'space-y-1.5',
                isHero ? 'text-sm sm:text-base text-fg-muted' : 'text-xs sm:text-sm text-fg',
              )}
            >
              {bullets.map((bullet, index) => (
                <li key={index}>
                  <span className="shrink-0 mr-1">•</span>
                  <span className="font-semibold mr-1 text-fg">{bullet.label[locale]}:</span>
                  <span>{bullet.value[locale]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

type CoreTechGridProps = {
  summary: ProfileSummaryData;
  locale: Locale;
  className?: string;
};

/**
 * Modern card-based grid for Core Tech & Expertise, cleanly separated from the two-column hero.
 */
export function CoreTechGrid({ summary, locale, className }: CoreTechGridProps) {
  const title = summary.coreTechTitle[locale];
  const bullets = summary.coreTechBullets;

  if (!bullets || bullets.length === 0) return null;

  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
          {title.replace(/:$/, '')}
        </h2>
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {bullets.map((bullet, index) => (
          <div
            key={index}
            className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-surface/60 p-4.5 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-accent/60 hover:bg-surface hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                  {bullet.label[locale]}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                  0{index + 1}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-fg-muted group-hover:text-fg transition-colors">
                {bullet.value[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
