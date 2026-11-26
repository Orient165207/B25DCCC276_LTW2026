import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [storedTheme, setTheme] = useLocalStorage('ltw_bongda_theme', 'light');
  // Phòng khi giá trị lưu bị sửa linh tinh
  const theme = storedTheme === 'dark' ? 'dark' : 'light';

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải dùng bên trong ThemeProvider');
  }
  return context;
}

export default ThemeContext;
