import { afterEach, describe, expect, it } from 'vitest';
import { buildShareUrl, resolveAppearance, applyAppearance, applyTheme } from './appearance';

function resolve(search: string, stored: Partial<Record<'theme' | 'skin' | 'view', string>> = {}) {
  return resolveAppearance({
    params: new URLSearchParams(search),
    stored: { theme: stored.theme ?? null, skin: stored.skin ?? null, view: stored.view ?? null },
    prefersLight: false,
  });
}

describe('resolveAppearance — precedencia URL > storage > default', () => {
  it('URL válida gana a storage', () => {
    const r = resolve('?theme=light&skin=terminal&view=timeline', {
      theme: 'dark',
      skin: 'vibrant',
    });
    expect(r).toMatchObject({
      theme: 'light',
      skin: 'terminal',
      view: 'timeline',
      hadUrlParams: true,
    });
  });
  it('URL inválida cae a storage; storage inválido cae a default', () => {
    expect(resolve('?skin=neon', { skin: 'editorial' }).skin).toBe('editorial');
    expect(resolve('?skin=neon', { skin: 'wat' }).skin).toBe('dev-tool');
    expect(resolve('', {}).theme).toBe('dark');
  });
  it('prefersLight solo decide sin URL ni storage', () => {
    expect(
      resolveAppearance({
        params: new URLSearchParams(''),
        stored: { theme: null, skin: null, view: null },
        prefersLight: true,
      }).theme,
    ).toBe('light');
  });
  it('view default standard', () => {
    expect(resolve('').view).toBe('standard');
  });
});

describe('applyAppearance / applyTheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.skin;
    localStorage.clear();
  });
  it('dev-tool NO pone data-skin; otros sí', () => {
    applyAppearance({ theme: 'dark', skin: 'editorial' });
    expect(document.documentElement.dataset.skin).toBe('editorial');
    applyAppearance({ theme: 'dark', skin: 'dev-tool' });
    expect(document.documentElement.dataset.skin).toBeUndefined();
  });
  it('applyTheme conserva el skin aplicado (paridad con el ThemeSwitcher actual)', () => {
    applyAppearance({ theme: 'dark', skin: 'terminal' });
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.dataset.skin).toBe('terminal');
  });
  it('persiste en localStorage y tolera storage roto (try/catch)', () => {
    applyAppearance({ theme: 'light', skin: 'editorial' });
    expect(localStorage.getItem('theme')).toBe('light');
    expect(localStorage.getItem('skin')).toBe('editorial');

    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('storage no disponible');
    };
    try {
      expect(() => applyAppearance({ theme: 'dark', skin: 'vibrant' })).not.toThrow();
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});

describe('buildShareUrl', () => {
  it('incluye theme y skin siempre, view solo si se pasa', () => {
    expect(
      buildShareUrl({
        origin: 'https://x.dev',
        pathname: '/es/cv',
        theme: 'light',
        skin: 'terminal',
        view: 'compact',
      }),
    ).toBe('https://x.dev/es/cv?theme=light&skin=terminal&view=compact');
    expect(
      buildShareUrl({
        origin: 'https://x.dev',
        pathname: '/en/showcase',
        theme: 'dark',
        skin: 'dev-tool',
      }),
    ).toBe('https://x.dev/en/showcase?theme=dark&skin=dev-tool');
  });
});
