import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { LETTERS, LEVELS } from './data'
import './App.css'

function Layout({ questions, loading }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Ai là triệu phú - Trang chủ">
          <span className="brand-mark">?</span>
          <span className="brand-name">AI LÀ TRIỆU PHÚ</span>
        </Link>
        <span className="edition-tag"><span className="live-dot" /> THỬ THÁCH KIẾN THỨC</span>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <p className="nav-caption">MENU CHÍNH</p>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon">⌂</span> Trang chủ
            </NavLink>
            <NavLink to="/questions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon">▤</span> Ngân hàng câu hỏi
              <span className="nav-count">{loading ? '…' : questions.length}</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon">◷</span> Lịch sử
            </NavLink>
          </nav>
          <div className="sidebar-bottom">
            <span className="sidebar-star">✦</span>
            <p>Sẵn sàng thử sức?</p>
            <span>15 câu hỏi · 3 cấp độ</span>
          </div>
        </aside>

        <main className="page-content">
          <Outlet />
          <footer className="page-footer">
            <span>AI LÀ TRIỆU PHÚ <span className="footer-separator">/</span> WEB EDITION</span>
            <span>HỌC HỎI · THỬ THÁCH · CHINH PHỤC</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <section className="home-hero">
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <div className="hero-copy">
        <span className="eyebrow"><span className="live-dot" /> SÂN CHƠI KIẾN THỨC</span>
        <h1>Ai là<br /><span>triệu phú?</span></h1>
        <p>15 câu hỏi. 3 nấc thử thách. Hãy xem bạn có thể đi được bao xa!</p>
        <Link className="primary-button" to="/questions">Khám phá câu hỏi <span aria-hidden="true">→</span></Link>
        <div className="hero-stats">
          <div><strong>15</strong><span>CÂU HỎI</span></div>
          <div><strong>03</strong><span>CẤP ĐỘ</span></div>
          <div><strong>250M</strong><span>GIẢI THƯỞNG CAO NHẤT</span></div>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-glow" />
        <div className="prize-ring ring-back" />
        <div className="prize-ring ring-front" />
        <div className="prize-core"><span>?</span></div>
        <span className="spark spark-a">✦</span><span className="spark spark-b">✧</span>
        <span className="spark spark-c">✦</span><span className="spark spark-d">✧</span>
      </div>
    </section>
  )
}

function QuestionsPage({ questions, loading, error }) {
  const [level, setLevel] = useState('all')
  const [search, setSearch] = useState('')
  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('vi')
    return questions.filter((question) => {
      const matchesLevel = level === 'all' || question.level === Number(level)
      const matchesSearch = !normalizedSearch || question.question.toLocaleLowerCase('vi').includes(normalizedSearch)
      return matchesLevel && matchesSearch
    })
  }, [level, questions, search])

  return (
    <section className="content-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THƯ VIỆN KIẾN THỨC</span>
          <h1>Ngân hàng câu hỏi</h1>
          <p>Ôn tập và khám phá những thử thách đang chờ bạn.</p>
        </div>
        <div className="heading-emblem" aria-hidden="true">Q<span>?</span></div>
      </div>

      <div className="question-panel">
        <div className="panel-toolbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo nội dung câu hỏi..."
              aria-label="Tìm kiếm câu hỏi"
            />
          </label>
          <label className="filter-select">
            <span>MỨC ĐỘ</span>
            <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Lọc theo mức độ">
              <option value="all">Tất cả mức độ</option>
              <option value="1">Dễ</option>
              <option value="2">Trung bình</option>
              <option value="3">Khó</option>
            </select>
          </label>
        </div>

        <div className="table-meta">
          <span>DANH SÁCH CÂU HỎI</span>
          <span>Có <strong>{filteredQuestions.length}</strong> câu hỏi</span>
        </div>

        {loading ? (
          <div className="state-message" role="status"><span className="loader" /> Đang tải câu hỏi...</div>
        ) : error ? (
          <div className="state-message error-message" role="alert">
            <strong>Không tải được câu hỏi</strong>
            <span>{error}</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="state-message">Không tìm thấy câu hỏi phù hợp.</div>
        ) : (
          <div className="table-scroll">
            <table className="question-table">
              <thead>
                <tr><th>STT</th><th>MỨC ĐỘ</th><th>CÂU HỎI</th><th aria-label="Chi tiết" /></tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id}>
                    <td className="question-number">{String(question.id).padStart(2, '0')}</td>
                    <td><span className={`level-badge level-${question.level}`}>{LEVELS[question.level]}</span></td>
                    <td><Link className="question-link" to={`/questions/${question.id}`}>{question.question}</Link></td>
                    <td><Link className="row-arrow" to={`/questions/${question.id}`} aria-label={`Xem câu hỏi ${question.id}`}>↗</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="section-note">Chọn một câu hỏi để xem chi tiết và đáp án chính xác.</p>
    </section>
  )
}

