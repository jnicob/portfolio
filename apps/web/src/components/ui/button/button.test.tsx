import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders a native button with its content', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('dispara onClick al activarse con teclado', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies classes by variant and size', () => {
    render(
      <Button variant="danger" size="sm">
        Borrar
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-danger');
    expect(btn.className).toContain('h-8');
  });

  // A2 (cursor convention, Phase 3.6): in Tailwind v4 `<button>` no longer comes with
  // `cursor: pointer` by default — without this explicit class, every real button in the
  // app (incl. los del showcase) mostraba cursor por defecto pese a ser interactivo.
  it('es cursor-pointer en cualquier variante (es un control interactivo real)', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
  });
});
