import type { ExperienceEntry } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type ExperienceEntryBlockProps = {
  entry: ExperienceEntry;
  locale: Locale;
  /** Texto localizado para `end === null` (puesto actual), ej. "Present"/"Actualidad". */
  presentLabel: string;
  /** Compacta márgenes y oculta los highlights — usado por las vistas compact/timeline (T24). */
  dense?: boolean;
  /** Omite el rango de fechas — el contenedor lo pinta aparte (Badge del rail, T19). */
  hideDates?: boolean;
};

/**
 * Formatea el rango de fechas de una experiencia: `start — end`, o `start — presentLabel`
 * si `end` es `null` (puesto actual). Única fuente de este formateo — usado tanto por el
 * rango inline de `ExperienceEntryBlock` como por el Badge del rail en `CvTimeline` (T19).
 */
export function formatExperienceRange(entry: ExperienceEntry, presentLabel: string): string {
  return `${entry.start} — ${entry.end ?? presentLabel}`;
}

/**
 * Bloque de una experiencia laboral: rol + empresa, rango de fechas, resumen, highlights
 * y tags. Presentacional puro, RSC-compatible. Reutilizado por las 3 vistas del CV (T9/T24)
 * — sin asunciones de layout del contenedor.
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
