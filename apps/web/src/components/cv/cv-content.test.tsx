import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvStrings } from './cv-standard';
import type { CvViewSwitcherLabels } from './cv-view-switcher';
import { CvContent } from './cv-content';

const { persistCvView } = vi.hoisted(() => ({ persistCvView: vi.fn() }));

vi.mock('@/lib/appearance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/appearance')>();
  return { ...actual, persistCvView };
});

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

const SWITCHER_LABELS: CvViewSwitcherLabels = {
  groupLabel: 'CV view',
  standard: 'Standard',
  compact: 'Compact',
  timeline: 'Timeline',
};

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  stubMatchMedia(false);
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.skin;
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  persistCvView.mockClear();
});

describe('CvContent', () => {
  it('con ?view=timeline en la URL, monta mostrando la vista timeline', () => {
    window.history.pushState(null, '', '/en/cv?view=timeline');

    render(<CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />);

    expect(screen.getByRole('radio', { name: 'Timeline' })).toBeChecked();
    const lists = screen.getAllByRole('list');
    expect(lists.some((list) => list.tagName === 'OL')).toBe(true);
  });

  it('cambiar la vista desde el switcher persiste la elección', async () => {
    const user = userEvent.setup();
    render(<CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />);

    await user.click(screen.getByRole('radio', { name: 'Compact' }));

    expect(persistCvView).toHaveBeenCalledWith('compact');
    expect(screen.getByRole('radio', { name: 'Compact' })).toBeChecked();
  });

  it('renderiza el shareSlot recibido después del switcher', () => {
    render(
      <CvContent
        locale="en"
        strings={STRINGS}
        switcherLabels={SWITCHER_LABELS}
        shareSlot={<button type="button">Share</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });
});
