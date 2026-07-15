import type { ComponentProps } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import en from '../../../messages/en.json';
import es from '../../../messages/es.json';
import { SiteHeader } from './header';

vi.mock('@/i18n/navigation', () => ({
  Link: (props: ComponentProps<'a'>) => <a {...props} />,
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

function renderAt(locale: 'es' | 'en') {
  const messages = locale === 'es' ? es : en;
  render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SiteHeader />
    </NextIntlClientProvider>,
  );
}

describe('SiteHeader', () => {
  it('renderiza la navegación con nombre accesible y enlaces en español', () => {
    renderAt('es');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Showcase' })).toHaveAttribute('href', '/showcase');
  });

  it('renderiza la navegación con nombre accesible y enlaces en inglés, junto al ThemeSwitcher', () => {
    renderAt('en');
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Showcase' })).toHaveAttribute('href', '/showcase');
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
  });
});
