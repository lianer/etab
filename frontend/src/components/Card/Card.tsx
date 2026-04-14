import React, { useState, useCallback, useRef, useEffect } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { useDashboard } from '../../context/DashboardContext';
import { CardState } from '../../types/dashboard';
import {
  gridToPixel,
  gridCellsToPixels,
  snapToGrid,
  clampToGrid,
  cardsOverlap,
  isWithinBounds,
  GRID_UNIT,
  GRID_GAP,
  GRID_COLS,
  GRID_MAX_ROWS,
} from '../../utils/gridUtils';
import CardRenderer from '../Cards/CardRenderer';
import EditCustomCardDialog from '../CardCreator/EditCustomCardDialog';
import styles from './Card.module.css';

const AUTO_SCROLL_ZONE = 80; // px from viewport bottom edge
const AUTO_SCROLL_SPEED = 3; // px per frame

interface CardProps {
  card: CardState;
  dashboardRef: React.RefObject<HTMLDivElement | null>;
}

const Card: React.FC<CardProps> = ({ card, dashboardRef }) => {
  const { state, updateCardPosition, updateCardSize, setDragging, removeCard, toggleImmersiveTitle } =
    useDashboard();
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [cancelDrag, setCancelDrag] = useState(false);
  const [resizeSize, setResizeSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [snapAnimating, setSnapAnimating] = useState(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const autoScrollRafRef = useRef<number | null>(null);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  const pixelPos = gridToPixel(card.gridX, card.gridY);
  const pixelSize = gridCellsToPixels(card.gridWidth, card.gridHeight);

  // Current display size: use resizeSize during resize, otherwise grid-based size
  const displaySize = isResizing && resizeSize ? resizeSize : pixelSize;

  useEffect(() => {
    setDragPos({ x: pixelPos.x, y: pixelPos.y });
  }, [card.gridX, card.gridY]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerSnapAnimation = useCallback(() => {
    setSnapAnimating(true);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => setSnapAnimating(false), 250);
  }, []);

  const cancelSnapAnimation = useCallback(() => {
    setSnapAnimating(false);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
    };
  }, []);

  // Auto-scroll when dragging near bottom edge
  const startAutoScroll = useCallback((mouseY: number) => {
    if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);

    const tick = () => {
      const container = dashboardRef.current;
      if (!container) return;

      const viewportBottom = window.innerHeight;
      const distanceFromBottom = viewportBottom - mouseY;

      if (distanceFromBottom < AUTO_SCROLL_ZONE) {
        const intensity = 1 - distanceFromBottom / AUTO_SCROLL_ZONE;
        container.scrollTop += AUTO_SCROLL_SPEED * intensity;
        mouseY = viewportBottom; // Keep mouse at edge position for next tick
      }

      autoScrollRafRef.current = requestAnimationFrame(tick);
    };

    autoScrollRafRef.current = requestAnimationFrame(tick);
  }, [dashboardRef]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  const handleDragStart: DraggableEventHandler = useCallback(() => {
    cancelSnapAnimation();
    setIsDragging(true);
    setDragging(true, card.id);
    setCancelDrag(false);
    startPosRef.current = { x: pixelPos.x, y: pixelPos.y };
  }, [card.id, setDragging, pixelPos.x, pixelPos.y, cancelSnapAnimation]);

  const handleDrag: DraggableEventHandler = useCallback(
    (_e, data) => {
      if (cancelDrag) return;
      setDragPos({ x: data.x, y: data.y });

      // Check if mouse is near bottom edge for auto-scroll
      const mouseEvent = _e as MouseEvent;
      const mouseY = mouseEvent.clientY;
      const viewportBottom = window.innerHeight;

      if (viewportBottom - mouseY < AUTO_SCROLL_ZONE) {
        startAutoScroll(mouseY);
      } else {
        stopAutoScroll();
      }
    },
    [cancelDrag, startAutoScroll, stopAutoScroll],
  );

  const handleDragStop: DraggableEventHandler = useCallback(
    (_e, data) => {
      stopAutoScroll();

      if (cancelDrag) {
        triggerSnapAnimation();
        setDragPos(startPosRef.current);
        setIsDragging(false);
        setDragging(false, null);
        setCancelDrag(false);
        return;
      }

      const snapped = snapToGrid(data.x, data.y);
      const clamped = clampToGrid(
        snapped.col,
        snapped.row,
        card.gridWidth,
        card.gridHeight,
      );

      // Check if the new position overlaps with any other card
      const wouldOverlap = state.cards.some(otherCard => {
        if (otherCard.id === card.id) return false; // Skip self
        return cardsOverlap(
          { gridX: clamped.col, gridY: clamped.row, gridWidth: card.gridWidth, gridHeight: card.gridHeight },
          otherCard
        );
      });

      if (wouldOverlap) {
        // Restore to original position if overlap would occur
        triggerSnapAnimation();
        setDragPos(startPosRef.current);
        setIsDragging(false);
        setDragging(false, null);
        return;
      }

      triggerSnapAnimation();
      updateCardPosition(card.id, clamped.col, clamped.row);
      setDragPos({ x: clamped.col * GRID_UNIT, y: clamped.row * GRID_UNIT });
      setIsDragging(false);
      setDragging(false, null);
    },
    [
      cancelDrag,
      triggerSnapAnimation,
      stopAutoScroll,
      card.id,
      card.gridWidth,
      card.gridHeight,
      state.cards,
      updateCardPosition,
      setDragging,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        setCancelDrag(true);
      }
    },
    [isDragging],
  );

  const handleResize = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      cancelSnapAnimation();
      setIsResizing(true);
      // Clamp resize size to grid boundaries
      const maxWidth = (GRID_COLS - card.gridX) * GRID_UNIT - GRID_GAP;
      const maxHeight = (GRID_MAX_ROWS - card.gridY) * GRID_UNIT - GRID_GAP;
      setResizeSize({
        width: Math.min(data.size.width, maxWidth),
        height: Math.min(data.size.height, maxHeight),
      });
    },
    [cancelSnapAnimation, card.gridX, card.gridY],
  );

  const handleResizeStop = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      let newWidth = Math.max(1, Math.round(data.size.width / GRID_UNIT));
      let newHeight = Math.max(1, Math.round(data.size.height / GRID_UNIT));

      // Clamp size to stay within grid boundaries
      newWidth = Math.min(newWidth, GRID_COLS - card.gridX);
      newHeight = Math.min(newHeight, GRID_MAX_ROWS - card.gridY);

      // Check if the new size would overlap with any other card
      const wouldOverlap = state.cards.some(otherCard => {
        if (otherCard.id === card.id) return false; // Skip self
        return cardsOverlap(
          { gridX: card.gridX, gridY: card.gridY, gridWidth: newWidth, gridHeight: newHeight },
          otherCard
        );
      });

      if (wouldOverlap) {
        // Restore original size if overlap would occur
        triggerSnapAnimation();
        setIsResizing(false);
        setResizeSize(null);
        return;
      }

      triggerSnapAnimation();
      updateCardSize(card.id, newWidth, newHeight);
      setIsResizing(false);
      setResizeSize(null);
    },
    [card.id, card.gridX, card.gridY, state.cards, updateCardSize, triggerSnapAnimation],
  );

  return (
    <>
      <Draggable
        enableUserSelectHack={false}
        handle={`.${styles.cardHeader2} h3`}
        position={dragPos}
        nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        disabled={!state.editMode}
      >
        <div
          ref={nodeRef}
          className={`${styles.card} ${isDragging ? styles.dragging : ''} ${isResizing ? styles.resizing : ''} ${snapAnimating ? styles.snapAnimating : ''}`}
          style={{
            width: displaySize.width,
            height: displaySize.height,
            zIndex: isDragging ? 10 : 1,
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <Resizable
            width={displaySize.width}
            height={displaySize.height}
            onResize={handleResize}
            onResizeStop={handleResizeStop}
            resizeHandles={state.editMode ? ['se'] : []}
          >
            <div className={styles.resizableInner}>
              <div className={`${styles.cardHeader2} ${card.immersiveTitle ? styles.immersiveHeader : ''}`}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                {state.editMode && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => toggleImmersiveTitle(card.id)}
                      aria-label={card.immersiveTitle ? '退出沉浸式标题栏' : '沉浸式标题栏'}
                      title={card.immersiveTitle ? '退出沉浸式标题栏' : '沉浸式标题栏'}
                      style={{ opacity: 1 }}
                    >
                      {card.immersiveTitle ? '⊟' : '⊡'}
                    </button>
                    {(card.cardType === 'custom' || card.cardType === 'preset') && (
                      <button
                        className={styles.editButton}
                        onClick={() => setShowEditDialog(true)}
                        aria-label="编辑代码"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className={styles.removeButton}
                      onClick={() => removeCard(card.id)}
                      aria-label="删除卡片"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div className={`${styles.cardContent} ${card.immersiveTitle ? styles.immersiveContent : ''}`}>
                <CardRenderer card={card} />
              </div>
            </div>
          </Resizable>
        </div>
      </Draggable>

      {isResizing && <div className={styles.resizeOverlay} />}

      {showEditDialog && (
        <EditCustomCardDialog
          card={card}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </>
  );
};

interface CardListProps {
  dashboardRef: React.RefObject<HTMLDivElement | null>;
}

const CardList: React.FC<CardListProps> = ({ dashboardRef }) => {
  const { state } = useDashboard();
  return (
    <>
      {state.cards.map((card) => (
        <Card key={card.id} card={card} dashboardRef={dashboardRef} />
      ))}
    </>
  );
};

export default CardList;
