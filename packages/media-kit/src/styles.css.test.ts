import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Regression (bug reported in showcase manual review, F3.6/A4): compareMode="onion"
// was not blending anything visible when moving the slider. Root cause: --mk-compare-pos is set
// inline como un valor <percentage> (p.ej. '50%', ver CompareSlider en
// compare-slider.tsx). `calc(var(--mk-compare-pos) / 100)` divide ese porcentaje entre
// to a unitless NUMBER: in CSS arithmetic the result retains the percentage type
// (50% / 100 = 0.5%), so the actual opacity ended up at ~0.005 instead of 0.5 —
// layer `.mk-compare__after` quedaba casi invisible en todo el rango del slider
// (confirmado en navegador real: computedOpacity 0.005 con --mk-compare-pos: 50%).
// jsdom does not resolve calc() with custom properties via getComputedStyle (does not exercise
// this rule), so the test anchors the formula to the rule's source text:
// dividing by '100%' (percentage ÷ percentage = unitless number) is correct.
const stylesPath = join(dirname(__filename), 'styles.css');

describe('onion opacity calc (CSS, no ejercitable por jsdom)', () => {
  it('divides position (percentage) by a percentage, not by a unitless number', () => {
    const css = readFileSync(stylesPath, 'utf-8');
    const match = css.match(
      /\.mk-compare\[data-compare-mode='onion'\] \.mk-compare__after \{[^}]*opacity:\s*calc\(var\(--mk-compare-pos\)\s*\/\s*([^)]+)\)/,
    );
    expect(match).not.toBeNull();
    const divisor = match?.[1]?.trim();
    expect(divisor).toBe('100%');
  });
});

// Regression (bug reported by Nico, F3.6 block D): SpotlightReveal "was very
// slow" when following the pointer. Confirmed root cause in a real browser: the
// 160ms transition lived on `clip-path`, a property that bundles position
// (x/y) AND radius into a single value — so each `pointermove` (only changes x/y)
// was also caught in the transition, and since pointermove fires much
// faster than 160ms, the circle ended up chasing the cursor instead of
// seguirlo 1:1. jsdom no resuelve `@property`/transiciones de custom properties
// via getComputedStyle (does not exercise this in real time), so the test anchors
// the mechanism in the source text: the transition lives on a custom property
// REGISTERED (`--mk-spot-active-radius`, animatable via `@property`) declared on
// `.mk-spotlight` — NEVER on `clip-path` — so that the position is applied
// always instantly and only the radius (appearance/disappearance) animates.
describe('SpotlightReveal: la transición vive en el radio, nunca en clip-path (CSS, no ejercitable por jsdom)', () => {
  const css = readFileSync(stylesPath, 'utf-8');

  it('registra --mk-spot-active-radius como <length> animable', () => {
    const match = css.match(/@property --mk-spot-active-radius\s*\{([^}]*)\}/);
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
    expect(body).toMatch(
      /clip-path:\s*circle\(var\(--mk-spot-active-radius\) at var\(--mk-spot-x\) var\(--mk-spot-y\)\)/,
    );
  });

  it('[data-active] selector that overrode clip-path no longer exists (effective radius is now set by JS)', () => {
    expect(css).not.toMatch(/\[data-active\]\s*\.mk-spotlight__reveal/);
  });
});

// Regression (design review F3.6/B2+M1): FilterGallery chips live on the background
// of the consumer page, not over media — unlike the MediaLightbox toolbar
// or the CompareSlider `expand` button, which do float over a photo/video.
// Reutilizar --mk-control-bg/--mk-control-color (un overlay oscuro fijo pensado para esos
// controles-sobre-medio) y --mk-handle-color/--mk-handle-icon-color (pensados para
// contrast with the media, never with the page) broke the active chip in light theme: bg
// white (--mk-handle-color) on a white page, with no border separating it. It
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
    expect(body).toMatch(/border:\s*1px solid currentColor/);
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
    const match = css.match(
      /\.mk-filter-gallery__filters button\[aria-pressed='true'\]\s*\{([^}]*)\}/,
    );
    expect(match).not.toBeNull();
    const body = match?.[1] ?? '';
    expect(body).toMatch(/background:\s*var\(--mk-filter-active-bg\)/);
    expect(body).toMatch(/color:\s*var\(--mk-filter-active-color\)/);
  });

  it('el chip activo declara su border-color en vez de heredar el currentColor del chip base', () => {
    const match = css.match(
      /\.mk-filter-gallery__filters button\[aria-pressed='true'\]\s*\{([^}]*)\}/,
    );
    expect(match).not.toBeNull();
    expect(match?.[1]).toMatch(/border-color:\s*var\(--mk-filter-active-color\)/);
  });
});

// Regression (BUG F1, F3.7, Nico's feedback): the portrait example (color/B-W) of the
// showcase looked misaligned when opened in fullscreen. Confirmed in a real browser
// (Playwright, viewport 2200×1200, screen.width×dpr ≥ 2000 para forzar fullSrc):
// before this fix, `.mk-compare__before img` measured 1000×562.5px (rect) while
// `.mk-compare__after img` measured 2076.4375×1168px — same origin x/y but boxes
// of completely different sizes (the compare ended up visually "split" in half).
// Root cause: `.mk-lightbox[data-fit='contain'] .mk-lightbox__media :is(img, video)`
// (specificity 0,3,1) used a DESCENDANT combinator that reached the images of the
// compare two levels down (`.mk-compare > .mk-compare__before|__after > img`),
// overriding the compare's own rule `.mk-compare__before img, .mk-compare__after
// img { width:100%; height:auto }` (specificity 0,1,1). Cada lado del compare quedaba
// then sized INDEPENDENTLY according to its own sizing algorithm by
// defecto: el lado `before` (un <img> de consumidor con `srcSet`/`sizes="1000px"`
// pensado para el layout embebido) usaba ese `sizes` como ancho especificado, mientras
// the `after` side (a plain <img> that MediaLightbox builds via `pickFullscreenSrc`, without
// `sizes`) used its intrinsic size (3200×1800) clipped by max-width/max-height —
// dos cajas distintas aunque el aspect ratio de ambos assets (portrait.webp/portrait-hd.webp)
// is identical (16:9). jsdom does not resolve real cascade of `:is()`/combinators against
// real stylesheets or layout (%, vw, dvh), so the test anchors the mechanism in
// el texto fuente: el combinador debe ser HIJO DIRECTO (`>`), no descendiente, para que
// esta regla solo alcance el <img>/<video> suelto de los casos `media`/`children` (donde
// IS a direct child of `.mk-lightbox__media`) and never the nested images of `compare`.
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
