import React, { useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { GRID_COLS, GRID_MAX_ROWS, GRID_TOTAL_WIDTH, GRID_MAX_HEIGHT, GRID_UNIT, gridCellsToPixels } from '../../utils/gridUtils';
import styles from './GridBackground.module.css';

const GridBackground: React.FC = () => {
  const { state } = useDashboard();

  // 动态计算网格高度
  const gridHeight = useMemo(() => {
    if (state.cards.length === 0) return GRID_MAX_HEIGHT;
    const maxBottom = state.cards.reduce((max, card) => {
      const bottom = gridCellsToPixels(card.gridWidth, card.gridY + card.gridHeight).height;
      return Math.max(max, bottom);
    }, 0);
    return Math.max(maxBottom + GRID_UNIT, window.innerHeight);
  }, [state.cards]);

  const showLines = state.isDragging;

  // 竖线：GRID_COLS + 1 条
  const verticalLines = useMemo(() =>
    Array.from({ length: GRID_COLS + 1 }, (_, i) => i),
    []
  );

  // 横线：根据动态高度计算
  const rowCount = useMemo(() => Math.ceil(gridHeight / GRID_UNIT), [gridHeight]);
  const horizontalLines = useMemo(() =>
    Array.from({ length: rowCount + 1 }, (_, i) => i),
    [rowCount]
  );

  return (
    <div
      className={`${styles.gridBackground} ${showLines ? styles.visible : ''}`}
      style={{
        width: GRID_TOTAL_WIDTH,
        height: Math.min(gridHeight, GRID_MAX_HEIGHT),
      }}
    >
      {verticalLines.map(i => (
        <div
          key={`v-${i}`}
          className={styles.gridLineVertical}
          style={{ left: i * GRID_UNIT }}
        />
      ))}
      {horizontalLines.map(i => (
        <div
          key={`h-${i}`}
          className={styles.gridLineHorizontal}
          style={{ top: i * GRID_UNIT }}
        />
      ))}
    </div>
  );
};

export default GridBackground;
