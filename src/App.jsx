import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LETTERS, LEVELS, MILESTONES, PRIZES, TIME_PER_QUESTION, formatMoney } from './data'
import './App.css'

const HISTORY_STORAGE_KEY = 'ltw_trieuphu_history'
const PAGE_TITLE = 'Ai là triệu phú'
const shuffle = (items) => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = currentItem
  }
  return shuffled
}

const Layout = ({ questions, loading }) => {
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

const HomePage = ({ playerName, setPlayerName, history }) => {
  const navigate = useNavigate()
  const bestRecord = history.reduce((best, record) => record.prize > (best?.prize ?? -1) ? record : best, null)

  const startGame = (event) => {
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
        {bestRecord && (
          <div className="home-record">
            <span>♛</span>
            <div><small>KỶ LỤC NGƯỜI CHƠI</small><strong>{formatMoney(bestRecord.prize)} <em>— {bestRecord.name}</em></strong></div>
          </div>
        )}
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

const AnswerButton = ({ answer, index, status, selectedAnswer, correctAnswer, onSelect, hidden }) => {
  const isSelected = selectedAnswer === index
  const isRevealed = status === 'revealed'
  let answerState = ''

  if (isSelected && status === 'locked') answerState = ' answer-locked'
  if (isRevealed && isSelected) answerState = selectedAnswer === correctAnswer ? ' answer-correct' : ' answer-wrong'
  if (isRevealed && index === correctAnswer) answerState = ' answer-correct'

  return (
    <button
      className={`game-answer${hidden ? ' game-answer-hidden' : ''}${answerState}`}
      type="button"
      onClick={() => onSelect(index)}
      disabled={status !== 'answering' || hidden}
    >
      <span className="game-answer-letter">{hidden ? '' : LETTERS[index]}</span>
      <span>{hidden ? '' : answer}</span>
      {isRevealed && index === correctAnswer && <span className="answer-check" aria-label="Đáp án đúng">✓</span>}
    </button>
  )
}

const QuestionCard = ({ question, questionNumber, status, selectedAnswer, onSelect, hiddenOptions, isAnswering, lifelines }) => {
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
            hidden={hiddenOptions.includes(index)}
          />
        ))}
      </div>
      {isAnswering && <Lifelines {...lifelines} />}
    </section>
  )
}

const Timer = ({ seconds }) => {
  const urgent = seconds <= 10
  return (
    <div className={`game-timer${urgent ? ' timer-urgent' : ''}`} role="timer" aria-label={`Còn ${seconds} giây`}>
      <span className="timer-label">THỜI GIAN CÒN LẠI</span>
      <strong>00:{String(seconds).padStart(2, '0')}</strong>
      <span className="timer-track"><span style={{ width: `${(seconds / TIME_PER_QUESTION) * 100}%` }} /></span>
    </div>
  )
}

