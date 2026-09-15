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
 * Sanitiza campos de cabecera de email (Subject, Email) evitando inyecciones CRLF (\r\n).
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
 * In-memory sliding window rate limiting.
 * Limits to `maxRequests` per `windowMs` milliseconds for the given identifier.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 10 * 60 * 1000, // 10 minutes by default
): RateLimitResult {
  const now = Date.now();
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
 * Resets the rate limit store (useful for testing).
 */
export function clearRateLimitStore(): void {
  rateLimitMap.clear();
}
