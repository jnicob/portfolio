import { useCallback, useEffect, useState, type RefObject } from 'react';

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
};

export type UseFullscreenResult = {
  /** Fullscreen API disponible; si es false el botón no debe renderizarse. */
  supported: boolean;
  active: boolean;
  toggle: () => void;
};

function fullscreenElement(doc: FullscreenDocument): Element | null {
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function useFullscreen(ref: RefObject<HTMLElement | null>): UseFullscreenResult {
  const doc = typeof document === 'undefined' ? null : (document as FullscreenDocument);
  const supported = Boolean(doc && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled));
  const [active, setActive] = useState(() => Boolean(doc && fullscreenElement(doc)));

  useEffect(() => {
    if (!doc) return;
    const sync = () => setActive(Boolean(fullscreenElement(doc)));
    doc.addEventListener('fullscreenchange', sync);
    doc.addEventListener('webkitfullscreenchange', sync);
    return () => {
      doc.removeEventListener('fullscreenchange', sync);
      doc.removeEventListener('webkitfullscreenchange', sync);
    };
  }, [doc]);

  const toggle = useCallback(() => {
    const el = ref.current as FullscreenElement | null;
    if (!doc || !el) return;
    if (fullscreenElement(doc)) {
      const exit = doc.exitFullscreen ?? doc.webkitExitFullscreen;
      void Promise.resolve(exit?.call(doc)).catch(() => {});
    } else {
      const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
      void Promise.resolve(request?.call(el)).catch(() => {});
    }
  }, [doc, ref]);

  return { supported, active, toggle };
}
