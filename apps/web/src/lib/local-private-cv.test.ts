import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isLocalPrivateCvAuthorized, isLoopbackHost } from './local-private-cv';

describe('isLoopbackHost', () => {
  it('accepts localhost, 127.0.0.1, and ::1 with optional ports', () => {
    expect(isLoopbackHost('localhost:3000')).toBe(true);
    expect(isLoopbackHost('127.0.0.1:45123')).toBe(true);
    expect(isLoopbackHost('[::1]:3000')).toBe(true);
    expect(isLoopbackHost('::1')).toBe(true);
  });

  it('rejects LAN IPs, public hostnames, and empty values', () => {
    expect(isLoopbackHost('192.168.1.42:3000')).toBe(false);
    expect(isLoopbackHost('jnicob.dev')).toBe(false);
    expect(isLoopbackHost('')).toBe(false);
    expect(isLoopbackHost(null)).toBe(false);
  });
});

describe('isLocalPrivateCvAuthorized', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires development mode and CV_INCLUDE_PRIVATE=true', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');
    expect(isLocalPrivateCvAuthorized(new Headers({ host: 'localhost:3000' }))).toBe(false);

    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'false');
    expect(isLocalPrivateCvAuthorized(new Headers({ host: 'localhost:3000' }))).toBe(false);
  });

  it('rejects non-loopback hosts and reverse-proxied external requests', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');

    expect(isLocalPrivateCvAuthorized(new Headers({ host: '192.168.1.10:3000' }))).toBe(false);
    expect(
      isLocalPrivateCvAuthorized(
        new Headers({ host: 'localhost:3000', 'x-forwarded-host': 'evil.example.com' }),
      ),
    ).toBe(false);
    expect(
      isLocalPrivateCvAuthorized(
        new Headers({ host: 'localhost:3000', 'x-forwarded-for': '203.0.113.5' }),
      ),
    ).toBe(false);
    expect(isLocalPrivateCvAuthorized(new Headers({ host: 'localhost:3000' }))).toBe(true);
  });
});
