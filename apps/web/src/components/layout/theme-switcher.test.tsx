import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeSwitcher } from './theme-switcher';

vi.mock('@/lib/appearance', () => ({
  applyTheme: vi.fn(),
}));

describe('ThemeSwitcher', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    localStorage.clear();
  });

  it('muestra cursor pointer en el botón disparador', () => {
    document.documentElement.dataset.theme = 'dark';
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
  });
});
