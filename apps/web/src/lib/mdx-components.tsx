import type { AnchorHTMLAttributes } from 'react';

/** Externo = absoluto http(s) o protocolo-relativo, que hereda el esquema. */
const EXTERNAL_HREF = /^(https?:)?\/\//;

/** Enlace `<a>` de contenido MDX: externo abre en pestaña nueva con rel seguro, interno se comporta como enlace normal. */
function ExternalAwareLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href !== undefined && EXTERNAL_HREF.test(href);
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    />
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
