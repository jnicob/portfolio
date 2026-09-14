import type { Locale } from '@/i18n/routing';
import { beyondCode } from '@/data/beyond-code';
import { Badge } from '@/components/ui/badge';
import { BeyondCodeGallery } from './beyond-code-gallery';

type BeyondCodeSectionProps = {
  locale: Locale;
};

/**
 * BeyondCodeSection:
 * Highlights personal roots, Mediterranean outdoor activities, maker curiosities (IoT/Raspberry Pi),
 * and remote collaboration philosophy, accompanied by an interactive photo carousel.
 */
export function BeyondCodeSection({ locale }: BeyondCodeSectionProps) {
  return (
    <section className="flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {beyondCode.title[locale]}
          </h2>
          <Badge variant="accent">{locale === 'es' ? 'Personal' : 'Life'}</Badge>
        </div>
        <p className="max-w-3xl text-base text-fg-muted">{beyondCode.subtitle[locale]}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Interactive photo gallery carousel */}
        <div className="lg:col-span-5">
          <BeyondCodeGallery images={beyondCode.images} locale={locale} />
        </div>

        {/* Right Column: Roots, sports, maker projects, and work philosophy */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Location and roots */}
          <div className="rounded-card border border-border bg-surface p-4">
            <div className="flex flex-col gap-1.5 text-sm">
              <p className="font-medium text-fg">{beyondCode.location[locale]}</p>
              <p className="text-fg-muted">{beyondCode.origin[locale]}</p>
            </div>
          </div>

          {/* Sports and exploration */}
          <div className="rounded-card border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
              {beyondCode.interestsTitle[locale]}
            </h3>
            <ul className="flex flex-col gap-1.5 text-sm text-fg-muted">
              {beyondCode.interests.map((interest) => (
                <li key={interest[locale]} className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>{interest[locale]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dual cards: Maker IoT & Philosophy */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-surface p-4">
              <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-accent">
                {beyondCode.makerTitle[locale]}
              </h3>
              <p className="text-xs leading-relaxed text-fg-muted">
                {beyondCode.makerDescription[locale]}
              </p>
            </div>

            <div className="rounded-card border border-border bg-surface p-4">
              <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-accent">
                {beyondCode.philosophyTitle[locale]}
              </h3>
              <p className="text-xs leading-relaxed text-fg-muted">
                {beyondCode.philosophyDescription[locale]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
