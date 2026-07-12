import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { MediaLightbox } from './media-lightbox';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <MediaLightbox open={open} onClose={() => setOpen(false)} label="Vista de imagen">
        <img src="/full.png" alt="Resultado completo" />
        <a href="/download">Descargar</a>
      </MediaLightbox>
    </>
  );
}

describe('MediaLightbox', () => {
  it('no renderiza nada cerrado', () => {
    render(
      <MediaLightbox open={false} onClose={() => {}} label="X">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('abre como dialog modal etiquetado y enfoca el botón de cerrar', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Vista de imagen' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Escape cierra y devuelve el foco al trigger', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('el foco queda atrapado dentro (Tab cicla)', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const close = screen.getByRole('button', { name: 'Close' });
    const link = screen.getByRole('link', { name: 'Descargar' });
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(link).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(link).toHaveFocus();
  });

  it('Tab desde un elemento no rastreado (p.ej. vídeo enfocado) no escapa del dialog', async () => {
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <div tabIndex={-1} data-testid="media-surface" />
        <a href="/download">Descargar</a>
      </MediaLightbox>,
    );
    screen.getByTestId('media-surface').focus();
    expect(screen.getByTestId('media-surface')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('con el foco en el root del dialog (click en contenido no enfocable), Escape y Tab siguen funcionando', async () => {
    // En navegador, click sobre contenido no enfocable mueve el foco al ancestro
    // enfocable más cercano; el root del dialog debe serlo (tabIndex=-1) para que
    // sus handlers de teclado sigan recibiendo los eventos.
    const onClose = vi.fn();
    render(
      <MediaLightbox open onClose={onClose} label="V">
        <img src="/a.png" alt="contenido" />
        <a href="/download">Descargar</a>
      </MediaLightbox>,
    );
    const dialog = screen.getByRole('dialog');
    dialog.focus();
    expect(dialog).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    dialog.focus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('click en el overlay cierra, click en el contenido no', async () => {
    const onClose = vi.fn();
    render(
      <MediaLightbox open onClose={onClose} label="V">
        <img src="/a.png" alt="contenido" />
      </MediaLightbox>,
    );
    await userEvent.click(screen.getByAltText('contenido'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
