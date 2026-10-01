import { useState } from 'react';
import './App.css';

const initialStudents = [
	{ id: 1, name: 'Nguyễn Đình Hải', score: 8.7, class: '12A1' },
	{ id: 2, name: 'Trần Bảo An', score: 4.5, class: '12A5' },
	{ id: 3, name: 'Lê Khánh Linh', score: 7.2, class: '12A6' },
	{ id: 4, name: 'Phạm Đức Minh', score: 9.1, class: '12A1' },
];

const filters = [
	{ value: 'all', label: 'Tất cả' },
    { value: 'outstanding', label: 'Xuất sắc · > 9' },
	{ value: 'excellent', label: 'Giỏi · ≥ 8' },
    { value: 'passed', label: 'Đạt · 5 - < 8' },
	{ value: 'failed', label: 'Trượt · < 5' },
];

const StudentItem = ({ student, onDelete }) => {
	const { id, name, score, class: studentClass } = student;
	const result = score > 9 ? 'Xuất sắc' : score >= 8 ? 'Giỏi' : score < 5 ? 'Trượt' : 'Đạt';
	const resultClass = score > 9 ? 'outstanding' : score >= 8 ? 'excellent' : score < 5 ? 'failed' : 'passed';

	return (
		<tr>
			<td className="student-id">{id}</td>
			<td className="student-name">{name}</td>
			<td><span className="class-code">{studentClass}</span></td>
			<td className="score-cell"><span className="score-value">{score.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</span></td>
			<td><span className={`result-badge ${resultClass}`}>{result}</span></td>
			<td className="action-cell">
				<button className="delete-button" type="button" onClick={() => onDelete(id)} aria-label={`Xóa ${name}`}>
					Xóa
				</button>
			</td>
		</tr>
	);
};

const StudentList = ({ students, onDelete }) => (
	<div className="table-wrap">
		<table>
			<thead>
				<tr>
					<th scope="col">Mã SV</th>
					<th scope="col">Họ và tên</th>
					<th scope="col">Lớp</th>
					<th scope="col">Điểm</th>
					<th scope="col">Xếp loại</th>
					<th scope="col"><span className="visually-hidden">Thao tác</span></th>
				</tr>
			</thead>
			<tbody>
				{students.length > 0 ? students.map((student) => (
					<StudentItem key={student.id} student={student} onDelete={onDelete} />
				)) : (
					<tr>
						<td className="empty-state" colSpan="6">Không có sinh viên phù hợp với sinh viên bạn đang tìm kiếm.</td>
					</tr>
				)}
			</tbody>
		</table>
	</div>
);

const App = () => {
	const [students, setStudents] = useState(initialStudents);
	const [filter, setFilter] = useState('all');
	const [name, setName] = useState('');
	const [score, setScore] = useState('');
	const [studentClass, setStudentClass] = useState('');
	const [error, setError] = useState('');

	const filteredStudents = students.filter(({ score: studentScore }) => {
    if (filter === 'outstanding') return studentScore > 9;
		if (filter === 'excellent') return studentScore >= 8;
		if (filter === 'failed') return studentScore < 5;
		if (filter === 'passed') return studentScore >= 5 && studentScore < 8;
		return true;
	});
	const average = students.length
		? students.reduce((total, student) => total + student.score, 0) / students.length
		: 0;

	const handleAdd = (event) => {
		event.preventDefault();
		const trimmedName = name.trim();
		const trimmedClass = studentClass.trim();
		const numericScore = Number(score);

		if (!trimmedName || !trimmedClass || score.trim() === '') {
			setError('Vui lòng nhập đầy đủ họ tên, điểm số và lớp.');
			return;
		}
		if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 10) {
			setError('Giới hạn điểm số từ 0 đến 10.');
			return;
		}

		setStudents((currentStudents) => [
			...currentStudents,
			{
				id: currentStudents.length
					? Math.max(...currentStudents.map(({ id: currentId }) => currentId)) + 1
					: 1,
				name: trimmedName,
				score: numericScore,
				class: trimmedClass,
			},
		]);
		setName('');
		setScore('');
		setStudentClass('');
		setError('');
	};

	const handleDelete = (studentId) => {
		setStudents((currentStudents) => currentStudents.filter(({ id }) => id !== studentId));
	};

	return (
		<main className="app-shell">
			<header className="topbar">
				<a className="brand" href="/" aria-label="Sổ điểm, trang chủ">
					<span className="brand-mark" aria-hidden="true">S</span>
					<span>Sổ điểm<span className="brand-period">.</span></span>
				</a>
				<span className="topbar-note">QUẢN LÝ HỌC TẬP</span>
			</header>

			<div className="workspace">
				<section className="page-heading">
					<div>
						<p className="eyebrow">NĂM HỌC 2025 — 2026 <span>·</span> HỌC KỲ I</p>
						<h1>Bảng điểm sinh viên</h1>
						<p className="page-subtitle">Theo dõi kết quả và quản lý danh sách lớp học.</p>
					</div>
					<div className="term-chip"><span className="live-dot" /> Đang cập nhật</div>
				</section>

				<section className="summary" aria-label="Thống kê lớp học">
					<article className="summary-item">
						<span className="summary-label">Tổng sinh viên</span>
						<strong>{students.length}</strong>
						<span className="summary-caption">trong danh sách</span>
					</article>
					<article className="summary-item average-summary">
						<span className="summary-label">Điểm trung bình</span>
						<strong>{average.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
						<span className="summary-caption">trên thang điểm 10</span>
					</article>
					<article className="summary-item">
						<span className="summary-label">Sinh viên giỏi</span>
						<strong>{students.filter(({ score: studentScore }) => studentScore >= 8).length}</strong>
						<span className="summary-caption">điểm từ 8 trở lên</span>
					</article>
					<article className="summary-item">
						<span className="summary-label">Sinh viên xuất sắc</span>
						<strong>{students.filter(({ score: studentScore }) => studentScore > 9).length}</strong>
						<span className="summary-caption">điểm trên 9</span>
					</article>
				</section>

				<section className="content-grid">
					<section className="roster-panel" aria-labelledby="roster-title">
						<div className="panel-heading">
							<div>
								<p className="section-kicker">DANH SÁCH LỚP</p>
								<h2 id="roster-title">Sinh viên <span className="count-chip">{filteredStudents.length}</span></h2>
							</div>
						</div>
						<div className="filter-row" role="group" aria-label="Lọc danh sách sinh viên">
							{filters.map(({ value, label }) => (
								<button
									className={`filter-button ${filter === value ? 'active' : ''}`}
									key={value}
									type="button"
									aria-pressed={filter === value}
									onClick={() => setFilter(value)}
								>
									{label}
								</button>
							))}
						</div>
						<StudentList students={filteredStudents} onDelete={handleDelete} />
						<p className="table-footnote">Hiển thị {filteredStudents.length} / {students.length} sinh viên</p>
					</section>

					<aside className="form-panel" aria-labelledby="form-title">
						<div className="form-heading">
							<span className="form-icon" aria-hidden="true">+</span>
							<div>
								<p className="section-kicker">HỒ SƠ MỚI</p>
								<h2 id="form-title">Thêm sinh viên</h2>
							</div>
						</div>
						<form onSubmit={handleAdd} noValidate>
							<label htmlFor="student-name">Họ và tên</label>
							<input
								id="student-name"
								type="text"
								placeholder="Ví dụ: Nguyễn Minh Anh"
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
							<div className="field-pair">
								<div>
									<label htmlFor="student-score">Điểm số</label>
									<input
										id="student-score"
										type="number"
										min="0"
										max="10"
										step="0.1"
										placeholder="0 — 10"
										value={score}
										onChange={(event) => setScore(event.target.value)}
									/>
								</div>
								<div>
									<label htmlFor="student-class">Lớp</label>
									<input
										id="student-class"
										type="text"
										placeholder="Ví dụ: 12A1"
										value={studentClass}
										onChange={(event) => setStudentClass(event.target.value)}
									/>
								</div>
							</div>
							{error && <p className="form-error" role="alert">{error}</p>}
							<button className="submit-button" type="submit">Thêm vào danh sách <span aria-hidden="true">→</span></button>
						</form>
						<p className="form-hint">Điểm hợp lệ nằm trong khoảng từ 0 đến 10.</p>
					</aside>
				</section>
				<footer className="page-footer">SỔ ĐIỂM <span>·</span> QUẢN LÝ KẾT QUẢ HỌC TẬP</footer>
			</div>
		</main>
	);
};

export default App;
