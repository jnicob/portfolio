import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteUrl } from './site-url';

describe('siteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve el placeholder documentado sin NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined);
    expect(siteUrl()).toBe('https://example-placeholder.dev');
  });

  it('devuelve NEXT_PUBLIC_SITE_URL cuando está definida', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://nicobehm.dev');
    expect(siteUrl()).toBe('https://nicobehm.dev');
  });
});
