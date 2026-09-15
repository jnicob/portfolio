// Official portfolio domain for Nico Behm.
const PLACEHOLDER = 'https://jnicob.dev';

/** Single source of truth for site origin. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER;
}
