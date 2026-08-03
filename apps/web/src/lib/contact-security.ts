/**
 * Módulo de seguridad backend/endpoint para el formulario de contacto (nico-security):
 * - Rate limiting (control de frecuencia por IP o token)
 * - Sanitización de entradas (eliminación/escape de HTML/scripts e inyección de cabeceras email)
 * - Verificación Honeypot anti-spam
 */

// Almacén en memoria para el rate limiting
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

/**
 * Sanitiza una cadena de texto para evitar XSS, inyecciones de código HTML e inyección de cabeceras de email.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return (
    input
      .trim()
      // Elimina etiquetas <script> e <iframe> con su contenido
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Reemplaza caracteres HTML clave por sus entidades seguras
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
 * Verifica si el campo de honeypot está vacío.
 * Retorna `true` si es un humano (honeypot limpio), `false` si es un bot (honeypot relleno).
 */
export function verifyHoneypot(honeypotValue?: string | null): boolean {
  if (!honeypotValue) return true;
  return honeypotValue.trim().length === 0;
}

/**
 * Rate Limiting basado en ventana deslizante en memoria.
 * Limita a `maxRequests` por cada `windowMs` milisegundos para el identificador dado.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 10 * 60 * 1000, // 10 minutos por defecto
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
 * Resetea el almacén de rate limit (útil para testing).
 */
export function clearRateLimitStore(): void {
  rateLimitMap.clear();
}
