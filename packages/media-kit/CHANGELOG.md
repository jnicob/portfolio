# Changelog

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