function QuestionDetailPage({ questions, loading, error }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const questionId = Number(id)
  const question = Number.isInteger(questionId) ? questions.find((item) => item.id === questionId) : undefined

  if (loading) return <div className="state-message detail-state" role="status"><span className="loader" /> Đang tải câu hỏi...</div>
  if (error) return <div className="state-message error-message detail-state" role="alert"><strong>Không tải được câu hỏi</strong><span>{error}</span></div>
  if (!question) return <NotFoundPage message="Không tìm thấy câu hỏi" />

  return (
    <section className="content-section">
      <button className="back-button" type="button" onClick={() => navigate(-1)}>← <span>Quay lại</span></button>
      <div className="detail-card">
        <div className="detail-topline">
          <span className="eyebrow">CHI TIẾT CÂU HỎI</span>
          <span className={`level-badge level-${question.level}`}>{LEVELS[question.level]}</span>
        </div>
        <div className="detail-number">CÂU HỎI SỐ <strong>{question.id}</strong></div>
        <h1>{question.question}</h1>
        <div className="answer-list">
          {question.options.map((option, index) => {
            const isCorrect = index === question.answer
            return (
              <div className={`answer-option${isCorrect ? ' correct-answer' : ''}`} key={`${question.id}-${index}`}>
                <span className="answer-letter">{LETTERS[index]}.</span>
                <span className="answer-text">{option}</span>
                {isCorrect && <span className="correct-label">ĐÁP ÁN ĐÚNG</span>}
              </div>
            )
          })}
        </div>
        <div className="answer-confirmation"><span>✓</span> Đáp án chính xác được đánh dấu màu xanh.</div>
      </div>
    </section>
  )
}

function PlaceholderPage({ title, eyebrow }) {
  return (
    <section className="placeholder-card">
      <span className="eyebrow">{eyebrow}</span>
      <div className="placeholder-icon">✦</div>
      <h1>{title}</h1>
      <p>Mục này sẽ được hoàn thiện trong các phần tiếp theo của bài thực hành.</p>
      <Link className="secondary-button" to="/questions">Đến ngân hàng câu hỏi <span>→</span></Link>
    </section>
  )
}

function NotFoundPage({ message = '404 — Không tìm thấy trang' }) {
  return (
    <section className="placeholder-card not-found-card">
      <span className="eyebrow">ÔI, CÓ VẺ BẠN ĐI LẠC</span>
      <div className="not-found-code">404</div>
      <h1>{message}</h1>
      <p>Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link className="secondary-button" to="/">← Về trang chủ</Link>
    </section>
  )
}

export default function App() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadQuestions() {
      setLoading(true)
      setError('')
      try {
        const response = await axios.get('/data/questions.json', { signal: controller.signal })
        setQuestions(response.data)
      } catch (requestError) {
        if (axios.isCancel(requestError)) return
        setError(requestError.message || 'Vui lòng thử tải lại trang.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadQuestions()
    return () => controller.abort()
  }, [])

  return (
    <Routes>
      <Route element={<Layout questions={questions} loading={loading} />}>
        <Route index element={<HomePage />} />
        <Route path="play" element={<PlaceholderPage title="Màn hình chơi" eyebrow="SẮP RA MẮT" />} />
        <Route path="result" element={<PlaceholderPage title="Kết quả lượt chơi" eyebrow="SẮP RA MẮT" />} />
        <Route path="history" element={<PlaceholderPage title="Lịch sử các lượt chơi" eyebrow="SẮP RA MẮT" />} />
        <Route path="questions" element={<QuestionsPage questions={questions} loading={loading} error={error} />} />
        <Route path="questions/:id" element={<QuestionDetailPage questions={questions} loading={loading} error={error} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
