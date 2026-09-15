import { projects } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PREVIEW_COUNT = 3;

type MoreProjectsCardProps = {
  locale: Locale;
  title: string;
  /** Localized template with `{count}` placeholder, e.g. "and {count} more projects". */
  countTemplate: string;
};

function countLabel(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

/**
 * Last cell of the featured grid: the entire card is a single link to /projects, with
 * visual navigation affordance (dashed border). RSC-compatible.
 *
 * Without `aria-label`: an `aria-label={title}` truncated the accessible name to just the title,
 * ignoring the rest of the link's visible content (project preview + counter) —
 * WCAG 2.5.3 (Label in Name) requires that the name CONTAIN the visible text, and axe
 * (`label-content-name-mismatch`) flagged it as a mismatch. Without an override, the name is
 * computed from the content itself: it starts with the visible title and contains it by construction.
 */
export function MoreProjectsCard({ locale, title, countTemplate }: MoreProjectsCardProps) {
  const notFeatured = projects.filter((p) => !p.featured);
  const preview = notFeatured.slice(0, PREVIEW_COUNT);
  const remaining = notFeatured.length - preview.length;

  return (
    <Link
      href="/projects"
      className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:col-span-2 lg:col-span-3"
    >
      <Card className="border-dashed transition-colors hover:border-accent">
        <CardHeader>
          <CardTitle>
            {title}
            <span aria-hidden>{' →'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-1 text-fg-muted">
            {preview.map((p) => (
              <li key={p.slug}>{p.title[locale]}</li>
            ))}
          </ul>
          {remaining > 0 && (
            // Design review F3.6 T21 ("hierarchy and 8 more"): at the same size as the
            // preview list, the count suffix competed visually with the project titles.
            // text-sm lo baja de peso sin tocar el orden del contenido (nombre accesible
            // del Link intacto, T30).
            <p className="text-sm text-fg-muted">{countLabel(countTemplate, remaining)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
