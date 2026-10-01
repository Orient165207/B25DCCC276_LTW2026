import React, { useState } from 'react';

// Component cháu - hiển thị 1 sinh viên
const StudentItem = ({ name, score }) => {
  return (
    <li>
      {`Sinh viên: ${name} - Điểm: ${score}`}
    </li>
  );
};

// Component con - nhận danh sách qua props, render bằng .map()
const StudentList = ({ students }) => {
  return (
    <ul>
      {students.map((student, index) => (
        <StudentItem
          key={index}
          name={student.name}
          score={student.score}
        />
      ))}
    </ul>
  );
};

// Component cha - quản lý state, form nhập liệu
const App = () => {
  const [students, setStudents] = useState([
    { name: 'Nguyễn Văn A', score: 8.5 },
    { name: 'Trần Thị B', score: 9.0 },
  ]);

  const [newName, setNewName] = useState('');
  const [newScore, setNewScore] = useState('');

  const handleAddStudent = () => {
    if (!newName || !newScore) return;

    const newStudent = { name: newName, score: newScore };
    setStudents([...students, newStudent]);

    setNewName('');
    setNewScore('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quản lý Điểm Sinh viên</h1>

      <div>
        <input
          type="text"
          placeholder="Tên sinh viên"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Điểm số"
          value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
        />
        <button onClick={handleAddStudent}>Thêm sinh viên</button>
      </div>

      <StudentList students={students} />
    </div>
  );
};

export default App;