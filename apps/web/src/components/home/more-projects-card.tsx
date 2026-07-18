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
 * Última celda del grid de destacados: toda la card es un único enlace a /projects, con
 * affordance visual de navegación (borde discontinuo). RSC-compatible.
 *
 * Sin `aria-label`: un `aria-label={title}` recortaba el nombre accesible al solo título,
 * ignorando el resto del contenido visible del link (preview de proyectos + contador) —
 * WCAG 2.5.3 (Label in Name) exige que el nombre CONTENGA el texto visible, y axe
 * (`label-content-name-mismatch`) lo marcaba como mismatch. Sin override, el nombre se
 * computa del propio contenido: empieza por el título visible y lo contiene por construcción.
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
            // Design review F3.6 T21 ("jerarquía y 8 más"): a igual tamaño que la lista de
            // preview, el sufijo de conteo competía visualmente con los títulos de proyecto.
            // text-sm lo baja de peso sin tocar el orden del contenido (nombre accesible
            // del Link intacto, T30).
            <p className="text-sm text-fg-muted">{countLabel(countTemplate, remaining)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
