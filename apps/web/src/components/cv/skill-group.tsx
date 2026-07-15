import type { Skill } from '@/data/schemas';
import type { Locale } from '@/i18n/routing';
import { SkillLevel } from './skill-level';

type SkillGroupProps = {
  category: Skill['category'];
  /** Etiqueta localizada de la categoría (namespace `cv.categories`) — nunca el slug crudo. */
  categoryLabel: string;
  skills: Skill[];
  locale: Locale;
  /** Oculta los puntos de nivel — usado por las vistas compact/timeline (T24). */
  showLevel?: boolean;
};

/**
 * Grupo de skills de una categoría con indicador de nivel opcional. Presentacional puro,
 * RSC-compatible. Reutilizado por las 3 vistas del CV (T9/T24).
 *
 * El aria-label de nivel usa el formato numérico "nombre: nivel/5": la relación N/5 se
 * entiende igual en ambos locales, así que no requiere una plantilla traducida adicional
 * (la interfaz de este componente no acepta `levelTemplate`).
 */
export function SkillGroup({ categoryLabel, skills, showLevel = true }: SkillGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {categoryLabel}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {skills.map((skill) => (
          <li key={skill.name} className="flex items-center justify-between gap-4">
            <span>{skill.name}</span>
            {showLevel && (
              <SkillLevel level={skill.level} label={`${skill.name}: ${skill.level}/5`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
