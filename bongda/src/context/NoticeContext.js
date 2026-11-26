import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const NoticeContext = createContext(null);

export function NoticeProvider({ children }) {
  // Nội dung thông báo là state riêng của Provider,
  // không đưa vào context nên component dùng useNotice() không render lại khi nó đổi.
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((text) => {
    // Tạo object mới mỗi lần gọi để luôn đếm lại 3 giây,
    // kể cả khi nội dung giống lần trước
    setNotice({ text });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <NoticeContext.Provider value={showNotice}>
      {notice && (
        <div role="status" className="notice">
          {notice.text}
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const showNotice = useContext(NoticeContext);
  if (!showNotice) {
    throw new Error('useNotice phải dùng bên trong NoticeProvider');
  }
  return showNotice;
}

export default NoticeContext;
