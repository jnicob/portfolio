import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Project } from '@/data/schemas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProjectCardProps = {
  project: Project;
  locale: Locale;
};

/** Tarjeta de proyecto: patrón "clickable card" accesible — el link vive en el heading. RSC-compatible. */
export function ProjectCard({ project, locale }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link
            href={`/projects/${project.slug}`}
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {project.title[locale]}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-fg-muted">{project.summary[locale]}</p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
        {project.metrics.length > 0 && (
          <dl className="flex flex-wrap gap-x-6 gap-y-2">
            {project.metrics.map((metric) => (
              <div key={metric.label[locale]}>
                <dt className="text-sm text-fg-muted">{metric.label[locale]}</dt>
                <dd className="font-mono text-fg">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
