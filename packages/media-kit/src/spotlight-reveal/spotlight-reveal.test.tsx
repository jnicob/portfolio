import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpotlightReveal } from './spotlight-reveal';

function mockRect(element: HTMLElement, rect: Partial<DOMRect>) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}

describe('SpotlightReveal', () => {
  it('renderiza lados MediaSource como imágenes y expone el aria-label', () => {
    render(
      <SpotlightReveal
        base={{ src: '/a.png', alt: 'base' }}
        reveal={{ src: '/b.png', alt: '' }}
        label="Spotlight demo"
      />,
    );
    expect(screen.getByLabelText('Spotlight demo')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'base' })).toBeInTheDocument();
  });

  it('las flechas mueven la lente y Escape la oculta', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    const root = screen.getByLabelText('S');
    act(() => root.focus());
    expect(root).toHaveAttribute('data-active');
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(root.style.getPropertyValue('--mk-spot-x')).toBe('55%');
    fireEvent.keyDown(root, { key: 'Escape' });
    expect(root).not.toHaveAttribute('data-active');
  });

  it('el puntero posiciona la lente', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    const root = screen.getByLabelText('S');
    mockRect(root, { left: 0, top: 0, width: 200, height: 100 });
    fireEvent.pointerMove(root, { clientX: 100, clientY: 25 });
    expect(root.style.getPropertyValue('--mk-spot-x')).toBe('50%');
    expect(root.style.getPropertyValue('--mk-spot-y')).toBe('25%');
  });

  it('Home centra la lente y la activa', () => {
    render(
      <SpotlightReveal
        base={<div />}
        reveal={<div />}
        label="S"
        defaultPosition={{ x: 10, y: 90 }}
      />,
    );
    const root = screen.getByLabelText('S');
    root.focus();
    fireEvent.keyDown(root, { key: 'Home' });
    expect(root.style.getPropertyValue('--mk-spot-x')).toBe('50%');
    expect(root.style.getPropertyValue('--mk-spot-y')).toBe('50%');
    expect(root).toHaveAttribute('data-active');
  });

  it('Shift+flecha mueve con el paso fino (1%)', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    const root = screen.getByLabelText('S');
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowRight', shiftKey: true });
    expect(root.style.getPropertyValue('--mk-spot-x')).toBe('51%');
  });

  it('las flechas acotan la posición a 0-100', () => {
    render(
      <SpotlightReveal
        base={<div />}
        reveal={<div />}
        label="S"
        defaultPosition={{ x: 98, y: 2 }}
      />,
    );
    const root = screen.getByLabelText('S');
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(root.style.getPropertyValue('--mk-spot-x')).toBe('100%');
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    expect(root.style.getPropertyValue('--mk-spot-y')).toBe('0%');
  });

  it('pointerleave oculta la lente (quita data-active)', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    const root = screen.getByLabelText('S');
    mockRect(root, { left: 0, top: 0, width: 200, height: 100 });
    fireEvent.pointerMove(root, { clientX: 100, clientY: 25 });
    expect(root).toHaveAttribute('data-active');
    fireEvent.pointerLeave(root);
    expect(root).not.toHaveAttribute('data-active');
  });

  it('sin foco ni puntero, la lente arranca inactiva en defaultPosition', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    const root = screen.getByLabelText('S');
    expect(root).not.toHaveAttribute('data-active');
    expect(root.style.getPropertyValue('--mk-spot-x')).toBe('50%');
    expect(root.style.getPropertyValue('--mk-spot-y')).toBe('50%');
  });

  it('radius por defecto es 110px y es configurable', () => {
    const { rerender } = render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    let root = screen.getByLabelText('S');
    expect(root.style.getPropertyValue('--mk-spot-radius')).toBe('110px');
    rerender(<SpotlightReveal base={<div />} reveal={<div />} label="S" radius={60} />);
    root = screen.getByLabelText('S');
    expect(root.style.getPropertyValue('--mk-spot-radius')).toBe('60px');
  });

  it('la capa reveal está oculta a lectores de pantalla', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    const root = screen.getByLabelText('S');
    const reveal = root.querySelector('.mk-spotlight__reveal');
    expect(reveal).toHaveAttribute('aria-hidden');
  });

  it('overlayLabels renderiza badges aria-hidden con data-side', () => {
    render(
      <SpotlightReveal
        base={<div />}
        reveal={<div />}
        label="S"
        overlayLabels={{ base: 'Antes', reveal: 'Después' }}
      />,
    );
    const badges = document.querySelectorAll('.mk-spotlight__badge');
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveAttribute('data-side', 'base');
    expect(badges[0]).toHaveAttribute('aria-hidden');
    expect(badges[0]).toHaveTextContent('Antes');
    expect(badges[1]).toHaveAttribute('data-side', 'reveal');
    expect(badges[1]).toHaveTextContent('Después');
  });

  it('sin overlayLabels no hay badges (regresión)', () => {
    render(<SpotlightReveal base={<div />} reveal={<div />} label="S" />);
    expect(document.querySelectorAll('.mk-spotlight__badge')).toHaveLength(0);
  });

  it('con ReactNode en ambos lados los renderiza directamente (sin envolver en img)', () => {
    render(
      <SpotlightReveal
        base={<img src="/a.png" alt="Antes" />}
        reveal={<img src="/b.png" alt="Después" />}
        label="S"
      />,
    );
    expect(screen.getByAltText('Antes')).toBeInTheDocument();
    const root = screen.getByLabelText('S');
    // El alt de "Después" vive dentro de la capa aria-hidden: sigue en el DOM.
    expect(root.querySelector('img[alt="Después"]')).toBeInTheDocument();
  });

  it('un MediaSource en reveal respeta su propio alt (no lo fuerza a vacío)', () => {
    render(
      <SpotlightReveal
        base={{ src: '/a.png', alt: 'base' }}
        reveal={{ src: '/b.png', alt: 'reveal alt' }}
        label="S"
      />,
    );
    const root = screen.getByLabelText('S');
    const img = root.querySelector('img[alt="reveal alt"]');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('draggable', 'false');
  });
});
