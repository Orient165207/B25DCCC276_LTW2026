import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LETTERS, LEVELS, MILESTONES, PRIZES, TIME_PER_QUESTION, formatMoney } from './data'
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

function HomePage({ playerName, setPlayerName }) {
  const navigate = useNavigate()

  function startGame(event) {
    event.preventDefault()
    if (!playerName.trim()) return
    navigate('/play')
  }

  return (
    <section className="home-hero">
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <div className="hero-copy">
        <span className="eyebrow"><span className="live-dot" /> SÂN CHƠI KIẾN THỨC</span>
        <h1>Ai là<br /><span>triệu phú?</span></h1>
        <p>15 câu hỏi. 30 giây cho mỗi câu. Hãy chinh phục đỉnh cao tri thức và giành giải thưởng 250 triệu đồng!</p>
        <form className="start-form" onSubmit={startGame}>
          <label htmlFor="player-name">TÊN NGƯỜI CHƠI</label>
          <input
            id="player-name"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Nhập tên của bạn..."
            maxLength={40}
            autoComplete="name"
          />
          <button className="primary-button" type="submit" disabled={!playerName.trim()}>
            Bắt đầu <span aria-hidden="true">→</span>
          </button>
        </form>
        <div className="home-rules">
          <span>15 câu hỏi</span><span>30 giây / câu</span><span>Mốc an toàn: 5 · 10 · 15</span>
        </div>
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

function AnswerButton({ answer, index, status, selectedAnswer, correctAnswer, onSelect }) {
  const isSelected = selectedAnswer === index
  const isRevealed = status === 'revealed'
  let answerState = ''

  if (isSelected && status === 'locked') answerState = ' answer-locked'
  if (isRevealed && isSelected) answerState = selectedAnswer === correctAnswer ? ' answer-correct' : ' answer-wrong'
  if (isRevealed && index === correctAnswer) answerState = ' answer-correct'

  return (
    <button
      className={`game-answer${answerState}`}
      type="button"
      onClick={() => onSelect(index)}
      disabled={status !== 'answering'}
    >
      <span className="game-answer-letter">{LETTERS[index]}</span>
      <span>{answer}</span>
      {isRevealed && index === correctAnswer && <span className="answer-check" aria-label="Đáp án đúng">✓</span>}
    </button>
  )
}

function QuestionCard({ question, questionNumber, status, selectedAnswer, onSelect }) {
  return (
    <section className="game-question-card">
      <div className="game-question-heading">
        <span className="eyebrow">CÂU HỎI {String(questionNumber).padStart(2, '0')}</span>
        <span className="question-progress">Câu <strong>{questionNumber}</strong> / 15</span>
      </div>
      <h1>{question.question}</h1>
      <div className="game-answers">
        {question.options.map((answer, index) => (
          <AnswerButton
            key={`${question.id}-${index}`}
            answer={answer}
            index={index}
            status={status}
            selectedAnswer={selectedAnswer}
            correctAnswer={question.answer}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}

function Timer({ seconds }) {
  const urgent = seconds <= 10
  return (
    <div className={`game-timer${urgent ? ' timer-urgent' : ''}`} role="timer" aria-label={`Còn ${seconds} giây`}>
      <span className="timer-label">THỜI GIAN CÒN LẠI</span>
      <strong>00:{String(seconds).padStart(2, '0')}</strong>
      <span className="timer-track"><span style={{ width: `${(seconds / TIME_PER_QUESTION) * 100}%` }} /></span>
    </div>
  )
}

function MoneyLadder({ currentQuestion }) {
  return (
    <aside className="money-ladder" aria-label="Thang tiền thưởng">
      <div className="ladder-heading"><span>✦</span> THANG TIỀN THƯỞNG</div>
      <ol>
        {PRIZES.map((prize, index) => {
          const questionNumber = index + 1
          const isCurrent = questionNumber === currentQuestion
          const isMilestone = MILESTONES.includes(questionNumber)
          return (
            <li
              className={`ladder-step${isCurrent ? ' ladder-current' : ''}${isMilestone ? ' ladder-milestone' : ''}`}
              key={questionNumber}
            >
              <span className="ladder-number">{String(questionNumber).padStart(2, '0')}</span>
              <span className="ladder-amount">{formatMoney(prize)}</span>
              {isMilestone && <span className="milestone-star" aria-label="Mốc an toàn">★</span>}
            </li>
          )
        }).reverse()}
      </ol>
      <p className="ladder-legend"><span>★</span> Mốc an toàn</p>
    </aside>
  )
}

function getPrize(correctCount, reason) {
  if (reason === 'quit') return correctCount > 0 ? PRIZES[correctCount - 1] : 0

  const passedMilestones = MILESTONES.filter((milestone) => milestone <= correctCount)
  if (passedMilestones.length === 0) return 0
  return PRIZES[passedMilestones[passedMilestones.length - 1] - 1]
}

function PlayPage({ questions, loading, error, playerName }) {
  const navigate = useNavigate()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(TIME_PER_QUESTION)
  const remainingSecondsRef = useRef(TIME_PER_QUESTION)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [status, setStatus] = useState('answering')
  const [endReason, setEndReason] = useState('')
  const question = questions[questionIndex]
  const hasQuestion = Boolean(question)
  const correctAnswer = question?.answer
  const questionNumber = questionIndex + 1

  const finishGame = useCallback((reason, totalCorrect) => {
    navigate('/result', {
      replace: true,
      state: {
        playerName,
        correctCount: totalCorrect,
        prize: reason === 'won' ? PRIZES[PRIZES.length - 1] : getPrize(totalCorrect, reason),
        reason,
      },
    })
  }, [navigate, playerName])

  useEffect(() => {
    if (status !== 'answering' || !hasQuestion) return undefined

    const timerId = window.setInterval(() => {
      if (remainingSecondsRef.current <= 1) {
        window.clearInterval(timerId)
        remainingSecondsRef.current = 0
        setRemainingSeconds(0)
        setEndReason('timeout')
        setStatus('revealed')
        return
      }

      remainingSecondsRef.current -= 1
      setRemainingSeconds(remainingSecondsRef.current)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [hasQuestion, questionIndex, status])

  useEffect(() => {
    if (status !== 'locked' || !hasQuestion) return undefined
    const revealId = window.setTimeout(() => setStatus('revealed'), 1000)
    return () => window.clearTimeout(revealId)
  }, [hasQuestion, status])

  useEffect(() => {
    if (status !== 'revealed' || !hasQuestion) return undefined
    const resultId = window.setTimeout(() => {
      if (endReason) {
        finishGame(endReason, correctCount)
        return
      }

      if (selectedAnswer !== correctAnswer) {
        finishGame('wrong', correctCount)
        return
      }

      const nextCorrectCount = correctCount + 1
      if (questionIndex === PRIZES.length - 1) {
        finishGame('won', nextCorrectCount)
        return
      }

      setCorrectCount(nextCorrectCount)
      setQuestionIndex((index) => index + 1)
      setSelectedAnswer(null)
      remainingSecondsRef.current = TIME_PER_QUESTION
      setRemainingSeconds(TIME_PER_QUESTION)
      setStatus('answering')
    }, 2000)

    return () => window.clearTimeout(resultId)
  }, [correctAnswer, correctCount, endReason, finishGame, hasQuestion, questionIndex, selectedAnswer, status])

  function selectAnswer(index) {
    if (status !== 'answering') return
    setSelectedAnswer(index)
    setStatus('locked')
  }

  if (!playerName.trim()) return <Navigate to="/" replace />
  if (loading) return <div className="state-message" role="status"><span className="loader" /> Đang tải câu hỏi...</div>
  if (error) return <div className="state-message error-message" role="alert"><strong>Không tải được câu hỏi</strong><span>{error}</span></div>
  if (!hasQuestion || !question) return <NotFoundPage message="Không có câu hỏi để bắt đầu" />

  return (
    <section className="game-page">
      <div className="game-topline">
        <div><span className="eyebrow">NGƯỜI CHƠI</span><strong>{playerName}</strong></div>
        <Timer seconds={remainingSeconds} />
      </div>
      <div className="game-board">
        <div className="game-main">
          <QuestionCard
            question={question}
            questionNumber={questionNumber}
            status={status}
            selectedAnswer={selectedAnswer}
            onSelect={selectAnswer}
          />
          <p className={`game-status game-status-${status}`} aria-live="polite">
            {status === 'answering' && 'Hãy chọn một đáp án.'}
            {status === 'locked' && 'Đáp án đã được chốt...'}
            {status === 'revealed' && (endReason === 'timeout' ? 'Hết giờ!' : selectedAnswer === question.answer ? 'Chính xác!' : 'Rất tiếc, bạn đã trả lời sai.')}
          </p>
        </div>
        <MoneyLadder currentQuestion={questionNumber} />
      </div>
    </section>
  )
}

function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state

  if (!result) return <Navigate to="/" replace />

  const messages = {
    won: ['Chúc mừng!', 'Bạn đã trở thành triệu phú'],
    wrong: ['Rất tiếc!', 'Bạn đã trả lời sai'],
    timeout: ['Hết giờ!', 'Thời gian trả lời đã kết thúc'],
    quit: ['Bạn đã dừng cuộc chơi', 'Hẹn gặp lại ở thử thách tiếp theo'],
  }
  const [title, subtitle] = messages[result.reason] || messages.wrong

  return (
    <section className="result-page">
      <div className={`result-card result-${result.reason}`}>
        <span className="result-medal">{result.reason === 'won' ? '♛' : result.reason === 'timeout' ? '◷' : '✦'}</span>
        <span className="eyebrow">KẾT QUẢ LƯỢT CHƠI</span>
        <h1>{title}</h1>
        <p className="result-subtitle">{subtitle}</p>
        <div className="result-prize">
          <span>TIỀN THƯỞNG NHẬN ĐƯỢC</span>
          <strong>{formatMoney(result.prize)}</strong>
        </div>
        <div className="result-details">
          <div><span>NGƯỜI CHƠI</span><strong>{result.playerName}</strong></div>
          <div><span>SỐ CÂU TRẢ LỜI ĐÚNG</span><strong>{result.correctCount} / 15</strong></div>
        </div>
        <div className="result-actions">
          <button className="primary-button" type="button" onClick={() => navigate('/play', { replace: true })}>
            Chơi lại <span aria-hidden="true">↻</span>
          </button>
          <button className="result-home-button" type="button" onClick={() => navigate('/', { replace: true })}>Về trang chủ</button>
        </div>
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
  const [playerName, setPlayerName] = useState('')

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
        <Route index element={<HomePage playerName={playerName} setPlayerName={setPlayerName} />} />
        <Route path="play" element={<PlayPage questions={questions} loading={loading} error={error} playerName={playerName} />} />
        <Route path="result" element={<ResultPage />} />
        <Route path="history" element={<PlaceholderPage title="Lịch sử các lượt chơi" eyebrow="SẮP RA MẮT" />} />
        <Route path="questions" element={<QuestionsPage questions={questions} loading={loading} error={error} />} />
        <Route path="questions/:id" element={<QuestionDetailPage questions={questions} loading={loading} error={error} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
