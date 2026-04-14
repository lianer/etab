import React, { useState, useEffect } from 'react';
import styles from './TodoCard.module.css';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface TodoCardProps {
  cardId: string;
  config: Record<string, unknown>;
}

const STORAGE_PREFIX = 'etab-todo-';

const TodoCard: React.FC<TodoCardProps> = ({ cardId }) => {
  const [items, setItems] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + cardId);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + cardId, JSON.stringify(items));
  }, [items, cardId]);

  const addItem = () => {
    const text = input.trim();
    if (!text) return;
    setItems(prev => [...prev, { id: Date.now().toString(), text, done: false }]);
    setInput('');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem();
  };

  return (
    <div className={styles.todo}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加待办..."
        />
        <button className={styles.addBtn} onClick={addItem} aria-label="添加">+</button>
      </div>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={`${styles.item} ${item.done ? styles.done : ''}`}>
            <button className={styles.checkBtn} onClick={() => toggleItem(item.id)} aria-label="切换完成">
              {item.done ? '✓' : '○'}
            </button>
            <span className={styles.text}>{item.text}</span>
            <button className={styles.delBtn} onClick={() => removeItem(item.id)} aria-label="删除">×</button>
          </li>
        ))}
        {items.length === 0 && <li className={styles.empty}>暂无待办事项</li>}
      </ul>
    </div>
  );
};

export default TodoCard;
