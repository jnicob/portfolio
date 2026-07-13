import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFullscreen } from './use-fullscreen';

type MutableDoc = Document & {
  fullscreenEnabled?: boolean;
  fullscreenElement?: Element | null;
  exitFullscreen?: () => Promise<void>;
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

function defineDoc(props: Partial<MutableDoc>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(document, key, { value, configurable: true, writable: true });
  }
}

describe('useFullscreen', () => {
  afterEach(() => {
    defineDoc({
      fullscreenEnabled: undefined,
      fullscreenElement: null,
      exitFullscreen: undefined,
      webkitFullscreenEnabled: undefined,
      webkitFullscreenElement: null,
      webkitExitFullscreen: undefined,
    });
    vi.restoreAllMocks();
  });

  it('supported=false sin Fullscreen API', () => {
    defineDoc({ fullscreenEnabled: undefined });
    const el = document.createElement('div');
    const { result } = renderHook(() => useFullscreen({ current: el }));
    expect(result.current.supported).toBe(false);
  });

  it('toggle() pide fullscreen sobre el elemento y active refleja fullscreenchange', () => {
    defineDoc({ fullscreenEnabled: true, fullscreenElement: null });
    const el = document.createElement('div');
    const request = vi.fn(() => Promise.resolve());
    (el as HTMLElement & { requestFullscreen: () => Promise<void> }).requestFullscreen = request;
    const { result } = renderHook(() => useFullscreen({ current: el }));
    expect(result.current.supported).toBe(true);
    act(() => result.current.toggle());
    expect(request).toHaveBeenCalledOnce();
    defineDoc({ fullscreenElement: el });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(result.current.active).toBe(true);
  });

  it('toggle() con fullscreen activo llama a exitFullscreen', () => {
    const el = document.createElement('div');
    const exit = vi.fn(() => Promise.resolve());
    defineDoc({ fullscreenEnabled: true, fullscreenElement: el, exitFullscreen: exit });
    const { result } = renderHook(() => useFullscreen({ current: el }));
    act(() => result.current.toggle());
    expect(exit).toHaveBeenCalledOnce();
  });

  it('supported=true con solo webkitFullscreenEnabled (Safari desktop)', () => {
    defineDoc({ fullscreenEnabled: undefined, webkitFullscreenEnabled: true });
    const el = document.createElement('div');
    const { result } = renderHook(() => useFullscreen({ current: el }));
    expect(result.current.supported).toBe(true);
  });

  it('toggle() sin fullscreen activo llama a webkitRequestFullscreen cuando requestFullscreen no existe', () => {
    defineDoc({
      fullscreenEnabled: undefined,
      webkitFullscreenEnabled: true,
      fullscreenElement: null,
    });
    const el = document.createElement('div') as WebkitElement;
    const webkitRequest = vi.fn(() => Promise.resolve());
    el.webkitRequestFullscreen = webkitRequest;
    const { result } = renderHook(() => useFullscreen({ current: el }));
    act(() => result.current.toggle());
    expect(webkitRequest).toHaveBeenCalledOnce();
  });

  it('toggle() llama a webkitExitFullscreen cuando webkitFullscreenElement está seteado', () => {
    const el = document.createElement('div');
    const webkitExit = vi.fn(() => Promise.resolve());
    defineDoc({
      fullscreenEnabled: undefined,
      webkitFullscreenEnabled: true,
      fullscreenElement: null,
      webkitFullscreenElement: el,
      webkitExitFullscreen: webkitExit,
    });
    const { result } = renderHook(() => useFullscreen({ current: el }));
    act(() => result.current.toggle());
    expect(webkitExit).toHaveBeenCalledOnce();
  });

  it('active refleja webkitfullscreenchange cuando webkitFullscreenElement pasa a ser el elemento', () => {
    defineDoc({
      fullscreenEnabled: undefined,
      webkitFullscreenEnabled: true,
      fullscreenElement: null,
    });
    const el = document.createElement('div');
    const { result } = renderHook(() => useFullscreen({ current: el }));
    expect(result.current.active).toBe(false);
    defineDoc({ webkitFullscreenElement: el });
    act(() => {
      document.dispatchEvent(new Event('webkitfullscreenchange'));
    });
    expect(result.current.active).toBe(true);
  });
});
