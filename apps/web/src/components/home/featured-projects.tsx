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
  /** Localized template with `{count}` placeholder for MoreProjectsCard. */
  moreCountTemplate: string;
};

/** Featured projects grid + final link-card to /projects. RSC-compatible: no hooks. */
export function FeaturedProjects({
  locale,
  title,
  moreTitle,
  moreCountTemplate,
}: FeaturedProjectsProps) {
  const featured = projects.filter((project) => project.featured);
  // Prevent orphaned last card in responsive grid columns:
  // - In sm (2 columns), an odd count leaves the last card alone in its row -> sm:col-span-2.
  // - In lg (3 columns), count % 3 === 1 leaves the last card alone in its row -> lg:col-span-3.
  const isOrphanedAtSm = featured.length % 2 === 1;
  const isOrphanedAtLg = featured.length % 3 === 1;

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
              isOrphanedAtLg && index === featured.length - 1 && 'lg:col-span-3',
            )}
          >
            <ProjectCard project={project} locale={locale} animateMetrics />
          </TiltCard>
        ))}
        {/* MoreProjectsCard spans sm:col-span-2 lg:col-span-3 on its own, and the TiltCard
            wrapper carries the same grid column spans as the direct grid child. */}
        <TiltCard className="relative sm:col-span-2 lg:col-span-3">
          <MoreProjectsCard locale={locale} title={moreTitle} countTemplate={moreCountTemplate} />
        </TiltCard>
      </div>
    </section>
  );
}
