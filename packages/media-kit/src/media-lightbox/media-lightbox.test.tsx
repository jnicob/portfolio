import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('el foco queda atrapado dentro (Tab cicla por contenido y toolbar)', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const close = screen.getByRole('button', { name: 'Close' });
    const link = screen.getByRole('link', { name: 'Descargar' });
    expect(close).toHaveFocus();
    // close es el último focusable del dialog → Tab envuelve al primero (el enlace)
    await userEvent.tab();
    expect(link).toHaveFocus();
    // Shift+Tab desde el primero envuelve al último (close)
    await userEvent.tab({ shift: true });
    expect(close).toHaveFocus();
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
    // El primer focusable del dialog ahora es el enlace del contenido (la toolbar va después).
    expect(screen.getByRole('link', { name: 'Descargar' })).toHaveFocus();
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

function mockSizes(el: HTMLElement, width: number, height: number) {
  Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true });
}

describe('MediaLightbox v2', () => {
  it('renderiza la toolbar por defecto; controls=false vuelve al close standalone v1', () => {
    const { rerender } = render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    expect(screen.getByRole('group', { name: 'Controls' })).toBeInTheDocument();
    rerender(
      <MediaLightbox open controls={false} onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    expect(screen.queryByRole('group', { name: 'Controls' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('cicla el fit y cambiar de fit resetea el zoom', async () => {
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-fit', 'contain');
    await userEvent.keyboard('+');
    expect(screen.getByText('150%')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Fit: contain/ }));
    expect(dialog).toHaveAttribute('data-fit', 'cover');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('teclado: "+" sube el zoom, "0" resetea', async () => {
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    await userEvent.keyboard('+');
    await userEvent.keyboard('+');
    expect(screen.getByText('225%')).toBeInTheDocument();
    await userEvent.keyboard('0');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('"c" oculta la toolbar (inert) y el toggle refleja aria-expanded', async () => {
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    const toggle = screen.getByRole('button', { name: 'Hide controls' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('c');
    expect(screen.getByRole('button', { name: 'Show controls' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    const region = document.querySelector('.mk-lightbox__controls-region');
    expect(region).toHaveAttribute('inert');
  });

  it('auto-hide: la toolbar se oculta tras el delay y reaparece al mover el puntero', () => {
    vi.useFakeTimers();
    try {
      render(
        <MediaLightbox open autoHideDelay={3000} onClose={() => {}} label="V">
          <img src="/a.png" alt="a" />
        </MediaLightbox>,
      );
      const region = document.querySelector('.mk-lightbox__controls-region');
      expect(region).toHaveAttribute('data-visible', 'true');
      act(() => vi.advanceTimersByTime(3000));
      expect(region).toHaveAttribute('data-visible', 'false');
      fireEvent.pointerMove(screen.getByRole('dialog'));
      expect(region).toHaveAttribute('data-visible', 'true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('no se auto-oculta mientras la toolbar tiene el foco', () => {
    vi.useFakeTimers();
    try {
      render(
        <MediaLightbox open autoHideDelay={3000} onClose={() => {}} label="V">
          <img src="/a.png" alt="a" />
        </MediaLightbox>,
      );
      fireEvent.focus(screen.getByRole('button', { name: 'Zoom in' }));
      act(() => vi.advanceTimersByTime(10000));
      expect(document.querySelector('.mk-lightbox__controls-region')).toHaveAttribute(
        'data-visible',
        'true',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('Escape con fullscreen nativo activo NO cierra el lightbox', async () => {
    const onClose = vi.fn();
    render(
      <MediaLightbox open onClose={onClose} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    Object.defineProperty(document, 'fullscreenElement', {
      value: screen.getByRole('dialog'),
      configurable: true,
    });
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('las flechas panean con desborde y NO panean con el foco en la toolbar', async () => {
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    const viewport = document.querySelector('.mk-lightbox__viewport') as HTMLElement;
    const media = document.querySelector('.mk-lightbox__media') as HTMLElement;
    mockSizes(viewport, 800, 600);
    mockSizes(media, 1600, 1200);
    screen.getByRole('dialog').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(media.style.transform).toBe('translate(-40px, 0px) scale(1)');
    screen.getByRole('button', { name: 'Zoom in' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(media.style.transform).toBe('translate(-40px, 0px) scale(1)');
  });

  it('closeLabel sigue funcionando y labels.close tiene precedencia', () => {
    const { rerender } = render(
      <MediaLightbox open closeLabel="Cerrar" onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    rerender(
      <MediaLightbox
        open
        closeLabel="Cerrar"
        labels={{ close: 'Schließen' }}
        onClose={() => {}}
        label="V"
      >
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    expect(screen.getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
  });
});
