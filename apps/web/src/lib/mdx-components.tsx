import type { AnchorHTMLAttributes } from 'react';
import { Link } from '@/i18n/navigation';

/** Externo = absoluto http(s) o protocolo-relativo, que hereda el esquema. */
const EXTERNAL_HREF = /^(https?:)?\/\//;

/** Enlace `<a>` de contenido MDX: externo abre en pestaña nueva con rel seguro, interno usa Link de i18n. */
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

  // Normaliza enlaces relativos de MDX (ej: ./freepik-api-platform → /projects/freepik-api-platform)
  const normalizedHref = href.startsWith('./') ? href.replace(/^\.\//, '/projects/') : href;

  return (
    <Link href={normalizedHref} {...props}>
      {children}
    </Link>
  );
}

/**
 * Map de componentes MDX para `compileMDX` (T20/E2-E3): hoy solo sobreescribe `a`.
 * Sin anotación de tipo explícita a propósito: `mdx/types` no es dependencia directa
 * de apps/web (solo transitiva vía next-mdx-remote) y no resuelve en su contexto de tipos;
 * TS infiere la forma concreta aquí y la valida por estructura al pasarla a `compileMDX`.
 */
export const mdxComponents = {
  a: ExternalAwareLink,
};
