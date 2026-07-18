# @nicobehm/media-kit

Accessible media components for React 18+: a before/after **CompareSlider** and a fullscreen
**MediaLightbox**. Zero styling dependencies — plain CSS with public custom properties. Built as
part of [nicobehm's portfolio](../../README.md).

## Install

```bash
pnpm add @nicobehm/media-kit
```

`react` and `react-dom` `>=18` are peer dependencies and must already be present in the consuming
app.

## Quick start

Import the stylesheet once (e.g. in your app's entry point or root layout), then use the
components:

```tsx
import '@nicobehm/media-kit/styles.css';
import { useState } from 'react';
import { CompareSlider, MediaLightbox } from '@nicobehm/media-kit';

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CompareSlider
        label="Before and after"
        before={<img src="/before.jpg" alt="Original photo" />}
        after={<img src="/after.jpg" alt="Enhanced photo" />}
        onPositionChange={(position) => console.log(position)}
      />

      <button type="button" onClick={() => setOpen(true)}>
        Open lightbox
      </button>

      <MediaLightbox open={open} onClose={() => setOpen(false)} label="Photo preview">
        <img src="/after.jpg" alt="Enhanced photo" />
      </MediaLightbox>
    </>
  );
}
```

## Components

### CompareSlider

A before/after divider that reveals the `after` media as the user drags, or moves it with the
keyboard. Implements the [ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/).

| Prop               | Type                         | Default                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `before`           | `ReactNode \| MediaSource`   | —                                | Original media. A plain `ReactNode` (typically an `<img>`) is rendered as-is, opaque to the component. Pass a [`MediaSource`](#mediasource) instead and the package renders its own `<img src alt draggable={false} style={{objectFit}}>` — needed for `objectFit` and the `data-loading` tracking below. Rendered on the left / top.                                                                                                                                                                                        |
| `after`            | `ReactNode \| MediaSource`   | —                                | Processed media. Same `ReactNode`/`MediaSource` rules as `before`. Revealed to the right / bottom of the divider.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `label`            | `string`                     | `'Compare'`                      | Accessible name of the divider (`role="slider"`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `initialPosition`  | `number`                     | `50`                             | Initial divider position, `0`–`100`. **Uncontrolled**: read once at mount into internal state; changing the prop afterwards does not move the divider.                                                                                                                                                                                                                                                                                                                                                                       |
| `orientation`      | `'horizontal' \| 'vertical'` | `'horizontal'`                   | Drag/keyboard axis. Also toggles cursor (`col-resize`/`row-resize`) and `aria-orientation`.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `mode`             | `'drag' \| 'hover'`          | `'drag'`                         | `'drag'` requires pressing and dragging to move the divider — identical to v1. `'hover'` makes the divider follow the mouse pointer without pressing (touch/pen input always falls back to the `'drag'` behavior; on mouse-out the divider stays where it was, it does not reset). Keyboard operation is identical in both modes. Pressing the pointer down over the handle moves focus to it in both modes; in `'hover'` mode, moving the mouse without pressing updates the position but does not move focus.              |
| `dragTarget`       | `'surface' \| 'handle'`      | `'surface'`                      | `'surface'`: dragging anywhere over the container moves the divider (v1/v2 behavior). `'handle'`: only the divider handle (pointer or keyboard focus) moves it; the rest of the surface ignores `pointerdown`. Meant for a `CompareSlider` nested inside `MediaLightbox` (see [`compare`](#medialightbox) / [`expand`](#comparesliderexpand) below) so the viewer's own pan gesture and the divider drag don't compete for the same pointer. With `'handle'`, `mode="hover"` has no effect (hover-follow is fully disabled). |
| `className`        | `string`                     | `undefined`                      | Extra class name appended to the root element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `onPositionChange` | `(position: number) => void` | `undefined`                      | Receives the clamped position (0–100). Pointer dragging produces fractional values; keyboard steps add/subtract whole numbers but preserve any fractional part from a previous drag — only `Home`/`End` guarantee an integer. `aria-valuenow` is always rounded.                                                                                                                                                                                                                                                             |
| `expand`           | `CompareSliderExpand`        | `undefined`                      | Renders an overlay button that opens an internal `MediaLightbox` with the same `before`/`after` (via `dragTarget="handle"`). See [`CompareSliderExpand`](#comparesliderexpand) below.                                                                                                                                                                                                                                                                                                                                        |
| `pauseOnClick`     | `boolean`                    | `true`                           | Only applies with `mode="hover"`. A click (pointer down+up under a 4px move threshold) toggles pausing the hover-follow, so the pointer can be lifted off without losing the compared position. While paused, no pointer gesture on the surface repositions the divider (the click that resumes doesn't either — the divider stays frozen where it was); keyboard on the handle keeps working. Reflected in a `data-paused` attribute on the root.                                                                           |
| `pauseLabel`       | `string`                     | `'Comparison paused'`            | Announced via `aria-live` when `pauseOnClick` pauses the hover-follow.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `resumeLabel`      | `string`                     | `'Comparison following pointer'` | Announced via `aria-live` when `pauseOnClick` resumes the hover-follow.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `overlayLabels`    | `CompareSliderOverlayLabels` | `undefined`                      | `aria-hidden` text badges in the bottom-left (`before`) / bottom-right (`after`) corners — the accessible name of each side already comes from its `alt` (internal, for a `MediaSource` side, or the consumer's own for a `ReactNode` side). See [`CompareSliderOverlayLabels`](#compareslideroverlaylabels) below.                                                                                                                                                                                                          |
| `objectFit`        | `'cover' \| 'contain'`       | `'cover'`                        | `object-fit` of the `<img>` the package renders for a `MediaSource` side. A `ReactNode` side is opaque to the component — this prop never reaches it; the consumer controls its own `object-fit`.                                                                                                                                                                                                                                                                                                                            |
| `compareMode`      | `CompareSliderMode`          | `'wipe'`                         | Comparison axis. `'wipe'`: current `clip-path`/divider behavior, zero changes. `'onion'`: same handle/keyboard, but drives the `after` layer's opacity instead of the divider position (no visible divider; `aria-valuetext` announces `"{n}% after"`). `'blink'`: no slider/handle — alternates `before`/`after` every 800ms behind a `role="switch"` pause/resume button (reuses `pauseLabel`/`resumeLabel` and their `aria-live` region; starts paused under `prefers-reduced-motion`). `'side-by-side'`: no slider/handle — both sides render in full via a two-column grid (two-row when `orientation="vertical"`) with `overlayLabels`; nested inside `MediaLightbox` it inherits the viewer's zoom/pan for free (the transform wraps the whole compare). Responsive: a `ResizeObserver` on the container switches to one column/two rows (`data-stacked="true"` on the root) below a `480`px container width, regardless of `orientation`; both halves render their `<img>` at `width:100%; height:100%; object-fit:cover` so the two rows/columns stay equal height instead of following each image's own intrinsic aspect ratio. See `CompareSliderMode` below. **Caveat:** `blinkRunning`'s initial value (running unless `prefers-reduced-motion`) is computed once at mount from the `compareMode` prop; switching an already-mounted component's `compareMode` into `'blink'` starts it paused instead of running — pass a `key` that changes alongside `compareMode` if you need it to auto-start. |

`before`/`after` have no default — they are required props.

#### `CompareSliderMode`

```ts
type CompareSliderMode = 'wipe' | 'onion' | 'blink' | 'side-by-side';
```

#### `CompareSliderExpand`

| Key              | Type                           | Default         | Description                                                       |
| ---------------- | ------------------------------ | --------------- | ----------------------------------------------------------------- |
| `lightboxLabel`  | `string`                       | —               | `aria-label` of the internal compare-lightbox's dialog. Required. |
| `buttonLabel`    | `string`                       | `'Full Screen'` | Visible text of the overlay button (also its accessible name).    |
| `lightboxLabels` | `Partial<MediaLightboxLabels>` | `undefined`     | Labels (i18n) forwarded to the internal `MediaLightbox`.          |

Hovering or focusing the overlay button preloads any `fullSrc` the current screen justifies (via
`preloadFullSources`, see [`MediaSource`](#mediasource)) for whichever of `before`/`after` are
`MediaSource` objects.

#### `CompareSliderOverlayLabels`

| Key      | Type     | Description                                             |
| -------- | -------- | ------------------------------------------------------- |
| `before` | `string` | Badge text overlaid on the `before` side (bottom-left). |
| `after`  | `string` | Badge text overlaid on the `after` side (bottom-right). |

### MediaLightbox

A fullscreen modal for viewing a single piece of media, rendered via a portal into
`document.body`. Implements the
[ARIA dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), including a
focus trap.

| Prop                     | Type                                                                                    | Default              | Description                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                   | `boolean`                                                                               | —                    | Whether the dialog is rendered. When `false`, the component renders `null`.                                                                                                                                                                                                                                                                                                                                     |
| `onClose`                | `() => void`                                                                            | —                    | Called when the user presses `Escape` (unless native fullscreen is active, or the keyboard-shortcuts help panel is open — see [Keyboard map](#keyboard-map)), clicks the overlay/empty viewport, or clicks close.                                                                                                                                                                                               |
| `label`                  | `string`                                                                                | —                    | Accessible name of the dialog (`aria-label`).                                                                                                                                                                                                                                                                                                                                                                   |
| `closeLabel`             | `string`                                                                                | `'Close'`            | **Legacy alias** of `labels.close` (v1 prop, kept for backward compatibility). If both `closeLabel` and `labels.close` are set, `labels.close` wins.                                                                                                                                                                                                                                                            |
| `fit`                    | `'contain' \| 'cover' \| 'actual'`                                                      | `'contain'`          | Base sizing at zoom 1x. `'contain'` fits the media inside the viewport; `'cover'` fills the viewport (cropping); `'actual'` renders at natural size (1:1). **Uncontrolled**: read once when the dialog opens; changing the prop while open does not move it (like `CompareSlider`'s `initialPosition`). During a session it changes via the toolbar's fit-cycle button, which resets zoom to 1x and re-centers. |
| `zoom`                   | `{ min?: number; max?: number }`                                                        | `{ min: 1, max: 8 }` | Zoom bounds, relative to the `fit` base size.                                                                                                                                                                                                                                                                                                                                                                   |
| `controls`               | `boolean`                                                                               | `true`               | Whether to render the bottom command toolbar (zoom, reset, fit, fullscreen) plus a controls-visibility toggle showing an inline eye / eye-off icon (top-right). When `false`, neither is rendered; pointer gestures and keyboard shortcuts remain fully active. A persistent close `✕` and the keyboard-shortcuts `?` button (top-right) are present in **both** modes.                                         |
| `defaultControlsVisible` | `boolean`                                                                               | `true`               | Initial visibility of the toolbar. Ignored when `controls` is `false`.                                                                                                                                                                                                                                                                                                                                          |
| `autoHideDelay`          | `number \| null`                                                                        | `3000`               | Milliseconds of pointer inactivity before the toolbar auto-hides. `null` disables auto-hide (the toolbar then only toggles via the `c` key or the visibility button). Auto-hide never triggers while focus is inside the toolbar.                                                                                                                                                                               |
| `labels`                 | `Partial<MediaLightboxLabels>`                                                          | `undefined`          | Overrides for the toolbar/close button text (i18n). Each key falls back to the English default listed below.                                                                                                                                                                                                                                                                                                    |
| `children`               | `ReactNode`                                                                             | `undefined`          | Fullscreen content: `<img>`, `<video>`, or a composition of either. **Optional** — ignored if `compare` or `media` is present; without any of the three, the viewer renders no media.                                                                                                                                                                                                                           |
| `media`                  | `MediaSource`                                                                           | `undefined`          | Single media as a [`MediaSource`](#mediasource) (alternative to `children`): the lightbox renders its own `<img>`, picking `src` or `fullSrc` for the current screen via `pickFullscreenSrc`. Ignored if `compare` is present.                                                                                                                                                                                  |
| `compare`                | `{ before: ReactNode \| MediaSource; after: ReactNode \| MediaSource; label?: string; compareMode?: CompareSliderMode }` | `undefined`          | A before/after compare rendered inside the viewer (internally a `CompareSlider` with `dragTarget="handle"`, inheriting the lightbox's zoom/pan/toolbar without duplicating the gesture engine). Wins over `media` and `children` when present. Each side accepts `ReactNode` or `MediaSource`; a `MediaSource` side resolves through `pickFullscreenSrc`. `compareMode` is an optional passthrough to the internal `CompareSlider` (see [`compareMode`](#compareslider) above) — `'side-by-side'` inherits the lightbox's own zoom/pan for free, since its transform wraps the whole compare.                                                       |

`open`, `onClose`, and `label` have no default — they are required props. Render priority when
more than one of `compare` / `media` / `children` is passed: **`compare` > `media` > `children`**.

#### `MediaLightboxLabels`

All keys are optional (`Partial<MediaLightboxLabels>`) and merge over these English defaults:

| Key                  | Default (English)                    | Used for                                                                                                       |
| -------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `controls`           | `'Controls'`                         | `aria-label` of the toolbar (`role="group"`)                                                                   |
| `zoomIn`             | `'Zoom in'`                          | Zoom-in button                                                                                                 |
| `zoomOut`            | `'Zoom out'`                         | Zoom-out button                                                                                                |
| `zoomLevel`          | `'Zoom {percent}%'`                  | `aria-live` announcement template — `{percent}` is substituted                                                 |
| `reset`              | `'Reset view'`                       | Reset button                                                                                                   |
| `fit`                | `'Fit: {current}. Switch to {next}'` | Fit-cycle button's `aria-label` — `{current}`/`{next}` substituted (the button itself shows a fixed glyph `▣`) |
| `fullscreen`         | `'Enter fullscreen'`                 | Fullscreen button, shown while inactive                                                                        |
| `exitFullscreen`     | `'Exit fullscreen'`                  | Fullscreen button, shown while active                                                                          |
| `hideControls`       | `'Hide controls'`                    | Visibility toggle, shown while the toolbar is visible                                                          |
| `showControls`       | `'Show controls'`                    | Visibility toggle, shown while the toolbar is hidden                                                           |
| `close`              | `'Close'`                            | Persistent close button (top-right), present in both `controls` modes                                          |
| `help`               | `'Keyboard shortcuts'`               | `aria-label` and CSS tooltip of the corner `?` button, which toggles the keyboard-shortcuts help panel         |
| `helpTitle`          | `'Keyboard shortcuts'`               | Accessible name (`aria-label`) of the help panel (`role="group"`) and its visible heading text                 |
| `shortcutZoom`       | `'Zoom in / out'`                    | Help panel row describing `+`/`−`/wheel/double-click                                                           |
| `shortcutReset`      | `'Reset view'`                       | Help panel row describing `0`                                                                                  |
| `shortcutPanKeys`    | `'Pan'`                              | Help panel row describing the arrow keys                                                                       |
| `shortcutPanDrag`    | `'Hold Space and drag to pan'`       | Help panel row describing `Space`                                                                              |
| `shortcutFit`        | `'Cycle fit mode (toolbar)'`         | Help panel row describing the fit-cycle glyph (`▣`); cycling fit has no keyboard shortcut of its own           |
| `shortcutFullscreen` | `'Toggle fullscreen'`                | Help panel row describing `f`                                                                                  |
| `shortcutControls`   | `'Show / hide controls'`             | Help panel row describing `c`                                                                                  |
| `shortcutHelp`       | `'Toggle this help'`                 | Help panel row describing `?`                                                                                  |
| `shortcutClose`      | `'Close'`                            | Help panel row describing `Esc`                                                                                |

### SpotlightReveal

A magnifier/flashlight that reveals `reveal` over `base` under the pointer — the highest-impact
sibling of `CompareSlider`.

| Prop              | Type                                 | Default            | Description                                                                                                                                                                                                          |
| ----------------- | ------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`            | `ReactNode \| MediaSource`           | —                    | Always-visible layer. Same `ReactNode`/`MediaSource` rules as `CompareSlider`'s `before`/`after` — a `MediaSource` renders the package's own `<img src alt draggable={false}>`.                                                                                                                                                    |
| `reveal`          | `ReactNode \| MediaSource`           | —                    | Layer revealed under the lens, clipped with `clip-path: circle(...)`. Rendered `aria-hidden` — same reasoning as `CompareSlider`'s `after`: its accessible name would duplicate `base`'s.                                                                                                                                          |
| `label`           | `string`                             | —                    | Accessible name of the interactive area (`aria-label`).                                                                                                                                                                                                                                                                             |
| `radius`          | `number`                             | `110`                | Lens radius in px.                                                                                                                                                                                                                                                                                                                   |
| `defaultPosition` | `{ x: number; y: number }`           | `{ x: 50, y: 50 }`   | Initial lens position, `%` `0`–`100` on each axis. **Uncontrolled**: read once at mount into internal state.                                                                                                                                                                                                                        |
| `overlayLabels`   | `{ base?: string; reveal?: string }` | `undefined`          | `aria-hidden` badges, top-left (`base`) / top-right (`reveal`).                                                                                                                                                                                                                                                                     |
| `className`       | `string`                             | `undefined`          | Extra class name appended to the root element.                                                                                                                                                                                                                                                                                      |

`base`, `reveal`, and `label` have no default — they are required props.

Pointer: `pointermove` positions the lens (coordinates relative to the container, same math as
`CompareSlider`'s position tracking); `pointerleave` hides it. Keyboard: the root is
`tabIndex={0}` with `aria-roledescription="spotlight"`; arrow keys move the lens in 5% steps
(`Shift` = 1% steps), `Home` centers it (`{50, 50}`) and shows it, `Escape` hides it without
losing focus. While focused, the lens stays visible at its last position.
`prefers-reduced-motion`: the lens's radius/opacity transitions are removed (appearance is
instant); pointer tracking is unaffected — it's direct positioning, not an animation.

New custom property `--mk-spot-ring` (default `rgb(255 255 255 / 0.9)`, declared in `:root`
alongside the other public tokens) controls the lens's border color — see
[Styling](#styling) below.

### FilterGallery

A filterable grid with animated reflow — manual FLIP (First-Last-Invert-Play) via WAAPI
`element.animate`, no dependencies, no View Transitions API.

| Prop             | Type                                    | Default     | Description                                                                                                                    |
| ---------------- | --------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`          | `readonly FilterGalleryItem[]`          | —           | Items to render.                                                                                                                                                                                       |
| `filter`         | `string \| null`                        | `undefined` | Controlled filter; `null` means "all". Omit for uncontrolled mode.                                                                                                                                     |
| `defaultFilter`  | `string \| null`                        | `null`      | Initial filter in uncontrolled mode.                                                                                                                                                                   |
| `onFilterChange` | `(filter: string \| null) => void`      | `undefined` | Called on every selection, in both controlled and uncontrolled mode.                                                                                                                                   |
| `categories`     | `readonly FilterGalleryCategory[]`      | `undefined` | If passed, renders the filter button group (`role="group"`, toggle buttons with `aria-pressed`) — always includes an "All" button regardless of this list.                                            |
| `allLabel`       | `string`                                | `'All'`     | Label of the "all" button.                                                                                                                                                                             |
| `label`          | `string`                                | —           | Accessible name (`aria-label`) of both the filter button group and the grid.                                                                                                                           |
| `duration`       | `number`                                | `240`       | Milliseconds of the FLIP repositioning animation (also the duration of the entering fade+scale and the leaving fade-out, below).                                                                       |
| `visibleIds`     | `readonly string[]`                     | `undefined` | Additional visibility restriction, intersected with the category `filter` — lets an external predicate (e.g. a text search box) combine with category filtering. `undefined` means no restriction.    |
| `className`      | `string`                                | `undefined` | Extra class name appended to the root element.                                                                                                                                                        |

`items` and `label` have no default — they are required props.

#### `FilterGalleryItem`

| Key          | Type                    | Description                                                                          |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------- |
| `id`         | `string`                | Stable identity used for FLIP tracking (`data-fg-id`) and the React `key`.             |
| `categories` | `readonly string[]`     | Category ids the item belongs to; matched against `filter`.                           |
| `node`       | `ReactNode`             | Rendered content, wrapped in an `<li>`.                                                |

#### `FilterGalleryCategory`

| Key     | Type     | Description                                                          |
| ------- | -------- | ---------------------------------------------------------------------- |
| `id`    | `string` | Value passed to `filter`/`onFilterChange` when its button is pressed. |
| `label` | `string` | Visible button text.                                                  |

An item is visible when its `categories` include the active `filter` **and** (if `visibleIds` is
passed) its `id` is in `visibleIds` — the two restrictions intersect, so category buttons and an
external predicate (e.g. a search box driving `visibleIds`) compose freely. Items that stay visible
are repositioned with FLIP — rects measured before the change, then animated from their previous
position to identity via `element.animate`. Items newly entering fade+scale in from `0.96`. Items
leaving stay mounted for the duration of their own fade+scale-out (`opacity 1→0`, `scale(1)→0.96`,
`duration` ms) — a deferred unmount: the leaving `<li>` gets `data-fg-exiting` + `aria-hidden` +
`inert` for that window, so it's invisible to assistive tech and unfocusable while it visually fades.
If an exiting id becomes visible again before its animation finishes, the exit is canceled and it
rejoins immediately. `prefers-reduced-motion` (checked in JS), no `element.animate` support, or
unmounting the whole `FilterGallery` while an exit is in flight all skip straight to removal — no
orphaned exiting items. SSR-safe: the first render never measures or animates, it only captures
positions for the next filter/`visibleIds` change.

### VideoScrubPreview

Hover-scrub of a video, the YouTube-thumbnail pattern.

| Prop           | Type      | Default     | Description                                                                          |
| -------------- | --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src`          | `string`  | —           | Video URL (same-origin, or CORS-enabled).                                                                                     |
| `poster`       | `string`  | `undefined` | Image shown before interaction and while metadata is still loading.                                                          |
| `label`        | `string`  | —           | Accessible name of the interactive area (`aria-label`).                                                                      |
| `scrubOnFocus` | `boolean` | `true`      | Enables keyboard scrubbing (arrow keys ±5%, `Home`/`End`).                                                                    |
| `className`    | `string`  | `undefined` | Extra class name appended to the root element.                                                                               |

`src` and `label` have no default — they are required props.

Renders `<video muted playsInline preload="metadata" aria-hidden>`. `pointermove` over the area
sets `currentTime = (x / width) * duration` (throttled with `requestAnimationFrame`);
`pointerleave` resets to `currentTime = 0` (back to the poster) — the video never actually plays,
so there's nothing to pause. Keyboard:
`ArrowRight`/`ArrowLeft` step ±5% of `duration`, `Home`/`End` jump to start/end — all gated on
`scrubOnFocus` (default `true`). Until the browser fires `loadedmetadata`, any scrub attempt is a
no-op (no errors thrown). The duration used to compute the scrub position is captured once into
React state inside `onLoadedMetadata`, instead of being re-read from `video.duration` on every
gesture — so a subsequent gesture keeps scrubbing correctly even if `video.duration` itself later
becomes unavailable again (e.g. `NaN` from a buffering/source reset), which the live-property
approach would have treated as "metadata never arrived" and silently ignored.

A track (`.mk-scrub__track`, height `6px`, background `--mk-scrub-track`) with a filled bar
(`.mk-scrub__bar`) reflects position along the bottom edge through an internal `--mk-scrub-pos`
CSS variable — an implementation detail (analogous to `CompareSlider`'s internal
`--mk-compare-pos`), not a public token meant to be set by consumers. Once duration is known (and
finite — `Infinity` is guarded the same as `NaN`), a floating `m:ss / m:ss` time chip
(`.mk-scrub__time`, bottom-right, e.g. `"0:07 / 1:30"`) renders next to it; before that, or if
duration isn't finite, it stays empty (and hidden via `:empty`).

### HoverVideo

A poster/video facade: at rest, only an `<img poster>` exists — zero video bytes are downloaded
until the user actually engages.

| Prop        | Type     | Default | Description                                                                                                    |
| ----------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`       | `string` | —       | Video URL. Only fetched after activation (facade — 0 bytes at rest).                                                                                                                                  |
| `poster`    | `string` | —       | Image visible at rest.                                                                                                                                                                                |
| `label`     | `string` | —       | Accessible name of the interactive area (`aria-label`).                                                                                                                                               |
| `delay`     | `number` | `300`   | Milliseconds of sustained hover before the video activates.                                                                                                                                           |
| `width`     | `number` | —       | Intrinsic poster width, set on the `<img>` for zero CLS.                                                                                                                                              |
| `height`    | `number` | —       | Intrinsic poster height, set on the `<img>` for zero CLS.                                                                                                                                              |
| `className` | `string` | `undefined` | Extra class name appended to the root element.                                                                                                                                                    |

`src`, `poster`, `label`, `width`, and `height` have no default — they are required props.

The root is `role="button"`, `tabIndex={0}`, with `aria-label={label}` and `aria-pressed`
reflecting whether the video is currently mounted/playing; `data-state` (`'idle'` or `'playing'`)
mirrors the same state for styling. With a fine pointer (`matchMedia('(pointer: fine)')`, assumed
true if `matchMedia` is unavailable — e.g. SSR or an unpolyfilled test environment) and no
`prefers-reduced-motion`, hovering for `delay` ms mounts a `<video autoPlay muted loop playsInline
aria-hidden>` over the poster; leaving before the delay elapses cancels the pending timer without
ever mounting the video. `Enter`/`Space` on the focused root, or a click, always toggles playback
regardless of pointer type or `prefers-reduced-motion` — this explicit toggle is the only way to
activate the video on a coarse pointer or under reduced motion.

### `MediaSource`

A plain, dependency-free module (no React) letting `CompareSlider` and `MediaLightbox` decide,
based on screen size/density, whether to serve a base image or a higher-resolution variant —
without coupling that decision to the components themselves.

```ts
type MediaSource = { src: string; fullSrc?: string; alt: string };

function isMediaSource(value: unknown): value is MediaSource;

/** screenWidth < 1024 → always false. Otherwise: screenWidth * min(dpr, 2) >= 2000. */
function shouldUseFullSrc(screenWidth: number, devicePixelRatio: number): boolean;

/** new Image() for each fullSrc the current screen justifies. SSR-safe (no-op). Idempotent
 *  across calls — a module-level Set dedups by URL, so calling it repeatedly (e.g. on every
 *  pointerenter of an expand button) never re-fetches the same asset. */
function preloadFullSources(sources: readonly MediaSource[]): void;
```

- `isMediaSource` is the type guard `CompareSlider`/`MediaLightbox` use internally to tell a
  `MediaSource` object apart from an opaque `ReactNode` passed to `before`/`after`/`media`/`compare`.
- `shouldUseFullSrc(screenWidth, devicePixelRatio)`: mobile screens (`screenWidth < 1024` CSS px)
  never get the HD asset, even if a high `devicePixelRatio` would push them over the effective-width
  threshold. Above that width, the device pixel ratio is capped at `2` before multiplying (so a
  dpr-3 desktop isn't over-served) and compared against a `2000`px effective-width threshold.
- `preloadFullSources` is what `CompareSlider`'s `expand` button calls on hover/focus — it is also
  exported directly if you want to preload a gallery's `fullSrc` assets ahead of time (e.g. on route
  idle, or on hover of a thumbnail that will open a `MediaLightbox`).
- A `pickFullscreenSrc(source: MediaSource): string` helper exists internally (used by both
  components to choose `src` vs `fullSrc` when rendering a `MediaSource` side inside a fullscreen
  context) but is **not** part of the public API — it isn't re-exported from the package entry point.

## Keyboard map

`MediaLightbox` binds every shortcut to its own dialog element — never to `window` — so they're
only active while the lightbox is open. All of them (except `Escape` and `Tab`/`Shift+Tab`) are
ignored while focus sits on a form field (`input`, `textarea`, `select`, `[contenteditable]`).

When a `CompareSlider` is nested inside the lightbox (via `compare` or `expand`, always with
`dragTarget="handle"`), the divider's own keyboard handling — `ArrowLeft`/`ArrowRight`/
`ArrowUp`/`ArrowDown` (±1), `PageUp`/`PageDown` (±10), `Home`/`End` — only fires while the **handle**
has focus, and stops propagation so those keys never reach the lightbox's own pan-by-arrow-keys
handling below. `Escape` is the one key the divider never intercepts, so it always bubbles up to
close the lightbox (or the help panel) as usual, even with the handle focused.

| Key                                                  | Action                                                                                                                                                                                                                               | Condition                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Escape`                                             | Closes the topmost active layer.                                                                                                                                                                                                     | Precedence: if native fullscreen is active, this `Escape` only exits fullscreen instead (matching browser behavior) — the dialog and help panel stay as they are; otherwise, if the help panel is open, this `Escape` closes the panel instead — the dialog stays open; otherwise it closes the dialog. |
| `Tab` / `Shift+Tab`                                  | Cycles the focus trap across the dialog's focusable elements.                                                                                                                                                                        | Always.                                                                                                                                                                                                                                                                                                 |
| `+` / `=`                                            | Zooms in (same step as the toolbar's `+` button).                                                                                                                                                                                    | Always.                                                                                                                                                                                                                                                                                                 |
| `-`                                                  | Zooms out (same step as the toolbar's `−` button).                                                                                                                                                                                   | Always.                                                                                                                                                                                                                                                                                                 |
| `0`                                                  | Resets to zoom 1x, re-centered.                                                                                                                                                                                                      | Always.                                                                                                                                                                                                                                                                                                 |
| `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` | Pans the media by a fixed step.                                                                                                                                                                                                      | Focus is outside the toolbar; a no-op when the content doesn't overflow the viewport.                                                                                                                                                                                                                   |
| `Space` (hold)                                       | While held, moving the pointer pans the media (grab cursor); over a button or link, `Space` keeps its native behavior instead of panning. (Dragging with a mouse button pans regardless of `Space` — that is the standard drag-pan.) | A no-op when the content doesn't overflow the viewport.                                                                                                                                                                                                                                                 |
| `f`                                                  | Toggles native fullscreen.                                                                                                                                                                                                           | Only when the Fullscreen API is supported (otherwise the button isn't rendered either).                                                                                                                                                                                                                 |
| `c`                                                  | Shows/hides the toolbar.                                                                                                                                                                                                             | Only when `controls` is `true`.                                                                                                                                                                                                                                                                         |
| `?`                                                  | Toggles the keyboard-shortcuts help panel.                                                                                                                                                                                           | Focus moves into the panel on open, back to the `?` button on close.                                                                                                                                                                                                                                    |

## Styling

No CSS-in-JS, no build-time theming step: import `@nicobehm/media-kit/styles.css` once and
override any of the following custom properties on `:root` to restyle the components. For
`CompareSlider` you can also override them on a wrapping element; `MediaLightbox` renders in a
portal under `document.body`, so wrapper-level overrides do **not** reach it — set its
properties (`--mk-overlay-bg`, `--mk-z-lightbox`, close-button vars) on `:root` (or
`:root[data-theme='…']`).

| Custom property          | Default                | Controls                                                                                                                                                                                                                  |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--mk-handle-color`      | `#ffffff`              | Background of the CompareSlider divider line, its circular grip indicator, and the MediaLightbox close button. Intentionally not theme-mapped by consumers — it must contrast with the media shown, not the page surface. |
| `--mk-handle-icon-color` | `#18181b`              | Color of the chevron affordance (`◂ ▸` / `▴ ▾`) rendered inside the CompareSlider grip indicator.                                                                                                                         |
| `--mk-handle-ring`       | `rgb(0 0 0 / 0.4)`     | Outline `box-shadow` around the CompareSlider divider line, its grip indicator, and the MediaLightbox close button, keeping them visible against any media.                                                               |
| `--mk-handle-size`       | `2.5rem`               | Diameter of the CompareSlider handle's circular grip indicator (the enlarged touch target).                                                                                                                               |
| `--mk-divider-width`     | `2px`                  | Thickness of the CompareSlider divider line (width when horizontal, height when vertical).                                                                                                                                |
| `--mk-focus-ring`        | `#6d5ce8`              | `focus-visible` indicator color: outer layer of the two-layer ring on the CompareSlider grip, and outline on the MediaLightbox close button/content.                                                                      |
| `--mk-overlay-bg`        | `rgb(0 0 0 / 0.88)`    | Background of the MediaLightbox overlay.                                                                                                                                                                                  |
| `--mk-radius`            | `0.75rem`              | Border radius of the CompareSlider container and of `<img>`/`<video>` elements inside the lightbox.                                                                                                                       |
| `--mk-z-lightbox`        | `50`                   | `z-index` of the MediaLightbox overlay.                                                                                                                                                                                   |
| `--mk-control-bg`        | `rgb(24 24 27 / 0.85)` | Background of the MediaLightbox command toolbar.                                                                                                                                                                          |
| `--mk-control-color`     | `#fafafa`              | Text/icon color inside the MediaLightbox command toolbar.                                                                                                                                                                 |
| `--mk-spot-ring`         | `rgb(255 255 255 / 0.9)` | Border color of the SpotlightReveal lens ring.                                                                                                                                                                          |
| `--mk-filter-bg`         | `var(--mk-control-bg)` | Background of an inactive FilterGallery chip. Unlike `--mk-control-*`/`--mk-handle-*` (designed to sit over a photo/video), FilterGallery's chips sit on the page surface — map this to a page-level token instead. |
| `--mk-filter-color`      | `var(--mk-control-color)` | Text color of an inactive FilterGallery chip. |
| `--mk-filter-hover-bg`   | `rgb(255 255 255 / 0.12)` | Background of an inactive FilterGallery chip on hover. |
| `--mk-filter-active-bg`  | `var(--mk-handle-color)` | Background of the active (`aria-pressed="true"`) FilterGallery chip. |
| `--mk-filter-active-color` | `var(--mk-handle-icon-color)` | Text color of the active FilterGallery chip. |
| `--mk-scrub-track`       | `rgb(255 255 255 / 0.24)` | Background of VideoScrubPreview's progress track (`.mk-scrub__track`), behind the filled bar. |

## Recipes

All examples assume the stylesheet is already imported once (see [Quick start](#quick-start)).

### 1. Basic lightbox (v1 usage, unchanged)

```tsx
import { useState } from 'react';
import { MediaLightbox } from '@nicobehm/media-kit';

function BasicLightbox() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open lightbox
      </button>
      <MediaLightbox open={open} onClose={() => setOpen(false)} label="Photo preview">
        <img src="/after.jpg" alt="Enhanced photo" />
      </MediaLightbox>
    </>
  );
}
```

### 2. Gallery image with zoom/pan and `fit="cover"`

`cover` fills the viewport edge-to-edge (cropping the media), which suits a gallery that wants an
immersive, no-letterboxing preview. Zoom bounds can be narrowed since `cover` already starts closer
to the content's native resolution.

```tsx
function GalleryLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img src={src} alt={alt} onClick={() => setOpen(true)} role="button" tabIndex={0} />
      <MediaLightbox
        open={open}
        onClose={() => setOpen(false)}
        label="Gallery image"
        fit="cover"
        zoom={{ min: 1, max: 4 }}
      >
        <img src={src} alt={alt} />
      </MediaLightbox>
    </>
  );
}
```

### 3. Toolbar-less lightbox (`controls={false}`)

`controls={false}` removes the visual command toolbar and the eye / eye-off visibility toggle,
leaving only the persistent close `✕` and the keyboard-shortcuts `?` button (the v1 look, plus
help) — pointer gestures (wheel, pinch, double-tap/click) and every keyboard shortcut except `c`
keep working silently in the background. Note that `MediaLightbox` doesn't
expose the internal zoom/fit state or setters, so building a fully custom toolbar synced to that
state isn't possible through the public API today; use this mode when you want the bare chrome, not
to replace the toolbar with your own zoom controls.

```tsx
function BareLightbox() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <MediaLightbox
        open={open}
        onClose={() => setOpen(false)}
        label="Photo preview"
        controls={false}
      >
        <img src="/after.jpg" alt="Enhanced photo" />
      </MediaLightbox>
    </>
  );
}
```

### 4. Full i18n via `labels`

Every key in `MediaLightboxLabels` is optional and can be overridden independently; here all of
them are set for a Spanish UI (`{percent}`, `{current}` and `{next}` are template placeholders
substituted at render time):

```tsx
<MediaLightbox
  open={open}
  onClose={() => setOpen(false)}
  label="Vista previa de la foto"
  labels={{
    controls: 'Controles',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    zoomLevel: 'Zoom al {percent}%',
    reset: 'Restablecer vista',
    fit: 'Ajuste: {current}. Cambiar a {next}',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    hideControls: 'Ocultar controles',
    showControls: 'Mostrar controles',
    close: 'Cerrar',
  }}
>
  <img src="/after.jpg" alt="Foto mejorada" />
</MediaLightbox>
```

### 5. `CompareSlider mode="hover"` for before/after grids

`mode="hover"` suits a grid of several before/after cases: hovering each card previews the
comparison without requiring a click-and-drag per card. Touch users still get the drag behavior.

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
  <CompareSlider
    mode="hover"
    label="Before and after — portrait"
    before={<img src="/case-1/before.jpg" alt="Original photo" />}
    after={<img src="/case-1/after.jpg" alt="Enhanced photo" />}
  />
  <CompareSlider
    mode="hover"
    label="Before and after — landscape"
    before={<img src="/case-2/before.jpg" alt="Original photo" />}
    after={<img src="/case-2/after.jpg" alt="Enhanced photo" />}
  />
</div>
```

### 6. Mapping your design tokens to `--mk-*`

Map the package's custom properties to your own theme tokens once, under your theme selectors.
This monorepo's showcase app (`apps/web/src/app/globals.css`) maps `--mk-focus-ring` and
`--mk-radius` this way; the toolbar-color mappings below are illustrative — extend the same
pattern to whichever `--mk-*` you want to theme:

```css
/* globals.css (or wherever your app defines its theme tokens) */
:root[data-theme='dark'],
:root[data-theme='light'] {
  --mk-focus-ring: var(--ring);
  --mk-radius: var(--radius-card);
  /* Illustrative — extend the same pattern to the control colors if you want them themed: */
  --mk-control-bg: var(--surface);
  --mk-control-color: var(--fg);
}

/* --mk-handle-color is intentionally left un-mapped: it must contrast with
   the media being shown (a photo or video), not with the page surface, in
   either theme. */
```

### 7. Color vs. black & white from a single bitmap

Derive the "before" side with a CSS filter — one asset, no double weight:

```tsx
<CompareSlider
  before={
    <img src="/portrait.webp" alt="Black and white portrait" style={{ filter: 'grayscale(1)' }} />
  }
  after={<img src="/portrait.webp" alt="" />}
  label="Compare black & white with color"
/>
```

### 8. Compare lightbox

Give a `CompareSlider` an `expand` button that opens the same before/after inside a fullscreen
`MediaLightbox` (or build the fullscreen compare directly with `MediaLightbox`'s own `compare`
prop, if you don't want the smaller inline slider at all):

```tsx
// A) Inline slider + overlay button that opens a fullscreen compare-lightbox.
<CompareSlider
  before={<img src="/before.jpg" alt="Original photo" />}
  after={<img src="/after.jpg" alt="" />}
  label="Before and after"
  expand={{
    lightboxLabel: 'Compare before and after',
    buttonLabel: 'Full Screen', // optional — this is also the default
  }}
/>;

// B) Fullscreen-only compare, opened from your own trigger.
function CompareLightbox() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Compare fullscreen
      </button>
      <MediaLightbox
        open={open}
        onClose={() => setOpen(false)}
        label="Compare before and after"
        compare={{
          before: <img src="/before.jpg" alt="Original photo" />,
          after: <img src="/after.jpg" alt="" />,
          label: 'Before and after',
        }}
      />
    </>
  );
}
```

Both forms render the nested `CompareSlider` with `dragTarget="handle"` internally — the divider
only moves from its own handle, leaving the rest of the viewport free for the lightbox's own
pan/zoom gestures.

### 9. Dual resolution (`src`/`fullSrc`)

Pass a [`MediaSource`](#mediasource) instead of a `ReactNode` to serve a higher-resolution asset
only where the screen justifies it — large desktop/tablet viewports at zoom or fullscreen, never on
mobile. The package decides for you (see `shouldUseFullSrc`'s thresholds above); you only declare
the two URLs:

```tsx
const portrait = {
  src: '/portrait.webp', // ~1600×900, always used inline / on small screens
  fullSrc: '/portrait-hd.webp', // ~3200×1800, used in fullscreen on large/high-density screens
  alt: 'Portrait photo',
};

<CompareSlider
  before={<img src="/portrait-bw.webp" alt="Black and white portrait" />}
  after={portrait}
  label="Compare black & white with color"
  objectFit="cover"
  expand={{ lightboxLabel: 'Compare fullscreen' }}
/>;

// A standalone MediaLightbox with a single MediaSource behaves the same way:
<MediaLightbox
  open={open}
  onClose={() => setOpen(false)}
  label="Portrait preview"
  media={portrait}
/>;
```

In both cases, the inline/base render always uses `src`; only the internal fullscreen render (the
`expand` button's compare-lightbox, or `MediaLightbox`'s own `media`/`compare`) picks `fullSrc` via
`pickFullscreenSrc`, and only on screens `shouldUseFullSrc` qualifies. Hovering/focusing the
`expand` button also calls `preloadFullSources` for you, so the HD asset is often already cached by
the time the user opens the fullscreen view.

## Accessibility

**CompareSlider** implements the ARIA
[slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/): the handle has
`role="slider"`, `tabIndex={0}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow`
(rounded to the nearest integer), and `aria-orientation`. It is operable with
`ArrowLeft`/`ArrowRight` (or `ArrowUp`/`ArrowDown` when vertical, ±1), `PageUp`/`PageDown` (±10),
and `Home`/`End` (jump to `0`/`100`).

The `after` slot is rendered with `aria-hidden="true"`. Both `before` and `after` typically depict
the same subject (e.g. the same photo, unedited vs. edited), so exposing both to assistive
technology would announce that content twice. The widget's accessible name/description is carried
by the visible `before` media (e.g. its `<img alt>`) together with the slider handle's
`aria-label` (the `label` prop) — hiding `after` avoids a duplicate, confusing announcement while
keeping the meaningful content (the `before` image and the slider control) in the accessibility
tree.

`overlayLabels`' `before`/`after` badges are also `aria-hidden="true"` — same reasoning: the side's
`alt` (or the consumer's own, for a `ReactNode` side) already carries the accessible description,
so the visual badge doesn't need to be announced again.

With `pauseOnClick` (default `true`, `mode="hover"` only), the pause/resume toggle is announced via
a visually-hidden `aria-live="polite"` region using `pauseLabel`/`resumeLabel`, and reflected
visually in a `data-paused` attribute on the root — assistive tech users get the same "frozen"
feedback sighted users get from the CSS change that attribute drives.

**Loading state and its `ReactNode` limitation:** a `data-loading` attribute appears on the root
while any `MediaSource` side (`before`/`after`) hasn't finished loading its `<img>` — tracked per
side and idempotent between the `load` event and an already-`complete` node at ref-attach time
(so hydration under static export never leaves a side stuck loading). A `ReactNode` side is opaque
to the component: its loading can't be observed, so it never contributes to `data-loading` — if you
pass `ReactNode` on both sides, `data-loading` never activates, and any loading-state styling you
rely on for a `MediaSource` side won't apply to it.

**MediaLightbox** implements the ARIA
[dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): the root has
`role="dialog"`, `aria-modal="true"`, and `aria-label` from the `label` prop. Keyboard contract: see
the full [Keyboard map](#keyboard-map) above; in summary, `Escape` calls `onClose` unless native
fullscreen is active (exits fullscreen instead) or the keyboard-shortcuts help panel is open
(closes the panel instead), and `Tab`/`Shift+Tab` cycle focus within the dialog only (a focus trap
over all elements matching
`a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])`, minus
anything under an `[inert]` subtree); focus cannot escape to the underlying page while open.

- A close button `✕` is persistent in the top-right corner in **both** `controls` modes (outside
  the auto-hide region, so it never becomes inert). On open it receives focus, and
  `document.body` scrolling is locked (the scrollbar width is compensated with `padding-right`
  so there's no layout shift).
- On close, focus returns to the element that had focus before the dialog opened (the trigger),
  and body scroll is restored.
- The zoom announcement (`aria-live="polite"`, see below) is a direct child of the dialog root,
  outside the auto-hide region — so zoom stays announced even while the toolbar is hidden, and in
  `controls={false}` mode where keyboard zoom still works.

Clicking the overlay itself — the dialog root or the empty viewport area outside the media, i.e.
outside `.mk-lightbox__media` — also calls `onClose`, unless the pointer gesture that just ended
was a pan drag (a drag ending over the overlay never closes the dialog).

**Command toolbar (`controls={true}`, the default):**

- Auto-hide (`autoHideDelay`, default `3000`ms) never hides the toolbar while focus is inside it:
  focusing any toolbar control pins it visible, and it's released on blur.
- When the toolbar transitions to hidden, it's marked `inert` (removed from both the focus trap and
  the accessibility tree) and `visibility: hidden`; if focus was inside it at that moment (e.g. the
  `c` key pressed while a toolbar button is focused), focus first moves to the always-visible toggle
  button so keyboard navigation never lands on inert content.
- The zoom percentage is announced via a visually-hidden `aria-live="polite"` region, debounced to
  the gesture's final value (not on every wheel/pinch tick), using the `labels.zoomLevel` template.
  It lives outside the auto-hide region (never inert), so it announces in every state. Any keyboard
  interaction also re-shows an idle-hidden toolbar, restoring the visible zoom feedback.
- The visibility toggle button (top-right, next to the persistent close and the `?` help button)
  renders an inline eye icon while the toolbar is visible and an eye-off icon while hidden (plain
  `currentColor` SVGs, no external assets or icon library). It always carries `aria-expanded`
  reflecting the toolbar's current visibility, plus an `aria-label` that switches between
  `labels.hideControls` / `labels.showControls`.
- The fit-cycle button shows a fixed glyph `▣`; its meaning (current fit and next fit) lives in the
  `aria-label` (`labels.fit` template), keeping the UI language-neutral. Every toolbar button and the
  top-right close/toggle/help meet the 44px touch-target minimum.
- Every toolbar button (zoom −/+, reset, fit, fullscreen) plus the persistent close, help `?`, and
  visibility-toggle buttons show a CSS-only tooltip (`data-mk-tooltip`) mirroring their current
  `aria-label`. A `data-mk-tooltip-pos` attribute picks the tooltip's side: `'below'` (default,
  used by the corner buttons) or `'above'` (used by every toolbar button, so the tooltip never
  covers the button it belongs to). On hover, the tooltip fades in after a 600ms delay
  (`transition-delay`); it disappears without delay, and `:focus-visible` shows it immediately too
  — keyboard users never wait. `prefers-reduced-motion` removes the fade's transition duration but
  keeps the delay (it's timing, not motion).

**Keyboard-shortcuts help panel:**

- The corner `?` button (`aria-label`/tooltip `labels.help`, `aria-expanded` reflecting whether the
  panel is open) toggles a `role="group"` panel (`aria-label` from `labels.helpTitle`) listing every
  shortcut; it's rendered regardless of the `controls` prop. Opening it moves focus into the panel;
  closing it (via `?`, `Escape`, or clicking the button again) returns focus to the `?` button.
- With the help panel open, `Escape` closes the panel instead of the dialog (see the `Escape`
  precedence in the [Keyboard map](#keyboard-map)).

## SSR & RSC notes

Both components' source files start with a `'use client'` banner, so the built bundle is a client
boundary. In a Next.js App Router project you can import `CompareSlider` and `MediaLightbox`
directly from Server Components — no wrapper component is required — because the package itself
declares the boundary.

## License

MIT — see [LICENSE](./LICENSE).
