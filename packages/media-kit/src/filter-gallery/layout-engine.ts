/**
 * Funciones puras de layout: derivan posiciones de aspect ratios conocidos sin
 * medir el DOM. El consumidor conserva el orden DOM y aplica estas cajas solo
 * como posición visual.
 */

export type LayoutBox = { x: number; y: number; width: number; height: number };
export type ComputedLayout = { boxes: readonly LayoutBox[]; totalHeight: number };

/** Ratio inválido (≤0, NaN o Infinity) → 1 (cuadrado). */
function normalizeRatio(ratio: number): number {
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

export function computeMasonryLayout(input: {
  aspectRatios: readonly number[];
  containerWidth: number;
  columns: number;
  gap: number;
  extraHeight?: number;
}): ComputedLayout {
  const { aspectRatios, containerWidth, columns, gap, extraHeight = 0 } = input;
  if (aspectRatios.length === 0 || containerWidth <= 0 || columns <= 0) {
    return { boxes: [], totalHeight: 0 };
  }

  const width = (containerWidth - gap * (columns - 1)) / columns;
  const nextY = Array.from({ length: columns }, () => 0);
  const boxes = aspectRatios.map((ratio) => {
    const column = nextY.indexOf(Math.min(...nextY));
    const height = width / normalizeRatio(ratio) + extraHeight;
    const box = { x: column * (width + gap), y: nextY[column] ?? 0, width, height };
    nextY[column] = box.y + height + gap;
    return box;
  });

  return { boxes, totalHeight: Math.max(...nextY) - gap };
}
