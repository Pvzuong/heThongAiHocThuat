import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiClock, FiSend } from 'react-icons/fi';
import { getCollectionDetail, submitCollectionResult } from '../../api/geminiApi';
import MultipleChoice from '../../components/ExerciseRenderer/MultipleChoice';
import FillInBlank from '../../components/ExerciseRenderer/FillInBlank';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

// Map generated_question → format ExerciseRenderer expects
function mapQuestion(q) {
  const opts = q.options
    ? (Array.isArray(q.options) ? q.options : JSON.parse(q.options))
    : null;
  return {
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
    options: opts,
  };
}

const AIPracticeArena = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { addToast: showToast } = useToast();

  const [collection, setCollection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    getCollectionDetail(collectionId)
      .then((res) => {
        setCollection(res.data.collection);
        setQuestions(res.data.questions);
        if (res.data.collection.duration_minutes) {
          setTimeLeft(res.data.collection.duration_minutes * 60);
        }
      })
      .catch(() => showToast('Không tải được bộ câu hỏi', 'error'))
      .finally(() => setLoading(false));
  }, [collectionId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    // Tự chuyển câu tiếp theo sau khi trả lời
    setCurrent((c) => Math.min(c + 1, questions.length - 1));
  }, [questions.length]);

  const handleSubmit = async () => {
    if (submitting) return;
    clearTimeout(timerRef.current);
    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const answersArr = questions.map((q) => ({ questionId: q.id, userAnswer: answers[q.id] ?? '' }));
    try {
      const res = await submitCollectionResult(collectionId, { answers: answersArr, timeSpentSeconds: timeSpent });
      navigate(`/practice/ai-result/${collectionId}`, { state: { result: res.data } });
    } catch {
      showToast('Lỗi khi nộp bài. Vui lòng thử lại.', 'error');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!collection || questions.length === 0) return <div className="empty-state"><p>Không tìm thấy bộ câu hỏi.</p></div>;

  const q = questions[current];
  const mapped = mapQuestion(q);
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / questions.length) * 100);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="ai-arena-wrap">
      {/* Header */}
      <div className="ai-arena-header">
        <div className="ai-arena-header-info">
          <h2 className="ai-arena-title">{collection.collection_name}</h2>
          <span className="ai-arena-meta">Câu {current + 1}/{questions.length} · {answered} đã trả lời</span>
        </div>
        {timeLeft !== null && (
          <div className={`ai-arena-timer${timeLeft <= 60 ? ' ai-arena-timer--urgent' : ''}`}>
            <FiClock size={14} /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="ai-arena-progress-wrap">
        <div className="ai-arena-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="ai-arena-body">
        <div className="ai-arena-question-num">Câu {current + 1}</div>
        {mapped.question_type !== 'fill_in_blank' && (
          <h3 className="ai-arena-question-text">{mapped.question_text}</h3>
        )}
        {q.image_svg && (
          <div className="ai-arena-image" dangerouslySetInnerHTML={{ __html: q.image_svg }} />
        )}

        {mapped.question_type === 'multiple_choice' && (
          <MultipleChoice
            key={q.id}
            question={mapped}
            onSubmit={(answer) => handleAnswer(q.id, answer)}
            disabled={!!answers[q.id] || submitting}
          />
        )}
        {mapped.question_type === 'fill_in_blank' && (
          <FillInBlank
            key={q.id}
            question={mapped}
            onSubmit={(answer) => handleAnswer(q.id, answer)}
            disabled={!!answers[q.id] || submitting}
          />
        )}

        {answers[q.id] && (
          <div className="ai-arena-answered-hint">
            ✓ Đã trả lời: <strong>{answers[q.id]}</strong>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="ai-arena-nav">
        <button className="btn btn--outline btn--sm" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          <FiChevronLeft size={16} /> Trước
        </button>

        <div className="ai-arena-dots">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`ai-arena-dot${i === current ? ' ai-arena-dot--current' : ''}${answers[questions[i]?.id] ? ' ai-arena-dot--done' : ''}`}
              onClick={() => setCurrent(i)}
              title={`Câu ${i + 1}`}
            />
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button className="btn btn--primary btn--sm" onClick={() => setCurrent((c) => c + 1)}>
            Tiếp <FiChevronRight size={16} />
          </button>
        ) : (
          <button className="btn btn--primary btn--sm" onClick={handleSubmit} disabled={submitting}>
            <FiSend size={14} /> {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AIPracticeArena;
