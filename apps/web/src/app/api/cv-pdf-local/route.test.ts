import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/cv-pdf-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/cv-pdf-local', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 404 outside development mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');

    const res = await POST(makeRequest({ locale: 'es', view: 'standard', photo: false }));
    expect(res.status).toBe(404);
  });

  it('returns 404 in development when CV_INCLUDE_PRIVATE is not true', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'false');

    const res = await POST(makeRequest({ locale: 'es', view: 'standard', photo: false }));
    expect(res.status).toBe(404);
  });

  it('returns 400 on invalid payload in development with CV_INCLUDE_PRIVATE=true', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');

    const res = await POST(makeRequest({ locale: 'fr', view: '../secret', photo: 'yes' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when the requested private PDF has not been generated yet', async () => {
    const emptyDir = mkdtempSync(path.join(tmpdir(), 'cv-private-empty-'));
    try {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');
      vi.stubEnv('CV_PRIVATE_PDF_DIR', emptyDir);

      const res = await POST(makeRequest({ locale: 'es', view: 'compact', photo: true }));
      expect(res.status).toBe(404);
    } finally {
      rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  it('serves private contact JSON in contact mode only for loopback requests', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');
    vi.stubEnv('CV_EMAIL', 'contact@example.com');
    vi.stubEnv('CV_PHONE', '+34 600 000 000');

    const res = await POST(makeRequest({ mode: 'contact' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({
      email: 'contact@example.com',
      phone: '+34 600 000 000',
    });
  });

  it('serves the local private PDF bytes when present in development with CV_INCLUDE_PRIVATE=true', async () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'cv-private-ok-'));
    try {
      writeFileSync(path.join(tempDir, 'Nico-Behm-CV-ES-compact-photo.pdf'), '%PDF-1.4\n%%EOF\n');
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('CV_INCLUDE_PRIVATE', 'true');
      vi.stubEnv('CV_PRIVATE_PDF_DIR', tempDir);

      const res = await POST(makeRequest({ locale: 'es', view: 'compact', photo: true }));
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/pdf');
      expect(res.headers.get('Content-Disposition')).toContain('Nico-Behm-CV-ES-compact-photo.pdf');
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(Buffer.from(bytes.subarray(0, 5)).toString('utf8')).toBe('%PDF-');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
