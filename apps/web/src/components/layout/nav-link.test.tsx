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
  it('marca el enlace de la página actual', () => {
    renderNavLink('/cv', 'CV', '/cv');
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('aria-current', 'page');
  });

  it('clicar el enlace activo no navega', () => {
    renderNavLink('/cv', 'CV', '/cv');
    const link = screen.getByRole('link', { name: 'CV' });
    const event = createEvent.click(link);
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('el enlace inactivo no lleva aria-current y no previene', () => {
    renderNavLink('/cv', 'CV', '/projects');
    const link = screen.getByRole('link', { name: 'CV' });
    expect(link).not.toHaveAttribute('aria-current');
  });
});
