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
 * Two distinct hidden states:
 * - idle-hidden: due to inactivity; poke() (moving the mouse) reverts it.
 * - user-hidden: explicit toggle; ONLY toggle() reverts it.
 * pin(true) (focus inside the toolbar) blocks hiding due to inactivity.
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

  // When explicitly (un)hiding: rearm or stop the timer.
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
