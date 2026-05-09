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
  GRID_DRAG_EXTENSION_ROWS,
} from '../../utils/gridUtils';
import CardRenderer from '../Cards/CardRenderer';
import EditCustomCardDialog from '../CardCreator/EditCustomCardDialog';
import styles from './Card.module.css';

const AUTO_SCROLL_ZONE = 80;
const AUTO_SCROLL_SPEED = 3;

interface CardProps {
  card: CardState;
  dashboardRef: React.RefObject<HTMLDivElement | null>;
}

const Card: React.FC<CardProps> = ({ card, dashboardRef }) => {
  const { state, updateCardPosition, updateCardSize, setDragging, removeCard, toggleImmersiveTitle } =
    useDashboard();

  const defaultPixelPos = gridToPixel(card.gridX, card.gridY);
  const pixelSize = gridCellsToPixels(card.gridWidth, card.gridHeight);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeSize, setResizeSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [snapAnimating, setSnapAnimating] = useState(false);
  const [controlledPosition, setControlledPosition] = useState(defaultPixelPos);

  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const autoScrollRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const pendingResizeSizeRef = useRef<{ width: number; height: number } | null>(null);
  const isResizingRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const cancelDragRef = useRef(false);
  const cardsRef = useRef(state.cards);
  cardsRef.current = state.cards;
  const cardRef = useRef(card);
  cardRef.current = card;
  const displaySize = isResizing && resizeSize ? resizeSize : pixelSize;

  // Key remounts Draggable when grid position is set externally (snap / cancel)
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
    if (!isDragging && !isResizing) {
      setControlledPosition(defaultPixelPos);
    }
  }, [defaultPixelPos, isDragging, isResizing]);

  useEffect(() => {
    return () => {
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
    };
  }, []);

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
        mouseY = viewportBottom;
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
    cancelDragRef.current = false;
    setIsDragging(true);
    setDragging(true, cardRef.current.id);
    startPosRef.current = { x: controlledPosition.x, y: controlledPosition.y };
  }, [setDragging, cancelSnapAnimation, controlledPosition.x, controlledPosition.y]);

  const handleDrag: DraggableEventHandler = useCallback(
    (_e, data) => {
      if (cancelDragRef.current) return;
      const mouseEvent = _e as MouseEvent;
      const mouseY = mouseEvent.clientY;

      if (window.innerHeight - mouseY < AUTO_SCROLL_ZONE) {
        startAutoScroll(mouseY);
      } else {
        stopAutoScroll();
      }
    },
    [startAutoScroll, stopAutoScroll],
  );

  const handleDragStop: DraggableEventHandler = useCallback(
    (_e, data) => {
      stopAutoScroll();

      const c = cardRef.current;

      if (cancelDragRef.current) {
        triggerSnapAnimation();
        setControlledPosition(startPosRef.current);
        setIsDragging(false);
        setDragging(false, null);
        return;
      }

      const snapped = snapToGrid(data.x, data.y);
      const maxRows = state.isDragging ? GRID_MAX_ROWS + GRID_DRAG_EXTENSION_ROWS : GRID_MAX_ROWS;
      const clamped = clampToGrid(snapped.col, snapped.row, c.gridWidth, c.gridHeight, maxRows);

      const wouldOverlap = cardsRef.current.some(otherCard => {
        if (otherCard.id === c.id) return false;
        return cardsOverlap(
          { gridX: clamped.col, gridY: clamped.row, gridWidth: c.gridWidth, gridHeight: c.gridHeight },
          otherCard,
        );
      });

      if (wouldOverlap) {
        triggerSnapAnimation();
        setControlledPosition(startPosRef.current);
        setIsDragging(false);
        setDragging(false, null);
        return;
      }

      triggerSnapAnimation();
      const targetPosition = gridToPixel(clamped.col, clamped.row);
      setControlledPosition(targetPosition);
      setIsDragging(false);
      setDragging(false, null);
      updateCardPosition(c.id, clamped.col, clamped.row);
    },
    [updateCardPosition, setDragging, triggerSnapAnimation, stopAutoScroll],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        cancelDragRef.current = true;
      }
    },
    [isDragging],
  );

  const handleResize = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      cancelSnapAnimation();
      if (!isResizingRef.current) {
        isResizingRef.current = true;
        setIsResizing(true);
      }
      const c = cardRef.current;
      const maxWidth = (GRID_COLS - c.gridX) * GRID_UNIT - GRID_GAP;
      const maxHeight = (GRID_MAX_ROWS - c.gridY) * GRID_UNIT - GRID_GAP;
      setResizeSize({
        width: Math.min(data.size.width, maxWidth),
        height: Math.min(data.size.height, maxHeight),
      });
    },
    [cancelSnapAnimation],
  );

  const handleResizeStop = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      if (resizeRafRef.current) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      isResizingRef.current = false;
      pendingResizeSizeRef.current = null;

      const c = cardRef.current;
      let newWidth = Math.max(1, Math.round(data.size.width / GRID_UNIT));
      let newHeight = Math.max(1, Math.round(data.size.height / GRID_UNIT));

      newWidth = Math.min(newWidth, GRID_COLS - c.gridX);
      newHeight = Math.min(newHeight, GRID_MAX_ROWS - c.gridY);

      const wouldOverlap = cardsRef.current.some(otherCard => {
        if (otherCard.id === c.id) return false;
        return cardsOverlap(
          { gridX: c.gridX, gridY: c.gridY, gridWidth: newWidth, gridHeight: newHeight },
          otherCard,
        );
      });

      if (wouldOverlap) {
        triggerSnapAnimation();
        setIsResizing(false);
        setResizeSize(null);
        return;
      }

      triggerSnapAnimation();
      updateCardSize(c.id, newWidth, newHeight);
      setIsResizing(false);
      setResizeSize(null);
    },
    [updateCardSize, triggerSnapAnimation],
  );

  return (
    <>
      <Draggable
        key={card.id}
        enableUserSelectHack={false}
        handle={`.${styles.cardHeader2} h3`}
        position={isDragging ? undefined : controlledPosition}
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
