import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeSwitcher } from './theme-switcher';

vi.mock('@/lib/appearance', () => ({
  // La mock-implementation replica la mutación real de applyTheme sobre el
  // DOM (dataset.theme), que es lo que el MutationObserver observa.
  applyTheme: vi.fn((theme: string) => {
    document.documentElement.dataset.theme = theme;
  }),
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

  it('dos instancias montadas a la vez quedan sincronizadas: click en una actualiza la otra', async () => {
    document.documentElement.dataset.theme = 'dark';
    render(
      <>
        <ThemeSwitcher />
        <ThemeSwitcher />
      </>,
    );
    const [first, second] = screen.getAllByRole('button');
    expect(first).toHaveTextContent('☀️');
    expect(second).toHaveTextContent('☀️');

    first?.click();

    await waitFor(() => {
      expect(screen.getAllByRole('button')[1]).toHaveTextContent('🌙');
    });
    expect(screen.getAllByRole('button')[0]).toHaveTextContent('🌙');
  });
});
