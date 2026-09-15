import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoverVideo } from './hover-video';

/**
 * Same pattern as `stubReducedMotion` in filter-gallery/compare-slider: stubs
 * `matchMedia` globally returning a fixed `matches` for any query. In
 * tests that do not call it, `window.matchMedia` remains `undefined` (jsdom does not
 * implement it) — HoverVideo must treat that absence as "fine pointer" (progresses
 * to enhancement, does not block it) and as "no preference for reduced-motion".
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

  it('leaving before delay cancels activation', () => {
    render(<HoverVideo src="/v.mp4" poster="/p.webp" label="Demo" width={640} height={360} />);
    const root = screen.getByRole('button', { name: 'Demo' });
    fireEvent.pointerEnter(root);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(root);
    act(() => vi.advanceTimersByTime(500));
    expect(document.querySelector('video')).not.toBeInTheDocument();
  });

  it('with reduced-motion hover does not activate but Enter does (toggle)', () => {
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

  it('with pointer coarse hover does not activate (explicit toggle only)', () => {
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

  it('toggle on click toggles playback', () => {
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
