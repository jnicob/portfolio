import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from '@/data/schemas';
import { skills } from '@/data/skills';
import { SkillsSummary } from './skills-summary';

const LEVEL_TEMPLATE = '{name}: level {level} of 5';

function renderSkillsSummary() {
  render(<SkillsSummary locale="en" title="Skills" levelTemplate={LEVEL_TEMPLATE} />);
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
});
