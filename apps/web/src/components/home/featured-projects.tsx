import { projects } from '@/data/projects';
import type { Locale } from '@/i18n/routing';
import { ProjectCard } from '@/components/projects/project-card';
import { MoreProjectsCard } from '@/components/home/more-projects-card';
import { TiltCard } from '@/components/ui/tilt-card';
import { cn } from '@/lib/cn';

type FeaturedProjectsProps = {
  locale: Locale;
  title: string;
  moreTitle: string;
  /** Plantilla localizada con placeholder `{count}` para la MoreProjectsCard. */
  moreCountTemplate: string;
};

/** Grid de proyectos destacados + link-card final a /projects. RSC-compatible: sin hooks. */
export function FeaturedProjects({
  locale,
  title,
  moreTitle,
  moreCountTemplate,
}: FeaturedProjectsProps) {
  const featured = projects.filter((project) => project.featured);
  // Design review F3.6 T21 ("card huérfana 768"): en el rango sm (640-1024px, incluye
  // 768) el grid es de 2 columnas (lg:grid-cols-3 no aplica todavía). Con un nº impar
  // de destacadas, la última queda sola en su fila con un hueco vacío al lado. Se
  // detecta con el nº real de destacadas (no hardcodeado) para no romper si cambia:
  // si es impar, esa última card pasa a ocupar las 2 columnas en sm y vuelve a 1 en lg
  // (donde ya encaja justa en la fila de 3).
  const isOrphanedAtSm = featured.length % 2 === 1;

  return (
    <section className="flex flex-col gap-4 py-8">
      <h2 className="text-2xl font-semibold text-fg">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((project, index) => (
          <TiltCard
            key={project.slug}
            className={cn(
              'relative',
              isOrphanedAtSm && index === featured.length - 1 && 'sm:col-span-2 lg:col-span-1',
            )}
          >
            <ProjectCard project={project} locale={locale} animateMetrics />
          </TiltCard>
        ))}
        {/* MoreProjectsCard ocupa ella misma sm:col-span-2 lg:col-span-3 (ver su propio
            test), pero al quedar anidada dentro de TiltCard deja de ser hija directa del
            grid: el span real que aplica es el del wrapper. */}
        <TiltCard className="relative sm:col-span-2 lg:col-span-3">
          <MoreProjectsCard locale={locale} title={moreTitle} countTemplate={moreCountTemplate} />
        </TiltCard>
      </div>
    </section>
  );
}
