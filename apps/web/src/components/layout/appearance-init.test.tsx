import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('una segunda instancia no re-lee location: recibe la vista cacheada aunque la URL ya esté limpia', async () => {
    window.history.pushState(null, '', '/es/cv?view=timeline');
    const AppearanceInit = await importFreshAppearanceInit();

    // Orden real: el layout monta el suyo (sin onView) primero y limpia la URL.
    render(<AppearanceInit />);
    expect(window.location.search).toBe('');

    const onView = vi.fn();
    render(<AppearanceInit onView={onView} />);

    expect(onView).toHaveBeenCalledWith('timeline');
  });
});