const MoneyLadder = ({ currentQuestion }) => {
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

const getPrize = (correctCount, reason) => {
  if (reason === 'quit') return correctCount > 0 ? PRIZES[correctCount - 1] : 0

  const passedMilestones = MILESTONES.filter((milestone) => milestone <= correctCount)
  if (passedMilestones.length === 0) return 0
  return PRIZES[passedMilestones[passedMilestones.length - 1] - 1]
}

const makeAudienceChart = (correctAnswer, hiddenOptions) => {
  const percentages = [0, 0, 0, 0]
  const visibleWrongOptions = [0, 1, 2, 3].filter((index) => index !== correctAnswer && !hiddenOptions.includes(index))
  const correctPercentage = Math.floor(Math.random() * 31) + 40
  percentages[correctAnswer] = correctPercentage

  const remaining = 100 - correctPercentage
  const weights = visibleWrongOptions.map(() => Math.random())
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const allocated = visibleWrongOptions.map((index, position) => {
    const value = totalWeight === 0 ? remaining / visibleWrongOptions.length : (remaining * weights[position]) / totalWeight
    const share = Math.floor(value)
    percentages[index] = share
    return { index, remainder: value - share }
  })
  const unallocated = remaining - allocated.reduce((sum, share) => sum + percentages[share.index], 0)
  allocated.sort((left, right) => right.remainder - left.remainder)
  for (let index = 0; index < unallocated; index += 1) {
    percentages[allocated[index % allocated.length].index] += 1
  }

  return percentages
}

const PlayPage = ({ questions, loading, error, playerName, onGameFinish }) => {
  const navigate = useNavigate()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(TIME_PER_QUESTION)
  const remainingSecondsRef = useRef(TIME_PER_QUESTION)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [status, setStatus] = useState('answering')
  const [endReason, setEndReason] = useState('')
  const [usedLifelines, setUsedLifelines] = useState({ fiftyFifty: false, audience: false })
  const [hiddenOptions, setHiddenOptions] = useState([])
  const [audienceResults, setAudienceResults] = useState(null)
  const question = questions[questionIndex]
  const hasQuestion = Boolean(question)
  const correctAnswer = question?.answer
  const questionNumber = questionIndex + 1

  const finishGame = useCallback((reason, totalCorrect) => {
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: playerName,
      prize: reason === 'won' ? PRIZES[PRIZES.length - 1] : getPrize(totalCorrect, reason),
      correctCount: totalCorrect,
      playedAt: new Date().toLocaleString('vi-VN'),
    }
    onGameFinish(record)
    navigate('/result', {
      replace: true,
      state: {
        playerName: record.name,
        correctCount: totalCorrect,
        prize: record.prize,
        reason,
      },
    })
  }, [navigate, onGameFinish, playerName])

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
      setUsedLifelines({ fiftyFifty: false, audience: false })
      setHiddenOptions([])
      setAudienceResults(null)
      remainingSecondsRef.current = TIME_PER_QUESTION
      setRemainingSeconds(TIME_PER_QUESTION)
      setStatus('answering')
    }, 2000)

    return () => window.clearTimeout(resultId)
  }, [correctAnswer, correctCount, endReason, finishGame, hasQuestion, questionIndex, selectedAnswer, status])

  const selectAnswer = (index) => {
    if (status !== 'answering') return
    if (hiddenOptions.includes(index)) return
    setSelectedAnswer(index)
    setStatus('locked')
  }

  const useFiftyFifty = () => {
    if (status !== 'answering' || usedLifelines.fiftyFifty) return
    const wrongOptions = [0, 1, 2, 3].filter((index) => index !== question.answer)
    const hidden = shuffle(wrongOptions).slice(0, 2)
    setHiddenOptions(hidden)
    setAudienceResults((currentResults) => currentResults ? makeAudienceChart(question.answer, hidden) : currentResults)
    setUsedLifelines((current) => ({ ...current, fiftyFifty: true }))
  }

  const askAudience = () => {
    if (status !== 'answering' || usedLifelines.audience) return
    setAudienceResults(makeAudienceChart(question.answer, hiddenOptions))
    setUsedLifelines((current) => ({ ...current, audience: true }))
  }

  const quitGame = () => {
    if (status === 'answering') finishGame('quit', correctCount)
  }

  useEffect(() => {
    if (status !== 'answering' || !hasQuestion) return undefined
    const handleKeyDown = (event) => {
      const answerIndex = LETTERS.indexOf(event.key.toUpperCase())
      if (answerIndex === -1 || hiddenOptions.includes(answerIndex)) return
      event.preventDefault()
      setSelectedAnswer(answerIndex)
      setStatus('locked')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasQuestion, hiddenOptions, status])

  useEffect(() => {
    if (!hasQuestion || !playerName.trim()) return undefined
    document.title = `Câu ${questionNumber}/15 - ${playerName}`
    return () => {
      document.title = PAGE_TITLE
    }
  }, [hasQuestion, playerName, questionNumber])

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
            hiddenOptions={hiddenOptions}
            isAnswering={status === 'answering'}
            lifelines={{
              useFiftyFifty,
              askAudience,
              quitGame,
              usedLifelines,
            }}
          />
          {audienceResults && status === 'answering' && <AudienceChart percentages={audienceResults} />}
          <p className={`game-status game-status-${status}`} aria-live="polite">
            {status === 'answering' && 'Chọn một đáp án hoặc nhấn phím A, B, C, D.'}
            {status === 'locked' && 'Đáp án đã được chốt...'}
            {status === 'revealed' && (endReason === 'timeout' ? 'Hết giờ!' : selectedAnswer === question.answer ? 'Chính xác!' : 'Rất tiếc, bạn đã trả lời sai.')}
          </p>
          {status === 'answering' && (
            <button className="quit-game-button" type="button" onClick={quitGame}>Dừng cuộc chơi</button>
          )}
        </div>
        <MoneyLadder currentQuestion={questionNumber} />
      </div>
    </section>
  )
}

