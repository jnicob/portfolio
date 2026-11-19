import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experience } from '@/data/experience';
import { CvStandard, type CvStrings } from './cv-standard';
import { CvCompact } from './cv-compact';
import { CvTimeline } from './cv-timeline';

const STRINGS: CvStrings = {
  experienceTitle: 'Experience',
  educationTitle: 'Education',
  languagesTitle: 'Languages',
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
] as const;

describe('the 3 CV views', () => {
  it.each(VIEWS)(
    '$name renders every experience entry (including 2026 independent work)',
    ({ name, Component }) => {
      render(<Component locale="en" strings={STRINGS} />);
      const heading = screen.getByRole('heading', { level: 2, name: STRINGS.experienceTitle });
      const section = heading.closest('section');
      expect(section).not.toBeNull();
      const headings = within(section as HTMLElement).getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(experience.length);
      expect(within(section as HTMLElement).getByText(/Freelance/)).toBeInTheDocument();
      if (name !== 'CvCompact') {
        expect(within(section as HTMLElement).getByText(/Lauquen Transporte/)).toBeInTheDocument();
        expect(within(section as HTMLElement).getByText(/Hotel Monte Cervino/)).toBeInTheDocument();
        expect(within(section as HTMLElement).getByText(/Manos Activas/)).toBeInTheDocument();
      }
      expect(
        within(section as HTMLElement).queryByText(/@nicobehm\/media-kit/),
      ).not.toBeInTheDocument();
    },
  );

  it.each(VIEWS)('$name renders education and languages', ({ Component }) => {
    render(<Component locale="en" strings={STRINGS} />);
    expect(screen.getByRole('heading', { name: STRINGS.languagesTitle })).toBeInTheDocument();
    expect(screen.getByText('Spanish:')).toBeInTheDocument();
    expect(screen.getByText('English:')).toBeInTheDocument();
  });

  it('CvCompact renders no interactive controls (print-safe)', () => {
    render(<CvCompact locale="en" strings={STRINGS} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('CvTimeline marks the experience timeline as an ordered list with one item per entry', () => {
    render(<CvTimeline locale="en" strings={STRINGS} />);
    const lists = screen.getAllByRole('list');
    const timelineList = lists.find((list) => list.tagName === 'OL');
    expect(timelineList).toBeDefined();
    expect(timelineList!.children).toHaveLength(experience.length);
  });

  it('CvStandard exposes layout hooks for the editorial skin', () => {
    const { container } = render(<CvStandard locale="en" strings={STRINGS} />);
    expect(container.querySelector('[data-cv-sections]')).not.toBeNull();
    expect(container.querySelector('[data-cv-experience]')).not.toBeNull();
  });
});

describe('CvTimeline — date badge', () => {
  it('renders the date range badge inside the card without duplication', () => {
    render(<CvTimeline locale="es" strings={STRINGS} />);
    const freepik = experience.find((entry) => entry.id === 'freepik')!;
    const freepikCard = screen.getByText(freepik.company).closest('li')!;
    // The range Badge has data-testid="timeline-date"
    expect(within(freepikCard).getByTestId('timeline-date')).toHaveTextContent(/2022/);
    // ExperienceEntryBlock does not repaint the range (hideDates)
    expect(within(freepikCard).getAllByText(/2022/)).toHaveLength(1);
  });
});
