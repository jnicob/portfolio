/**
 * Backend/endpoint security module for contact form (nico-security):
 * - Rate limiting (frequency control by IP or token)
 * - Input sanitization (HTML/script removal/escaping and email header injection defense)
 * - Anti-spam Honeypot verification
 */

// In-memory store for rate limiting
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

/**
 * Sanitizes a text string to prevent XSS, HTML code injection, and email header injection.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return (
    input
      .trim()
      // Removes <script> and <iframe> tags with their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Replaces key HTML characters with safe entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  );
}

/**
 * Sanitizes email header fields (Subject, Email) preventing CRLF (\r\n) injection.
 */
export function sanitizeHeader(input: string): string {
  if (!input) return '';
  return sanitizeText(input).replace(/[\r\n]/g, ' ');
}

/**
 * Checks if the honeypot field is empty.
 * Returns `true` if it's a human (clean honeypot), `false` if it's a bot (filled honeypot).
 */
export function verifyHoneypot(honeypotValue?: string | null): boolean {
  if (!honeypotValue) return true;
  return honeypotValue.trim().length === 0;
}

/**
 * Verifies that the form submission took at least `minSeconds` since `ts` (form mount time).
 * If `ts` is omitted (`undefined` or `null`), returns `true`.
 */
export function verifySubmissionTime(
  ts?: number | null,
  minSeconds: number = 3,
  nowMs: number = Date.now(),
): boolean {
  if (ts === undefined || ts === null) return true;
  if (!Number.isFinite(ts) || ts <= 0) return false;
  const elapsedSeconds = (nowMs - ts) / 1000;
  return elapsedSeconds >= minSeconds;
}

function pruneExpiredRateLimits(now: number): void {
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.expiresAt) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * In-memory sliding window rate limiting.
 * Limits to `maxRequests` per `windowMs` milliseconds for the given identifier.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 10 * 60 * 1000, // 10 minutes by default
): RateLimitResult {
  const now = Date.now();
  pruneExpiredRateLimits(now);
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.expiresAt) {
    const expiresAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, expiresAt });
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: record.expiresAt - now,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMs: record.expiresAt - now,
  };
}

/**
 * Returns the active number of tracked identifiers in the rate limit store.
 */
export function getRateLimitStoreSize(): number {
  return rateLimitMap.size;
}

/**
 * Resets the rate limit store (useful for testing).
 */
export function clearRateLimitStore(): void {
  rateLimitMap.clear();
}
