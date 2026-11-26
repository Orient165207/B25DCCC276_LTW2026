const MATCHES_KEY = 'ltw_bongda_matches';

const FIELDS = ['id', 'round', 'home', 'away', 'homeGoals', 'awayGoals'];

const isMatch = (m) =>
  m !== null && typeof m === 'object' && FIELDS.every((f) => Number.isFinite(m[f]));

// Trả về mảng trận đã lưu, hoặc null nếu chưa có / dữ liệu hỏng
export function loadSaved() {
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isMatch) ? parsed : null;
  } catch (err) {
    return null;
  }
}

export function saveMatches(matches) {
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  } catch (err) {
    // bỏ qua lỗi ghi
  }
}
