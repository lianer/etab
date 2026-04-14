import { dashboardReducer, initialState } from '../context/DashboardContext';
import { CardState, DashboardAction } from '../types/dashboard';

const mockCard: CardState = {
  id: 'card-1',
  title: 'Test Card',
  gridX: 0,
  gridY: 0,
  gridWidth: 2,
  gridHeight: 2,
  cardType: 'clock',
  cardConfig: { is24Hour: true },
};

describe('dashboardReducer', () => {
  it('returns initial state', () => {
    expect(initialState.cards).toEqual([]);
    expect(initialState.editMode).toBe(true);
  });

  it('handles ADD_CARD', () => {
    const action: DashboardAction = { type: 'ADD_CARD', payload: mockCard };
    const state = dashboardReducer(initialState, action);
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].id).toBe('card-1');
  });

  it('handles REMOVE_CARD', () => {
    const withCard = { ...initialState, cards: [mockCard] };
    const action: DashboardAction = { type: 'REMOVE_CARD', payload: { id: 'card-1' } };
    const state = dashboardReducer(withCard, action);
    expect(state.cards).toHaveLength(0);
  });

  it('handles UPDATE_CARD_POSITION', () => {
    const withCard = { ...initialState, cards: [mockCard] };
    const action: DashboardAction = { type: 'UPDATE_CARD_POSITION', payload: { id: 'card-1', gridX: 3, gridY: 2 } };
    const state = dashboardReducer(withCard, action);
    expect(state.cards[0].gridX).toBe(3);
    expect(state.cards[0].gridY).toBe(2);
  });

  it('handles UPDATE_CARD_SIZE', () => {
    const withCard = { ...initialState, cards: [mockCard] };
    const action: DashboardAction = { type: 'UPDATE_CARD_SIZE', payload: { id: 'card-1', gridWidth: 3, gridHeight: 4 } };
    const state = dashboardReducer(withCard, action);
    expect(state.cards[0].gridWidth).toBe(3);
    expect(state.cards[0].gridHeight).toBe(4);
  });

  it('handles TOGGLE_EDIT_MODE', () => {
    const action: DashboardAction = { type: 'TOGGLE_EDIT_MODE' };
    const state = dashboardReducer(initialState, action);
    expect(state.editMode).toBe(false);
  });

  it('handles SET_DRAGGING', () => {
    const action: DashboardAction = { type: 'SET_DRAGGING', payload: { isDragging: true, cardId: 'card-1' } };
    const state = dashboardReducer(initialState, action);
    expect(state.isDragging).toBe(true);
    expect(state.draggingCardId).toBe('card-1');
  });
});
