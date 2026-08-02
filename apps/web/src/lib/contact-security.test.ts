import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkRateLimit,
  clearRateLimitStore,
  sanitizeHeader,
  sanitizeText,
  verifyHoneypot,
} from './contact-security';

describe('contact-security (nico-security)', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe('sanitizeText & sanitizeHeader', () => {
    it('escapa caracteres HTML peligrosos', () => {
      const malicious = '<script>alert("xss")</script> <b>Hola</b> & "test"';
      const clean = sanitizeText(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;b&gt;Hola&lt;/b&gt;');
      expect(clean).toContain('&amp;');
      expect(clean).toContain('&quot;test&quot;');
    });

    it('elimina etiquetas iframe', () => {
      const malicious = '<iframe src="http://evil.com"></iframe>';
      const clean = sanitizeText(malicious);
      expect(clean).not.toContain('<iframe');
    });

    it('elimina saltos de línea CRLF en cabeceras de email', () => {
      const headerWithInjection = 'Asunto\r\nBcc: victim@example.com';
      const cleanHeader = sanitizeHeader(headerWithInjection);
      expect(cleanHeader).not.toContain('\r');
      expect(cleanHeader).not.toContain('\n');
      expect(cleanHeader).toBe('Asunto  Bcc: victim@example.com');
    });
  });

  describe('verifyHoneypot', () => {
    it('retorna true para humanos (campo vacío u omiso)', () => {
      expect(verifyHoneypot('')).toBe(true);
      expect(verifyHoneypot(undefined)).toBe(true);
      expect(verifyHoneypot(null)).toBe(true);
      expect(verifyHoneypot('   ')).toBe(true);
    });

    it('retorna false para bots (campo con datos)', () => {
      expect(verifyHoneypot('buy cheap pills')).toBe(false);
      expect(verifyHoneypot('http://bot-link.com')).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('permite peticiones dentro del límite', () => {
      const res1 = checkRateLimit('user-1', 2, 60000);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(1);

      const res2 = checkRateLimit('user-1', 2, 60000);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(0);
    });

    it('bloquea peticiones al exceder el límite', () => {
      checkRateLimit('user-2', 1, 60000);
      const blocked = checkRateLimit('user-2', 1, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });
  });
});
