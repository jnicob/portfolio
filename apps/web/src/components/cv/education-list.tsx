import type { EducationEntry } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';

type EducationListProps = {
  education: EducationEntry[];
  locale: Locale;
};

/**
 * Academic education list: degree, institution, and year range.
 * Pure presentational, RSC-compatible. Reused across the 3 CV views (T9/T24).
 */
export function EducationList({ education, locale }: EducationListProps) {
  return (
    <ul className="flex flex-col gap-4 print:gap-1.5">
      {education.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <h3 className="font-semibold text-fg">{entry.degree[locale]}</h3>
            <p className="shrink-0 text-sm text-fg-muted">
              {entry.end ? `${entry.start} — ${entry.end}` : entry.start}
            </p>
          </div>
          <p className="text-fg-muted">{entry.institution}</p>
        </li>
      ))}
    </ul>
  );
}
