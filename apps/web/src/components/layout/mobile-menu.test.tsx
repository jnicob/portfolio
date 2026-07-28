import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileMenu, type MobileMenuLabels } from './mobile-menu';
import { NavLink } from './nav-link';
import { SkinSwitcher, type SkinSwitcherLabels } from './skin-switcher';

vi.mock('@/i18n/navigation', () => ({
  Link: (props: ComponentProps<'a'>) => <a {...props} />,
  usePathname: () => '/',
}));

const SKIN_LABELS: SkinSwitcherLabels = {
  button: 'Skin',
  inputLabel: 'Filter skins',
  emptyMessage: 'No skins match',
  skinNames: {
    'dev-tool': 'Dev tool',
    editorial: 'Editorial',
    terminal: 'Terminal',
    vibrant: 'Vibrant',
  },
};

const labels: MobileMenuLabels = { open: 'Abrir menú', close: 'Cerrar menú' };

function renderMenu() {
  render(
    <MobileMenu labels={labels}>
      <NavLink href="/cv">CV</NavLink>
    </MobileMenu>,
  );
}

describe('MobileMenu', () => {
  afterEach(() => {
    delete document.documentElement.dataset.skin;
    localStorage.clear();
  });

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

  it('Escape con el dropdown de un switcher anidado abierto solo cierra ese dropdown, no el menú', () => {
    render(
      <MobileMenu labels={labels}>
        <SkinSwitcher labels={SKIN_LABELS} />
      </MobileMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skin' }));
    expect(screen.getByRole('combobox', { name: 'Filter skins' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Filter skins' }), {
      key: 'Escape',
    });

    expect(screen.queryByRole('combobox', { name: 'Filter skins' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('Escape con texto en el filtro del skin solo limpia el filtro: ni el dropdown ni el menú se cierran', () => {
    render(
      <MobileMenu labels={labels}>
        <SkinSwitcher labels={SKIN_LABELS} />
      </MobileMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skin' }));
    const combobox = screen.getByRole('combobox', { name: 'Filter skins' });
    fireEvent.change(combobox, { target: { value: 'term' } });

    fireEvent.keyDown(combobox, { key: 'Escape' });

    expect(screen.getByRole('combobox', { name: 'Filter skins' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
