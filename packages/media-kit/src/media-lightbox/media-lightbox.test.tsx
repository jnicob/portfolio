import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { MediaLightbox } from './media-lightbox';

function stubScreen(width: number, devicePixelRatio: number) {
  vi.stubGlobal('screen', { width });
  vi.stubGlobal('devicePixelRatio', devicePixelRatio);
}

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

describe('MediaLightbox v2.1 — ayuda de teclado (B2)', () => {
  it("la tecla '?' abre la ayuda, el foco entra al panel, y '?' la cierra", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await userEvent.keyboard('?');
    const panel = screen.getByRole('group', { name: 'Keyboard shortcuts' });
    expect(panel).toHaveFocus();
    expect(screen.getByText('Hold Space and drag to pan')).toBeInTheDocument();
    await userEvent.keyboard('?');
    expect(screen.queryByRole('group', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
  });

  it('el botón ? abre la ayuda y refleja aria-expanded', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const helpButton = screen.getByRole('button', { name: 'Keyboard shortcuts' });
    expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(helpButton);
    expect(helpButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
  });

  it('Escape cierra la ayuda ANTES que el lightbox y devuelve el foco al botón ?', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const helpButton = screen.getByRole('button', { name: 'Keyboard shortcuts' });
    await userEvent.click(helpButton);
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
    expect(helpButton).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('MediaLightbox v2.1 — toggle ojo y tooltips (B3)', () => {
  it('el toggle muestra ojo/ojo-tachado y su tooltip sigue al aria-label', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const toggle = screen.getByRole('button', { name: 'Hide controls' });
    expect(toggle.querySelector('svg[data-mk-icon="eye"]')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-mk-tooltip', 'Hide controls');
    await userEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Show controls');
    expect(toggle.querySelector('svg[data-mk-icon="eye-off"]')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-mk-tooltip', 'Show controls');
  });

  it('el botón de ayuda también lleva tooltip', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('button', { name: 'Keyboard shortcuts' })).toHaveAttribute(
      'data-mk-tooltip',
      'Keyboard shortcuts',
    );
  });
});

describe('MediaLightbox v2.2 — compare (C2)', () => {
  it('con compare renderiza el slider dentro del viewport con toolbar completa', () => {
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="Compare"
        compare={{
          before: <img src="/before.png" alt="antes" />,
          after: <img src="/after.png" alt="después" />,
        }}
      />,
    );
    const media = document.querySelector('.mk-lightbox__media') as HTMLElement;
    const slider = screen.getByRole('slider', { name: 'Compare' });
    expect(media.contains(slider)).toBe(true);
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
  });

  it('las flechas con el handle enfocado mueven el divisor y NO panean', async () => {
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="Compare"
        fit="actual"
        compare={{
          before: <img src="/before.png" alt="antes" />,
          after: <img src="/after.png" alt="después" />,
        }}
      />,
    );
    const viewport = document.querySelector('.mk-lightbox__viewport') as HTMLElement;
    const media = document.querySelector('.mk-lightbox__media') as HTMLElement;
    mockSizes(viewport, 800, 600);
    mockSizes(media, 1600, 1200);
    const slider = screen.getByRole('slider', { name: 'Compare' });
    const transformBefore = media.style.transform;
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '51');
    expect(media.style.transform).toBe(transformBefore);
  });

  it('los gestos de pointer sobre el handle no arrancan el pan del visor', () => {
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="Compare"
        fit="actual"
        compare={{
          before: <img src="/before.png" alt="antes" />,
          after: <img src="/after.png" alt="después" />,
        }}
      />,
    );
    const viewport = document.querySelector('.mk-lightbox__viewport') as HTMLElement;
    const media = document.querySelector('.mk-lightbox__media') as HTMLElement;
    mockSizes(viewport, 800, 600);
    mockSizes(media, 1600, 1200);
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    const transformBefore = media.style.transform;
    expect(media.style.transform).not.toBe('translate(0px, 0px) scale(1)');
    const slider = screen.getByRole('slider', { name: 'Compare' });
    const container = slider.closest('.mk-compare') as HTMLElement;
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100,
      toJSON: () => ({}),
    } as DOMRect);
    fireEvent.pointerDown(slider, {
      clientX: 160,
      clientY: 50,
      pointerType: 'mouse',
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    fireEvent.pointerMove(slider, { clientX: 170, clientY: 50, pointerType: 'mouse' });
    expect(slider).toHaveAttribute('aria-valuenow', '80');
    expect(media.style.transform).toBe(transformBefore);
  });

  it('Escape con el foco en el handle cierra el lightbox (el stopPropagation del slider no se extiende a Escape)', async () => {
    const onClose = vi.fn();
    render(
      <MediaLightbox
        open
        onClose={onClose}
        label="Compare"
        compare={{
          before: <img src="/before.png" alt="antes" />,
          after: <img src="/after.png" alt="después" />,
        }}
      />,
    );
    screen.getByRole('slider', { name: 'Compare' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('sin compare, children sigue funcionando (regresión v2)', () => {
    render(
      <MediaLightbox open onClose={() => {}} label="V">
        <img src="/a.png" alt="contenido" />
      </MediaLightbox>,
    );
    expect(screen.getByAltText('contenido')).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});

describe('MediaLightbox v2.2 — MediaSource (C3)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('con media (pantalla grande) renderiza el fullSrc elegido por pantalla', () => {
    stubScreen(2560, 1);
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="V"
        media={{ src: '/a.png', fullSrc: '/a-full.png', alt: 'contenido' }}
      />,
    );
    const img = screen.getByAltText('contenido');
    expect(img).toHaveAttribute('src', '/a-full.png');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('con media (pantalla chica) renderiza src, no fullSrc', () => {
    stubScreen(390, 3);
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="V"
        media={{ src: '/a.png', fullSrc: '/a-full.png', alt: 'contenido' }}
      />,
    );
    expect(screen.getByAltText('contenido')).toHaveAttribute('src', '/a.png');
  });

  it('compare gana sobre media, y media gana sobre children', () => {
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="V"
        compare={{
          before: { src: '/before.png', alt: 'antes' },
          after: { src: '/after.png', alt: 'después' },
        }}
        media={{ src: '/media.png', alt: 'medio' }}
      >
        <img src="/children.png" alt="hijos" />
      </MediaLightbox>,
    );
    expect(screen.getByRole('slider', { name: 'Compare' })).toBeInTheDocument();
    expect(screen.queryByAltText('medio')).not.toBeInTheDocument();
    expect(screen.queryByAltText('hijos')).not.toBeInTheDocument();
  });

  it('compare con lados MediaSource resuelve cada lado con pickFullscreenSrc (pantalla grande → fullSrc)', () => {
    stubScreen(2560, 1);
    render(
      <MediaLightbox
        open
        onClose={() => {}}
        label="Compare"
        compare={{
          before: { src: '/before.png', fullSrc: '/before-full.png', alt: 'antes' },
          after: { src: '/after.png', fullSrc: '/after-full.png', alt: 'después' },
        }}
      />,
    );
    expect(screen.getByAltText('antes')).toHaveAttribute('src', '/before-full.png');
    expect(screen.getByAltText('después')).toHaveAttribute('src', '/after-full.png');
  });
});

describe('fullscreen focus (v0.5)', () => {
  afterEach(() => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: undefined, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
  });

  it('devuelve el foco al dialog al entrar en fullscreen', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    render(
      <MediaLightbox open onClose={() => {}} label="Viewer">
        <img alt="" src="/x.png" />
      </MediaLightbox>,
    );
    const dialog = screen.getByRole('dialog');
    screen.getByRole('button', { name: 'Enter fullscreen' }).focus();
    Object.defineProperty(document, 'fullscreenElement', { value: dialog, configurable: true });
    fireEvent(document, new Event('fullscreenchange'));
    expect(dialog).toHaveFocus();
  });

  it('devuelve el foco al dialog al salir de fullscreen', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    render(
      <MediaLightbox open onClose={() => {}} label="Viewer">
        <img alt="" src="/x.png" />
      </MediaLightbox>,
    );
    const dialog = screen.getByRole('dialog');
    Object.defineProperty(document, 'fullscreenElement', { value: dialog, configurable: true });
    fireEvent(document, new Event('fullscreenchange'));
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    fireEvent(document, new Event('fullscreenchange'));
    expect(dialog).toHaveFocus();
  });
});
