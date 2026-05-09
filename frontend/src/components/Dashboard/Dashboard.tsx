import React, { useRef, useMemo } from 'react';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import GridBackground from '../Grid/GridBackground';
import Card from '../Card/Card';
import AddCardButton from '../CardCreator/AddCardButton';
import { GRID_TOTAL_WIDTH, getGridHeight } from '../../utils/gridUtils';
import styles from './Dashboard.module.css';

const DashboardInner: React.FC = () => {
  const { state } = useDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // 动态计算 gridArea 高度：取卡片最大底边，最小 100vh，拖拽时额外扩展 10 行
  const gridHeight = useMemo(() => {
    if (state.cards.length === 0 && !state.isDragging) return '100vh';
    const height = getGridHeight(state.cards, state.isDragging);
    return `${height}px`;
  }, [state.cards, state.isDragging]);

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
