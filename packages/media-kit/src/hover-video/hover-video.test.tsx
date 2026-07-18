import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoverVideo } from './hover-video';

/**
 * Mismo patrón que `stubReducedMotion` en filter-gallery/compare-slider: stubea
 * `matchMedia` globalmente devolviendo un `matches` fijo para cualquier query. En
 * los tests que no lo llaman, `window.matchMedia` queda `undefined` (jsdom no lo
 * implementa) — HoverVideo debe tratar esa ausencia como "puntero fino" (progresa
 * a la mejora, no la bloquea) y como "sin preferencia de reduced-motion".
 */
function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe('HoverVideo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('en reposo no monta el video (facade)', () => {
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    expect(document.querySelector('video')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Demo' })).toHaveAttribute('data-state', 'idle');
  });

  it('hover sostenido delay ms activa el video', () => {
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Demo' }));
    act(() => vi.advanceTimersByTime(299));
    expect(document.querySelector('video')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('salir antes del delay cancela la activación', () => {
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    const root = screen.getByRole('button', { name: 'Demo' });
    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(root);
    act(() => vi.advanceTimersByTime(500));
    expect(document.querySelector('video')).not.toBeInTheDocument();
  });

  it('con reduced-motion el hover no activa pero Enter sí (toggle)', () => {
    mockReducedMotion(true);
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    const root = screen.getByRole('button', { name: 'Demo' });
    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(1000));
    expect(document.querySelector('video')).not.toBeInTheDocument();
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(document.querySelector('video')).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-pressed', 'true');
  });

  it('respeta un delay custom', () => {
    render(
      <HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} delay={50} />,
    );
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Demo' }));
    act(() => vi.advanceTimersByTime(49));
    expect(document.querySelector('video')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('con pointer coarse el hover no activa (solo toggle explícito)', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('coarse'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    const root = screen.getByRole('button', { name: 'Demo' });
    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(1000));
    expect(document.querySelector('video')).not.toBeInTheDocument();
    fireEvent.click(root);
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('toggle por click alterna reproducción', () => {
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    const root = screen.getByRole('button', { name: 'Demo' });
    fireEvent.click(root);
    expect(document.querySelector('video')).toBeInTheDocument();
    expect(root).toHaveAttribute('data-state', 'playing');
    fireEvent.click(root);
    expect(document.querySelector('video')).not.toBeInTheDocument();
    expect(root).toHaveAttribute('data-state', 'idle');
  });

  it('desmonta sin dejar el timer corriendo (no rompe tras unmount)', () => {
    const { unmount } = render(
      <HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />,
    );
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Demo' }));
    unmount();
    expect(() => act(() => vi.advanceTimersByTime(1000))).not.toThrow();
  });

  it('el poster lleva width/height y loading lazy', () => {
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    const img = document.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/p.webp');
    expect(img).toHaveAttribute('width', '640');
    expect(img).toHaveAttribute('height', '360');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
