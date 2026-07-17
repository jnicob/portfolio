# Changelog

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
  render never measures or animates.
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
