import React, { useState, useEffect } from 'react';
import styles from './ClockCard.module.css';

interface ClockCardProps {
  cardId: string;
  config: Record<string, unknown>;
}

const ClockCard: React.FC<ClockCardProps> = ({ cardId, config }) => {
  const is24Hour = config.is24Hour !== false;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    if (is24Hour) {
      return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return date.toLocaleTimeString('zh-CN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  return (
    <div className={styles.clock}>
      <div className={styles.time}>{formatTime(time)}</div>
      <div className={styles.date}>{formatDate(time)}</div>
    </div>
  );
};

export default ClockCard;
