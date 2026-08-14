import type { EducationEntry } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';

type EducationListProps = {
  education: EducationEntry[];
  locale: Locale;
};

/**
 * Lista de formación académica: grado, institución y rango de años. Presentacional puro,
 * RSC-compatible. Reutilizado por las 3 vistas del CV (T9/T24).
 */
export function EducationList({ education, locale }: EducationListProps) {
  return (
    <ul className="flex flex-col gap-4 print:gap-1">
      {education.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-0.5 print:gap-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 print:gap-y-0">
            <h3 className="font-semibold text-fg print:text-[11.5px] print:leading-tight">
              {entry.degree[locale]}
            </h3>
            <p className="text-sm text-fg-muted print:text-[10px]">
              {entry.end ? `${entry.start} — ${entry.end}` : entry.start}
            </p>
          </div>
          <p className="text-fg-muted print:text-[10.5px]">{entry.institution}</p>
        </li>
      ))}
    </ul>
  );
}
