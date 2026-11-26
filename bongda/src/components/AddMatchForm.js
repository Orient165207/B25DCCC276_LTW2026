import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TEAMS, ROUNDS } from '../data';
import { getTeamName, isValidGoals } from '../utils';
import { addMatch, selectMatches } from '../features/matchesSlice';
import { useNotice } from '../context/NoticeContext';

const GOALS_ERROR = 'Số bàn thắng phải là số nguyên từ 0 đến 20';

const EMPTY_FORM = { round: 1, home: '', away: '', homeGoals: '', awayGoals: '' };

const parseGoals = (value) => (value === '' ? NaN : Number(value));

function AddMatchForm() {
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const homeRef = useRef(null);

  const updateForm = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const homeId = form.home === '' ? null : Number(form.home);
    const awayId = form.away === '' ? null : Number(form.away);

    if (homeId === null) next.home = 'Hãy chọn đội nhà';
    if (awayId === null) {
      next.away = 'Hãy chọn đội khách';
    } else if (homeId !== null) {
      if (homeId === awayId) {
        next.away = 'Hai đội phải khác nhau';
      } else if (
        matches.some(
          (m) =>
            (m.home === homeId && m.away === awayId) ||
            (m.home === awayId && m.away === homeId)
        )
      ) {
        next.away = 'Hai đội đã đá với nhau rồi';
      }
    }

    const homeGoals = parseGoals(form.homeGoals);
    const awayGoals = parseGoals(form.awayGoals);
    if (!isValidGoals(homeGoals)) next.homeGoals = GOALS_ERROR;
    if (!isValidGoals(awayGoals)) next.awayGoals = GOALS_ERROR;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    dispatch(
      addMatch({
        round: Number(form.round),
        home: homeId,
        away: awayId,
        homeGoals,
        awayGoals,
      })
    );
    showNotice(`Đã thêm trận ${getTeamName(homeId)} - ${getTeamName(awayId)}`);
    setForm(EMPTY_FORM);
    homeRef.current.focus();
  };

  return (
    <section aria-labelledby="add-title">
      <h2 id="add-title">Thêm trận đấu</h2>
      <form onSubmit={handleSubmit} noValidate className="match-form">
        <div className="field">
          <label htmlFor="form-round">Vòng</label>
          <select id="form-round" value={form.round} onChange={updateForm('round')}>
            {ROUNDS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="form-home">Đội nhà</label>
          <select
            id="form-home"
            ref={homeRef}
            value={form.home}
            onChange={updateForm('home')}
          >
            <option value="">-- Chọn đội --</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.home && <p role="alert" className="error">{errors.home}</p>}
        </div>

        <div className="field">
          <label htmlFor="form-away">Đội khách</label>
          <select id="form-away" value={form.away} onChange={updateForm('away')}>
            <option value="">-- Chọn đội --</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.away && <p role="alert" className="error">{errors.away}</p>}
        </div>

        <div className="field">
          <label htmlFor="form-home-goals">Bàn thắng đội nhà</label>
          <input
            id="form-home-goals"
            type="number"
            value={form.homeGoals}
            onChange={updateForm('homeGoals')}
          />
          {errors.homeGoals && (
            <p role="alert" className="error">{errors.homeGoals}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="form-away-goals">Bàn thắng đội khách</label>
          <input
            id="form-away-goals"
            type="number"
            value={form.awayGoals}
            onChange={updateForm('awayGoals')}
          />
          {errors.awayGoals && (
            <p role="alert" className="error">{errors.awayGoals}</p>
          )}
        </div>

        <button type="submit">Thêm trận</button>
      </form>
    </section>
  );
}

export default AddMatchForm;
