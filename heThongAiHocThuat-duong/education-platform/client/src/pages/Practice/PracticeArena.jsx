import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiX, FiZap, FiHeart, FiStar, FiRefreshCw, FiHome } from 'react-icons/fi';
import { savePracticeSession } from '../../api/practiceApi';

// ─── Constants ───────────────────────────────────────────────
const POINTS_CORRECT    = 10;
const POINTS_STREAK     = 5;   // bonus khi streak >= 3
const STREAK_THRESHOLD  = 3;
const FEEDBACK_DURATION = 600; // ms hiển thị flash feedback

// ─── Matching Question ────────────────────────────────────────
const MatchingQuestion = ({ question, onAnswer, disabled }) => {
  const opts = typeof question.options === 'string'
    ? JSON.parse(question.options)
    : question.options;

  const leftItems  = opts?.left  || [];
  const rightItems = opts?.right || [];

  const [selLeft,  setSelLeft]  = useState(null);
  const [matched,  setMatched]  = useState({}); // { leftIdx: rightIdx }

  const handleLeft = (i) => {
    if (disabled || matched[i] != null) return;
    setSelLeft(i === selLeft ? null : i);
  };

  const handleRight = (j) => {
    if (disabled) return;
    if (selLeft == null) return;
    // Nếu right đã được match → bỏ qua
    const alreadyUsed = Object.values(matched).includes(j);
    if (alreadyUsed) return;

    const newMatched = { ...matched, [selLeft]: j };
    setMatched(newMatched);
    setSelLeft(null);

    if (Object.keys(newMatched).length === leftItems.length) {
      // Kiểm tra đáp án
      const correctAnswer = typeof question.correct_answer === 'string'
        ? JSON.parse(question.correct_answer)
        : question.correct_answer;
      const pairs = correctAnswer?.pairs || [];
      const isCorrect = pairs.every(([li, ri]) => newMatched[li] === ri);
      onAnswer(isCorrect, newMatched);
    }
  };

  const usedRightIndices = new Set(Object.values(matched));

  return (
    <div className="practice-matching">
      <p className="practice-matching-hint">Bấm vào cột trái rồi cột phải để nối cặp</p>
      <div className="practice-matching-cols">
        <div className="practice-matching-col">
          {leftItems.map((item, i) => (
            <button
              key={i}
              className={`practice-matching-item
                ${selLeft === i ? 'practice-matching-item--selected' : ''}
                ${matched[i] != null ? 'practice-matching-item--paired' : ''}
              `}
              onClick={() => handleLeft(i)}
              disabled={disabled || matched[i] != null}
            >
              {item}
              {matched[i] != null && (
                <span className="practice-matching-arrow"> → {rightItems[matched[i]]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="practice-matching-col">
          {rightItems.map((item, j) => (
            <button
              key={j}
              className={`practice-matching-item
                ${usedRightIndices.has(j) ? 'practice-matching-item--paired' : ''}
                ${selLeft != null && !usedRightIndices.has(j) ? 'practice-matching-item--selectable' : ''}
              `}
              onClick={() => handleRight(j)}
              disabled={disabled || usedRightIndices.has(j)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Per-question Timer Ring ──────────────────────────────────
const TimerRing = ({ timeLeft, maxTime }) => {
  const pct   = timeLeft / maxTime;
  const r     = 22;
  const circ  = 2 * Math.PI * r;
  const dash  = pct * circ;
  const color = pct > 0.5 ? '#16a34a' : pct > 0.25 ? '#d97706' : '#dc2626';

  return (
    <div className="practice-timer-ring" title={`${timeLeft}s`}>
      <svg width={60} height={60}>
        <circle cx={30} cy={30} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
        <circle
          cx={30} cy={30} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dasharray .2s linear, stroke .3s' }}
        />
      </svg>
      <span className="practice-timer-num" style={{ color }}>{timeLeft}</span>
    </div>
  );
};

// ─── Result Screen ────────────────────────────────────────────
const ResultScreen = ({ result, config, onPlayAgain, onHome, saving }) => {
  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const mins = Math.floor(result.duration / 60);
  const secs = result.duration % 60;

  const grade =
    pct >= 90 ? { label: 'Xuất sắc! 🏆', color: '#16a34a' } :
    pct >= 70 ? { label: 'Tốt lắm! 🌟',  color: '#2563eb' } :
    pct >= 50 ? { label: 'Khá ổn 👍',    color: '#d97706' } :
               { label: 'Cố lên! 💪',    color: '#dc2626' };

  return (
    <div className="practice-result-screen">
      <div className="practice-result-card">
        <div className="practice-result-trophy">
          {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚'}
        </div>
        <h2 className="practice-result-grade" style={{ color: grade.color }}>{grade.label}</h2>
        <div className="practice-result-score">
          <span className="practice-result-score-num">{result.score}</span>
          <span className="practice-result-score-label">điểm</span>
        </div>

        <div className="practice-result-stats">
          <div className="practice-result-stat">
            <span className="practice-result-stat-num">{result.total}</span>
            <span>Tổng câu</span>
          </div>
          <div className="practice-result-stat practice-result-stat--correct">
            <span className="practice-result-stat-num">{result.correct}</span>
            <span>Đúng</span>
          </div>
          <div className="practice-result-stat practice-result-stat--wrong">
            <span className="practice-result-stat-num">{result.wrong}</span>
            <span>Sai</span>
          </div>
          <div className="practice-result-stat">
            <span className="practice-result-stat-num">{result.maxStreak}</span>
            <span>Streak</span>
          </div>
        </div>

        <div className="practice-result-meta">
          <span>⏱ Thời gian: {mins > 0 ? `${mins}p ` : ''}{secs}s</span>
          <span>🎯 Độ chính xác: {pct}%</span>
          <span>🏅 Chuỗi dài nhất: {result.maxStreak}</span>
        </div>

        {saving && <p className="practice-result-saving">Đang lưu kết quả...</p>}

        <div className="practice-result-actions">
          <button className="btn btn--outline" onClick={onHome} id="practice-result-home">
            <FiHome size={16} /> Về trang chủ
          </button>
          <button className="btn btn--primary" onClick={onPlayAgain} id="practice-result-replay">
            <FiRefreshCw size={16} /> Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Arena ───────────────────────────────────────────────
const PracticeArena = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const state     = location.state;

  // Redirect nếu không có config
  useEffect(() => {
    if (!state?.questions) navigate('/practice', { replace: true });
  }, [state, navigate]);

  if (!state?.questions) return null;

  const {
    questions, gradeSlug, subjectSlug, gradeName, subjectName,
    chapterId, chapterName, difficulty,
    sessionMin, secPerQ, maxWrong,
  } = state;

  const SESSION_SEC = sessionMin * 60;

  // ─── Game state ───────────────────────────────────────────
  const [phase,     setPhase]     = useState('QUESTION'); // QUESTION | FEEDBACK | DONE
  const [qIndex,    setQIndex]    = useState(0);
  const [sessionSec, setSessionSec] = useState(SESSION_SEC);
  const [qSec,      setQSec]      = useState(secPerQ);
  const [feedback,  setFeedback]  = useState(null); // { correct: bool, explanation }
  const [score,     setScore]     = useState(0);
  const [streak,    setStreak]    = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct,   setCorrect]   = useState(0);
  const [wrong,     setWrong]     = useState(0);
  const [disabled,  setDisabled]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [startTime] = useState(Date.now());

  const sessionRef = useRef(null);
  const qRef       = useRef(null);
  const feedRef    = useRef(null);

  // Refs giữ giá trị mới nhất để dùng trong interval (tránh stale closure)
  const gameStateRef   = useRef({ correct: 0, wrong: 0, score: 0, streak: 0, maxStreak: 0 });
  const endGameRef     = useRef(null);
  const handleAnswerRef = useRef(null);

  const currentQ = questions[qIndex];

  // ─── Game over ────────────────────────────────────────────
  const endGame = useCallback((finalCorrect, finalWrong, finalScore, finalStreak, finalMaxStreak) => {
    clearInterval(sessionRef.current);
    clearInterval(qRef.current);
    clearTimeout(feedRef.current);
    setPhase('DONE');

    const duration = Math.round((Date.now() - startTime) / 1000);

    setSaving(true);
    savePracticeSession({
      gradeSlug, subjectSlug, chapterId,
      difficulty, totalQuestions: finalCorrect + finalWrong,
      correctCount: finalCorrect, wrongCount: finalWrong,
      score: finalScore, maxStreak: finalMaxStreak, durationSeconds: duration,
    }).finally(() => setSaving(false));
  }, [gradeSlug, subjectSlug, chapterId, difficulty, startTime]);

  // Cập nhật refs khi state thay đổi (để interval luôn có giá trị mới nhất)
  useEffect(() => {
    gameStateRef.current = { correct, wrong, score, streak, maxStreak };
  }, [correct, wrong, score, streak, maxStreak]);

  useEffect(() => { endGameRef.current = endGame; }, [endGame]);

  // ─── Handle answer ────────────────────────────────────────
  const handleAnswer = useCallback((isCorrect) => {
    if (disabled || phase !== 'QUESTION') return;
    clearInterval(qRef.current);
    setDisabled(true);

    let newCorrect = correct;
    let newWrong   = wrong;
    let newScore   = score;
    let newStreak  = streak;
    let newMax     = maxStreak;

    if (isCorrect) {
      newStreak  = streak + 1;
      newMax     = Math.max(maxStreak, newStreak);
      newScore   = score + POINTS_CORRECT + (newStreak >= STREAK_THRESHOLD ? POINTS_STREAK : 0);
      newCorrect = correct + 1;
    } else {
      newStreak  = 0;
      newWrong   = wrong + 1;
    }

    setStreak(newStreak);
    setMaxStreak(newMax);
    setScore(newScore);
    setCorrect(newCorrect);
    setWrong(newWrong);

    setFeedback({
      correct: isCorrect,
      explanation: currentQ.explanation || '',
    });
    setPhase('FEEDBACK');

    // Check game over: vượt số lần sai
    if (newWrong >= maxWrong) {
      feedRef.current = setTimeout(() => {
        endGame(newCorrect, newWrong, newScore, newStreak, newMax);
      }, FEEDBACK_DURATION);
      return;
    }

    // Chuyển câu tiếp
    feedRef.current = setTimeout(() => {
      const nextIdx = qIndex + 1;
      if (nextIdx >= questions.length) {
        // Hết câu hỏi
        endGame(newCorrect, newWrong, newScore, newStreak, newMax);
      } else {
        setQIndex(nextIdx);
        setQSec(secPerQ);
        setFeedback(null);
        setDisabled(false);
        setPhase('QUESTION');
      }
    }, FEEDBACK_DURATION);
  }, [disabled, phase, correct, wrong, score, streak, maxStreak, currentQ, qIndex, questions, maxWrong, secPerQ, endGame]);

  // Cập nhật handleAnswerRef sau khi handleAnswer được tạo
  useEffect(() => { handleAnswerRef.current = handleAnswer; }, [handleAnswer]);

  // ─── Session timer ────────────────────────────────────────
  useEffect(() => {
    if (phase === 'DONE') return;
    sessionRef.current = setInterval(() => {
      setSessionSec((prev) => {
        if (prev <= 1) {
          clearInterval(sessionRef.current);
          // Dùng ref để luôn lấy giá trị state mới nhất, tránh stale closure
          const s = gameStateRef.current;
          endGameRef.current(s.correct, s.wrong, s.score, s.streak, s.maxStreak);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sessionRef.current);
  }, [phase]); // phase thay vì boolean phase === 'DONE'

  // ─── Per-question timer ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'QUESTION') return;
    setQSec(secPerQ);
    qRef.current = setInterval(() => {
      setQSec((prev) => {
        if (prev <= 1) {
          clearInterval(qRef.current);
          handleAnswerRef.current(false); // hết giờ = sai, dùng ref tránh stale closure
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(qRef.current);
  }, [qIndex, phase, secPerQ]);

  // ─── Check MC answer ─────────────────────────────────────
  const checkMC = (optionValue) => {
    if (disabled) return;
    const ans = typeof currentQ.correct_answer === 'string'
      ? JSON.parse(currentQ.correct_answer)
      : currentQ.correct_answer;
    handleAnswer(String(optionValue) === String(ans?.answer));
  };

  // ─── Check fill-blank ────────────────────────────────────
  const [fillValue, setFillValue] = useState('');
  useEffect(() => setFillValue(''), [qIndex]);

  const checkFill = (e) => {
    e.preventDefault();
    if (disabled) return;
    const ans = typeof currentQ.correct_answer === 'string'
      ? JSON.parse(currentQ.correct_answer)
      : currentQ.correct_answer;
    handleAnswer(fillValue.trim().toLowerCase() === String(ans?.answer).toLowerCase());
  };

  // ─── Session timer display ────────────────────────────────
  const smins = Math.floor(sessionSec / 60);
  const ssecs = sessionSec % 60;
  const sessionPct = sessionSec / SESSION_SEC;

  // ─── DONE screen ──────────────────────────────────────────
  if (phase === 'DONE') {
    const duration = Math.round((Date.now() - startTime) / 1000);
    return (
      <ResultScreen
        result={{ total: correct + wrong, correct, wrong, score, maxStreak, duration }}
        config={{ sessionMin, secPerQ, maxWrong }}
        onHome={() => navigate('/')}
        onPlayAgain={() => navigate('/practice')}
        saving={saving}
      />
    );
  }

  // ─── QUESTION / FEEDBACK screen ───────────────────────────
  const opts = currentQ?.options
    ? (typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options)
    : null;

  return (
    <div className="practice-arena-page">
      {/* Header bar */}
      <div className="practice-arena-header">
        <button
          className="practice-arena-quit"
          onClick={() => { if (window.confirm('Thoát phiên luyện tập?')) navigate('/practice'); }}
          title="Thoát"
        >
          <FiX size={18} />
        </button>

        {/* Session progress bar */}
        <div className="practice-session-bar-wrap">
          <div
            className="practice-session-bar-fill"
            style={{
              width: `${sessionPct * 100}%`,
              background: sessionPct > 0.5 ? '#16a34a' : sessionPct > 0.25 ? '#d97706' : '#dc2626',
            }}
          />
        </div>

        <div className="practice-arena-stats">
          <span className="practice-stat-lives">
            <FiHeart size={15} />
            {maxWrong - wrong}
          </span>
          <span className="practice-stat-score">
            <FiStar size={15} />
            {score}
          </span>
          <span className="practice-stat-time">
            ⏱ {smins}:{String(ssecs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Streak bar */}
      {streak >= STREAK_THRESHOLD && (
        <div className="practice-streak-banner">
          🔥 Chuỗi {streak} câu đúng! +{POINTS_STREAK} điểm thưởng/câu
        </div>
      )}

      {/* Question card */}
      <div className="practice-question-wrap">
        <div className="practice-question-card">
          {/* Question meta */}
          <div className="practice-q-meta">
            <span className="practice-q-counter">Câu {qIndex + 1}</span>
            <span className="practice-q-chapter">{currentQ.chapter_title}</span>
            <TimerRing timeLeft={qSec} maxTime={secPerQ} />
          </div>

          {/* Question text */}
          <p className="practice-q-text">{currentQ.question_text}</p>

          {/* Answer area */}
          {currentQ.exercise_type === 'multiple_choice' && Array.isArray(opts) && (
            <div className="practice-options">
              {opts.map((opt, i) => (
                <button
                  key={i}
                  id={`practice-opt-${i}`}
                  className={`practice-option-btn ${
                    feedback
                      ? (String(opt) === String((typeof currentQ.correct_answer === 'string' ? JSON.parse(currentQ.correct_answer) : currentQ.correct_answer)?.answer)
                          ? 'practice-option-btn--correct'
                          : 'practice-option-btn--wrong-chosen')
                      : ''
                  }`}
                  onClick={() => checkMC(opt)}
                  disabled={disabled}
                >
                  <span className="practice-option-label">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQ.exercise_type === 'fill_blank' && (
            <form onSubmit={checkFill} className="practice-fill-form">
              <input
                className="form-input practice-fill-input"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                placeholder="Nhập câu trả lời..."
                disabled={disabled}
                autoFocus
                id="practice-fill-input"
              />
              <button type="submit" className="btn btn--primary" disabled={disabled || !fillValue.trim()}>
                <FiZap size={15} /> Trả lời
              </button>
            </form>
          )}

          {currentQ.exercise_type === 'matching' && (
            <MatchingQuestion
              question={currentQ}
              onAnswer={(isCorrect) => handleAnswer(isCorrect)}
              disabled={disabled}
            />
          )}

          {/* Feedback flash */}
          {feedback && (
            <div className={`practice-feedback ${feedback.correct ? 'practice-feedback--correct' : 'practice-feedback--wrong'}`}>
              <span>{feedback.correct ? '✅ Chính xác!' : '❌ Chưa đúng!'}</span>
              {feedback.explanation && <span className="practice-feedback-exp">{feedback.explanation}</span>}
              {!feedback.correct && currentQ.exercise_type !== 'matching' && (
                <span className="practice-feedback-ans">
                  Đáp án: <strong>
                    {String((typeof currentQ.correct_answer === 'string'
                      ? JSON.parse(currentQ.correct_answer)
                      : currentQ.correct_answer)?.answer || '')}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeArena;
