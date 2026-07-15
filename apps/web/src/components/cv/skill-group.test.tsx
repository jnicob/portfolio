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

  it('expone el nivel de cada skill via un aria-label accesible con 5 puntos visuales', () => {
    render(
      <SkillGroup category="backend" categoryLabel="Backend" skills={backendSkills} locale="en" />,
    );

    const first = backendSkills[0]!;
    const group = screen.getByLabelText(`${first.name}: ${first.level}/5`);
    expect(group.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
  });

  it('con showLevel=false omite los puntos de nivel', () => {
    render(
      <SkillGroup
        category="backend"
        categoryLabel="Backend"
        skills={backendSkills}
        locale="en"
        showLevel={false}
      />,
    );

    for (const skill of backendSkills) {
      expect(screen.queryByLabelText(`${skill.name}: ${skill.level}/5`)).not.toBeInTheDocument();
    }
    expect(screen.getByText(backendSkills[0]!.name)).toBeInTheDocument();
  });
});
