# Changelog

## 0.7.0 — Unreleased

### Added

- Motor de layouts de `FilterGallery`: `layout="masonry"` y `layout="justified"` con
  posiciones derivadas de `aspectRatio` por ítem, columnas responsive 2→5 por ancho de
  contenedor y el orden DOM intacto. Las props aditivas `layout`, `itemExtraHeight` y
  `FilterGalleryItem.aspectRatio` conservan `grid` como comportamiento por defecto.

## 0.6.0 — 2026-07-18

### Added

- **`CompareSlider`:** the `compareMode="blink"` pause/resume switch had no accessible name of
  its own — its button text reused `pauseLabel`/`resumeLabel`, which describe the unrelated
  hover-follow pause (C6, `mode="hover"` + `pauseOnClick`). A screen reader user landing on the
  blink switch heard "Comparison paused"/"Comparison following pointer", which doesn't describe
  what the switch does. New optional props `blinkPauseLabel` (default `'Pause blinking'`) and
  `blinkResumeLabel` (default `'Resume blinking'`) give it its own stable name — action-button
  wording, matching the action the switch performs next; `pauseLabel`/`resumeLabel` keep their
  original meaning, unchanged for existing consumers (design review F3.6 T21).

- **New component `HoverVideo`:** a poster/video facade — at rest only the `<img poster>` exists
  (zero video bytes downloaded). A sustained hover (`delay`, default `300`ms) with a fine pointer
  mounts the `<video autoPlay muted loop playsInline>`; leaving the area before the delay elapses
  cancels it. Click, or `Enter`/`Space` on the focused root (`role="button"`, `tabIndex={0}`),
  always toggles play/pause regardless of pointer type or `prefers-reduced-motion` — `data-state`
  (`'idle' | 'playing'`) and `aria-pressed` reflect the current state. Props: `src`, `poster`,
  `label` (required), `delay` (default `300`), `width`/`height` (required, intrinsic poster
  dimensions for zero CLS), `className`.
- **`FilterGallery`:** `visibleIds?: readonly string[]` — an additional visibility restriction
  intersected with the category `filter`, so external predicates (e.g. a text search box) can
  combine with the existing category buttons without the consumer reimplementing the FLIP
  reflow. `undefined` (default) means no restriction.
- **`FilterGallery`:** animated exit — items leaving `visible` now fade+scale out
  (`opacity 1→0`, `scale(1)→scale(0.96)`) instead of disappearing immediately, via the same manual
  FLIP/WAAPI mechanism used for the entering/repositioning animations (deferred unmount: the
  leaving `<li>` stays mounted with `data-fg-exiting` + `aria-hidden` + `inert` for the duration of
  its own animation). Reentering an item before its exit finishes cancels the exit and it rejoins
  instantly. `prefers-reduced-motion` (or no `element.animate` support) unmounts immediately, same
  as before.
- **`VideoScrubPreview`:** the bottom progress indicator is now a thicker track (`.mk-scrub__track`,
  height `6px`, background `--mk-scrub-track`) with a filled bar plus a floating `m:ss / m:ss` time
  chip (`.mk-scrub__time`, bottom-right) that appears once video metadata is available (guarded
  against non-finite duration, e.g. `Infinity`). Scrubbing before `loadedmetadata` fires is still a
  no-op (unchanged); the duration used to scrub is now captured once into React state instead of
  re-read from `video.duration` on every gesture, so scrubbing keeps working even if the live
  property later goes stale (e.g. `NaN` from a buffering/source reset) — the previous "always trust
  `video.duration`" approach would have treated that the same as metadata never having arrived.
- New public CSS variable `--mk-scrub-track` (default `rgb(255 255 255 / 0.24)`) — background of
  `VideoScrubPreview`'s progress track.

### Fixed

