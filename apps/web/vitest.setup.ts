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
