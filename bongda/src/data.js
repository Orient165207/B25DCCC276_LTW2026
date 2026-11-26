export const TEAMS = [
  { id: 1, name: 'Khoa CNTT' },
  { id: 2, name: 'Khoa Viễn thông' },
  { id: 3, name: 'Khoa Điện tử' },
  { id: 4, name: 'Khoa An toàn TT' },
  { id: 5, name: 'Khoa Đa phương tiện' },
  { id: 6, name: 'Khoa Marketing' },
];

// Đá vòng tròn một lượt: 6 đội, 5 vòng, mỗi cặp đấu với nhau đúng 1 trận
export const ROUNDS = [1, 2, 3, 4, 5];

// Điểm cho mỗi kết quả
export const POINTS = { win: 3, draw: 1, loss: 0 };

// Số bàn thắng hợp lệ của một đội trong một trận
export const MAX_GOALS = 20;

// Nhãn kết quả của trận đấu
export const RESULT_LABELS = {
  home: 'Đội nhà thắng',
  draw: 'Hòa',
  away: 'Đội khách thắng',
};

// Hiệu số: +3, -2, 0
export const formatDiff = (n) => (n > 0 ? `+${n}` : String(n));
