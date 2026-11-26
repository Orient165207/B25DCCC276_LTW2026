import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { ROUNDS, RESULT_LABELS } from './data';
import { getTeamName, calcStandings, calcMatchStats } from './utils';
import useFetch from './hooks/useFetch';
import useLocalStorage from './hooks/useLocalStorage';
import useDebounce from './hooks/useDebounce';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import { selectMatches, setMatches, removeMatch, setGoals } from './features/matchesSlice';
import { hasSaved } from './store';
import StandingsTable from './components/StandingsTable';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import MatchRow from './components/MatchRow';

// TODO: điền đúng giá trị data-build theo "phần lưu ý kỹ thuật" ở đầu đề bài
const DATA_BUILD = 'TODO-dien-gia-tri-data-build';

const BASE_TITLE = 'Giải bóng đá khoa';

function App() {
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const dispatch = useDispatch();
  const matches = useSelector(selectMatches);

  const { data, loading, error } = useFetch('/data/matches.json');
  const [ready, setReady] = useState(hasSaved);
  const [storedRound, setRoundFilter] = useLocalStorage('ltw_bongda_round', 'all');
  const [search, setSearch] = useState('');
  const searchRef = useRef(null);

  const roundFilter =
    storedRound === 'all' || ROUNDS.includes(Number(storedRound)) ? storedRound : 'all';

  // Chỉ khi CHƯA có dữ liệu lưu mới nạp lịch thi đấu mẫu vào store
  useEffect(() => {
    if (!hasSaved && data) {
      dispatch(setMatches(data));
      setReady(true);
    }
  }, [data, dispatch]);

  // Bảng xếp hạng luôn tính trên tất cả các trận
  const standings = useMemo(() => calcStandings(matches), [matches]);

  // Lọc theo vòng (dùng cho thống kê)
  const roundMatches = useMemo(
    () =>
      roundFilter === 'all'
        ? matches
        : matches.filter((m) => m.round === Number(roundFilter)),
    [matches, roundFilter]
  );
  const stats = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);

  // Tìm đội: lọc theo giá trị đã debounce 300ms, chỉ ảnh hưởng bảng lịch
  const debouncedSearch = useDebounce(search, 300);
  const shownMatches = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return roundMatches;
    return roundMatches.filter(
      (m) =>
        getTeamName(m.home).toLowerCase().includes(keyword) ||
        getTeamName(m.away).toLowerCase().includes(keyword)
    );
  }, [roundMatches, debouncedSearch]);

  const leader = matches.length > 0 ? standings[0] : null;
  const leaderName = leader ? leader.name : null;

  // Tiêu đề tab
  useEffect(() => {
    document.title = leaderName ? `${leaderName} dẫn đầu – ${BASE_TITLE}` : BASE_TITLE;
  }, [leaderName]);

  // Phím tắt: "/" để nhảy vào ô tìm, Esc để xóa ô tìm
  useEffect(() => {
    const handleKey = (e) => {
      const el = e.target;
      const tag = el && el.tagName;
      const typing =
        tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (el && el.isContentEditable);

      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (searchRef.current) searchRef.current.focus();
      } else if (e.key === 'Escape' && el === searchRef.current) {
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTeamShift = (e) => setSearch(e.target.value);

  // Handler ổn định để React.memo của MatchRow có tác dụng
  const handleGoals = useCallback(
    (payload) => {
      dispatch(setGoals(payload));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (match) => {
      dispatch(removeMatch(match.id));
      showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
    },
    [dispatch, showNotice]
  );

  const handleReset = () => {
    if (!data) return;
    dispatch(setMatches(data));
    showNotice('Đã đặt lại dữ liệu mẫu');
  };

  // Có dữ liệu lưu thì không chờ fetch, lỗi fetch cũng không chặn
  const waiting = !hasSaved && !ready;
  const showLoading = waiting && !error;
  const showError = waiting && !loading && error;

  return (
    <div className={`app ${theme}`} data-build={DATA_BUILD}>
      <div className="container">
        <header className="app-header">
          <h1>{BASE_TITLE}</h1>
          <button type="button" onClick={toggleTheme}>
            {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          </button>
        </header>

        {showLoading && <p>Đang tải lịch thi đấu...</p>}
        {showError && <p role="alert">Không tải được lịch thi đấu</p>}

        {!waiting && (
          <>
            <StandingsTable standings={standings} />

            <section aria-labelledby="stats-title">
              <h2 id="stats-title">Thống kê</h2>
              <p>{`Số trận: ${stats.count}`}</p>
              <p>{`Tổng số bàn thắng: ${stats.goals}`}</p>
              <p>{`Bàn thắng mỗi trận: ${stats.average.toFixed(2)}`}</p>
              <p>
                {leader
                  ? `Đội dẫn đầu: ${leader.name} (${leader.points} điểm)`
                  : 'Đội dẫn đầu: —'}
              </p>
              <h3>Phân bố kết quả</h3>
              <ul className="dist-list">
                {Object.keys(RESULT_LABELS).map((key) => (
                  <li key={key}>
                    {`${RESULT_LABELS[key]}: ${stats.counts[key]}`}
                    <span className="dist-bar" style={{ width: 24 * stats.counts[key] }} />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="schedule-title">
              <h2 id="schedule-title">Lịch thi đấu</h2>

              <div className="filters">
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

                <div className="field-inline">
                  <label htmlFor="team-search">Tìm đội</label>
                  <input
                    id="team-search"
                    ref={searchRef}
                    type="text"
                    value={search}
                    placeholder="Nhấn / để tìm nhanh"
                    onChange={handleTeamShift}
                  />
                </div>
              </div>

              <p>{`Tìm thấy ${shownMatches.length} trận`}</p>

              {shownMatches.length === 0 ? (
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
                      <th>Số lần render</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownMatches.map((m) => (
                      <MatchRow
                        key={m.id}
                        match={m}
                        onGoals={handleGoals}
                        onRemove={handleRemove}
                      />
                    ))}
                  </tbody>
                </table>
              )}

              <p>
                <button type="button" onClick={handleReset} disabled={!data}>
                  Đặt lại dữ liệu mẫu
                </button>
              </p>
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
