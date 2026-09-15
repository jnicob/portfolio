'use client';

import type { MouseEvent, ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

export function NavLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();

  // Determine whether the link is active
  const isActive =
    pathname === props.href || (props.href !== '/' && pathname.startsWith(`${props.href}/`));

  // Only prevent navigation when click targets the SAME page (exact match):
  // from a sub-route (e.g. /projects/foo), clicking the section link
  // (/projects) must navigate to the list, even if marked active.
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
      className={cn(
        'group relative inline-flex items-center py-1 font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        isActive ? 'text-fg' : 'text-fg-muted hover:text-fg',
      )}
    >
      <span>{props.children}</span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-accent transition-all duration-300 ease-out origin-center',
          isActive
            ? 'opacity-100 scale-x-100'
            : 'opacity-0 scale-x-0 group-hover:opacity-30 group-hover:scale-x-50 pointer-events-none',
        )}
      />
    </Link>
  );
}
