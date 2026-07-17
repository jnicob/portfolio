import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Regresión (bug reportado en review manual de showcase, F3.6/A4): compareMode="onion"
// no mezclaba nada visible al mover el slider. Causa raíz: --mk-compare-pos se fija
// inline como un valor <percentage> (p.ej. '50%', ver CompareSlider en
// compare-slider.tsx). `calc(var(--mk-compare-pos) / 100)` divide ese porcentaje entre
// un NÚMERO sin unidad: en aritmética CSS el resultado conserva el tipo porcentaje
// (50% / 100 = 0.5%), así que la opacidad real terminaba en ~0.005 en vez de 0.5 — el
// layer `.mk-compare__after` quedaba casi invisible en todo el rango del slider
// (confirmado en navegador real: computedOpacity 0.005 con --mk-compare-pos: 50%).
// jsdom no resuelve calc() con custom properties vía getComputedStyle (no ejercita
// esta regla), así que el test ancla la fórmula en el texto fuente de la regla:
// dividir entre '100%' (porcentaje ÷ porcentaje = número sin unidad) es lo correcto.
const stylesPath = join(dirname(__filename), 'styles.css');

describe('onion opacity calc (CSS, no ejercitable por jsdom)', () => {
  it('divide la posición (porcentaje) entre un porcentaje, no entre un número sin unidad', () => {
    const css = readFileSync(stylesPath, 'utf-8');
    const match = css.match(
      /\.mk-compare\[data-compare-mode='onion'\] \.mk-compare__after \{[^}]*opacity:\s*calc\(var\(--mk-compare-pos\)\s*\/\s*([^)]+)\)/,
    );
    expect(match).not.toBeNull();
    const divisor = match?.[1]?.trim();
    expect(divisor).toBe('100%');
  });
});
