import type { LanguageEntry } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';

type LanguageListProps = {
  languages: LanguageEntry[];
  locale: Locale;
};

/**
 * Renders language proficiency credentials (e.g. Spanish - Native, English - B2).
 * Pure presentational RSC-compatible component reused across CV views.
 */
export function LanguageList({ languages, locale }: LanguageListProps) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {languages.map((entry) => (
        <li key={entry.id} className="flex items-center gap-1.5">
          <span className="font-semibold text-fg">{entry.language[locale]}:</span>
          <span className="text-fg-muted">{entry.level[locale]}</span>
        </li>
      ))}
    </ul>
  );
}
