import {
  pixelToGrid,
  gridToPixel,
  gridCellsToPixels,
  snapToGrid,
  isWithinBounds,
  clampToGrid,
  cardsOverlap,
  findGridPosition,
  GRID_UNIT,
  GRID_COLS,
  GRID_MAX_ROWS,
} from '../utils/gridUtils';

describe('gridUtils', () => {
  describe('pixelToGrid', () => {
    it('converts pixel position to grid coordinates', () => {
      expect(pixelToGrid(0, 0)).toEqual({ col: 0, row: 0 });
      expect(pixelToGrid(120, 0)).toEqual({ col: 1, row: 0 });
      expect(pixelToGrid(0, 120)).toEqual({ col: 0, row: 1 });
      expect(pixelToGrid(240, 240)).toEqual({ col: 2, row: 2 });
    });

    it('floors partial cell positions', () => {
      expect(pixelToGrid(60, 60)).toEqual({ col: 0, row: 0 });
      expect(pixelToGrid(119, 119)).toEqual({ col: 0, row: 0 });
    });
  });

  describe('gridToPixel', () => {
    it('converts grid coordinates to pixel position', () => {
      expect(gridToPixel(0, 0)).toEqual({ x: 0, y: 0 });
      expect(gridToPixel(1, 0)).toEqual({ x: 120, y: 0 });
      expect(gridToPixel(0, 1)).toEqual({ x: 0, y: 120 });
    });
  });

  describe('gridCellsToPixels', () => {
    it('calculates pixel dimensions from grid cells', () => {
      // 2×3 grid card: (2×100) + (1×20) = 220, (3×100) + (2×20) = 340
      expect(gridCellsToPixels(2, 3)).toEqual({ width: 220, height: 340 });
      expect(gridCellsToPixels(1, 1)).toEqual({ width: 100, height: 100 });
    });
  });

  describe('snapToGrid', () => {
    it('snaps pixel position to nearest grid boundary', () => {
      const result = snapToGrid(60, 60);
      expect(result.col).toBe(1);
      expect(result.row).toBe(1);
      expect(result.x).toBe(GRID_UNIT);
      expect(result.y).toBe(GRID_UNIT);
    });

    it('snaps to 0,0 for small offsets', () => {
      const result = snapToGrid(50, 50);
      expect(result.col).toBe(0);
      expect(result.row).toBe(0);
    });
  });

  describe('isWithinBounds', () => {
    it('returns true for valid positions', () => {
      expect(isWithinBounds(0, 0, 2, 2)).toBe(true);
    });

    it('returns false for out-of-bounds positions', () => {
      expect(isWithinBounds(-1, 0, 2, 2)).toBe(false);
      expect(isWithinBounds(GRID_COLS - 1, 0, 2, 2)).toBe(false);
    });
  });

  describe('clampToGrid', () => {
    it('clamps position within grid boundaries', () => {
      expect(clampToGrid(-1, -1, 2, 2)).toEqual({ col: 0, row: 0 });
      expect(clampToGrid(GRID_COLS, GRID_MAX_ROWS, 2, 2)).toEqual({
        col: GRID_COLS - 2,
        row: GRID_MAX_ROWS - 2,
      });
    });

    it('respects a dynamic row limit during drag', () => {
      expect(clampToGrid(GRID_COLS, GRID_MAX_ROWS + 5, 2, 2, GRID_MAX_ROWS + 10)).toEqual({
        col: GRID_COLS - 2,
        row: GRID_MAX_ROWS + 5,
      });
    });
  });

  describe('cardsOverlap', () => {
    it('detects overlapping cards', () => {
      const a = { gridX: 0, gridY: 0, gridWidth: 2, gridHeight: 2 };
      const b = { gridX: 1, gridY: 1, gridWidth: 2, gridHeight: 2 };
      expect(cardsOverlap(a, b)).toBe(true);
    });

    it('returns false for non-overlapping cards', () => {
      const a = { gridX: 0, gridY: 0, gridWidth: 2, gridHeight: 2 };
      const b = { gridX: 2, gridY: 2, gridWidth: 2, gridHeight: 2 };
      expect(cardsOverlap(a, b)).toBe(false);
    });
  });

  describe('findGridPosition', () => {
    it('finds first available position in empty grid', () => {
      expect(findGridPosition([], 2, 2)).toEqual({ gridX: 0, gridY: 0 });
    });

    it('finds position after existing card', () => {
      const cards = [{ gridX: 0, gridY: 0, gridWidth: GRID_COLS, gridHeight: 1 }];
      expect(findGridPosition(cards, 2, 2)).toEqual({ gridX: 0, gridY: 1 });
    });

    it('returns null when no space available', () => {
      const cards = [{ gridX: 0, gridY: 0, gridWidth: GRID_COLS, gridHeight: GRID_MAX_ROWS }];
      expect(findGridPosition(cards, 1, 1)).toBeNull();
    });
  });
});
