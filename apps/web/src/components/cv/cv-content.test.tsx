import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvStrings } from './cv-standard';
import type { CvViewSwitcherLabels } from './cv-view-switcher';

const { persistCvView } = vi.hoisted(() => ({ persistCvView: vi.fn() }));

vi.mock('@/lib/appearance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/appearance')>();
  // Spy write-through: registra llamadas Y escribe a storage, porque AppearanceInit
  // resuelve la vista leyendo storage fresco en cada montaje.
  persistCvView.mockImplementation(actual.persistCvView);
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
  Reflect.deleteProperty(navigator, 'clipboard');
});

const SHARE_LABELS = { share: 'Share this view', copied: 'Link copied', error: 'Could not copy' };

/** Ver share-view-button.test.tsx: userEvent.setup() pisa su propio stub de clipboard. */
function stubClipboardAfterSetup(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

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

  it('la vista elegida por el usuario gana sobre el deep link al remontar (navegar fuera y volver)', async () => {
    window.history.pushState(null, '', '/en/cv?view=timeline');
    const user = userEvent.setup();
    const { CvContent, AppearanceInit } = await importFreshComponents();

    // Primera carga: deep link gana.
    const first = render(
      <>
        <AppearanceInit />
        <CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />
      </>,
    );
    expect(screen.getAllByRole('radio', { name: 'Timeline' })[0]).toBeChecked();

    // El usuario cambia a Compact (persistida) y navega fuera (unmount de la página).
    await user.click(screen.getAllByRole('radio', { name: 'Compact' })[0]!);
    first.unmount();

    // Vuelve a /cv por navegación client: MISMO módulo (sin resetModules), CvContent remonta.
    render(<CvContent locale="en" strings={STRINGS} switcherLabels={SWITCHER_LABELS} />);

    expect(screen.getAllByRole('radio', { name: 'Compact' })[0]!).toBeChecked();
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

  it('con shareLabels, el botón de compartir copia una URL con la vista activa', async () => {
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

  it('con printLabel, renderiza el botón de imprimir que llama a window.print()', async () => {
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
});
