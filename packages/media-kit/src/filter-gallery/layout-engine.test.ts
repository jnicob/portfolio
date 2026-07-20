import { describe, expect, it } from 'vitest';
import {
  columnWidthForWidth,
  columnCountForWidth,
  computeJustifiedLayout,
  computeMasonryLayout,
} from './layout-engine';

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

describe('computeJustifiedLayout', () => {
  it('llena el ancho exacto en cada fila completa', () => {
    const { boxes } = computeJustifiedLayout({
      aspectRatios: [2, 1.2, 1],
      containerWidth: 300,
      targetRowHeight: 100,
      gap: 10,
    });

    expect(boxes[0]?.x).toBe(0);
    expect(boxes[1]?.x).toBeCloseTo((boxes[0]?.width ?? 0) + 10, 5);
    expect((boxes[0]?.width ?? 0) + 10 + (boxes[1]?.width ?? 0)).toBeCloseTo(300, 5);
    expect(boxes[0]?.height).toBeCloseTo(boxes[1]?.height ?? 0, 5);
  });

  it('no estira la última fila incompleta', () => {
    const { boxes } = computeJustifiedLayout({
      aspectRatios: [2, 1.2, 1],
      containerWidth: 300,
      targetRowHeight: 100,
      gap: 10,
    });

    expect(boxes[2]?.height).toBe(100);
    expect(boxes[2]?.width).toBe(100);
  });

  it('apila filas con gap y extraHeight y calcula la altura total', () => {
    const { boxes, totalHeight } = computeJustifiedLayout({
      aspectRatios: [2, 1.2, 1],
      containerWidth: 300,
      targetRowHeight: 100,
      gap: 10,
      extraHeight: 20,
    });

    const row1Height = boxes[0]?.height ?? 0;
    expect(boxes[2]?.y).toBeCloseTo(row1Height + 10, 5);
    expect(totalHeight).toBeCloseTo(row1Height + 10 + (boxes[2]?.height ?? 0), 5);
  });

  it('devuelve un layout vacío para una entrada vacía', () => {
    expect(
      computeJustifiedLayout({
        aspectRatios: [],
        containerWidth: 300,
        targetRowHeight: 100,
        gap: 10,
      }),
    ).toEqual({ boxes: [], totalHeight: 0 });
  });
});

describe('columnCountForWidth', () => {
  it('escala de 2 a 5 columnas según el ancho del contenedor', () => {
    expect(columnCountForWidth(320)).toBe(2);
    expect(columnCountForWidth(559)).toBe(2);
    expect(columnCountForWidth(560)).toBe(3);
    expect(columnCountForWidth(879)).toBe(3);
    expect(columnCountForWidth(880)).toBe(4);
    expect(columnCountForWidth(1199)).toBe(4);
    expect(columnCountForWidth(1200)).toBe(5);
  });

  it('deriva un ancho de tile comparable para todos los layouts', () => {
    expect(columnWidthForWidth(700, 8)).toBe(228);
    expect(columnWidthForWidth(1000, 8)).toBe(244);
  });
});
