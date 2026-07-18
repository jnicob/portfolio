import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileMenu, type MobileMenuLabels } from './mobile-menu';
import { NavLink } from './nav-link';

vi.mock('@/i18n/navigation', () => ({
  Link: (props: ComponentProps<'a'>) => <a {...props} />,
  usePathname: () => '/',
}));

const labels: MobileMenuLabels = { open: 'Abrir menú', close: 'Cerrar menú' };

function renderMenu() {
  render(
    <MobileMenu labels={labels}>
      <NavLink href="/cv">CV</NavLink>
    </MobileMenu>,
  );
}

describe('MobileMenu', () => {
  it('abre y cierra con aria-expanded correcto', () => {
    renderMenu();
    const button = screen.getByRole('button', { name: 'Abrir menú' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('link', { name: 'CV' })).toBeVisible();
  });

  it('Escape cierra y devuelve el foco al botón', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveFocus();
  });

  it('clicar un enlace cierra el panel', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    fireEvent.click(screen.getByRole('link', { name: 'CV' }));
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
