import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { skills } from '@/data/skills';
import { SkillGroup } from './skill-group';

const backendSkills = skills.filter((skill) => skill.category === 'backend');

describe('SkillGroup', () => {
  it('renderiza categoryLabel (localizado) como heading y las skills del grupo', () => {
    render(
      <SkillGroup category="backend" categoryLabel="Backend" skills={backendSkills} locale="en" />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Backend');
    for (const skill of backendSkills) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
  });

  it('by default omits level dots and renders skills as pills/chips', () => {
    const { container } = render(
      <SkillGroup category="backend" categoryLabel="Backend" skills={backendSkills} locale="en" />,
    );

    for (const skill of backendSkills) {
      expect(screen.queryByLabelText(`${skill.name}: ${skill.level}/5`)).not.toBeInTheDocument();
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
    const list = container.querySelector('ul');
    expect(list?.className).toContain('flex-wrap');
  });

  it('when showLevel=true, exposes each skill level via an accessible aria-label with 5 visual dots', () => {
    render(
      <SkillGroup
        category="backend"
        categoryLabel="Backend"
        skills={backendSkills}
        locale="en"
        showLevel
      />,
    );

    const first = backendSkills[0]!;
    const group = screen.getByLabelText(`${first.name}: ${first.level}/5`);
    expect(group.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
  });
});
