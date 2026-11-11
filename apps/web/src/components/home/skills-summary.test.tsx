import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from '@/data/constants';
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
  it('renders a heading and groups skills by category with only the used categories', () => {
    renderSkillsSummary();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Skills');

    const usedCategories = new Set(skills.map((s) => s.category));
    for (const category of SKILL_CATEGORIES) {
      if (!usedCategories.has(category)) {
        expect(screen.queryByText(category, { exact: false })).not.toBeInTheDocument();
      }
    }
  });

  it('renders skills as unrated pills/chips ordered by category without level dots', () => {
    const { container } = renderSkillsSummary();
    const react = skills.find((s) => s.name === 'React / Next.js')!;
    expect(screen.getByText(react.name)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(`${react.name}: level ${react.level} of 5`),
    ).not.toBeInTheDocument();
    const lists = container.querySelectorAll('ul');
    expect(lists.length).toBeGreaterThan(0);
    expect(lists[0]?.className).toContain('flex-wrap');
  });

  it('groups categories into a compact multi-column grid (not one full-width row per skill)', () => {
    const { container } = renderSkillsSummary();
    const heading = screen.getByRole('heading', { level: 2 });
    const grid = heading.nextElementSibling;
    expect(grid?.className).toContain('grid');
    expect(grid?.className).toContain('sm:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
    expect(container.querySelectorAll('h3').length).toBeGreaterThan(0);
  });
});