- **`CompareSlider`:** in fullscreen (`MediaLightbox`'s `compare`/`expand`) with a portrait-aspect
  `before`/`after` pair, the two layers no longer misalign. `MediaLightbox`'s `data-fit` sizing rule
  used a descendant combinator (`.mk-lightbox__media :is(img, video)`) that also matched the
  `<img>`s nested two levels down inside `.mk-compare__before`/`__after`, sizing each side
  independently by its own intrinsic size/`sizes` instead of letting them share the compare's own
  box. Switched to a direct-child combinator (`>`) so the rule only reaches the lone `<img>`/`<video>`
  of the `media`/`children` cases — a nested compare is now sized exclusively by its own
  `.mk-compare__before img, .mk-compare__after img` rules, which already keep both sides in the same
  box.
- **`CompareSlider` `compareMode="side-by-side"`:** stacks vertically (`data-stacked="true"`, one
  column) instead of staying two-column when the container narrows below `480`px (tracked via
  `ResizeObserver`), and both halves are normalized to equal height at every width.
- **`MediaLightbox`:** clicking play/pause on a `children`-injected audio control, or the native
  controls of a `<video controls>` inside the lightbox, closed the dialog instead of operating the
  media (QA finding, F3.7 close-out — 100% reproducible). Root cause: `useZoomPan`'s
  `onPointerDown` called `setPointerCapture` unconditionally for any pointerdown inside the
  viewport except `[data-mk-drag-exempt]`; capture redirects the subsequent pointerup/click to the
  viewport div regardless of where the pointer physically is, so `onOverlayClick` saw
  `event.target === viewportRef.current` and closed. The exemption now covers any native
  interactive element (`button, a, input, select, textarea, video, audio`, plus the existing
  `[data-mk-drag-exempt]`), so pan/zoom never steals their pointer events. `onOverlayClick` also
  gained a second, independent guard (`consumeInteractiveDown`) that remembers whether the
  pointerdown that started the gesture began on an interactive control — captured before any
  possible retargeting, so it doesn't depend on where the click event's target ends up. Pan/drag
  over the media itself is unaffected.

### Compatibility

All changes are additive; no breaking changes. Every new prop is optional with a default that
preserves prior behavior (`FilterGallery`'s exit animation is the one behavior change without a
prop gate, and it degrades to the previous immediate-unmount under `prefers-reduced-motion`, same
as every other animation in this package).

## 0.5.0 — 2026-07-17

### Added

- **New component `SpotlightReveal`:** a magnifier/flashlight that reveals a `reveal` layer over
  a `base` layer under the pointer (`clip-path: circle(...)`, positioned via `--mk-spot-x`/
  `--mk-spot-y`/`--mk-spot-radius`). Props: `base`, `reveal`, `label` (required), `radius`
  (default `110`), `defaultPosition` (default `{ x: 50, y: 50 }`, uncontrolled), `overlayLabels`,
  `className`. Pointer positions the lens; keyboard (`tabIndex={0}`,
  `aria-roledescription="spotlight"`) moves it with arrow keys (5% steps, `Shift` = 1%), centers
  with `Home`, and hides it with `Escape` without losing focus. `prefers-reduced-motion` removes
  the lens's own transitions (appearance is instant; pointer tracking is unaffected). New public
  custom property `--mk-spot-ring` (lens border color, default `rgb(255 255 255 / 0.9)`),
  declared in `:root` alongside the package's other public tokens.
- **New component `FilterGallery`:** a filterable grid with animated reflow — manual FLIP
  (First-Last-Invert-Play) via WAAPI `element.animate`, no dependencies, no View Transitions API.
  Props: `items`, `label` (required), `filter`/`defaultFilter`/`onFilterChange` (controlled or
  uncontrolled), `categories` (renders an "All" + per-category `role="group"` button bar with
  `aria-pressed`), `allLabel` (default `'All'`), `duration` (default `240`ms), `className`. Items
  entering fade+scale in from `0.96`; items leaving are removed immediately (no exit animation in
  this version). `prefers-reduced-motion` skips `element.animate` entirely. SSR-safe: the first
  render never measures or animates. New public custom properties for the filter chips —
  `--mk-filter-bg`/`--mk-filter-color` (inactive), `--mk-filter-hover-bg`, `--mk-filter-active-bg`/
  `--mk-filter-active-color` (active) — default to the previous `--mk-control-*`/`--mk-handle-*`
  values, but let consumers theme the chips independently: they sit on the page surface, unlike
  the media-overlay controls those defaults were designed for.
- **New component `VideoScrubPreview`:** hover-scrub of a video (YouTube-thumbnail pattern) via a
  muted, posterized `<video>`. Props: `src`, `label` (required), `poster`, `scrubOnFocus` (default
  `true`). Pointer move sets `currentTime` proportionally (throttled with
  `requestAnimationFrame`); pointer leave resets to the poster. Keyboard: arrow keys ±5% of
  duration, `Home`/`End`. A no-op (no error) before `loadedmetadata` fires. Internal
  `--mk-scrub-pos` CSS variable drives the progress bar (implementation detail, not a public
  token).
- **CompareSlider:** `compareMode?: 'wipe' | 'onion' | 'blink' | 'side-by-side'` (default `'wipe'`
  = current clip-path/divider behavior, zero changes). `'onion'` keeps the same handle/keyboard
  but drives the `after` layer's opacity instead of divider position. `'blink'` and
  `'side-by-side'` render no slider/handle: `'blink'` alternates `before`/`after` every 800ms
  behind a `role="switch"` pause/resume button (reuses `pauseLabel`/`resumeLabel`, starts paused
  under `prefers-reduced-motion`); `'side-by-side'` shows both sides in full via a two-column (or
  two-row, `orientation="vertical"`) grid — nested inside `MediaLightbox` it inherits the viewer's
  zoom/pan for free. `MediaLightbox`'s `compare` prop gained a matching optional `compareMode`
  passthrough.
- **MediaLightbox:** every toolbar button (zoom −/+, reset, fit, fullscreen) now carries
  `data-mk-tooltip`/`data-mk-tooltip-pos` — the CSS-only delayed tooltip infrastructure
  (previously scoped to the corner buttons) now covers every control. Appearance has a 600ms hover
  delay; disappearance and `:focus-visible` have none. `prefers-reduced-motion` keeps the delay
  (it's timing) but drops the fade's transition duration.

### Fixed

- **MediaLightbox:** toggling native fullscreen from the toolbar left focus on the toggle button,
  so `Space` (mouse-follow pan) never reactivated afterwards. Focus now returns to the dialog root
  on both entering and exiting fullscreen.
- **MediaLightbox:** the pan/zoom state wasn't re-clamped on a viewport size change (window
  `resize` or `fullscreenchange`), so panning past the new bounds silently did nothing. The zoom/
  pan hook now listens for both events while mounted and re-clamps the current state (and
  recomputes `canPan`) on each.
- **CompareSlider:** `compareMode="onion"` never blended — the `after` layer stayed effectively
  invisible across the whole slider range. `--mk-compare-pos` is a `<percentage>` value (e.g.
  `50%`); the opacity rule divided it by the unitless number `100`, and CSS percentage arithmetic
  keeps the percentage type through that division (`50% / 100` = `0.5%`, not `0.5`), so real
  opacity topped out around `1%`. Dividing by `100%` instead cancels the percentage type and
  yields the intended `0`–`1` fraction.
- **SpotlightReveal:** pointer tracking felt laggy on large images — the lens visibly trailed the
  cursor instead of following it 1:1 (measured in a real browser: an instantaneous jump took
  ~160ms to reach its target position). `clip-path`'s 160ms transition packed position (`x`/`y`)
  and radius into one value, so every `pointermove` (which only changes position) got caught in
  the same transition meant for the show/hide animation; since pointer moves fire far more often
  than 160ms, the browser kept re-targeting an in-flight interpolation and the circle never caught
  up. The transition now lives on a new, separately-animatable `--mk-spot-active-radius` (an
  `@property`-registered custom property, `0` when hidden / the configured radius when shown) —
  position is always applied instantly, and only the show/hide radius animates, matching the
  documented behavior ("pointer tracking is not an animation, it's direct positioning").

No breaking changes; every new prop above is optional with a default that preserves prior
behavior, and every existing prop, default, and CSS variable is unchanged.

## 0.4.0 — 2026-07-15

### Added

- **MediaLightbox:** `compare?: { before, after, label? }` — a before/after `CompareSlider`
  rendered inside the fullscreen viewer, inheriting its zoom/pan/toolbar (no duplicated gesture
  engine). `children` is now optional; render priority is `compare` > `media` > `children` (no
  media renders if none of the three is passed).
- **CompareSlider:** `dragTarget?: 'surface' | 'handle'` (default `'surface'`) — with `'handle'`,
  only the divider handle (pointer or keyboard) moves the divider; the rest of the surface ignores
  `pointerdown`. Used internally when a `CompareSlider` nests inside `MediaLightbox` (via `compare`
  or `expand`) so the viewer's own pan gesture and the divider drag don't fight over the same
  pointer. With `dragTarget="handle"`, `mode="hover"` has no effect (hover-follow is fully
  disabled).
- **New module `MediaSource`:** `{ src: string; fullSrc?: string; alt: string }`, plus
  `isMediaSource`, `shouldUseFullSrc(screenWidth, devicePixelRatio)` and `preloadFullSources`.
  `CompareSlider`'s `before`/`after` and `MediaLightbox`'s new `media`/`compare` props accept a
  `MediaSource` as an alternative to `ReactNode`: the package then renders its own
  `<img src alt draggable={false}>`. `shouldUseFullSrc` returns `false` below 1024 CSS px; above
  that it compares `screenWidth * min(devicePixelRatio, 2)` against a 2000px effective-width
  threshold to decide whether the fullscreen context deserves `fullSrc`. `preloadFullSources` is
  idempotent across calls (module-level dedup by URL) and a no-op under SSR.
- **CompareSlider:** `expand?: CompareSliderExpand` (`{ lightboxLabel, buttonLabel?, lightboxLabels? }`)
  — renders an overlay button (default text `'Full Screen'`) that opens an internal
  `MediaLightbox` with the same `before`/`after` compare via `dragTarget="handle"`. Hovering or
  focusing the button preloads any `fullSrc` the current screen justifies.
- **CompareSlider:** `pauseOnClick?: boolean` (default `true`, only relevant with `mode="hover"`)
  — a click (down+up under a 4px move threshold) toggles pausing the hover-follow, so a mouse can
  be lifted off without losing the compared position; while paused no pointer gesture on the
  surface repositions the divider (keyboard on the handle keeps working). New `pauseLabel`
  (default `'Comparison paused'`) and `resumeLabel` (default `'Comparison following pointer'`)
  announce the toggle via `aria-live`; reflected in a new `data-paused` attribute on the root.
- **CompareSlider:** `overlayLabels?: { before, after }` — `aria-hidden` badges in the
  bottom-left/bottom-right corners; `objectFit?: 'cover' | 'contain'` (default `'cover'`) —
  applies only to the `<img>` the package renders for a `MediaSource` side (a `ReactNode` side is
  opaque to the component, it controls its own `object-fit`).
- **CompareSlider:** loading state — a new `data-loading` attribute on the root while any
  `MediaSource` side hasn't finished loading (tracked per side, idempotent between the `onLoad`
  event and an already-`complete` node at ref-attach time, for hydration safety under static
  export). `ReactNode` sides are untracked and never contribute to `data-loading`.

