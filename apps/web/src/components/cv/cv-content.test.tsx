import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvStrings } from './cv-standard';
import type { CvViewSwitcherLabels } from './cv-view-switcher';

const { persistCvView } = vi.hoisted(() => ({ persistCvView: vi.fn() }));

vi.mock('@/lib/appearance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/appearance')>();
  // Write-through spy: records calls AND writes to storage, because AppearanceInit
  // resolves the view by reading fresh storage on each mount.
  persistCvView.mockImplementation(actual.persistCvView);
  return { ...actual, persistCvView };
});

/**
 * AppearanceInit caches resolution at module level (one-shot shared across
 * layout+page double mount), so each test requires fresh modules:
 * `vi.resetModules()` in beforeEach + dynamic import per test.
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
  Reflect.deleteProperty(navigator, 'clipboard');
});

const SHARE_LABELS = { share: 'Share this view', copied: 'Link copied', error: 'Could not copy' };

/** See share-view-button.test.tsx: userEvent.setup() overwrites its own clipboard stub. */
function stubClipboardAfterSetup(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

describe('CvContent', () => {
  it('con ?view=timeline muestra timeline aunque el AppearanceInit del layout monte antes y limpie la URL', async () => {
    window.history.pushState(null, '', '/en/cv?view=timeline');
    const { CvContent, AppearanceInit } = await importFreshComponents();

    // Real tree shape: layout mounts its AppearanceInit WITHOUT onView before the page.
    render(
      <>
        <AppearanceInit />
        <CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />
      </>,
    );

    expect(screen.getByRole('radio', { name: 'Timeline' })).toBeChecked();
    const lists = screen.getAllByRole('list');
    expect(lists.some((list) => list.tagName === 'OL')).toBe(true);
    // The first instance cleaned up the URL; the view arrived from cache, not location.
    expect(window.location.search).toBe('');
  });

  it('la vista elegida por el usuario gana sobre el deep link al remontar (navegar fuera y volver)', async () => {
    window.history.pushState(null, '', '/en/cv?view=timeline');
    const user = userEvent.setup();
    const { CvContent, AppearanceInit } = await importFreshComponents();

    // First load: deep link wins.
    const first = render(
      <>
        <AppearanceInit />
        <CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />
      </>,
    );
    expect(screen.getAllByRole('radio', { name: 'Timeline' })[0]).toBeChecked();

    // User switches to Compact (persisted) and navigates away (unmounts page).
    await user.click(screen.getAllByRole('radio', { name: 'Compact' })[0]!);
    first.unmount();

    // Navigates back to /cv via client navigation: SAME module (no resetModules), CvContent remounts.
    render(<CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />);

    expect(screen.getAllByRole('radio', { name: 'Compact' })[0]!).toBeChecked();
  });

  it('changing the view from the switcher persists the choice', async () => {
    const user = userEvent.setup();
    const { CvContent } = await importFreshComponents();
    render(<CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />);

    await user.click(screen.getByRole('radio', { name: 'Compact' }));

    expect(persistCvView).toHaveBeenCalledWith('compact');
    expect(screen.getByRole('radio', { name: 'Compact' })).toBeChecked();
  });

  it('renders the received shareSlot after the switcher', async () => {
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

  it('with shareLabels, the share button copies a URL with the active view', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboardAfterSetup(writeText);
    window.history.pushState(null, '', '/en/cv');
    const { CvContent } = await importFreshComponents();

    render(
      <CvContent
        locale="en"
        strings={STRINGS}
        switcherLabels={SWITCHER_LABELS}
        shareLabels={SHARE_LABELS}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 'Compact' }));
    await user.click(screen.getByRole('button', { name: SHARE_LABELS.share }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('view=compact'));
  });

  it('with printLabel, renders the print button that calls window.print()', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { CvContent } = await importFreshComponents();

    render(
      <CvContent
        locale="en"
        strings={STRINGS}
        switcherLabels={SWITCHER_LABELS}
        printLabel="Print CV"
      />,
    );

    const button = screen.getByRole('button', { name: 'Print CV' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });

  it('el contenedor de la barra de controles (switcher, print, share) tiene la clase no-print', async () => {
    const { CvContent } = await importFreshComponents();
    render(
      <CvContent
        locale="en"
        strings={STRINGS}
        switcherLabels={SWITCHER_LABELS}
        printLabel="Print CV"
      />,
    );

    const switcherGroup = screen.getByRole('radiogroup', { name: SWITCHER_LABELS.groupLabel });
    const controlsContainer = switcherGroup.parentElement;
    expect(controlsContainer).toHaveClass('no-print');
  });
});