const Lifelines = ({ useFiftyFifty, askAudience, usedLifelines }) => (
  <div className="lifelines" aria-label="Quyền trợ giúp">
    <span className="lifelines-label">QUYỀN TRỢ GIÚP</span>
    <button
      className="lifeline-button"
      type="button"
      onClick={useFiftyFifty}
      disabled={usedLifelines.fiftyFifty}
      aria-label="50:50"
    >
      <span className="lifeline-icon">½</span>
      <span>50:50</span>
    </button>
    <button
      className="lifeline-button"
      type="button"
      onClick={askAudience}
      disabled={usedLifelines.audience}
      aria-label="Hỏi khán giả"
    >
      <span className="lifeline-icon">▥</span>
      <span>Hỏi khán giả</span>
    </button>
  </div>
)

const AudienceChart = ({ percentages }) => (
  <section className="audience-chart" aria-label="Biểu đồ kết quả hỏi khán giả">
    <div className="audience-chart-heading"><span>▥</span> KHÁN GIẢ BÌNH CHỌN</div>
    {percentages.map((percentage, index) => (
      <div className="audience-row" key={LETTERS[index]}>
        <strong>{LETTERS[index]}</strong>
        <div className="audience-track">
          <div className="audience-bar" style={{ width: `${percentage}%` }} />
        </div>
        <span>{LETTERS[index]}: {percentage}%</span>
      </div>
    ))}
  </section>
)

const readSavedHistory = () => {
  try {
    const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!savedHistory) return { entries: [], error: '' }
    const entries = JSON.parse(savedHistory)
    const hasValidRecords = Array.isArray(entries) && entries.every((record) => (
      record
      && typeof record.id === 'string'
      && typeof record.name === 'string'
      && Number.isFinite(record.prize)
      && Number.isInteger(record.correctCount)
      && typeof record.playedAt === 'string'
    ))
    if (!hasValidRecords) throw new Error('Dữ liệu lịch sử không đúng định dạng.')
    return { entries, error: '' }
  } catch (storageError) {
    console.error('Không thể đọc lịch sử chơi từ localStorage.', storageError)
    return { entries: [], error: 'Không thể đọc lịch sử đã lưu. Hãy xóa dữ liệu lịch sử để tạo mới.' }
  }
}

