import React, { useRef, useMemo } from 'react';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import GridBackground from '../Grid/GridBackground';
import Card from '../Card/Card';
import AddCardButton from '../CardCreator/AddCardButton';
import { gridCellsToPixels, GRID_TOTAL_WIDTH, GRID_UNIT, GRID_MAX_HEIGHT } from '../../utils/gridUtils';
import styles from './Dashboard.module.css';

const DashboardInner: React.FC = () => {
  const { state } = useDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // 动态计算 gridArea 高度：取卡片最大底边，最小 100vh，最大 GRID_MAX_HEIGHT
  const gridHeight = useMemo(() => {
    if (state.cards.length === 0) return '100vh';
    const maxBottom = state.cards.reduce((max, card) => {
      const bottom = gridCellsToPixels(card.gridWidth, card.gridY + card.gridHeight).height;
      return Math.max(max, bottom);
    }, 0);
    const height = Math.max(maxBottom + GRID_UNIT, window.innerHeight);
    const clamped = Math.min(height, GRID_MAX_HEIGHT);
    return `${clamped}px`;
  }, [state.cards]);

  return (
    <div className={styles.dashboard} ref={dashboardRef}>
      <div
        className={styles.gridArea}
        style={{ width: GRID_TOTAL_WIDTH, height: gridHeight }}
      >
        <GridBackground />
        <Card dashboardRef={dashboardRef} />
      </div>
      <AddCardButton />
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
};

export default Dashboard;
