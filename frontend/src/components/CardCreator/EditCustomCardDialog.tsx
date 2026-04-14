import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CardState } from '../../types/dashboard';
import styles from './CardCreationDialog.module.css';

interface EditCustomCardDialogProps {
  card: CardState;
  onClose: () => void;
}

const CODE_STORAGE_PREFIX = 'etab-card-code-';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; }
  </style>
</head>
<body>
  <div>Hello World</div>
</body>
</html>`;

const EditCustomCardDialog: React.FC<EditCustomCardDialogProps> = ({ card, onClose }) => {
  const { updateCardConfig } = useDashboard();

  // Load code from card.customCode, fallback to localStorage for legacy/temp storage
  const [customCode, setCustomCode] = useState(() => {
    if (card.customCode) {
      return card.customCode;
    }
    try {
      const saved = localStorage.getItem(CODE_STORAGE_PREFIX + card.id);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_HTML;
  });

  const handleSave = () => {
    // Save to localStorage for future editing
    localStorage.setItem(CODE_STORAGE_PREFIX + card.id, customCode);

    // Update card config
    updateCardConfig(card.id, { ...card.cardConfig, customCode });

    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>编辑卡片</h2>

        <textarea
          className={styles.codeArea}
          value={customCode}
          onChange={e => setCustomCode(e.target.value)}
          spellCheck={false}
        />
        <div className={styles.dialogActions}>
          <button className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button className={styles.saveBtn} onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomCardDialog;
