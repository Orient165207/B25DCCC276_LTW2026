import { memo, useRef } from 'react';
import { RESULT_LABELS } from '../data';
import { getTeamName, getResult, isValidGoals } from '../utils';

function MatchRow({ match, onGoals, onRemove }) {
  // Đếm số lần hàm component chạy (không gây render lại)
  const renders = useRef(0);
  renders.current += 1;

  const result = getResult(match);
  const homeName = getTeamName(match.home);
  const awayName = getTeamName(match.away);

  const handleChange = (side) => (e) => {
    const value = e.target.valueAsNumber;
    if (!isValidGoals(value)) return;
    onGoals({
      id: match.id,
      homeGoals: side === 'home' ? value : match.homeGoals,
      awayGoals: side === 'away' ? value : match.awayGoals,
    });
  };

  return (
    <tr style={result === 'draw' ? { background: 'rgba(255, 193, 7, 0.25)' } : undefined}>
      <td>{match.round}</td>
      <td>{homeName}</td>
      <td>
        <input
          type="number"
          min="0"
          max="20"
          value={match.homeGoals}
          aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
          onChange={handleChange('home')}
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          max="20"
          value={match.awayGoals}
          aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
          onChange={handleChange('away')}
        />
      </td>
      <td>{awayName}</td>
      <td>{RESULT_LABELS[result]}</td>
      <td>{renders.current}</td>
      <td>
        <button type="button" onClick={() => onRemove(match)}>
          Xóa
        </button>
      </td>
    </tr>
  );
}

export default memo(MatchRow);
