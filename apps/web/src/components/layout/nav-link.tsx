'use client';

import type { MouseEvent, ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

export function NavLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();

  // Determinamos si el link está activo
  const isActive =
    pathname === props.href || (props.href !== '/' && pathname.startsWith(`${props.href}/`));

  // Solo prevenimos la navegación cuando el click es a la MISMA página (match
  // exacto): desde una sub-ruta (p. ej. /projects/foo), clicar el link de
  // sección (/projects) debe navegar a la lista, aunque quede marcado activo.
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === props.href) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href={props.href}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={
        isActive
          ? 'text-fg font-semibold underline decoration-accent underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          : 'text-fg-muted hover:text-fg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
      }
    >
      {props.children}
    </Link>
  );
}
