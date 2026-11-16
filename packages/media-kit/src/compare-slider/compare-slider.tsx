'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { prefersReducedMotion } from '../internal/prefers-reduced-motion';
import { MediaLightbox, type MediaLightboxLabels } from '../media-lightbox';
import { isMediaSource, preloadFullSources, type MediaSource } from '../media-source';

/** Before/after alternation cadence in `compareMode="blink"` (spec A3). */
const BLINK_INTERVAL_MS = 800;
/** Container width below which side-by-side switches to stacked. */
const STACK_BREAKPOINT = 480;

export type CompareSliderExpand = {
  /** aria-label of the compare-lightbox dialog. */
  lightboxLabel: string;
  /** Overlay button text. Default 'Full Screen'. */
  buttonLabel?: string;
  /** Labels of the internal MediaLightbox (i18n). */
  lightboxLabels?: Partial<MediaLightboxLabels>;
};

// Expand icon (currentColor stroke, F2.6 pattern): no dependencies.
const EXPAND_ICON = (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
);

/**
 * Comparison axis (spec A3, F3.6). Default `'wipe'` = current behavior
 * (clip-path + divider), zero changes. `'blink'` alternates before/after with a
 * timer (no slider); see `data-blink-side` and the pause switch in the component.
 */
export type CompareSliderMode = 'wipe' | 'onion' | 'blink' | 'side-by-side';

export type CompareSliderOverlayLabels = {
  /** Overlay label on the `before` side (bottom-left corner). */
  before: string;
  /** Overlay label on the `after` side (bottom-right corner). */
  after: string;
};

export type CompareSliderProps = {
  /**
   * Original media (typically <img>). Displayed on the left / top.
   * Accepts a `MediaSource`: the slider internally renders its `<img src alt draggable={false}>`.
   */
  before: ReactNode | MediaSource;
  /** Processed media. Revealed to the right / bottom of the divider. Same rules as `before`. */
  after: ReactNode | MediaSource;
  /** Accessible name of the divider. */
  label?: string;
  /** Initial divider position, 0-100. */
  initialPosition?: number;
  orientation?: 'horizontal' | 'vertical';
  /**
   * 'drag' (default): drag to move, like v1.
   * 'hover': with mouse, the divider follows the pointer without clicking (on leave it stays
   * where it was); touch/pen use the drag path. Keyboard identical in both.
   */
  mode?: 'drag' | 'hover';
  /**
   * 'surface' (default): dragging anywhere on the surface moves the
   * divider (v1/v2 behavior, zero regression).
   * 'handle': the divider ONLY moves by dragging the handle (or with arrow keys when
   * the handle has focus); the rest of the surface ignores pointerdown. Intended
   * for when compare lives inside a viewer with its own pan (T13/MediaLightbox):
   * the viewer's pan gesture and the divider's drag must not fight for the same pointer.
   * With dragTarget='handle', mode='hover' is ignored: the divider only moves from the
   * handle (pointer or keyboard).
   */
  dragTarget?: 'surface' | 'handle';
  className?: string;
  onPositionChange?: (position: number) => void;
  /**
   * Fullscreen CTA for example (spec C1): with `expand`, the slider renders an
   * overlay button that opens an internal `MediaLightbox` with this same compare.
   */
  expand?: CompareSliderExpand;
  /**
   * Only applies with `mode="hover"` (spec C6): a click (down+up without drag) toggles
   * pausing mouse tracking, to be able to release the pointer without losing the
   * compared position. While paused, NO pointer gesture on the
   * surface repositions the divider (neither does the click that resumes: the divider
   * stays frozen where it was); keyboard on the handle continues to work.
   * Default `true`.
   */
  pauseOnClick?: boolean;
  /** Announced by aria-live when pausing (hover-pause, C6). Default `'Comparison paused'`. */
  pauseLabel?: string;
  /**
   * Announced by aria-live when resuming (hover-pause, C6). Default
   * `'Comparison following pointer'`.
   */
  resumeLabel?: string;
  /**
   * Text of the switch for `compareMode="blink"` while blink is running — the
   * available action is to pause it (button-action convention, not state: the text describes
   * what the click does next, not what already happened). Design review F3.6 T21,
   * Code review minor: the blink switch reused `pauseLabel`, an accessible
   * name designed for the C6 hover-pause — "Comparison paused" does not describe what
   * this switch does. Default `'Pause blinking'`.
   */
  blinkPauseLabel?: string;
  /**
   * Text of the switch for `compareMode="blink"` while paused — the available
   * action is to resume it (same button-action convention as `blinkPauseLabel`).
   * Default `'Resume blinking'`.
   */
  blinkResumeLabel?: string;
  /**
   * Overlay badges on each side (C5 parity), bottom-left/right corners.
   * `aria-hidden`: the accessible name of the media is already provided by the `alt` of the `<img>` (internal
   * if the side is `MediaSource`, or whatever the consumer provides if it is `ReactNode`).
   */
  overlayLabels?: CompareSliderOverlayLabels;
  /**
   * `object-fit` of the internal `<img>` elements rendered by the package for a
   * `MediaSource` side (T14). A `ReactNode` side is opaque to the component — this prop does NOT
   * reach it; the consumer controls its own `object-fit`. Default `'cover'`.
   */
  objectFit?: 'cover' | 'contain';
  /**
   * Comparison axis (spec A3, F3.6). Default `'wipe'` (current behavior).
   * `'onion'` keeps the same handle/keyboard but controls opacity instead of
   * divider position. `'side-by-side'` has neither slider nor handle: both sides
   * are shown in full (grid). `'blink'` has no slider either: alternates
   * before/after every 800ms with its own pause switch (`blinkPauseLabel`/`blinkResumeLabel`).
   */
  compareMode?: CompareSliderMode;
};

