import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CardState } from '../../types/dashboard';
import { findGridPosition } from '../../utils/gridUtils';
import CardCreationDialog from './CardCreationDialog';
import styles from './AddCardButton.module.css';

const AddCardButton: React.FC = () => {
  const { state, addCard } = useDashboard();
  const [showDialog, setShowDialog] = useState(false);

  if (!state.editMode) return null;

  const handleCreate = (cardType: CardState['cardType'], title: string, customCode?: CardState['customCode']) => {
    const id = `card-${Date.now()}`;
    const gridWidth = (cardType === 'todo' || cardType === 'preset') ? 3 : 2;
    const gridHeight = (cardType === 'todo' || cardType === 'preset') ? 3 : 2;

    const position = findGridPosition(state.cards, gridWidth, gridHeight);

    if (!position) {
      alert('首页空间不足');
      return;
    }

    const newCard: CardState = {
      id,
      title,
      gridX: position.gridX,
      gridY: position.gridY,
      gridWidth,
      gridHeight,
      cardType,
      cardConfig: cardType === 'clock' ? { is24Hour: true } : {},
      customCode,
      immersiveTitle: true,
    };
    addCard(newCard);
    setShowDialog(false);
  };

  return (
    <>
      <button className={styles.button} onClick={() => setShowDialog(true)} aria-label="添加卡片">
        +
      </button>
      <CardCreationDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onCreate={handleCreate}
      />
    </>
  );
};

export default AddCardButton;
