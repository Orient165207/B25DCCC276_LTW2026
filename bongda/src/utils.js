import { TEAMS, POINTS, MAX_GOALS } from './data';

export const getTeamName = (id) => {
  const team = TEAMS.find((t) => t.id === id);
  return team ? team.name : '';
};

export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
};

export const isValidGoals = (n) =>
  Number.isInteger(n) && n >= 0 && n <= MAX_GOALS;

export const calcStandings = (matches) => {
  const table = TEAMS.map((t) => ({
    id: t.id,
    name: t.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    diff: 0,
    points: 0,
  }));
  const byId = {};
  table.forEach((row) => {
    byId[row.id] = row;
  });

  matches.forEach((m) => {
    const home = byId[m.home];
    const away = byId[m.away];
    if (!home || !away) return;
    const result = getResult(m);

    home.played += 1;
    away.played += 1;
    home.gf += m.homeGoals;
    home.ga += m.awayGoals;
    away.gf += m.awayGoals;
    away.ga += m.homeGoals;

    if (result === 'home') {
      home.won += 1;
      home.points += POINTS.win;
      away.lost += 1;
      away.points += POINTS.loss;
    } else if (result === 'away') {
      away.won += 1;
      away.points += POINTS.win;
      home.lost += 1;
      home.points += POINTS.loss;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += POINTS.draw;
      away.points += POINTS.draw;
    }
  });

  table.forEach((row) => {
    row.diff = row.gf - row.ga;
  });

  // Sắp xếp trên mảng mới, không đụng tới state
  return [...table].sort(
    (a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.gf - a.gf ||
      a.name.localeCompare(b.name, 'vi')
  );
};

export const calcMatchStats = (matches) => {
  const counts = { home: 0, draw: 0, away: 0 };
  let goals = 0;
  matches.forEach((m) => {
    goals += m.homeGoals + m.awayGoals;
    counts[getResult(m)] += 1;
  });
  const count = matches.length;
  const average = count === 0 ? 0 : Math.round((goals / count) * 100) / 100;
  return { count, goals, average, counts };
};

export const NEEDED_HINT =
  'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)';

const toNumber = (value) =>
  value === null || value === undefined || String(value).trim() === ''
    ? NaN
    : Number(value);

// Hàm thuần: trả về câu kết quả cho mục "Mục tiêu điểm"
export const calcNeeded = (standings, teamId, target, remaining) => {
  const team = standings.find((row) => String(row.id) === String(teamId));
  const targetNum = toNumber(target);
  const remainingNum = toNumber(remaining);

  if (
    !team ||
    !Number.isInteger(targetNum) ||
    targetNum < 0 ||
    !Number.isInteger(remainingNum) ||
    remainingNum < 1
  ) {
    return NEEDED_HINT;
  }

  const need = targetNum - team.points;
  if (need <= 0) return 'Đội đã đạt mục tiêu';
  if (need > 3 * remainingNum) return 'Không thể đạt mục tiêu này';

  const minWins = Math.max(0, Math.ceil((need - remainingNum) / 2));
  return `Cần thêm ${need} điểm ở ${remainingNum} trận còn lại, tối thiểu ${minWins} trận thắng`;
};
