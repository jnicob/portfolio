import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvStrings } from './cv-standard';
import type { CvViewSwitcherLabels } from './cv-view-switcher';

const { persistCvView } = vi.hoisted(() => ({ persistCvView: vi.fn() }));

vi.mock('@/lib/appearance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/appearance')>();
  return { ...actual, persistCvView };
});

/**
 * AppearanceInit cachea la resolución a nivel de módulo (one-shot compartido por el
 * doble montaje layout+página), así que cada test necesita módulos frescos:
 * `vi.resetModules()` en beforeEach + import dinámico por test.
 */
async function importFreshComponents() {
  const [{ CvContent }, { AppearanceInit }] = await Promise.all([
    import('./cv-content'),
    import('@/components/layout/appearance-init'),
  ]);
  return { CvContent, AppearanceInit };
}

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
  vi.resetModules();
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
  it('con ?view=timeline muestra timeline aunque el AppearanceInit del layout monte antes y limpie la URL', async () => {
    window.history.pushState(null, '', '/en/cv?view=timeline');
    const { CvContent, AppearanceInit } = await importFreshComponents();

    // Forma real del árbol: el layout monta su AppearanceInit SIN onView antes que la página.
    render(
      <>
        <AppearanceInit />
        <CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />
      </>,
    );

    expect(screen.getByRole('radio', { name: 'Timeline' })).toBeChecked();
    const lists = screen.getAllByRole('list');
    expect(lists.some((list) => list.tagName === 'OL')).toBe(true);
    // La primera instancia limpió la URL; la vista llegó desde la caché, no desde location.
    expect(window.location.search).toBe('');
  });

  it('cambiar la vista desde el switcher persiste la elección', async () => {
    const user = userEvent.setup();
    const { CvContent } = await importFreshComponents();
    render(<CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />);

    await user.click(screen.getByRole('radio', { name: 'Compact' }));

    expect(persistCvView).toHaveBeenCalledWith('compact');
    expect(screen.getByRole('radio', { name: 'Compact' })).toBeChecked();
  });

  it('renderiza el shareSlot recibido después del switcher', async () => {
    const { CvContent } = await importFreshComponents();
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
