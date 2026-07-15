import { projects } from '@/data/projects';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FeaturedProjectsProps = {
  locale: Locale;
  title: string;
};

/** Grid de proyectos destacados. RSC-compatible: datos importados, sin hooks. */
export function FeaturedProjects({ locale, title }: FeaturedProjectsProps) {
  const featured = projects.filter((project) => project.featured);

  return (
    <section className="flex flex-col gap-4 py-8">
      <h2 className="text-2xl font-semibold text-fg">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((project) => (
          <Card key={project.slug}>
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
            <CardContent>{project.summary[locale]}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