/** Movement threshold (px) to distinguish click from drag (use-zoom-pan convention). */
const CLICK_MOVE_THRESHOLD = 4;

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

type CompareSide = 'before' | 'after';

function renderSide(
  side: ReactNode | MediaSource,
  sideKey: CompareSide,
  objectFit: 'cover' | 'contain',
  onSideLoaded: (side: CompareSide) => void,
): ReactNode {
  if (!isMediaSource(side)) return side;
  return (
    <img
      // Hydration (static export): native `load` may fire BEFORE
      // React attaches onLoad; without this check the side would remain pending forever
      // (permanent data-loading, opacity 0). A node already complete when attaching the ref
      // is marked loaded directly. naturalWidth>0 distinguishes a successful load from an error
      // (a broken img also reports complete=true, but with naturalWidth 0).
      ref={(node) => {
        if (node?.complete && node.naturalWidth > 0) onSideLoaded(sideKey);
      }}
      src={side.src}
      alt={side.alt}
      draggable={false}
      style={{ objectFit }}
      onLoad={() => onSideLoaded(sideKey)}
    />
  );
}

export function CompareSlider({
  before,
  after,
  label = 'Compare',
  initialPosition = 50,
  orientation = 'horizontal',
  mode = 'drag',
  dragTarget = 'surface',
  className,
  onPositionChange,
  expand,
  pauseOnClick = true,
  pauseLabel = 'Comparison paused',
  resumeLabel = 'Comparison following pointer',
  blinkPauseLabel = 'Pause blinking',
  blinkResumeLabel = 'Resume blinking',
  overlayLabels,
  objectFit = 'cover',
  compareMode = 'wipe',
}: CompareSliderProps) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  // Declared unconditionally (rules of hooks) even though it is only used with `expand`.
  const [expanded, setExpanded] = useState(false);
  // C6: hover-follow pause via click; `announcement` alternates between the two
  // labels so that aria-live re-announces each toggle.
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  // C5: per-side loading, idempotent (already-complete node ref + onLoad may
  // overlap after hydration: two signals, a single "loaded" per side).
  // Documented limitation: if a side's src changes after mounting, its flag
  // is NOT reset (data-loading does not reappear for the new source).
  const [loadedSides, setLoadedSides] = useState({ before: false, after: false });
  // Blink (spec A3): side shown by the timer and whether it is still running. Starts
  // paused if the user prefers reduced motion (lazy initializer: read
  // once on mount, not reactive to live preference changes).
  const [blinkShowsAfter, setBlinkShowsAfter] = useState(false);
  const [blinkRunning, setBlinkRunning] = useState(
    () => compareMode === 'blink' && !prefersReducedMotion(),
  );
  const [stacked, setStacked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  // pointerdown position and whether dragging occurred since then (4px threshold, same
  // convention as draggedRef in use-zoom-pan) to distinguish click from drag.
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggedSinceDownRef = useRef(false);
  const horizontal = orientation === 'horizontal';
  // Derived during render: only MediaSource sides are trackable; without any,
  // `data-loading` never activates (ReactNode is opaque, its load cannot be
  // observed from here — documented in the JSDoc of objectFit/overlayLabels).
  const loading =
    (isMediaSource(before) && !loadedSides.before) || (isMediaSource(after) && !loadedSides.after);
  // `side-by-side` and `blink` have neither divider nor handle: pointer/keyboard
  // gestures on this surface do not apply and return early.
  const hasSlider = compareMode === 'wipe' || compareMode === 'onion';

  // Blink timer: only runs in compareMode="blink" and with blinkRunning=true;
  // the pause switch (below) toggles blinkRunning and this effect cleans up the
  // previous interval before creating a new one (or on unmount).
  useEffect(() => {
    if (compareMode !== 'blink' || !blinkRunning) return;
    const id = window.setInterval(() => setBlinkShowsAfter((v) => !v), BLINK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [compareMode, blinkRunning]);

  // Responsive side-by-side: ResizeObserver to detect when the container
  // is narrow (<480px) and stack vertically.
  useEffect(() => {
    if (compareMode !== 'side-by-side') return;
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setStacked(entry.contentRect.width < STACK_BREAKPOINT);
      }
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [compareMode]);

  // Synchronize and reset pause state immediately during render if mode changes
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    if (mode !== 'hover') {
      setPaused(false);
    }
  }

  function update(next: number) {
    const clamped = clamp(next);
    setPosition(clamped);
    onPositionChange?.(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Without a handle there is no keyboard to govern (side-by-side/blink): the handle is not
    // even rendered, but the guard documents the invariant.
    if (!hasSlider) return;
    const step: Record<string, number> = horizontal
      ? { ArrowRight: 1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }
      : { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key === 'Home') {
      event.preventDefault();
      // The lightbox keydown is a React handler on the dialog root (not a
      // native listener), so stopPropagation does stop it: with focus on the handle,
      // Home/End/arrows move the divider and do NOT reach the viewer's keyboard pan/zoom.
      event.stopPropagation();
      update(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      event.stopPropagation();
      update(100);
    } else if (event.key in step) {
      event.preventDefault();
      event.stopPropagation();
      update(position + (step[event.key] ?? 0));
    }
  }

  function positionFromPointer(event: PointerEvent<HTMLDivElement>): number {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return position;
    return horizontal
      ? ((event.clientX - rect.left) / rect.width) * 100
      : ((event.clientY - rect.top) / rect.height) * 100;
  }

  function followsHover(event: PointerEvent<HTMLDivElement>): boolean {
    // With dragTarget='handle' hover-follow is completely disabled: the
    // surface does not respond to the pointer, only the handle (pointer or keyboard).
    // When paused (C6) tracking is suspended: the divider stays where it was.
    return dragTarget === 'surface' && mode === 'hover' && event.pointerType === 'mouse' && !paused;
  }

  function togglePaused() {
    // Outside the setPaused updater: updaters must be pure (no side effects).
    const next = !paused;
    setAnnouncement(next ? pauseLabel : resumeLabel);
    setPaused(next);
  }

  function toggleBlinkRunning() {
    // blinkPauseLabel/blinkResumeLabel are button-actions (they describe what the switch
    // does next, not the state already reached): running=true -> the switch
    // offers "pause" (blinkPauseLabel), running=false -> offers "resume"
    // (blinkResumeLabel). The aria-live announces that SAME action available after the
    // toggle, with the same condition as the render below (`blinkRunning ?
    // blinkPauseLabel : blinkResumeLabel`), so the announcement can never become out of sync
    // with the visible switch text (design review F3.6 T21 + F3.7 T24).
    const next = !blinkRunning;
    setAnnouncement(next ? blinkPauseLabel : blinkResumeLabel);
    setBlinkRunning(next);
  }

  // The `expand` (C1) lightbox mounts via createPortal in document.body but continues
  // to be a React child of THIS component: its pointer events bubble up to
  // here according to the React tree, not the real DOM. `currentTarget.contains(target)` uses
  // the real DOM, so it correctly discards events originating inside the
  // lightbox (help, controls, close…) even if its node is not under containerRef.
  function originatesOnSurface(event: PointerEvent<HTMLDivElement>): boolean {
    return event.target instanceof Node && event.currentTarget.contains(event.target);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasSlider) return;
    if (!originatesOnSurface(event)) return;
    // It is reset on every down (including the one discarded below) so that a
    // subsequent pointerup never reuses the position of a previous down.
    downPosRef.current = null;
    draggedSinceDownRef.current = false;
    if (!event.isPrimary || event.button !== 0) return;
    if (
      dragTarget === 'handle' &&
      !(event.target instanceof Element && event.target.closest('.mk-compare__handle'))
    ) {
      return;
    }
    handleRef.current?.focus({ preventScroll: true });
    downPosRef.current = { x: event.clientX, y: event.clientY };
    // With hover active the mouse already follows the pointer; the down only applies to touch/pen.
    if (followsHover(event)) return;
    // When paused (C6), the surface does not reposition the divider with any pointer: the
    // down is recorded ONLY to classify the resuming click in pointerup
    // (without capture or update, the divider does not jump to the click position).
    if (mode === 'hover' && paused) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(positionFromPointer(event));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!hasSlider) return;
    if (!originatesOnSurface(event)) return;
    if (downPosRef.current && !draggedSinceDownRef.current) {
      const dx = event.clientX - downPosRef.current.x;
      const dy = event.clientY - downPosRef.current.y;
      if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD) draggedSinceDownRef.current = true;
    }
    if (followsHover(event)) {
      update(positionFromPointer(event));
      return;
    }
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    update(positionFromPointer(event));
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!hasSlider) return;
    if (!originatesOnSurface(event)) return;
    const wasDown = downPosRef.current !== null;
    const dragged = draggedSinceDownRef.current;
    downPosRef.current = null;
    draggedSinceDownRef.current = false;
    // Click = down+up without drag; only pauses/resumes in mode="hover" with pauseOnClick
    // and dragTarget='surface' (with dragTarget='handle' there is no hover-follow to pause).
    // wasDown discards clicks whose down was absorbed by another element (e.g. the expand
    // button, which calls stopPropagation on its own pointerdown).
    if (!wasDown || dragged || mode !== 'hover' || !pauseOnClick || dragTarget !== 'surface') {
      return;
    }
    togglePaused();
  }

  function preloadExpandSources() {
    preloadFullSources([before, after].filter(isMediaSource));
  }

  // C5: marks a side as loaded. Idempotent: if already loaded, returns the SAME
  // state object (without re-render), so the complete+onLoad double fire is harmless.
  function markSideLoaded(side: CompareSide) {
    setLoadedSides((prev) => (prev[side] ? prev : { ...prev, [side]: true }));
  }

  return (
    <div
      ref={containerRef}
      className={['mk-compare', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-compare-mode={compareMode}
      data-blink-side={compareMode === 'blink' ? (blinkShowsAfter ? 'after' : 'before') : undefined}
      data-paused={mode === 'hover' && paused ? '' : undefined}
      data-loading={loading ? '' : undefined}
      data-stacked={compareMode === 'side-by-side' && stacked ? 'true' : undefined}
      style={{ ['--mk-compare-pos' as string]: `${position}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="mk-compare__before">
        {renderSide(before, 'before', objectFit, markSideLoaded)}
      </div>
      <div
        className="mk-compare__after"
        // side-by-side shows two complete and independent media items (both with
        // their own accessible name); in the remaining modes `after` is a
        // reveal effect over `before` and is hidden from screen readers.
        aria-hidden={compareMode === 'side-by-side' ? undefined : 'true'}
      >
        {renderSide(after, 'after', objectFit, markSideLoaded)}
      </div>
      {hasSlider ? <div className="mk-compare__divider" aria-hidden="true" /> : null}
      {overlayLabels ? (
        <>
          <span
            className="mk-compare__overlay-label mk-compare__overlay-label--before"
            aria-hidden="true"
          >
            {overlayLabels.before}
          </span>
          <span
            className="mk-compare__overlay-label mk-compare__overlay-label--after"
            aria-hidden="true"
          >
            {overlayLabels.after}
          </span>
        </>
      ) : null}
      {hasSlider ? (
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          // onion governs opacity, not the divider position: the valuetext
          // announces what actually changes with the handle in that mode.
          aria-valuetext={compareMode === 'onion' ? `${Math.round(position)}% after` : undefined}
          aria-orientation={orientation}
          className="mk-compare__handle"
          data-mk-drag-exempt=""
          onKeyDown={onKeyDown}
        />
      ) : null}
      {(mode === 'hover' && pauseOnClick) || compareMode === 'blink' ? (
        <span className="mk-visually-hidden" aria-live="polite">
          {announcement}
        </span>
      ) : null}
      {compareMode === 'blink' ? (
        <button
          type="button"
          role="switch"
          aria-checked={blinkRunning}
          className="mk-compare__blink-toggle"
          data-mk-drag-exempt=""
          onClick={toggleBlinkRunning}
        >
          {blinkRunning ? blinkPauseLabel : blinkResumeLabel}
        </button>
      ) : null}
      {expand ? (
        <button
          type="button"
          className="mk-compare__expand"
          data-mk-drag-exempt=""
          onPointerDown={(event) => event.stopPropagation()}
          onPointerEnter={preloadExpandSources}
          onFocus={preloadExpandSources}
          onClick={() => setExpanded(true)}
        >
          {EXPAND_ICON}
          {expand.buttonLabel ?? 'Full Screen'}
        </button>
      ) : null}
      {expand ? (
        <MediaLightbox
          open={expanded}
          onClose={() => setExpanded(false)}
          label={expand.lightboxLabel}
          labels={expand.lightboxLabels}
          // Fix T4→T5: without compareMode here, the internal lightbox would always open
          // in 'wipe' even if the background slider is in onion/side-by-side/blink.
          compare={{ before, after, label: expand.lightboxLabel, compareMode }}
        />
      ) : null}
    </div>
  );
}
