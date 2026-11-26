import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TEAMS } from '../data';
import { calcNeeded } from '../utils';
import {
  selectGoal,
  setTeamId,
  setTarget,
  setRemaining,
} from '../features/goalSlice';

function GoalPlanner({ standings }) {
  const { teamId, target, remaining } = useSelector(selectGoal);
  const dispatch = useDispatch();

  const message = useMemo(
    () => calcNeeded(standings, teamId, target, remaining),
    [standings, teamId, target, remaining]
  );

  return (
    <section aria-labelledby="goal-title">
      <h2 id="goal-title">Mục tiêu điểm</h2>
      <div className="match-form">
        <div className="field">
          <label htmlFor="goal-team">Đội của bạn</label>
          <select
            id="goal-team"
            value={teamId}
            onChange={(e) => dispatch(setTeamId(e.target.value))}
          >
            <option value="">-- Chọn đội --</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="goal-target">Số điểm mục tiêu</label>
          <input
            id="goal-target"
            type="number"
            value={target}
            onChange={(e) => dispatch(setTarget(e.target.value))}
          />
        </div>

        <div className="field">
          <label htmlFor="goal-remaining">Số trận còn lại</label>
          <input
            id="goal-remaining"
            type="number"
            value={remaining}
            onChange={(e) => dispatch(setRemaining(e.target.value))}
          />
        </div>
      </div>
      <p className="goal-result">{message}</p>
    </section>
  );
}

export default GoalPlanner;
