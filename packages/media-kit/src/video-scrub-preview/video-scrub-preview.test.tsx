import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoScrubPreview } from './video-scrub-preview';

/**
 * jsdom no implementa `requestAnimationFrame` con un scheduler real y el scrub por
 * puntero lo usa para el throttle: se stubea para ejecutar el callback de forma
 * síncrona e inmediata, así los tests no dependen de temporizadores.
 */
function stubImmediateRaf() {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
}

function setupVideo(duration = 10) {
  const { container } = render(<VideoScrubPreview src="/demo.mp4" label="Preview" />);
  const root = screen.getByLabelText('Preview');
  const video = container.querySelector('video')!;
  Object.defineProperty(video, 'duration', { configurable: true, value: duration });
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
  } as DOMRect);
  return { root, video };
}

describe('VideoScrubPreview', () => {
  beforeEach(() => {
    stubImmediateRaf();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('el puntero hace scrub proporcional', () => {
    const { root, video } = setupVideo(10);
    fireEvent.pointerMove(root, { clientX: 100, clientY: 10 });
    expect(video.currentTime).toBeCloseTo(5);
  });

  it('al salir vuelve al inicio', () => {
    const { root, video } = setupVideo(10);
    fireEvent.pointerMove(root, { clientX: 150, clientY: 10 });
    fireEvent.pointerLeave(root);
    expect(video.currentTime).toBe(0);
  });

  it('teclado: flechas ±5%', () => {
    const { root, video } = setupVideo(10);
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(video.currentTime).toBeCloseTo(0.5);
  });

  it('sin metadata (duration NaN) no rompe', () => {
    const { root, video } = setupVideo(Number.NaN);
    fireEvent.pointerMove(root, { clientX: 100, clientY: 10 });
    expect(video.currentTime).toBe(0);
  });
});

function setDuration(video: HTMLVideoElement, value: number) {
  Object.defineProperty(video, 'duration', { configurable: true, value });
}

describe('scrub v3 (v0.6)', () => {
  beforeEach(() => {
    stubImmediateRaf();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('el scrub se activa cuando loadedmetadata llega después del hover', async () => {
    const { container } = render(<VideoScrubPreview src="/v.mp4" label="Scrub" />);
    const root = container.querySelector('.mk-scrub') as HTMLElement;
    const video = container.querySelector('video') as HTMLVideoElement;
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 100 } as DOMRect);
    // Sin metadata: no-op (comportamiento actual, sin errores)
    fireEvent.pointerMove(root, { clientX: 50 });
    // Llega el metadata → el siguiente move ya scrubbea
    setDuration(video, 10);
    fireEvent.loadedMetadata(video);
    fireEvent.pointerMove(root, { clientX: 50 });
    await waitFor(() => expect(video.currentTime).toBeCloseTo(5));
  });

  it('muestra el tiempo actual y total', () => {
    const { container } = render(<VideoScrubPreview src="/v.mp4" label="Scrub" />);
    const video = container.querySelector('video') as HTMLVideoElement;
    setDuration(video, 90);
    fireEvent.loadedMetadata(video);
    expect(container.querySelector('.mk-scrub__time')).toHaveTextContent('0:00 / 1:30');
  });
});