### Fixed

- **CompareSlider / MediaLightbox:** native HTML5 drag on `<img>`/`<video>` (`draggable`, defaults
  to `true`) was hijacking mouse-drag gestures; both now prevent the native `dragstart` on their
  internal media and the `MediaLightbox` viewport now exposes a `data-can-pan` attribute (only
  when the content overflows) purely as a cursor affordance (`grab`/`grabbing`).

No breaking changes: `MediaLightbox.children` becoming optional is a backward-compatible
widening (every existing call site that always passed `children` keeps working unchanged); every
other addition above is a new, optional prop with a default that preserves prior behavior.

## 0.3.0 — 2026-07-14

### Added

- **MediaLightbox:** hold `Space` to pan with a `grab` cursor (pointer move pans while held;
  `Space` still activates focused buttons); `?` key and corner button toggle a keyboard-shortcuts
  help panel (`Escape` closes the help before the lightbox; focus is managed in/out of the panel);
  new `labels` keys `help`, `helpTitle` and `shortcut*` for full i18n of the panel.
- **MediaLightbox:** the controls-visibility toggle now renders an inline eye / eye-off SVG
  (instead of `⋯`) and both corner buttons (`?`, eye) show a CSS-only tooltip mirroring their
  `aria-label`.

No runtime breaking changes: all new labels default to English, there are no new props, and v2
behavior is unchanged. Type-level note: `MediaLightboxLabels` gained new required keys, so objects
annotated with the full type must add them — usage through the `labels` prop (`Partial`) is
unaffected.