const HistoryPage = ({ history, historyError, onClearHistory }) => {
  const sortedHistory = [...history].sort((first, second) => second.prize - first.prize)
  const totalPrize = history.reduce((total, record) => total + record.prize, 0)
  const totalCorrect = history.reduce((total, record) => total + record.correctCount, 0)
  const bestPrize = history.reduce((best, record) => Math.max(best, record.prize), 0)

  return (
    <section className="content-section history-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">HÀNH TRÌNH CHINH PHỤC</span>
          <h1>Lịch sử các lượt chơi</h1>
          <p>Mỗi lượt chơi là một dấu mốc trên hành trình trở thành triệu phú.</p>
        </div>
        <div className="heading-emblem" aria-hidden="true">◷</div>
      </div>

      {historyError && (
        <div className="history-error" role="alert">
          <span>{historyError}</span>
          <button className="clear-history-button" type="button" onClick={onClearHistory}>Xóa dữ liệu lỗi</button>
        </div>
      )}
      {history.length > 0 && (
        <>
          <div className="history-stats">
            <div><span>LƯỢT CHƠI</span><strong>{history.length}</strong></div>
            <div><span>SỐ CÂU ĐÚNG</span><strong>{totalCorrect}</strong></div>
            <div><span>KỶ LỤC CAO NHẤT</span><strong>{formatMoney(bestPrize)}</strong></div>
            <div><span>TỔNG TIỀN THƯỞNG</span><strong>{formatMoney(totalPrize)}</strong></div>
          </div>

          <div className="question-panel history-panel">
            <div className="history-panel-heading">
              <span>BẢNG XẾP HẠNG · SẮP XẾP THEO TIỀN THƯỞNG</span>
              <button className="clear-history-button" type="button" onClick={onClearHistory}>Xóa lịch sử</button>
            </div>
            <div className="table-scroll">
              <table className="question-table history-table">
                <thead>
                  <tr><th>#</th><th>NGƯỜI CHƠI</th><th>SỐ CÂU ĐÚNG</th><th>TIỀN THƯỞNG</th><th>THỜI GIAN</th></tr>
                </thead>
                <tbody>
                  {sortedHistory.map((record, index) => (
                    <tr key={record.id}>
                      <td className="question-number">{String(index + 1).padStart(2, '0')}</td>
                      <td className="history-player">{record.name}</td>
                      <td>{record.correctCount} / 15</td>
                      <td className="history-prize">{formatMoney(record.prize)}</td>
                      <td>{record.playedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {history.length === 0 && !historyError && (
        <div className="history-empty">
          <span>◷</span>
          <h2>Chưa có lượt chơi nào</h2>
          <p>Hãy bắt đầu thử thách đầu tiên và thành tích của bạn sẽ xuất hiện tại đây.</p>
          <Link className="secondary-button" to="/">Bắt đầu chơi <span>→</span></Link>
        </div>
      )}
    </section>
  )
}

const ResultPage = () => {
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

const QuestionsPage = ({ questions, loading, error }) => {
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

const QuestionDetailPage = ({ questions, loading, error }) => {
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

const NotFoundPage = ({ message = '404 — Không tìm thấy trang' }) => {
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

const App = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [savedHistory] = useState(readSavedHistory)
  const [history, setHistory] = useState(savedHistory.entries)
  const [historyError, setHistoryError] = useState(savedHistory.error)

  useEffect(() => {
    if (historyError) return
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    } catch (storageError) {
      console.error('Không thể lưu lịch sử chơi vào localStorage.', storageError)
    }
  }, [history, historyError])

  const onGameFinish = useCallback((record) => {
    setHistory((currentHistory) => [...currentHistory, record])
  }, [])

  const clearHistory = useCallback(() => {
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
      setHistory([])
      setHistoryError('')
    } catch (storageError) {
      console.error('Không thể xóa lịch sử chơi khỏi localStorage.', storageError)
      setHistoryError('Không thể xóa lịch sử chơi trên thiết bị này.')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadQuestions = async () => {
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
        <Route index element={<HomePage playerName={playerName} setPlayerName={setPlayerName} history={history} />} />
        <Route path="play" element={<PlayPage questions={questions} loading={loading} error={error} playerName={playerName} onGameFinish={onGameFinish} />} />
        <Route path="result" element={<ResultPage />} />
        <Route path="history" element={<HistoryPage history={history} historyError={historyError} onClearHistory={clearHistory} />} />
        <Route path="questions" element={<QuestionsPage questions={questions} loading={loading} error={error} />} />
        <Route path="questions/:id" element={<QuestionDetailPage questions={questions} loading={loading} error={error} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
