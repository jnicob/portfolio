/**
 * Pure layout functions: derive positions from known aspect ratios without
 * measuring the DOM. The consumer preserves DOM order and applies these boxes only
 * as visual positioning.
 */

export type LayoutBox = { x: number; y: number; width: number; height: number };
export type ComputedLayout = { boxes: readonly LayoutBox[]; totalHeight: number };

/** Invalid ratio (≤0, NaN, or Infinity) → 1 (square). */
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

/**
 * Greedily groups to target height; full rows fill the exact
 * width and the last incomplete row preserves the target height.
 */
export function computeJustifiedLayout(input: {
  aspectRatios: readonly number[];
  containerWidth: number;
  targetRowHeight: number;
  gap: number;
  extraHeight?: number;
}): ComputedLayout {
  const { aspectRatios, containerWidth, targetRowHeight, gap, extraHeight = 0 } = input;
  if (aspectRatios.length === 0 || containerWidth <= 0) {
    return { boxes: [], totalHeight: 0 };
  }

  const ratios = aspectRatios.map(normalizeRatio);
  const rows: number[][] = [];
  let current: number[] = [];
  let widthAtTarget = 0;
  ratios.forEach((ratio, index) => {
    current.push(index);
    widthAtTarget += targetRowHeight * ratio;
    if (widthAtTarget + gap * (current.length - 1) >= containerWidth) {
      rows.push(current);
      current = [];
      widthAtTarget = 0;
    }
  });

  const lastIsPartial = current.length > 0;
  if (lastIsPartial) rows.push(current);

  const boxes: LayoutBox[] = [];
  let y = 0;
  rows.forEach((row, rowIndex) => {
    const gaps = gap * (row.length - 1);
    const rowRatioSum = row.reduce((sum, index) => sum + (ratios[index] ?? 1), 0);
    const isLast = rowIndex === rows.length - 1 && lastIsPartial;
    const mediaHeight = isLast ? targetRowHeight : (containerWidth - gaps) / rowRatioSum;
    let x = 0;

    for (const index of row) {
      const width = mediaHeight * (ratios[index] ?? 1);
      boxes[index] = { x, y, width, height: mediaHeight + extraHeight };
      x += width + gap;
    }
    y += mediaHeight + extraHeight + gap;
  });

  return { boxes, totalHeight: y - gap };
}

export const MASONRY_COLUMN_THRESHOLDS = [
  { minWidth: 1200, columns: 5 },
  { minWidth: 880, columns: 4 },
  { minWidth: 560, columns: 3 },
] as const;

export function columnCountForWidth(containerWidth: number): number {
  for (const { minWidth, columns } of MASONRY_COLUMN_THRESHOLDS) {
    if (containerWidth >= minWidth) return columns;
  }
  return 2;
}

/** Common tile width for the active breakpoint, excluding gaps. */
export function columnWidthForWidth(containerWidth: number, gap: number): number {
  const columns = columnCountForWidth(containerWidth);
  return (containerWidth - gap * (columns - 1)) / columns;
}
