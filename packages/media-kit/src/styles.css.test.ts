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

// Regresión (design review F3.6/B2+M1): los chips de FilterGallery viven sobre el fondo
// de la página del consumidor, no sobre un medio — a diferencia de la toolbar de
// MediaLightbox o el botón `expand` de CompareSlider, que sí flotan sobre una foto/vídeo.
// Reutilizar --mk-control-bg/--mk-control-color (un overlay oscuro fijo pensado para esos
// controles-sobre-medio) y --mk-handle-color/--mk-handle-icon-color (pensados para
// contrastar con el medio, nunca con la página) rompía el chip activo en tema light: bg
// blanco (--mk-handle-color) sobre página blanca, sin ningún borde que lo separe. Se
// introducen custom properties dedicadas para que el consumidor pueda mapearlas a sus
// propios tokens de tema (ver README) sin heredar el contrato "sobre medio" de los otros
// controles. Cambio aditivo: los defaults reproducen el comportamiento visual anterior.
describe('FilterGallery: chips usan custom properties propias, no las de "control sobre medio" (CSS, no ejercitable por jsdom)', () => {
  const css = readFileSync(stylesPath, 'utf-8');

  it('declara los defaults --mk-filter-* en :root', () => {
    expect(css).toMatch(/--mk-filter-bg:\s*var\(--mk-control-bg\)/);
    expect(css).toMatch(/--mk-filter-color:\s*var\(--mk-control-color\)/);
    expect(css).toMatch(/--mk-filter-hover-bg:\s*rgb\(255 255 255 \/ 0\.12\)/);
    expect(css).toMatch(/--mk-filter-active-bg:\s*var\(--mk-handle-color\)/);
    expect(css).toMatch(/--mk-filter-active-color:\s*var\(--mk-handle-icon-color\)/);
  });

  it('.mk-filter-gallery__filters button ya no usa --mk-control-bg/--mk-control-color', () => {
    const match = css.match(/\.mk-filter-gallery__filters button\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).toMatch(/background:\s*var\(--mk-filter-bg\)/);
    expect(body).toMatch(/color:\s*var\(--mk-filter-color\)/);
    expect(body).toMatch(/font:\s*inherit/);
    expect(body).not.toMatch(/--mk-control-bg/);
    expect(body).not.toMatch(/--mk-control-color/);
  });

  it('el hover de un chip inactivo usa --mk-filter-hover-bg', () => {
    const match = css.match(
      /\.mk-filter-gallery__filters button:hover:not\(\[aria-pressed='true'\]\)\s*\{([^}]*)\}/,
    );
    expect(match).not.toBeNull();
    expect(match?.[1]).toMatch(/background:\s*var\(--mk-filter-hover-bg\)/);
  });

  it('el chip activo usa --mk-filter-active-bg/--mk-filter-active-color, no --mk-handle-*', () => {
    const match = css.match(/\.mk-filter-gallery__filters button\[aria-pressed='true'\]\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).toMatch(/background:\s*var\(--mk-filter-active-bg\)/);
    expect(body).toMatch(/color:\s*var\(--mk-filter-active-color\)/);
  });
});

// Regresión (BUG F1, F3.7, feedback de Nico): el ejemplo de retrato (color/B-N) del
// showcase se veía desfasado al abrirlo en fullscreen. Confirmado en navegador real
// (Playwright, viewport 2200×1200, screen.width×dpr ≥ 2000 para forzar fullSrc):
// antes de este fix, `.mk-compare__before img` medía 1000×562.5px (rect) mientras
// `.mk-compare__after img` medía 2076.4375×1168px — mismo x/y de origen pero cajas
// de tamaño totalmente distinto (el compare quedaba "partido" a la mitad visualmente).
// Causa raíz: `.mk-lightbox[data-fit='contain'] .mk-lightbox__media :is(img, video)`
// (specificity 0,3,1) usaba un combinador DESCENDIENTE que alcanzaba las imágenes del
// compare dos niveles más abajo (`.mk-compare > .mk-compare__before|__after > img`),
// ganándole a la regla propia del compare `.mk-compare__before img, .mk-compare__after
// img { width:100%; height:auto }` (specificity 0,1,1). Cada lado del compare quedaba
// entonces dimensionado de forma INDEPENDIENTE según su propio algoritmo de tamaño por
// defecto: el lado `before` (un <img> de consumidor con `srcSet`/`sizes="1000px"`
// pensado para el layout embebido) usaba ese `sizes` como ancho especificado, mientras
// el lado `after` (un <img> plano que MediaLightbox arma vía `pickFullscreenSrc`, sin
// `sizes`) usaba su tamaño intrínseco (3200×1800) recortado por max-width/max-height —
// dos cajas distintas aunque el aspect ratio de ambos assets (portrait.webp/portrait-hd.webp)
// sea idéntico (16:9). jsdom no resuelve cascada real de `:is()`/combinadores contra
// hojas de estilo reales ni layout (%, vw, dvh), así que el test ancla el mecanismo en
// el texto fuente: el combinador debe ser HIJO DIRECTO (`>`), no descendiente, para que
// esta regla solo alcance el <img>/<video> suelto de los casos `media`/`children` (donde
// SÍ es hijo directo de `.mk-lightbox__media`) y nunca las imágenes anidadas de `compare`.
describe('MediaLightbox data-fit: no dimensiona las imágenes del compare por separado (CSS, no ejercitable por jsdom)', () => {
  const css = readFileSync(stylesPath, 'utf-8');

  it.each(['contain', 'cover', 'actual'] as const)(
    "data-fit='%s' usa combinador de hijo directo (>) entre .mk-lightbox__media y :is(img, video)",
    (fit) => {
      const descendantLeak = new RegExp(
        `\\.mk-lightbox\\[data-fit='${fit}'\\]\\s+\\.mk-lightbox__media\\s+:is\\(img,\\s*video\\)`,
      );
      const directChild = new RegExp(
        `\\.mk-lightbox\\[data-fit='${fit}'\\]\\s+\\.mk-lightbox__media\\s*>\\s*:is\\(img,\\s*video\\)`,
      );
      expect(css).not.toMatch(descendantLeak);
      expect(css).toMatch(directChild);
    },
  );
});
