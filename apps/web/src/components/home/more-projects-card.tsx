import { projects } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PREVIEW_COUNT = 3;

type MoreProjectsCardProps = { locale: Locale; title: string; cta: string };

/** Última celda del grid de destacados: box-enlace a /projects adelantando títulos. */
export function MoreProjectsCard({ locale, title, cta }: MoreProjectsCardProps) {
  const preview = projects.filter((p) => !p.featured).slice(0, PREVIEW_COUNT);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link
            href="/projects"
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-1 text-fg-muted">
          {preview.map((p) => (
            <li key={p.slug}>{p.title[locale]}</li>
          ))}
        </ul>
        <span aria-hidden className="text-accent">
          {cta}
        </span>
      </CardContent>
    </Card>
  );
}
