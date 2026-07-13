import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoHide } from './use-auto-hide';

describe('useAutoHide', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('visible al inicio; se oculta sola tras el delay (idle)', () => {
    const { result } = renderHook(() => useAutoHide({ delay: 3000 }));
    expect(result.current.visible).toBe(true);
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.visible).toBe(false);
    expect(result.current.userHidden).toBe(false);
  });

  it('poke() saca del idle-hidden y rearma el timer', () => {
    const { result } = renderHook(() => useAutoHide({ delay: 3000 }));
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.poke());
    expect(result.current.visible).toBe(true);
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.visible).toBe(false);
  });

  it('toggle() oculta explícitamente y poke() NO lo trae de vuelta', () => {
    const { result } = renderHook(() => useAutoHide({ delay: 3000 }));
    act(() => result.current.toggle());
    expect(result.current.visible).toBe(false);
    expect(result.current.userHidden).toBe(true);
    act(() => result.current.poke());
    expect(result.current.visible).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.visible).toBe(true);
  });

  it('pin(true) bloquea el auto-hide; pin(false) lo rearma', () => {
    const { result } = renderHook(() => useAutoHide({ delay: 3000 }));
    act(() => result.current.pin(true));
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.visible).toBe(true);
    act(() => result.current.pin(false));
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.visible).toBe(false);
  });

  it('delay null desactiva el auto-hide', () => {
    const { result } = renderHook(() => useAutoHide({ delay: null }));
    act(() => vi.advanceTimersByTime(60000));
    expect(result.current.visible).toBe(true);
  });

  it('defaultVisible false arranca como user-hidden', () => {
    const { result } = renderHook(() => useAutoHide({ delay: 3000, defaultVisible: false }));
    expect(result.current.visible).toBe(false);
    act(() => result.current.poke());
    expect(result.current.visible).toBe(false);
  });
});
