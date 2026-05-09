/** Grid configuration constants */
export const GRID_CELL_SIZE = 80;
export const GRID_GAP = 20;
export const GRID_UNIT = GRID_CELL_SIZE + GRID_GAP; // 100px
export const GRID_COLS = 12;
export const GRID_MAX_ROWS = 24;
export const GRID_DRAG_EXTENSION_ROWS = 10;
export const GRID_TOTAL_WIDTH = GRID_COLS * GRID_UNIT - GRID_GAP; // 1180px
export const GRID_MAX_HEIGHT = GRID_MAX_ROWS * GRID_UNIT - GRID_GAP; // 2380px

/**
 * Convert pixel position to grid coordinates
 */
export function pixelToGrid(x: number, y: number): { col: number; row: number } {
  return {
    col: Math.floor(x / GRID_UNIT),
    row: Math.floor(y / GRID_UNIT),
  };
}

/**
 * Convert grid coordinates to pixel position
 */
export function gridToPixel(col: number, row: number): { x: number; y: number } {
  return {
    x: col * GRID_UNIT,
    y: row * GRID_UNIT,
  };
}

/**
 * Calculate card pixel dimensions from grid cells
 * width = (cellsX × 100) + ((cellsX - 1) × 20)
 */
export function gridCellsToPixels(cellsX: number, cellsY: number): { width: number; height: number } {
  return {
    width: cellsX * GRID_CELL_SIZE + (cellsX - 1) * GRID_GAP,
    height: cellsY * GRID_CELL_SIZE + (cellsY - 1) * GRID_GAP,
  };
}

export function getGridMaxRows(isDragging: boolean): number {
  return GRID_MAX_ROWS + (isDragging ? GRID_DRAG_EXTENSION_ROWS : 0);
}

export function getGridMaxHeight(isDragging: boolean): number {
  return getGridMaxRows(isDragging) * GRID_UNIT - GRID_GAP;
}

export function getGridHeight(
  cards: { gridWidth: number; gridY: number; gridHeight: number }[],
  isDragging: boolean,
  viewportHeight: number = typeof window !== 'undefined' ? window.innerHeight : GRID_MAX_HEIGHT,
): number {
  if (cards.length === 0) {
    const baseHeight = Math.max(viewportHeight, GRID_UNIT);
    const requestedHeight = isDragging ? baseHeight + GRID_DRAG_EXTENSION_ROWS * GRID_UNIT : baseHeight;
    return requestedHeight;
  }

  const maxBottom = cards.reduce((max, card) => {
    const bottom = gridCellsToPixels(card.gridWidth, card.gridY + card.gridHeight).height;
    return Math.max(max, bottom);
  }, 0);

  const baseHeight = Math.max(maxBottom + GRID_UNIT, viewportHeight);
  const requestedHeight = isDragging ? Math.max(baseHeight, viewportHeight + GRID_DRAG_EXTENSION_ROWS * GRID_UNIT) : baseHeight;
  return requestedHeight;
}

/**
 * Snap pixel position to nearest grid boundary
 */
export function snapToGrid(x: number, y: number): { col: number; row: number; x: number; y: number } {
  const col = Math.round(x / GRID_UNIT);
  const row = Math.round(y / GRID_UNIT);
  return { col, row, x: col * GRID_UNIT, y: row * GRID_UNIT };
}

/**
 * Check if a card position is within grid boundaries
 */
export function isWithinBounds(
  col: number,
  row: number,
  widthCells: number,
  heightCells: number,
): boolean {
  return col >= 0 && row >= 0 && col + widthCells <= GRID_COLS && row + heightCells <= GRID_MAX_ROWS;
}

/**
 * Clamp position within grid boundaries
 */
export function clampToGrid(
  col: number,
  row: number,
  widthCells: number,
  heightCells: number,
  maxRows: number = GRID_MAX_ROWS,
): { col: number; row: number } {
  return {
    col: Math.max(0, Math.min(col, GRID_COLS - widthCells)),
    row: Math.max(0, Math.min(row, maxRows - heightCells)),
  };
}

/**
 * Check if two cards overlap
 */
export function cardsOverlap(
  a: { gridX: number; gridY: number; gridWidth: number; gridHeight: number },
  b: { gridX: number; gridY: number; gridWidth: number; gridHeight: number }
): boolean {
  return !(
    a.gridX + a.gridWidth <= b.gridX ||
    b.gridX + b.gridWidth <= a.gridX ||
    a.gridY + a.gridHeight <= b.gridY ||
    b.gridY + b.gridHeight <= a.gridY
  );
}

/**
 * Find a non-overlapping grid position for a new card.
 * Searches top-to-bottom, left-to-right.
 * Returns {gridX, gridY} or null if no space available.
 */
export function findGridPosition(
  cards: { gridX: number; gridY: number; gridWidth: number; gridHeight: number }[],
  gridWidth: number,
  gridHeight: number,
): { gridX: number; gridY: number } | null {
  for (let row = 0; row <= GRID_MAX_ROWS - gridHeight; row++) {
    for (let col = 0; col <= GRID_COLS - gridWidth; col++) {
      const wouldOverlap = cards.some(existingCard =>
        cardsOverlap(
          { gridX: col, gridY: row, gridWidth, gridHeight },
          existingCard
        )
      );

      if (!wouldOverlap) {
        return { gridX: col, gridY: row };
      }
    }
  }
  return null;
}