## 0.2.0 — 2026-07-14

### Added

- **MediaLightbox:** zoom (wheel anchored to the cursor, pinch, double click/tap, buttons,
  keyboard `+`/`=`/`-`/`0`), edge-clamped panning, fit modes (`fit`: `'contain'` / `'cover'` /
  `'actual'`), an auto-hiding command toolbar with an explicit visibility toggle (`c` key or
  button), native fullscreen with support detection (`f` key), and full label i18n via `labels`
  (see `MediaLightboxLabels`). New props: `fit`, `zoom`, `controls`, `defaultControlsVisible`,
  `autoHideDelay`, `labels`.
- **CompareSlider:** `mode="hover"` — with a mouse pointer, the divider follows `pointermove`
  without requiring a click; touch/pen input always falls back to the `'drag'` behavior. Keyboard
  operation is unchanged in both modes. Non-primary-pointer and non-finite-position inputs are now
  guarded against; the handle receives focus on pointer-down interaction.
- New custom properties: `--mk-control-bg` (default `rgb(24 24 27 / 0.85)`) and
  `--mk-control-color` (default `#fafafa`), controlling the MediaLightbox command toolbar.
- `CHANGELOG.md` (this file).

### Changed

- **Visual (default props):** the lightbox now renders a bottom-center command toolbar (zoom,
  reset, fit, fullscreen) by default. The close `✕` and a controls-visibility toggle `⋯` are
  persistent in the top-right corner (revised after the closing design review — close stays in the
  top-right by convention/discoverability, and is present even with `controls={false}`). The
  fit-cycle button shows a fixed glyph `▣` with its meaning in the `aria-label`. Pass
  `controls={false}` to keep the v1 look (only the persistent close button).
- The lightbox's media wrapper is now `.mk-lightbox__media`, itself inside a new
  `.mk-lightbox__viewport` element (previously the wrapper was `.mk-lightbox__content`). Clicking
  the empty viewport area (outside the media) still calls `onClose`, same as clicking the dialog
  root.

### Fixed

- Body scroll lock now compensates for the scrollbar width with `padding-right`, avoiding a layout
  shift when the lightbox opens.

No breaking changes to the public API: every new prop is optional with a default that preserves
v1 behavior, except for the toolbar becoming visible by default (see above). `closeLabel` keeps
working as a legacy alias of `labels.close`.

## 0.1.0 — 2026-07-10

Initial release: accessible `CompareSlider` and `MediaLightbox`, zero runtime dependencies.
