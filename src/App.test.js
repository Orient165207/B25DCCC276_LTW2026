import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders student IDs in the roster', () => {
  render(<App />);
  expect(screen.getByRole('columnheader', { name: 'Mã SV' })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
});

test('assigns the next ID when adding a student', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Nguyễn Minh Anh' } });
  fireEvent.change(screen.getByLabelText('Điểm số'), { target: { value: '8' } });
  fireEvent.change(screen.getByLabelText('Lớp'), { target: { value: '12A2' } });
  fireEvent.click(screen.getByRole('button', { name: /Thêm vào danh sách/i }));

  expect(screen.getByRole('cell', { name: '5' })).toBeInTheDocument();
});
