import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CardState, DashboardState, DashboardAction } from '../types/dashboard';

const STORAGE_KEY = 'etab-dashboard-state';

export const initialState: DashboardState = {
  cards: [],
  isDragging: false,
  draggingCardId: null,
  editMode: true,
};

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] };

    case 'REMOVE_CARD':
      return { ...state, cards: state.cards.filter(c => c.id !== action.payload.id) };

    case 'UPDATE_CARD_POSITION':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id
            ? { ...c, gridX: action.payload.gridX, gridY: action.payload.gridY }
            : c
        ),
      };

    case 'UPDATE_CARD_SIZE':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id
            ? { ...c, gridWidth: action.payload.gridWidth, gridHeight: action.payload.gridHeight }
            : c
        ),
      };

    case 'UPDATE_CARD_TITLE':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id ? { ...c, title: action.payload.title } : c
        ),
      };

    case 'UPDATE_CARD_CONFIG':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id ? {
            ...c,
            cardConfig: action.payload.config,

            customCode: (action.payload.config.customCode as string | undefined) || c.customCode
          } : c
        ),
      };

    case 'TOGGLE_IMMERSIVE_TITLE':
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id
            ? { ...c, immersiveTitle: !c.immersiveTitle }
            : c
        ),
      };

    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.payload.isDragging,
        draggingCardId: action.payload.cardId,
      };

    case 'TOGGLE_EDIT_MODE':
      return { ...state, editMode: !state.editMode };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  addCard: (card: CardState) => void;
  removeCard: (id: string) => void;
  updateCardPosition: (id: string, gridX: number, gridY: number) => void;
  updateCardSize: (id: string, gridWidth: number, gridHeight: number) => void;
  updateCardTitle: (id: string, title: string) => void;
  updateCardConfig: (id: string, config: Record<string, unknown>) => void;
  toggleImmersiveTitle: (id: string) => void;
  setDragging: (isDragging: boolean, cardId: string | null) => void;
  toggleEditMode: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboard = (): DashboardContextValue => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return ctx;
};

const CODE_STORAGE_PREFIX = 'etab-card-code-';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as DashboardState;
      }
    } catch {
      // ignore parse errors
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addCard = useCallback((card: CardState) => {
    dispatch({ type: 'ADD_CARD', payload: card });

    // Handle temp ID for custom cards - move stored code to real ID
    const tempId = (card.cardConfig as any)?._tempId;
    if (tempId && card.customCode) {
      try {
        const tempCode = localStorage.getItem(CODE_STORAGE_PREFIX + tempId);
        if (tempCode) {
          localStorage.setItem(CODE_STORAGE_PREFIX + card.id, tempCode);
          localStorage.removeItem(CODE_STORAGE_PREFIX + tempId);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const removeCard = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CARD', payload: { id } });

    // Also remove custom card code storage
    try {
      localStorage.removeItem(CODE_STORAGE_PREFIX + id);
    } catch {
      // ignore
    }
  }, []);

  const updateCardPosition = useCallback((id: string, gridX: number, gridY: number) =>
    dispatch({ type: 'UPDATE_CARD_POSITION', payload: { id, gridX, gridY } }), []);
  const updateCardSize = useCallback((id: string, gridWidth: number, gridHeight: number) =>
    dispatch({ type: 'UPDATE_CARD_SIZE', payload: { id, gridWidth, gridHeight } }), []);
  const updateCardTitle = useCallback((id: string, title: string) =>
    dispatch({ type: 'UPDATE_CARD_TITLE', payload: { id, title } }), []);
  const updateCardConfig = useCallback((id: string, config: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_CARD_CONFIG', payload: { id, config } });

    // Save custom card code to localStorage
    const customCode = config.customCode;
    if (customCode && typeof customCode === 'string') {
      try {
        localStorage.setItem(CODE_STORAGE_PREFIX + id, customCode as string);
      } catch {
        // ignore
      }
    }
  }, []);
  const toggleImmersiveTitle = useCallback((id: string) =>
    dispatch({ type: 'TOGGLE_IMMERSIVE_TITLE', payload: { id } }), []);
  const setDragging = useCallback((isDragging: boolean, cardId: string | null) =>
    dispatch({ type: 'SET_DRAGGING', payload: { isDragging, cardId } }), []);
  const toggleEditMode = useCallback(() => dispatch({ type: 'TOGGLE_EDIT_MODE' }), []);

  return (
    <DashboardContext.Provider
      value={{
        state,
        dispatch,
        addCard,
        removeCard,
        updateCardPosition,
        updateCardSize,
        updateCardTitle,
        updateCardConfig,
        toggleImmersiveTitle,
        setDragging,
        toggleEditMode,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
