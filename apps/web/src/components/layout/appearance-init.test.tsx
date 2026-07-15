import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppearanceInit } from './appearance-init';

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
});

describe('AppearanceInit', () => {
  it('aplica la apariencia de la URL, notifica la vista y limpia solo sus propios params', () => {
    window.history.pushState(null, '', '/es/cv?skin=terminal&utm=x');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const onView = vi.fn();

    render(<AppearanceInit onView={onView} />);

    expect(document.documentElement.dataset.skin).toBe('terminal');
    expect(onView).toHaveBeenCalledWith('standard');
    expect(replaceSpy).toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe('/es/cv?utm=x');
  });

  it('no reescribe la URL si no había params de apariencia', () => {
    window.history.pushState(null, '', '/es/cv?utm=x');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    render(<AppearanceInit />);

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe('/es/cv?utm=x');
  });
});
