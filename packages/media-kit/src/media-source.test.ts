import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FULL_SRC_MIN_EFFECTIVE_WIDTH,
  isMediaSource,
  pickFullscreenSrc,
  preloadFullSources,
  shouldUseFullSrc,
  type MediaSource,
} from './media-source';

function stubScreen(width: number, devicePixelRatio: number) {
  vi.stubGlobal('screen', { width });
  vi.stubGlobal('devicePixelRatio', devicePixelRatio);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isMediaSource', () => {
  it('reconoce un MediaSource válido (con y sin fullSrc)', () => {
    expect(isMediaSource({ src: '/a.png', alt: 'A' })).toBe(true);
    expect(isMediaSource({ src: '/a.png', fullSrc: '/a-full.png', alt: 'A' })).toBe(true);
  });

  it('rechaza valores que no son MediaSource', () => {
    expect(isMediaSource(null)).toBe(false);
    expect(isMediaSource(undefined)).toBe(false);
    expect(isMediaSource('string')).toBe(false);
    expect(isMediaSource(42)).toBe(false);
    expect(isMediaSource({})).toBe(false);
    expect(isMediaSource({ src: '/a.png' })).toBe(false); // falta alt
    expect(isMediaSource({ alt: 'A' })).toBe(false); // falta src
    expect(isMediaSource({ src: 1, alt: 'A' })).toBe(false); // src no string
    expect(isMediaSource({ src: '/a.png', alt: 'A', fullSrc: 1 })).toBe(false); // fullSrc no string
  });

  it('no confunde un ReactNode (string/número) con un MediaSource', () => {
    expect(isMediaSource('/a.png')).toBe(false);
  });
});

describe('FULL_SRC_MIN_EFFECTIVE_WIDTH', () => {
  it('es 2000', () => {
    expect(FULL_SRC_MIN_EFFECTIVE_WIDTH).toBe(2000);
  });
});

describe('shouldUseFullSrc', () => {
  it.each([
    [390, 3, false],
    [1024, 2, true],
    [1920, 1, false],
    [2560, 1, true],
    [1440, 2, true],
  ])('shouldUseFullSrc(%d, %d) -> %s', (screenWidth, dpr, expected) => {
    expect(shouldUseFullSrc(screenWidth, dpr)).toBe(expected);
  });
});

describe('pickFullscreenSrc', () => {
  const source: MediaSource = { src: '/a.png', fullSrc: '/a-full.png', alt: 'A' };

  it('sin fullSrc devuelve src', () => {
    stubScreen(2560, 1);
    expect(pickFullscreenSrc({ src: '/a.png', alt: 'A' })).toBe('/a.png');
  });

  it('con fullSrc y pantalla grande devuelve fullSrc', () => {
    stubScreen(2560, 1);
    expect(pickFullscreenSrc(source)).toBe('/a-full.png');
  });

  it('con fullSrc y pantalla chica (móvil) devuelve src', () => {
    stubScreen(390, 3);
    expect(pickFullscreenSrc(source)).toBe('/a.png');
  });
});

describe('preloadFullSources', () => {
  it('precarga solo los fullSrc que la pantalla justifica, y no repite URLs ya precargadas', () => {
    stubScreen(2560, 1);
    const calls: string[] = [];
    class FakeImage {
      set src(value: string) {
        calls.push(value);
      }
    }
    vi.stubGlobal('Image', FakeImage);

    const sources: MediaSource[] = [
      { src: '/a.png', fullSrc: '/a-full-unique-1.png', alt: 'A' },
      { src: '/b.png', alt: 'B' }, // sin fullSrc: no precarga nada
      { src: '/c.png', fullSrc: '/c-full-unique-1.png', alt: 'C' },
    ];
    preloadFullSources(sources);
    expect(calls).toEqual(['/a-full-unique-1.png', '/c-full-unique-1.png']);

    // Repetir la misma llamada no debe volver a pedir las mismas URLs.
    preloadFullSources(sources);
    expect(calls).toEqual(['/a-full-unique-1.png', '/c-full-unique-1.png']);
  });

  it('en pantalla chica no precarga ningún fullSrc', () => {
    stubScreen(390, 3);
    const calls: string[] = [];
    class FakeImage {
      set src(value: string) {
        calls.push(value);
      }
    }
    vi.stubGlobal('Image', FakeImage);

    preloadFullSources([{ src: '/x.png', fullSrc: '/x-full-unique-2.png', alt: 'X' }]);
    expect(calls).toEqual([]);
  });
});
