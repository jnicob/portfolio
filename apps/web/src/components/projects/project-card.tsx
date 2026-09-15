import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Project } from '@/data/schemas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedMetric } from '@/components/ui/animated-metric';

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  /** Heading level depending on context (h2 under h1, h3 under h2). */
  headingLevel?: 'h2' | 'h3';
  /** Opt-in: animates metrics (count-up on entering viewport). Default false. */
  animateMetrics?: boolean;
};

const titleLinkClassName =
  'hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * Card title: internal link to case study if available (`caseStudy`),
 * otherwise first available external link (live > docs > repo), or plain text.
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
      <a href={external} target="_blank" rel="noopener noreferrer" className={titleLinkClassName}>
        {project.title[locale]}
        <span aria-hidden>{' ↗'}</span>
      </a>
    );
  }
  return <span>{project.title[locale]}</span>;
}

/** Project card: accessible "clickable card" pattern — link lives in heading. RSC-compatible. */
export function ProjectCard({
  project,
  locale,
  headingLevel = 'h3',
  animateMetrics = false,
}: ProjectCardProps) {
  return (
    <Card className="h-full">
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
                <dd className="font-mono text-fg">
                  {animateMetrics ? <AnimatedMetric value={metric.value} /> : metric.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
