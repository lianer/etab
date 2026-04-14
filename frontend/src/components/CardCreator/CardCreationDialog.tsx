import React, { useState, useEffect } from 'react';
import { useTransition, animated } from 'react-spring';
import { CardState } from '../../types/dashboard';
import styles from './CardCreationDialog.module.css';

interface CardCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (cardType: CardState['cardType'], title: string, customCode?: CardState['customCode']) => void;
}

type TabType = 'preset' | 'custom';

interface PresetCard {
  id: string;
  label: string;
  filename: string;
  image: string;
  author: string;
  addCount: number;
}

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

// 从 cards 目录加载预设卡片列表
const CARD_MANIFEST: PresetCard[] = [
  { id: 'time', label: '时钟', filename: 'time-card.html', image: '/card-icons/time.svg', author: 'eTab', addCount: 1280 },
  { id: 'calendar', label: '日历', filename: 'calendar-card.html', image: '/card-icons/calendar.svg', author: 'eTab', addCount: 960 },
  { id: 'calendar2', label: '日历 2', filename: 'calendar2-card.html', image: '/card-icons/calendar2.svg', author: 'eTab', addCount: 720 },
  { id: 'todo', label: '待办', filename: 'todo-card.html', image: '/card-icons/todo.svg', author: 'eTab', addCount: 1540 },
  { id: 'todo2', label: '待办 2', filename: 'todo2-card.html', image: '/card-icons/todo2.svg', author: 'eTab', addCount: 680 },
  { id: 'weather', label: '天气', filename: 'weather-card.html', image: '/card-icons/weather.svg', author: 'eTab', addCount: 2100 },
  { id: 'banner', label: '轮播图', filename: 'banner-card.html', image: '/card-icons/banner.svg', author: 'eTab', addCount: 450 },
  { id: 'birthday-countdown', label: '生日倒计时', filename: 'birthday-countdown.html', image: '/card-icons/birthday.svg', author: 'eTab', addCount: 830 },
];

const CardCreationDialog: React.FC<CardCreationDialogProps> = ({ open, onClose, onCreate }) => {
  const [tab, setTab] = useState<TabType>('preset');
  const [customCode, setCustomCode] = useState(DEFAULT_HTML);
  const [loading, setLoading] = useState<string | null>(null);

  const transitions = useTransition(open, {
    from: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0)' },
    leave: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
    config: { tension: 300, friction: 26 },
  });

  const handlePresetAdd = async (card: PresetCard) => {
    setLoading(card.id);
    try {
      const response = await fetch(`/cards/${card.filename}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const html = await response.text();
      onCreate('preset', card.label, html);
    } catch {
      console.error(`Failed to load card: ${card.filename}`);
    } finally {
      setLoading(null);
    }
  };

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const formatCount = (count: number): string => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
  };

  return transitions((style, show) =>
    show && (
      <animated.div className={styles.overlay} onClick={onClose} style={{ opacity: style.opacity }}>
        <animated.div className={styles.dialog} onClick={e => e.stopPropagation()} style={{ transform: style.transform }}>
          <div className={styles.header}>
            <h2 className={styles.title}>添加卡片</h2>
            <button className={styles.closeIconBtn} onClick={onClose} aria-label="关闭">
              ✕
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'preset' ? styles.activeTab : ''}`}
              onClick={() => setTab('preset')}
            >
              卡片市场
            </button>
            <button
              className={`${styles.tab} ${tab === 'custom' ? styles.activeTab : ''}`}
              onClick={() => setTab('custom')}
            >
              创建卡片
            </button>
          </div>

          {tab === 'preset' && (
            <div className={styles.presetGrid}>
              {CARD_MANIFEST.map(w => (
                <button
                  key={w.id}
                  className={styles.presetCard}
                  onClick={() => handlePresetAdd(w)}
                  disabled={loading !== null}
                >
                  <div className={styles.cardImage}>
                    <img src={w.image} alt={w.label} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className={styles.cardImageFallback}>{w.label[0]}</div>
                    {loading === w.id && <div className={styles.cardLoading}>…</div>}
                  </div>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardTitle}>{w.label}</span>
                    <span className={styles.cardMeta}>
                      <span className={styles.cardAuthor}>{w.author}</span>
                      <span className={styles.cardCount}>{formatCount(w.addCount)}次添加</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {tab === 'custom' && (
            <div className={styles.customEditor}>
              <textarea
                className={styles.codeArea}
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
                spellCheck={false}
              />
              <button
                className={styles.createCustomBtn}
                onClick={() => onCreate('custom', '自定义卡片', customCode)}
              >
                创建卡片
              </button>
            </div>
          )}
        </animated.div>
      </animated.div>
    )
  );
};

export default CardCreationDialog;
