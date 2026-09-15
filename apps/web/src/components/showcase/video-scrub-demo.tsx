'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoScrubPreview } from '@nicobehm/media-kit';
import { Badge } from '@/components/ui/badge';

export type VideoScrubDemoStrings = {
  /** Accessible name of the interactive scrub area. */
  label: string;
  /**
   * Decorative visual hint (`aria-hidden`) that explains the interaction and
   * disappears on the first real interaction. The accessible name of the area
   * already comes from `label`/`figcaption`, so the hint does not need to be announced.
   */
  hint: string;
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: VideoScrubDemoStrings };

/**
 * Video preview scrubbable with pointer (or with arrows, when focused), spec B4
 * / F3.6. Actual 864×486 clip (exact 16:9 — Task 10): `aspect-video` reserves
 * space with the correct aspect ratio without waiting for metadata to load,
 * preventing layout shift (same goal as `width`/`height` on `<img>`).
 *
 * Task 26: in-browser diagnosis confirmed that scrubbing (pointer + keyboard)
 * works correctly; user feedback was about affordance, not a bug
 * — nothing on the idle video communicated that it was interactive. The hint
 * (icon + short copy) disappears on the first interaction (`pointerenter` or
 * keyboard focus) and is not shown again.
 *
 * Task 27 (perf, F3.6): measured in the served export (`out/`, Playwright) that
 * `VideoScrubPreview` (package, `preload="metadata"`) still downloads the
 * full clip (~600 KB) as soon as it mounts — the browser does not always close the
 * connection after reading the metadata atoms, and this demo cannot modify the
 * package to change that `preload`. That is why the actual `<video>` is not mounted
 * until the first interaction (`pointerenter`, focus, or click): before that,
 * only the poster is shown as `<img loading="lazy">` inside a button — same
 * `aria-label`, same dimensions (864×486), zero extra network requests. Focus is
 * manually forwarded to the actual widget when activation comes from keyboard (the
 * placeholder `<button>` unmounts upon activation and the browser would lose
 * focus if not explicitly reclaimed).
 */
export function VideoScrubDemo({ strings }: Props) {
  const [hintVisible, setHintVisible] = useState(true);
  const [activated, setActivated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  /** Only reclaims focus after the swap if activation came from the keyboard (not hover). */
  const refocusAfterSwap = useRef(false);

  function activate() {
    setHintVisible(false);
    setActivated(true);
  }

  function handleFocus() {
    refocusAfterSwap.current = true;
    activate();
  }

  useEffect(() => {
    if (!activated || !refocusAfterSwap.current) return;
    refocusAfterSwap.current = false;
    containerRef.current?.querySelector<HTMLElement>('[tabindex]')?.focus({ preventScroll: true });
  }, [activated]);

  return (
    <figure className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative aspect-video w-full"
        onPointerEnter={activate}
        onFocus={handleFocus}
      >
        {activated ? (
          <VideoScrubPreview
            src="/demo/scrub.mp4"
            poster="/demo/scrub-poster.webp"
            label={strings.label}
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            aria-label={strings.label}
            onClick={activate}
            className="block h-full w-full cursor-pointer overflow-hidden rounded-card border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <img
              src="/demo/scrub-poster.webp"
              alt=""
              width={864}
              height={486}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        )}
        {hintVisible && (
          <Badge
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit gap-1.5"
          >
            <ScrubHintIcon />
            {strings.hint}
          </Badge>
        )}
      </div>
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}

/** Icono decorativo (flechas ↔) que refuerza el cursor `ew-resize` del scrub. */
function ScrubHintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 8l-4 4 4 4" />
      <path d="M16 8l4 4-4 4" />
      <path d="M2 12h20" />
    </svg>
  );
}
