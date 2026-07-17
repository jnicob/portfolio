import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('acepta texto', async () => {
    render(<Input aria-label="Nombre" />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Nico');
    expect(screen.getByRole('textbox')).toHaveValue('Nico');
  });

  it('tiene transición de color y hover coherente con Button', () => {
    render(<Input aria-label="Nombre" />);
    expect(screen.getByRole('textbox')).toHaveClass('transition-colors', 'hover:border-fg-muted');
  });
});
