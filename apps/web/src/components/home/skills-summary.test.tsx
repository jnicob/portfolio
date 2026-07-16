import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from '@/data/schemas';
import { skills } from '@/data/skills';
import { SkillsSummary } from './skills-summary';

const LEVEL_TEMPLATE = '{name}: level {level} of 5';
const CATEGORY_LABELS = {
  backend: 'Backend',
  frontend: 'Frontend',
  ai: 'AI',
  platform: 'Platform',
  tooling: 'Tooling',
} as const;

function renderSkillsSummary() {
  return render(
    <SkillsSummary
      locale="en"
      title="Skills"
      levelTemplate={LEVEL_TEMPLATE}
      categoryLabels={CATEGORY_LABELS}
    />,
  );
}

describe('SkillsSummary', () => {
  it('renderiza un heading y agrupa las skills por categoría con solo las categorías usadas', () => {
    renderSkillsSummary();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Skills');

    const usedCategories = new Set(skills.map((s) => s.category));
    for (const category of SKILL_CATEGORIES) {
      if (!usedCategories.has(category)) {
        expect(screen.queryByText(category, { exact: false })).not.toBeInTheDocument();
      }
    }
  });

  it('expone el nivel de cada skill via aria-label localizado y 5 puntos visuales', () => {
    renderSkillsSummary();
    const react = skills.find((s) => s.name === 'React')!;
    const group = screen.getByLabelText(`${react.name}: level ${react.level} of 5`);
    expect(group).toBeInTheDocument();
    const dots = group.querySelectorAll('[aria-hidden="true"]');
    expect(dots).toHaveLength(5);
  });

  it('agrupa las categorías en un grid multi-columna compacto (no una fila por skill a ancho completo)', () => {
    const { container } = renderSkillsSummary();
    const heading = screen.getByRole('heading', { level: 2 });
    const grid = heading.nextElementSibling;
    expect(grid?.className).toContain('grid');
    expect(grid?.className).toContain('sm:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
    expect(container.querySelectorAll('h3').length).toBeGreaterThan(0);
  });
});
