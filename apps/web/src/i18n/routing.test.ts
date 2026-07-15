import { describe, expect, it } from 'vitest';
import { routing } from './routing';

describe('routing', () => {
  it('define es y en con en como default', () => {
    expect(routing.locales).toEqual(['es', 'en']);
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('always');
  });
});
