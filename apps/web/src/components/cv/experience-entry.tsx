import type { ExperienceEntry } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type ExperienceEntryBlockProps = {
  entry: ExperienceEntry;
  locale: Locale;
  /** Localized text for `end === null` (current position), e.g. "Present"/"Actualidad". */
  presentLabel: string;
  /** Compresses margins and hides highlights — used by compact/timeline views (T24). */
  dense?: boolean;
  /** Omits date range — container renders it separately (rail Badge, T19). */
  hideDates?: boolean;
};

/**
 * Formats date range for an experience: `start — end`, or `start — presentLabel`
 * if `end` is `null` (current position). Single source of truth for this format — used by both
 * inline range in `ExperienceEntryBlock` and rail Badge in `CvTimeline` (T19).
 */
export function formatExperienceRange(entry: ExperienceEntry, presentLabel: string): string {
  return `${entry.start} — ${entry.end ?? presentLabel}`;
}

/**
 * Work experience block: role + company, date range, summary, highlights,
 * and tags. Pure presentational, RSC-compatible. Reused across the 3 CV views (T9/T24)
 * — without container layout assumptions.
 */
export function ExperienceEntryBlock({
  entry,
  locale,
  presentLabel,
  dense = false,
  hideDates = false,
}: ExperienceEntryBlockProps) {
  return (
    <article className={cn('flex flex-col', dense ? 'gap-1' : 'gap-2')}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-semibold text-fg">
          {entry.role[locale]}, <span>{entry.company}</span>
          {entry.location && (
            <span className="font-normal text-fg-muted"> · {entry.location[locale]}</span>
          )}
        </h3>
        {!hideDates && (
          <p className="text-sm text-fg-muted">{formatExperienceRange(entry, presentLabel)}</p>
        )}
      </div>
      <p className="text-fg-muted">{entry.summary[locale]}</p>
      {!dense && (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-fg-muted">
          {entry.highlights.map((highlight) => (
            <li key={highlight[locale]}>{highlight[locale]}</li>
          ))}
        </ul>
      )}
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-fg-muted">
        {entry.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  );
}
