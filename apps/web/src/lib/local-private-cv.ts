const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function extractHostname(rawHost: string): string {
  const trimmed = rawHost.trim().toLowerCase();
  if (!trimmed) return '';
  if (trimmed.startsWith('[')) {
    const endBracket = trimmed.indexOf(']');
    return endBracket === -1 ? '' : trimmed.slice(0, endBracket + 1);
  }
  const firstColon = trimmed.indexOf(':');
  const lastColon = trimmed.lastIndexOf(':');
  // Unbracketed IPv6 literal (multiple colons, e.g. ::1)
  if (firstColon !== -1 && firstColon !== lastColon) {
    return trimmed;
  }
  return firstColon === -1 ? trimmed : trimmed.slice(0, firstColon);
}

/**
 * Returns true strictly for local loopback hostnames (`localhost`, `127.0.0.1`, `::1`).
 */
export function isLoopbackHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  return LOOPBACK_HOSTS.has(extractHostname(hostHeader));
}

function isForwardedExternal(requestHeaders: Headers): boolean {
  const forwardedHost = requestHeaders.get('x-forwarded-host');
  if (forwardedHost && !isLoopbackHost(forwardedHost)) {
    return true;
  }
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIp = forwardedFor.split(',')[0]?.trim() ?? '';
    if (!isLoopbackHost(clientIp)) {
      return true;
    }
  }
  return false;
}

/**
 * Authorizes local-only private CV features (email/phone + private PDF download)
 * ONLY in `development` mode with explicit `CV_INCLUDE_PRIVATE=true` and a loopback request.
 */
export function isLocalPrivateCvAuthorized(requestHeaders: Headers, requestUrl?: string): boolean {
  if (process.env.NODE_ENV !== 'development' || process.env.CV_INCLUDE_PRIVATE !== 'true') {
    return false;
  }
  if (isForwardedExternal(requestHeaders)) {
    return false;
  }
  const hostHeader = requestHeaders.get('host');
  if (hostHeader) {
    return isLoopbackHost(hostHeader);
  }
  if (requestUrl) {
    try {
      return isLoopbackHost(new URL(requestUrl).host);
    } catch {
      return false;
    }
  }
  return false;
}
