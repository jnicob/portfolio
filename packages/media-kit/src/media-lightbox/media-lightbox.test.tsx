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
    // Orden de foco tras el rediseño: contenido (enlace) → toggle/close (esquina) →
    // botones de la toolbar. El último focusable es el botón de fit.
    const fit = screen.getByRole('button', { name: 'Fit: contain. Switch to cover' });
    expect(close).toHaveFocus();
    // Shift+Tab desde el primer focusable (el enlace) envuelve al último (fit), sin salir.
    link.focus();
    await userEvent.tab({ shift: true });
    expect(fit).toHaveFocus();
    // Tab desde el último envuelve al primero (el enlace).
    await userEvent.tab();
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
    // Con el root enfocado, Tab avanza al último focusable del dialog (el botón de fit)
    // en vez de escapar a la página.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Fit: contain. Switch to cover' })).toHaveFocus();
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

  it('al ocultar la toolbar con foco dentro reubica el foco fuera de la región antes de inertizarla', async () => {
    // El auto-hide por inactividad no puede dispararse con foco dentro (queda pineada),
    // así que el camino "ocultar con foco dentro" es la tecla "c" (o el toggle). Tras él,
    // el foco NO debe quedar huérfano en la región inertizada.
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="a" />
      </MediaLightbox>,
    );
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    zoomIn.focus();
    expect(zoomIn).toHaveFocus();
    await userEvent.keyboard('c');
    const region = document.querySelector('.mk-lightbox__controls-region') as HTMLElement;
    expect(region).toHaveAttribute('inert');
    // El foco NO quedó atrapado dentro de la región inertizada...
    expect(region.contains(document.activeElement)).toBe(false);
    // ...sigue dentro del diálogo, en el toggle siempre visible.
    expect(screen.getByRole('button', { name: 'Show controls' })).toHaveFocus();
  });

  it('el anuncio de zoom (aria-live) vive fuera de la región y no se inertiza al auto-ocultar', () => {
    vi.useFakeTimers();
    try {
      render(
        <MediaLightbox open autoHideDelay={3000} onClose={() => {}} label="V">
          <img src="/a.png" alt="a" />
        </MediaLightbox>,
      );
      const live = document.querySelector('[aria-live="polite"]') as HTMLElement;
      const region = document.querySelector('.mk-lightbox__controls-region') as HTMLElement;
      // Presente, con la plantilla de zoomLevel, y fuera de la región de controles.
      expect(live).toHaveTextContent('Zoom 100%');
      expect(region.contains(live)).toBe(false);
      // Tras el auto-hide la región se inertiza, pero el aria-live no: sigue anunciando.
      act(() => vi.advanceTimersByTime(3000));
      expect(region).toHaveAttribute('inert');
      expect(live.closest('[inert]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('una tecla revive la toolbar oculta por inactividad (poke en keydown)', () => {
    vi.useFakeTimers();
    try {
      render(
        <MediaLightbox open autoHideDelay={3000} onClose={() => {}} label="V">
          <img src="/a.png" alt="a" />
        </MediaLightbox>,
      );
      const region = document.querySelector('.mk-lightbox__controls-region') as HTMLElement;
      act(() => vi.advanceTimersByTime(3000));
      expect(region).toHaveAttribute('data-visible', 'false');
      act(() => {
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'x' });
      });
      expect(region).toHaveAttribute('data-visible', 'true');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('MediaLightbox v2.1 — pan con Espacio (B1)', () => {
  function openWithOverflow() {
    render(
      <MediaLightbox open onClose={() => {}} label="Vista" fit="actual">
        <img src="/big.png" alt="grande" />
      </MediaLightbox>,
    );
    const dialog = screen.getByRole('dialog');
    const viewport = document.querySelector('.mk-lightbox__viewport') as HTMLElement;
    const media = document.querySelector('.mk-lightbox__media') as HTMLElement;
    mockSizes(viewport, 800, 600);
    mockSizes(media, 1600, 1200);
    return { dialog, media };
  }

  it('con Espacio mantenido, mover el puntero panea cuando hay desborde', () => {
    const { dialog, media } = openWithOverflow();
    fireEvent.keyDown(dialog, { key: ' ' });
    expect(dialog).toHaveAttribute('data-space-pan');
    fireEvent.pointerMove(dialog, { clientX: 400, clientY: 300 });
    fireEvent.pointerMove(dialog, { clientX: 360, clientY: 300 });
    expect(media.style.transform).toContain('translate(-40px, 0px)');
  });

  it('al soltar Espacio deja de panear y retira la affordance de cursor', () => {
    const { dialog, media } = openWithOverflow();
    fireEvent.keyDown(dialog, { key: ' ' });
    fireEvent.pointerMove(dialog, { clientX: 400, clientY: 300 });
    fireEvent.keyUp(dialog, { key: ' ' });
    expect(dialog).not.toHaveAttribute('data-space-pan');
    fireEvent.pointerMove(dialog, { clientX: 300, clientY: 300 });
    expect(media.style.transform).toContain('translate(0px, 0px)');
  });

  it('Espacio con el foco en un botón NO entra en modo pan (el botón se sigue activando)', () => {
    openWithOverflow();
    const close = screen.getByRole('button', { name: 'Close' });
    close.focus();
    fireEvent.keyDown(close, { key: ' ' });
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-space-pan');
  });
});
