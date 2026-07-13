import { useCallback, useEffect, useRef, useState } from 'react';

export type UseAutoHideOptions = {
  /** ms de inactividad antes de ocultar; null desactiva el auto-hide. */
  delay: number | null;
  /** Visibilidad inicial (false = user-hidden). */
  defaultVisible?: boolean;
};

export type UseAutoHideResult = {
  visible: boolean;
  userHidden: boolean;
  toggle: () => void;
  poke: () => void;
  pin: (pinned: boolean) => void;
};

/**
 * Dos estados ocultos distintos:
 * - idle-hidden: por inactividad; poke() (mover el ratón) lo revierte.
 * - user-hidden: toggle explícito; SOLO toggle() lo revierte.
 * pin(true) (foco dentro de la toolbar) bloquea el ocultado por inactividad.
 */
export function useAutoHide({
  delay,
  defaultVisible = true,
}: UseAutoHideOptions): UseAutoHideResult {
  const [userHidden, setUserHidden] = useState(!defaultVisible);
  const [idleHidden, setIdleHidden] = useState(false);
  const pinnedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const arm = useCallback(() => {
    clear();
    if (delay === null) return;
    timerRef.current = setTimeout(() => {
      if (!pinnedRef.current) setIdleHidden(true);
    }, delay);
  }, [clear, delay]);

  // Al (des)ocultar explícitamente: rearmar o parar el timer.
  useEffect(() => {
    if (userHidden) {
      clear();
    } else {
      setIdleHidden(false);
      arm();
    }
    return clear;
  }, [arm, clear, userHidden]);

  const toggle = useCallback(() => setUserHidden((hidden) => !hidden), []);

  const poke = useCallback(() => {
    if (userHidden) return;
    setIdleHidden(false);
    arm();
  }, [arm, userHidden]);

  const pin = useCallback(
    (pinned: boolean) => {
      pinnedRef.current = pinned;
      if (pinned) {
        clear();
        setIdleHidden(false);
      } else {
        arm();
      }
    },
    [arm, clear],
  );

  return { visible: !userHidden && !idleHidden, userHidden, toggle, poke, pin };
}
