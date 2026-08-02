import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteUrl } from './site-url';

describe('siteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve el dominio por defecto jnicob.dev sin NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined);
    expect(siteUrl()).toBe('https://jnicob.dev');
  });

  it('devuelve NEXT_PUBLIC_SITE_URL cuando está definida', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://nicobehm.dev');
    expect(siteUrl()).toBe('https://nicobehm.dev');
  });
});
