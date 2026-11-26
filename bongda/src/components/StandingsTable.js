import { formatDiff } from '../data';

function StandingsTable({ standings }) {
  return (
    <section aria-labelledby="standings-title">
      <h2 id="standings-title">Bảng xếp hạng</h2>
      <table>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Đội</th>
            <th>Trận</th>
            <th>Thắng</th>
            <th>Hòa</th>
            <th>Thua</th>
            <th>BT</th>
            <th>BB</th>
            <th>HS</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => (
            <tr
              key={row.id}
              style={index === standings.length - 1 ? { color: '#c62828' } : undefined}
            >
              <td>{index + 1}</td>
              <td>{row.name}</td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.gf}</td>
              <td>{row.ga}</td>
              <td>{formatDiff(row.diff)}</td>
              <td>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default StandingsTable;
