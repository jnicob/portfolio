import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkRateLimit,
  clearRateLimitStore,
  getRateLimitStoreSize,
  sanitizeHeader,
  sanitizeText,
  verifyHoneypot,
  verifySubmissionTime,
} from './contact-security';

describe('contact-security (nico-security)', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe('sanitizeText & sanitizeHeader', () => {
    it('escapes dangerous HTML characters', () => {
      const malicious = '<script>alert("xss")</script> <b>Hola</b> & "test"';
      const clean = sanitizeText(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;b&gt;Hola&lt;/b&gt;');
      expect(clean).toContain('&amp;');
      expect(clean).toContain('&quot;test&quot;');
    });

    it('removes iframe tags', () => {
      const malicious = '<iframe src="http://evil.com"></iframe>';
      const clean = sanitizeText(malicious);
      expect(clean).not.toContain('<iframe');
    });

    it('removes CRLF line breaks in email headers', () => {
      const headerWithInjection = 'Asunto\r\nBcc: victim@example.com';
      const cleanHeader = sanitizeHeader(headerWithInjection);
      expect(cleanHeader).not.toContain('\r');
      expect(cleanHeader).not.toContain('\n');
      expect(cleanHeader).toBe('Asunto  Bcc: victim@example.com');
    });
  });

  describe('verifyHoneypot', () => {
    it('returns true for humans (empty or omitted field)', () => {
      expect(verifyHoneypot('')).toBe(true);
      expect(verifyHoneypot(undefined)).toBe(true);
      expect(verifyHoneypot(null)).toBe(true);
      expect(verifyHoneypot('   ')).toBe(true);
    });

    it('returns false for bots (filled field)', () => {
      expect(verifyHoneypot('buy cheap pills')).toBe(false);
      expect(verifyHoneypot('http://bot-link.com')).toBe(false);
    });
  });

  describe('verifySubmissionTime', () => {
    it('returns true when ts is omitted or elapsed time meets minimum threshold', () => {
      const now = 1_700_000_000_000;
      expect(verifySubmissionTime(undefined, 3, now)).toBe(true);
      expect(verifySubmissionTime(null, 3, now)).toBe(true);
      expect(verifySubmissionTime(now - 3500, 3, now)).toBe(true);
    });

    it('returns false when submission is faster than minimum threshold or invalid', () => {
      const now = 1_700_000_000_000;
      expect(verifySubmissionTime(now - 500, 3, now)).toBe(false);
      expect(verifySubmissionTime(0, 3, now)).toBe(false);
      expect(verifySubmissionTime(-100, 3, now)).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('allows requests within the limit', () => {
      const res1 = checkRateLimit('user-1', 2, 60000);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(1);

      const res2 = checkRateLimit('user-1', 2, 60000);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(0);
    });

    it('blocks requests when exceeding the limit', () => {
      checkRateLimit('user-2', 1, 60000);
      const blocked = checkRateLimit('user-2', 1, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });

    it('prunes expired records from memory when checking new requests', async () => {
      checkRateLimit('expired-ip-1', 2, 5);
      checkRateLimit('expired-ip-2', 2, 5);
      expect(getRateLimitStoreSize()).toBe(2);

      await new Promise((resolve) => setTimeout(resolve, 15));
      checkRateLimit('active-ip', 2, 60000);
      expect(getRateLimitStoreSize()).toBe(1);
    });
  });
});
