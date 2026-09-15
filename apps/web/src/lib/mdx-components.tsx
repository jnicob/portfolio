import type { AnchorHTMLAttributes } from 'react';
import { Link } from '@/i18n/navigation';

/** Externo = absoluto http(s) o protocolo-relativo, que hereda el esquema. */
const EXTERNAL_HREF = /^(https?:)?\/\//;

/** MDX content `<a>` link: external opens in new tab with safe rel, internal uses i18n Link. */
function ExternalAwareLink({
  href = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = EXTERNAL_HREF.test(href);
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  // Normalize relative MDX links (e.g. ./freepik-api-platform → /projects/freepik-api-platform)
  const normalizedHref = href.startsWith('./') ? href.replace(/^\.\//, '/projects/') : href;

  return (
    <Link href={normalizedHref} {...props}>
      {children}
    </Link>
  );
}

/**
 * MDX component map for `compileMDX` (T20/E2-E3): currently only overrides `a`.
 * Intentionally without explicit type annotation: `mdx/types` is not a direct dependency
 * of apps/web (only transitive via next-mdx-remote) and does not resolve in its type context;
 * TS infers the concrete shape here and validates it structurally when passing to `compileMDX`.
 */
export const mdxComponents = {
  a: ExternalAwareLink,
};
