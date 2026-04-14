import React, { useState } from 'react';
import styles from './CalendarCard.module.css';

interface CalendarCardProps {
  cardId: string;
  config: Record<string, unknown>;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarCard: React.FC<CalendarCardProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navButton} onClick={prevMonth} aria-label="上个月">‹</button>
        <span className={styles.monthLabel}>
          {year}年{month + 1}月
        </span>
        <button className={styles.navButton} onClick={nextMonth} aria-label="下个月">›</button>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map(d => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>
      <div className={styles.days}>
        {cells.map((day, i) => (
          <div
            key={i}
            className={`${styles.day} ${day && isToday(day) ? styles.today : ''} ${!day ? styles.empty : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarCard;
