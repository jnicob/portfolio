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

// jsdom: pointer capture inexistente/inconsistente (ver el mismo stub en
// packages/media-kit/vitest.setup.ts). Necesario desde que el showcase anida
// botones (p.ej. el CTA `expand` de CompareSlider) dentro de un contenedor con
// handlers de puntero: el pointermove que userEvent dispara al mover el cursor
// hacia el botón burbujea hasta ese contenedor y llama a estos métodos.
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;

// jsdom no implementa el constructor PointerEvent (https://github.com/jsdom/jsdom/issues/2527):
// fireEvent.pointerDown/Move cae a `new Event(...)` y descarta clientX/pointerType/button/
// isPrimary/pointerId. Polyfill mínimo sobre MouseEvent (que sí soporta clientX/clientY/button)
// solo para el entorno de test; el navegador real siempre trae su propio PointerEvent. Mismo
// polyfill que `packages/media-kit/vitest.setup.ts` — necesario aquí desde TiltCard, que lee
// `event.clientX/clientY` en su handler de pointermove.
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
