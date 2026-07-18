'use client';

import type { ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

export function NavLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();

  // Determinamos si el link está activo
  const isActive =
    pathname === props.href || (props.href !== '/' && pathname.startsWith(`${props.href}/`));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
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
          ? 'text-fg font-semibold underline decoration-accent underline-offset-8'
          : 'text-fg-muted hover:text-fg transition-colors'
      }
    >
      {props.children}
    </Link>
  );
}
