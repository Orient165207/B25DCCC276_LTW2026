import { configureStore } from '@reduxjs/toolkit';
import matchesReducer from './features/matchesSlice';
import goalReducer from './features/goalSlice';
import { loadSaved, saveMatches } from './storage';

const saved = loadSaved();

// Lần này đã có dữ liệu lưu chưa? (App dùng để quyết định có nạp dữ liệu mẫu không)
export const hasSaved = saved !== null;

export const store = configureStore({
  reducer: {
    matches: matchesReducer,
    goal: goalReducer,
  },
  preloadedState: { matches: saved ?? [] },
});

// Chỉ lưu khi mảng trận đấu đổi tham chiếu
let previousMatches = store.getState().matches;
store.subscribe(() => {
  const current = store.getState().matches;
  if (current !== previousMatches) {
    previousMatches = current;
    saveMatches(current);
  }
});

export default store;
