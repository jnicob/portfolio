import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '@/lib/appearance';

/**
 * AppearanceInit cachea la resolución a nivel de módulo (one-shot): cada test necesita
 * un módulo fresco — `vi.resetModules()` en beforeEach + import dinámico por test.
 */
async function importFreshAppearanceInit() {
  const { AppearanceInit } = await import('./appearance-init');
  return AppearanceInit;
}

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
});

describe('AppearanceInit', () => {
  it('aplica la apariencia de la URL, notifica la vista y limpia solo sus propios params', async () => {
    window.history.pushState(null, '', '/es/cv?skin=terminal&utm=x');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const onView = vi.fn();
    const AppearanceInit = await importFreshAppearanceInit();

    render(<AppearanceInit onView={onView} />);

    expect(document.documentElement.dataset.skin).toBe('terminal');
    expect(onView).toHaveBeenCalledWith('standard');
    expect(replaceSpy).toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe('/es/cv?utm=x');
  });

  it('no reescribe la URL si no había params de apariencia', async () => {
    window.history.pushState(null, '', '/es/cv?utm=x');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const AppearanceInit = await importFreshAppearanceInit();

    render(<AppearanceInit />);

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe('/es/cv?utm=x');
  });

  it('una segunda instancia recibe la vista del deep link aunque la primera ya limpió la URL', async () => {
    window.history.pushState(null, '', '/es/cv?view=timeline');
    const AppearanceInit = await importFreshAppearanceInit();

    // Orden real: el layout monta el suyo (sin onView) primero y limpia la URL.
    render(<AppearanceInit />);
    expect(window.location.search).toBe('');

    const onView = vi.fn();
    render(<AppearanceInit onView={onView} />);

    expect(onView).toHaveBeenCalledWith('timeline');
  });

  it('la view de la URL se consume una vez: un remount posterior reporta la view persistida, no la del deep link', async () => {
    window.history.pushState(null, '', '/es/cv?view=timeline');
    const AppearanceInit = await importFreshAppearanceInit();

    const first = render(<AppearanceInit onView={vi.fn()} />);
    // La view del deep link quedó persistida como parte del one-shot.
    expect(localStorage.getItem(STORAGE_KEYS.cvView)).toBe('timeline');

    // El usuario cambia de vista (CvContent persiste) y navega fuera.
    localStorage.setItem(STORAGE_KEYS.cvView, 'compact');
    first.unmount();

    // Remount con el MISMO módulo (sin resetModules): storage fresco debe ganar.
    const onView = vi.fn();
    render(<AppearanceInit onView={onView} />);

    expect(onView).toHaveBeenCalledWith('compact');
  });
});
