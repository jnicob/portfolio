import { projects } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PREVIEW_COUNT = 3;

type MoreProjectsCardProps = {
  locale: Locale;
  title: string;
  /** Plantilla localizada con placeholder `{count}`, ej. "and {count} more projects". */
  countTemplate: string;
};

function countLabel(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

/**
 * Última celda del grid de destacados: toda la card es un único enlace a /projects
 * (nombre accesible = título), con affordance visual de navegación (borde discontinuo).
 * RSC-compatible.
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
            <p className="text-fg-muted">{countLabel(countTemplate, remaining)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
