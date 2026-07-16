// Placeholder documentado en apps/web/.env.example hasta que exista dominio propio.
const PLACEHOLDER = 'https://example-placeholder.dev';

/** Fuente única del origen del sitio; placeholder hasta que exista dominio. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER;
}
