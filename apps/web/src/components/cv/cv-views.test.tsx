import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experience } from '@/data/experience';
import type { CvStrings } from './cv-standard';
import { CvStandard } from './cv-standard';
import { CvCompact } from './cv-compact';
import { CvTimeline } from './cv-timeline';

const STRINGS: CvStrings = {
  experienceTitle: 'Experience',
  educationTitle: 'Education',
  skillsTitle: 'Skills',
  present: 'Present',
  contactTitle: 'Contact',
  contactGithub: 'GitHub',
  contactLinkedin: 'LinkedIn',
  categories: {
    backend: 'Backend',
    frontend: 'Frontend',
    ai: 'AI',
    platform: 'Platform',
    tooling: 'Tooling',
  },
};

const VIEWS = [
  { name: 'CvStandard', Component: CvStandard },
  { name: 'CvCompact', Component: CvCompact },
  { name: 'CvTimeline', Component: CvTimeline },
];

describe('las 3 vistas del CV', () => {
  it.each(VIEWS)(
    '$name renderiza el mismo número de entradas de experiencia que los datos',
    ({ Component }) => {
      render(<Component locale="en" strings={STRINGS} />);
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.length).toBeGreaterThanOrEqual(experience.length);
    },
  );

  it('CvCompact no renderiza controles interactivos (print-safe)', () => {
    render(<CvCompact locale="en" strings={STRINGS} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('CvTimeline marca la cronología de experiencia como lista ordenada con un item por entrada', () => {
    render(<CvTimeline locale="en" strings={STRINGS} />);
    const lists = screen.getAllByRole('list');
    const timelineList = lists.find((list) => list.tagName === 'OL');
    expect(timelineList).toBeDefined();
    expect(timelineList!.children).toHaveLength(experience.length);
  });
});
