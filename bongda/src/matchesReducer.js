export function matchesReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'ADD': {
      const maxId = state.reduce((max, m) => Math.max(max, m.id), 0);
      return [...state, { ...action.payload, id: maxId + 1 }];
    }

    case 'REMOVE': {
      const id =
        action.payload !== null && typeof action.payload === 'object'
          ? action.payload.id
          : action.payload;
      return state.filter((m) => m.id !== id);
    }

    case 'SET_GOALS': {
      const { id, homeGoals, awayGoals } = action.payload;
      return state.map((m) => (m.id === id ? { ...m, homeGoals, awayGoals } : m));
    }

    default:
      return state;
  }
}

export default matchesReducer;
