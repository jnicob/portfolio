import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeSwitcher } from './theme-switcher';

vi.mock('@/lib/appearance', () => ({
  applyTheme: vi.fn(),
}));

describe('ThemeSwitcher', () => {
  it('muestra cursor pointer en el botón disparador', () => {
    document.documentElement.dataset.theme = 'dark';
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
  });
});
