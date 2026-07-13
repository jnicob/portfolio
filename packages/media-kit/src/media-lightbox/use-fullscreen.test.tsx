import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFullscreen } from './use-fullscreen';

type MutableDoc = Document & {
  fullscreenEnabled?: boolean;
  fullscreenElement?: Element | null;
  exitFullscreen?: () => Promise<void>;
};

function defineDoc(props: Partial<MutableDoc>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(document, key, { value, configurable: true, writable: true });
  }
}

describe('useFullscreen', () => {
  afterEach(() => {
    defineDoc({ fullscreenEnabled: undefined, fullscreenElement: null, exitFullscreen: undefined });
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
});
