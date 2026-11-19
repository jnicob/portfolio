import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// RTL's own auto-cleanup only registers when it detects a global `afterEach`
// (Jest-style globals). This project runs Vitest without `test.globals: true`
// (explicit imports everywhere), so we wire cleanup manually or the DOM leaks
// between tests within the same file.
afterEach(() => {
  cleanup();
});

// jsdom: missing/inconsistent pointer capture (mirrors packages/media-kit/vitest.setup.ts).
// Required because the showcase nests buttons (e.g. CompareSlider's `expand` CTA) inside a
// container with pointer handlers: the pointermove fired by userEvent bubbles up and invokes
// these methods.
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;

// jsdom does not implement the PointerEvent constructor (https://github.com/jsdom/jsdom/issues/2527):
// fireEvent.pointerDown/Move falls back to `new Event(...)` and drops clientX/pointerType/button/
// isPrimary/pointerId. Minimal polyfill over MouseEvent (which supports clientX/clientY/button)
// for the test environment only; real browsers provide a native PointerEvent. Mirrors
// `packages/media-kit/vitest.setup.ts` — required here by TiltCard, which reads
// `event.clientX/clientY` in its pointermove handler.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent implements PointerEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    altitudeAngle: number;
    azimuthAngle: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? '';
      this.isPrimary = params.isPrimary ?? false;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tangentialPressure = params.tangentialPressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.twist = params.twist ?? 0;
      this.altitudeAngle = params.altitudeAngle ?? 0;
      this.azimuthAngle = params.azimuthAngle ?? 0;
    }

    getCoalescedEvents(): PointerEvent[] {
      return [];
    }

    getPredictedEvents(): PointerEvent[] {
      return [];
    }
  }

  globalThis.PointerEvent = PointerEventPolyfill;
}

// jsdom does not implement the 2D canvas context: each `canvas.getContext('2d')` call
// logs a "not implemented" error via its virtual console and returns undefined. Since
// HeroCanvas defensively checks `if (!ctx) return`, returning null directly silences
// the noise. Tests that need a real context (drawing, animation) override it locally
// with `vi.spyOn` — see `hero-canvas.test.tsx`.
//
// Environment guard rather than feature check: calling the method to inspect it would
// trigger the exact log we want to suppress. The only way jsdom provides a real context
// is via the optional `canvas` package, which this repo does not install (zero extra
// dependencies), so stubbing when `HTMLCanvasElement` exists is safe.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
}
