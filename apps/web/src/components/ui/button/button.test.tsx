import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renderiza un botón nativo con su contenido', () => {
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

  it('no dispara onClick cuando está disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica clases por variante y tamaño', () => {
    render(
      <Button variant="danger" size="sm">
        Borrar
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-danger');
    expect(btn.className).toContain('h-8');
  });

  // A2 (convención de cursor, Fase 3.6): en Tailwind v4 `<button>` ya no trae
  // `cursor: pointer` por defecto — sin esta clase explícita, todo botón real de la
  // app (incl. los del showcase) mostraba cursor por defecto pese a ser interactivo.
  it('es cursor-pointer en cualquier variante (es un control interactivo real)', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
  });
});
