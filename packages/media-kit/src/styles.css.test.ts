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

// Regresión (bug reportado por Nico, F3.6 bloque D): SpotlightReveal "iba muy
// lento" al seguir el puntero. Causa raíz confirmada en navegador real: la
// transición de 160ms vivía en `clip-path`, propiedad que empaqueta posición
// (x/y) Y radio en un único valor — así que cada `pointermove` (solo cambia x/y)
// también quedaba atrapado en la transición, y como pointermove dispara mucho
// más rápido que 160ms, el círculo quedaba persiguiendo al cursor en vez de
// seguirlo 1:1. jsdom no resuelve `@property`/transiciones de custom properties
// vía getComputedStyle (no ejercita esto en tiempo real), así que el test ancla
// el mecanismo en el texto fuente: la transición vive en una custom property
// REGISTRADA (`--mk-spot-active-radius`, animable vía `@property`) declarada en
// `.mk-spotlight` — NUNCA en `clip-path` — para que la posición se aplique
// siempre al instante y solo el radio (aparición/desaparición) anime.
describe('SpotlightReveal: la transición vive en el radio, nunca en clip-path (CSS, no ejercitable por jsdom)', () => {
  const css = readFileSync(stylesPath, 'utf-8');

  it('registra --mk-spot-active-radius como <length> animable', () => {
    const match = css.match(
      /@property --mk-spot-active-radius\s*\{([^}]*)\}/,
    );
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).toMatch(/syntax:\s*'<length>'/);
    expect(body).toMatch(/inherits:\s*true/);
  });

  it('.mk-spotlight transiciona --mk-spot-active-radius, no clip-path', () => {
    const match = css.match(/\.mk-spotlight\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).toMatch(/transition:\s*--mk-spot-active-radius\s+160ms/);
  });

  it('.mk-spotlight__reveal no declara su propia transition (clip-path se recalcula al instante)', () => {
    const match = css.match(/\.mk-spotlight__reveal\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).not.toMatch(/transition/);
    expect(body).toMatch(/clip-path:\s*circle\(var\(--mk-spot-active-radius\) at var\(--mk-spot-x\) var\(--mk-spot-y\)\)/);
  });

  it('ya no existe el selector [data-active] que sobreescribía clip-path (el radio efectivo ahora lo fija JS)', () => {
    expect(css).not.toMatch(/\[data-active\]\s*\.mk-spotlight__reveal/);
  });
});
