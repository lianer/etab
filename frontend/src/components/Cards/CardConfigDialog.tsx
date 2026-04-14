import React, { useState } from 'react';
import styles from './CardConfig.module.css';

interface CardConfigProps {
  cardType: 'clock' | 'calendar' | 'todo';
  config: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
}

const CardConfigDialog: React.FC<CardConfigProps> = ({ cardType, config, onSave, onClose }) => {
  const [is24Hour, setIs24Hour] = useState(config.is24Hour !== false);

  if (cardType === 'clock') {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.dialog} onClick={e => e.stopPropagation()}>
          <h3 className={styles.title}>时钟设置</h3>
          <label className={styles.option}>
            <input
              type="checkbox"
              checked={is24Hour}
              onChange={e => setIs24Hour(e.target.checked)}
            />
            <span>24小时制</span>
          </label>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose}>取消</button>
            <button className={styles.saveBtn} onClick={() => { onSave({ is24Hour }); onClose(); }}>保存</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CardConfigDialog;
