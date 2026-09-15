import type { AnchorHTMLAttributes } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { render, screen, createEvent, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import es from '../../../messages/es.json';
import { NavLink } from './nav-link';

const mockUsePathname = vi.hoisted(() => vi.fn());
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  usePathname: mockUsePathname,
  useRouter: () => ({ replace: vi.fn() }),
}));

function renderNavLink(href: string, label: string, pathname: string) {
  mockUsePathname.mockReturnValue(pathname);
  render(
    <NextIntlClientProvider locale="es" messages={es}>
      <NavLink href={href}>{label}</NavLink>
    </NextIntlClientProvider>,
  );
}

describe('NavLink', () => {
  it('marks current page link', () => {
    renderNavLink('/cv', 'CV', '/cv');
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('aria-current', 'page');
  });

  it('clicking active link does not navigate', () => {
    renderNavLink('/cv', 'CV', '/cv');
    const link = screen.getByRole('link', { name: 'CV' });
    const event = createEvent.click(link);
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('inactive link does not have aria-current and does not prevent navigation', () => {
    renderNavLink('/cv', 'CV', '/projects');
    const link = screen.getByRole('link', { name: 'CV' });
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('clicking section link from a sub-route navigates', () => {
    renderNavLink('/projects', 'Proyectos', '/projects/un-slug');
    const link = screen.getByRole('link', { name: 'Proyectos' });
    expect(link).toHaveAttribute('aria-current', 'page');
    const event = createEvent.click(link);
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(false);
  });
});
