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

| Prop               | Type                         | Default        | Description                                                                                                                                                                                                                                                      |
| ------------------ | ---------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `before`           | `ReactNode`                  | —              | Original media (typically an `<img>`). Rendered on the left / top.                                                                                                                                                                                               |
| `after`            | `ReactNode`                  | —              | Processed media. Revealed to the right / bottom of the divider.                                                                                                                                                                                                  |
| `label`            | `string`                     | `'Compare'`    | Accessible name of the divider (`role="slider"`).                                                                                                                                                                                                                |
| `initialPosition`  | `number`                     | `50`           | Initial divider position, `0`–`100`. **Uncontrolled**: read once at mount into internal state; changing the prop afterwards does not move the divider.                                                                                                           |
| `orientation`      | `'horizontal' \| 'vertical'` | `'horizontal'` | Drag/keyboard axis. Also toggles cursor (`col-resize`/`row-resize`) and `aria-orientation`.                                                                                                                                                                      |
| `className`        | `string`                     | `undefined`    | Extra class name appended to the root element.                                                                                                                                                                                                                   |
| `onPositionChange` | `(position: number) => void` | `undefined`    | Receives the clamped position (0–100). Pointer dragging produces fractional values; keyboard steps add/subtract whole numbers but preserve any fractional part from a previous drag — only `Home`/`End` guarantee an integer. `aria-valuenow` is always rounded. |

### MediaLightbox

A fullscreen modal for viewing a single piece of media, rendered via a portal into
`document.body`. Implements the
[ARIA dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), including a
focus trap.

| Prop         | Type         | Default   | Description                                                                 |
| ------------ | ------------ | --------- | --------------------------------------------------------------------------- |
| `open`       | `boolean`    | —         | Whether the dialog is rendered. When `false`, the component renders `null`. |
| `onClose`    | `() => void` | —         | Called when the user presses `Escape`, clicks the overlay, or clicks close. |
| `label`      | `string`     | —         | Accessible name of the dialog (`aria-label`).                               |
| `closeLabel` | `string`     | `'Close'` | Accessible name of the close button.                                        |
| `children`   | `ReactNode`  | —         | Fullscreen content: `<img>`, `<video>`, or a composition of either.         |

`open`, `onClose`, `label`, and `children` have no default — they are required props.

## Styling

No CSS-in-JS, no build-time theming step: import `@nicobehm/media-kit/styles.css` once and
override any of the following custom properties on `:root` (or on a wrapping element) to restyle
the components.

| Custom property      | Default            | Controls                                                                                                       |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `--mk-handle-color`  | `#ffffff`          | Background of the CompareSlider divider line, its circular grip indicator, and the MediaLightbox close button. |
| `--mk-handle-size`   | `2.5rem`           | Diameter of the CompareSlider handle's circular grip indicator (the enlarged touch target).                    |
| `--mk-divider-width` | `2px`              | Thickness of the CompareSlider divider line (width when horizontal, height when vertical).                     |
| `--mk-focus-ring`    | `#6d5ce8`          | `focus-visible` outline color for the CompareSlider handle and the MediaLightbox close button/content.         |
| `--mk-overlay-bg`    | `rgb(0 0 0 / 0.8)` | Background of the MediaLightbox overlay.                                                                       |
| `--mk-radius`        | `0.75rem`          | Border radius of the CompareSlider container and of `<img>`/`<video>` elements inside the lightbox.            |
| `--mk-z-lightbox`    | `50`               | `z-index` of the MediaLightbox overlay.                                                                        |

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

**MediaLightbox** implements the ARIA
[dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): the root has
`role="dialog"`, `aria-modal="true"`, and `aria-label` from the `label` prop. Keyboard contract:

- `Escape` calls `onClose`.
- `Tab` / `Shift+Tab` cycle focus within the dialog only (a focus trap over all elements matching
  `a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])`);
  focus cannot escape to the underlying page while open.
- On open, the close button receives focus and `document.body` scrolling is locked.
- On close, focus returns to the element that had focus before the dialog opened (the trigger),
  and body scroll is restored.

Clicking the overlay itself (outside `.mk-lightbox__content`) also calls `onClose`.

## SSR & RSC notes

Both components' source files start with a `'use client'` banner, so the built bundle is a client
boundary. In a Next.js App Router project you can import `CompareSlider` and `MediaLightbox`
directly from Server Components — no wrapper component is required — because the package itself
declares the boundary.

## License

MIT — see [LICENSE](./LICENSE).
