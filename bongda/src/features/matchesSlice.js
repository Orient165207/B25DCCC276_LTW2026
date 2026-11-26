import { createSlice } from '@reduxjs/toolkit';

const matchesSlice = createSlice({
  name: 'matches',
  initialState: [],
  reducers: {
    // Thay cả mảng: trả về mảng mới
    setMatches: (state, action) => action.payload,

    // Immer cho phép "sửa trực tiếp" (push) trong reducer
    addMatch: (state, action) => {
      const maxId = state.reduce((max, m) => Math.max(max, m.id), 0);
      state.push({ ...action.payload, id: maxId + 1 });
    },

    // Xóa theo id: trả về mảng mới
    removeMatch: (state, action) => {
      const id =
        action.payload !== null && typeof action.payload === 'object'
          ? action.payload.id
          : action.payload;
      return state.filter((m) => m.id !== id);
    },

    setGoals: (state, action) => {
      const { id, homeGoals, awayGoals } = action.payload;
      const match = state.find((m) => m.id === id);
      if (match) {
        match.homeGoals = homeGoals;
        match.awayGoals = awayGoals;
      }
    },
  },
});

export const { setMatches, addMatch, removeMatch, setGoals } = matchesSlice.actions;

export const selectMatches = (state) => state.matches;

export default matchesSlice.reducer;
