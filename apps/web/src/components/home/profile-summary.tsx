import { cn } from '@/lib/cn';

type ProfileSummaryProps = {
  summary: string;
  variant?: 'hero' | 'cv';
  className?: string;
};

export function parseSummary(summary: string) {
  const lines = summary.trim().split('\n');
  const paragraphs: string[] = [];
  let sectionTitle = '';
  const bullets: { label: string; value: string }[] = [];

  let currentParagraph = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      continue;
    }

    if (trimmed.startsWith('Core Tech')) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      sectionTitle = trimmed;
      continue;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const content = trimmed.replace(/^[•-]\s*/, '');

      const colonIndex = content.indexOf(':');
      if (colonIndex !== -1) {
        bullets.push({
          label: content.slice(0, colonIndex + 1),
          value: content.slice(colonIndex + 1).trim(),
        });
      } else {
        bullets.push({ label: '', value: content });
      }
      continue;
    }

    if (currentParagraph) {
      currentParagraph += ' ' + trimmed;
    } else {
      currentParagraph = trimmed;
    }
  }

  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }

  return { paragraphs, sectionTitle, bullets };
}

/**
 * Componente para formatear el resumen profesional (en Hero y en CV):
 * - Separa la narrativa inicial en párrafos legibles.
 * - Renderiza el título de "Core Tech & Dominio / Expertise" en negrita.
 * - Presenta la lista de viñetas técnicas con etiquetas en negrita y tipografía compacta en el Hero.
 */
export function ProfileSummary({ summary, variant = 'hero', className }: ProfileSummaryProps) {
  const { paragraphs, sectionTitle, bullets } = parseSummary(summary);
  const isHero = variant === 'hero';

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

      {sectionTitle && (
        <div className="pt-1">
          <h3
            className={cn(
              'font-semibold text-fg mb-2',
              isHero ? 'text-base sm:text-lg' : 'text-sm font-semibold',
            )}
          >
            {sectionTitle}
          </h3>
          {bullets.length > 0 && (
            <ul
              className={cn(
                'space-y-1.5',
                isHero ? 'text-sm sm:text-base text-fg-muted' : 'text-xs sm:text-sm text-fg',
              )}
            >
              {bullets.map((bullet, index) => (
                <li key={index} className="flex flex-wrap gap-x-1.5 items-baseline">
                  <span className="shrink-0">•</span>
                  {bullet.label && <span className="font-semibold text-fg">{bullet.label}</span>}
                  <span>{bullet.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
