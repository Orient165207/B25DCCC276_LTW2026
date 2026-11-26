import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch (err) {
      // localStorage không dùng được hoặc JSON hỏng: dùng giá trị khởi tạo
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // bỏ qua lỗi ghi (đầy bộ nhớ, chế độ riêng tư...)
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
