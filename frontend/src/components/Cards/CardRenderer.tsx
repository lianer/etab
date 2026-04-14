import React from 'react';
import { CardState } from '../../types/dashboard';
import ClockCard from './ClockCard';
import CalendarCard from './CalendarCard';
import TodoCard from './TodoCard';
import IframeSandbox from '../IframeSandbox/IframeSandbox';

interface CardRendererProps {
  card: CardState;
}

const CardRenderer: React.FC<CardRendererProps> = ({ card }) => {
  switch (card.cardType) {
    case 'clock':
      return <ClockCard cardId={card.id} config={card.cardConfig} />;
    case 'calendar':
      return <CalendarCard cardId={card.id} config={card.cardConfig} />;
    case 'todo':
      return <TodoCard cardId={card.id} config={card.cardConfig} />;
    case 'custom':
    case 'preset':
      return <IframeSandbox card={card} />;
    default:
      return <div>未知卡片类型</div>;
  }
};

export default CardRenderer;
