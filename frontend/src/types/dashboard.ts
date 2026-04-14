export interface CardState {
  id: string;
  title: string;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
  cardType: 'clock' | 'calendar' | 'todo' | 'custom' | 'preset';
  cardConfig: Record<string, unknown>;
  customCode?: string;
  immersiveTitle?: boolean;
}

export interface DashboardState {
  cards: CardState[];
  isDragging: boolean;
  draggingCardId: string | null;
  editMode: boolean;
}

export type DashboardAction =
  | { type: 'ADD_CARD'; payload: CardState }
  | { type: 'REMOVE_CARD'; payload: { id: string } }
  | { type: 'UPDATE_CARD_POSITION'; payload: { id: string; gridX: number; gridY: number } }
  | { type: 'UPDATE_CARD_SIZE'; payload: { id: string; gridWidth: number; gridHeight: number } }
  | { type: 'UPDATE_CARD_TITLE'; payload: { id: string; title: string } }
  | { type: 'UPDATE_CARD_CONFIG'; payload: { id: string; config: Record<string, unknown> } }
  | { type: 'TOGGLE_IMMERSIVE_TITLE'; payload: { id: string } }
  | { type: 'SET_DRAGGING'; payload: { isDragging: boolean; cardId: string | null } }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'LOAD_STATE'; payload: DashboardState };
