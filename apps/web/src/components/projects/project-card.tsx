import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Project } from '@/data/schemas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  /** Nivel del heading del título según el contexto (h2 bajo un h1, h3 bajo un h2). */
  headingLevel?: 'h2' | 'h3';
};

const titleLinkClassName =
  'hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * Título de la tarjeta: enlace interno al case study si existe (`caseStudy`),
 * si no al primer enlace externo disponible (live > docs > repo), o texto plano.
 */
function TitleLink({ project, locale }: { project: Project; locale: Locale }) {
  if (project.caseStudy) {
    return (
      <Link href={`/projects/${project.slug}`} className={titleLinkClassName}>
        {project.title[locale]}
        <span aria-hidden>{' →'}</span>
      </Link>
    );
  }
  const external = project.links.live ?? project.links.docs ?? project.links.repo;
  if (external) {
    return (
      <a href={external} rel="noreferrer" className={titleLinkClassName}>
        {project.title[locale]}
        <span aria-hidden>{' ↗'}</span>
      </a>
    );
  }
  return <span>{project.title[locale]}</span>;
}

/** Tarjeta de proyecto: patrón "clickable card" accesible — el link vive en el heading. RSC-compatible. */
export function ProjectCard({ project, locale, headingLevel = 'h3' }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={headingLevel}>
          <TitleLink project={project} locale={locale} />
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
              <div key={metric.label.en}>
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
