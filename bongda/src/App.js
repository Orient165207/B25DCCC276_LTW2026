import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { ROUNDS, RESULT_LABELS } from './data';
import { getTeamName, getResult, isValidGoals, calcStandings, calcMatchStats } from './utils';
import useFetch from './hooks/useFetch';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import {
  selectMatches,
  setMatches,
  removeMatch,
  setGoals,
} from './features/matchesSlice';
import StandingsTable from './components/StandingsTable';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';

function App() {
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const dispatch = useDispatch();
  const matches = useSelector(selectMatches);

  const { data, loading, error } = useFetch('/data/matches.json');
  const [ready, setReady] = useState(false);
  const [roundFilter, setRoundFilter] = useState('all');

  useEffect(() => {
    if (data) {
      dispatch(setMatches(data));
      setReady(true);
    }
  }, [data, dispatch]);

  // Bảng xếp hạng luôn tính trên tất cả các trận
  const standings = useMemo(() => calcStandings(matches), [matches]);

  const visibleMatches = useMemo(
    () =>
      roundFilter === 'all'
        ? matches
        : matches.filter((m) => m.round === Number(roundFilter)),
    [matches, roundFilter]
  );

  const visibleStats = useMemo(() => calcMatchStats(visibleMatches), [visibleMatches]);

  const leader = matches.length > 0 ? standings[0] : null;

  const handleGoalsChange = (match, side) => (e) => {
    const value = e.target.valueAsNumber;
    if (!isValidGoals(value)) return;
    dispatch(
      setGoals({
        id: match.id,
        homeGoals: side === 'home' ? value : match.homeGoals,
        awayGoals: side === 'away' ? value : match.awayGoals,
      })
    );
  };

  const handleRemove = (match) => {
    dispatch(removeMatch(match.id));
    showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
  };

  const showLoading = loading || (!error && !ready);

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        <header className="app-header">
          <h1>Giải bóng đá khoa</h1>
          <button type="button" onClick={toggleTheme}>
            {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          </button>
        </header>

        {showLoading && !error && <p>Đang tải lịch thi đấu...</p>}
        {!loading && error && <p role="alert">Không tải được lịch thi đấu</p>}

        {!showLoading && !error && (
          <>
            <StandingsTable standings={standings} />

            <section aria-labelledby="stats-title">
              <h2 id="stats-title">Thống kê</h2>
              <p>{`Số trận: ${visibleStats.count}`}</p>
              <p>{`Tổng số bàn thắng: ${visibleStats.goals}`}</p>
              <p>{`Bàn thắng mỗi trận: ${visibleStats.average.toFixed(2)}`}</p>
              <p>
                {leader
                  ? `Đội dẫn đầu: ${leader.name} (${leader.points} điểm)`
                  : 'Đội dẫn đầu: —'}
              </p>
            </section>

            <section aria-labelledby="schedule-title">
              <h2 id="schedule-title">Lịch thi đấu</h2>
              <div className="field-inline">
                <label htmlFor="round-filter">Xem vòng</label>
                <select
                  id="round-filter"
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  {ROUNDS.map((r) => (
                    <option key={r} value={r}>
                      {`Vòng ${r}`}
                    </option>
                  ))}
                </select>
              </div>

              {visibleMatches.length === 0 ? (
                <p>Chưa có trận đấu nào</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Vòng</th>
                      <th>Đội nhà</th>
                      <th>BT nhà</th>
                      <th>BT khách</th>
                      <th>Đội khách</th>
                      <th>Kết quả</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMatches.map((m) => {
                      const result = getResult(m);
                      const homeName = getTeamName(m.home);
                      const awayName = getTeamName(m.away);
                      return (
                        <tr
                          key={m.id}
                          style={
                            result === 'draw'
                              ? { background: 'rgba(255, 193, 7, 0.25)' }
                              : undefined
                          }
                        >
                          <td>{m.round}</td>
                          <td>{homeName}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={m.homeGoals}
                              aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
                              onChange={handleGoalsChange(m, 'home')}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={m.awayGoals}
                              aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
                              onChange={handleGoalsChange(m, 'away')}
                            />
                          </td>
                          <td>{awayName}</td>
                          <td>{RESULT_LABELS[result]}</td>
                          <td>
                            <button type="button" onClick={() => handleRemove(m)}>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            <AddMatchForm />

            <GoalPlanner standings={standings} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
