import { describe, expect, it } from 'vitest';
import { computeMasonryLayout } from './layout-engine';

describe('computeMasonryLayout', () => {
  it('con 1 columna apila en vertical con gap', () => {
    const { boxes, totalHeight } = computeMasonryLayout({
      aspectRatios: [2, 1],
      containerWidth: 200,
      columns: 1,
      gap: 10,
    });

    expect(boxes).toEqual([
      { x: 0, y: 0, width: 200, height: 100 },
      { x: 0, y: 110, width: 200, height: 200 },
    ]);
    expect(totalHeight).toBe(310);
  });

  it('coloca cada ítem en la columna más corta de forma determinista', () => {
    const { boxes } = computeMasonryLayout({
      aspectRatios: [0.5, 1, 1],
      containerWidth: 210,
      columns: 2,
      gap: 10,
    });

    expect(boxes[0]).toEqual({ x: 0, y: 0, width: 100, height: 200 });
    expect(boxes[1]).toEqual({ x: 110, y: 0, width: 100, height: 100 });
    expect(boxes[2]).toEqual({ x: 110, y: 110, width: 100, height: 100 });
  });

  it('suma extraHeight a cada caja', () => {
    const { boxes } = computeMasonryLayout({
      aspectRatios: [1],
      containerWidth: 100,
      columns: 1,
      gap: 0,
      extraHeight: 28,
    });

    expect(boxes[0]?.height).toBe(128);
  });

  it('normaliza ratios inválidos al fallback cuadrado', () => {
    const { boxes } = computeMasonryLayout({
      aspectRatios: [0, Number.NaN, Number.POSITIVE_INFINITY],
      containerWidth: 100,
      columns: 1,
      gap: 0,
    });

    for (const box of boxes) expect(box.height).toBe(100);
  });

  it('devuelve un layout vacío para ítems vacíos o ancho no positivo', () => {
    expect(
      computeMasonryLayout({ aspectRatios: [], containerWidth: 500, columns: 3, gap: 8 }),
    ).toEqual({ boxes: [], totalHeight: 0 });
    expect(
      computeMasonryLayout({ aspectRatios: [1], containerWidth: 0, columns: 3, gap: 8 }),
    ).toEqual({ boxes: [], totalHeight: 0 });
  });
});
