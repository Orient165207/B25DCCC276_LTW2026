import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './store';
import { ThemeProvider } from './context/ThemeContext';
import { NoticeProvider } from './context/NoticeContext';

// Đã bỏ <React.StrictMode> để cột "Số lần render" đếm đúng
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <ThemeProvider>
      <NoticeProvider>
        <App />
      </NoticeProvider>
    </ThemeProvider>
  </Provider>
);
