import type { ProfileSummary as ProfileSummaryData } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type ProfileSummaryProps = {
  summary: ProfileSummaryData;
  locale: Locale;
  variant?: 'hero' | 'cv';
  className?: string;
};

/**
 * Componente declarativo para renderizar el resumen profesional estructurado (Home y CV):
 * - Renderiza los párrafos biográficos narrativos.
 * - Destaca el título "Core Tech & Dominio / Expertise" en negrita.
 * - Renderiza cada viñeta técnica con las etiquetas en negrita y las tecnologías asociadas.
 */
export function ProfileSummary({
  summary,
  locale,
  variant = 'hero',
  className,
}: ProfileSummaryProps) {
  const isHero = variant === 'hero';
  const paragraphs = summary.paragraphs[locale];
  const title = summary.coreTechTitle[locale];
  const bullets = summary.coreTechBullets;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'space-y-3 leading-relaxed',
          isHero ? 'text-base sm:text-lg text-fg-muted' : 'text-sm text-fg',
        )}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {title && (
        <div className="pt-1">
          <h3 className={cn('font-semibold text-fg mb-2', isHero ? 'text-base sm:text-lg' : 'text-sm')}>
            {title}
          </h3>
          {bullets.length > 0 && (
            <ul
              className={cn(
                'space-y-1.5',
                isHero ? 'text-sm sm:text-base text-fg-muted' : 'text-xs sm:text-sm text-fg',
              )}
            >
              {bullets.map((bullet, index) => (
                <li key={index}>
                  <span className="shrink-0 mr-1">•</span>
                  <span className="font-semibold mr-1 text-fg">{bullet.label[locale]}:</span>
                  <span>{bullet.value[locale]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
