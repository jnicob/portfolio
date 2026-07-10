import { describe, expect, it } from 'vitest';
import { resolveInitialTheme } from './theme';

describe('resolveInitialTheme', () => {
  it('respeta el tema almacenado', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
    expect(resolveInitialTheme('dark', true)).toBe('dark');
  });

  it('cae a la preferencia del sistema sin almacenado', () => {
    expect(resolveInitialTheme(null, true)).toBe('light');
    expect(resolveInitialTheme(null, false)).toBe('dark');
  });

  it('ignora valores corruptos y usa la preferencia', () => {
    expect(resolveInitialTheme('wat', false)).toBe('dark');
    expect(resolveInitialTheme('wat', true)).toBe('light');
  });
});
