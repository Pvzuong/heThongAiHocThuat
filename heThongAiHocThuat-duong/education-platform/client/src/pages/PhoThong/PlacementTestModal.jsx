import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { getPlacementTest, submitPlacementTest } from '../../api/placementApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PlacementTestModal.css';

const PlacementTestModal = ({ gradeSlug, subjectSlug, onClose, onSuccess }) => {
  const [step, setStep] = useState('loading'); // 'loading', 'test', 'result'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTest();
  }, [gradeSlug, subjectSlug]);

  const loadTest = async () => {
    try {
      setStep('loading');
      setError('');
      const res = await getPlacementTest(gradeSlug, subjectSlug);
      setQuestions(res.data.questions);
      setStep('test');
      setAnswers({});
      setCurrentIdx(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể tải bài kiểm tra');
      setStep('error');
    }
  };

  const handleAnswerChange = (questionId, userAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: userAnswer,
    }));
  };

  const handleSubmit = async () => {
    // Kiểm tra đã trả lời hết câu hỏi
    if (Object.keys(answers).length !== questions.length) {
      setError('Vui lòng trả lời tất cả các câu hỏi');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Transform answers
      const answersArray = questions.map(q => ({
        exercise_id: q.id,
        user_answer: answers[q.id],
      }));

      const res = await submitPlacementTest(gradeSlug, subjectSlug, answersArray);
      setResult(res.data);
      setStep('result');
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <LoadingSpinner fullPage={false} />
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content placement-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Bài kiểm tra đầu vào</h2>
            <button className="modal-close" onClick={onClose}><FiX /></button>
          </div>
          <div className="modal-body">
            <p className="form-error">{error}</p>
            <button onClick={loadTest} className="btn btn-primary">Tải lại</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const masterCount = result.mastered_chapter_ids.length;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content placement-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Kết quả kiểm tra đầu vào</h2>
            <button className="modal-close" onClick={onClose}><FiX /></button>
          </div>
          <div className="modal-body placement-result">
            <div className="result-score">
              <div className="score-circle">
                <span className="score-percent">{result.score_percent.toFixed(1)}%</span>
                <span className="score-text">Điểm tổng</span>
              </div>
              <div className="score-details">
                <p><strong>{result.correct_count}/{result.total_questions}</strong> câu đúng</p>
              </div>
            </div>

            <div className="result-chapters">
              <h3>Kết quả theo chương:</h3>
              <div className="chapter-results">
                {Object.entries(result.chapter_scores).map(([chapterId, score]) => (
                  <div key={chapterId} className="chapter-result-item">
                    <div className="chapter-result-label">
                      {result.mastered_chapter_ids.includes(parseInt(chapterId)) && (
                        <FiCheckCircle className="icon-success" />
                      )}
                      <span>Chương {chapterId}</span>
                    </div>
                    <div className="chapter-result-score">
                      <span className={`score ${score >= 70 ? 'score-good' : 'score-weak'}`}>
                        {score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`result-recommendation ${result.recommended_chapter_id ? 'show' : ''}`}>
              <FiBarChart2 />
              <p>
                <strong>Nên bắt đầu từ chương tiếp theo.</strong> Bạn đã nắm vững {masterCount} chương,
                hệ thống sẽ đánh dấu hoàn thành để bạn tiếp tục học.
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={onClose} className="btn btn-primary">
                Đóng và xem danh sách chương
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // step === 'test'
  const currentQuestion = questions[currentIdx];
  const answered = answers[currentQuestion?.id] !== undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content placement-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bài kiểm tra đầu vào</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="modal-body placement-test">
          <div className="test-progress">
            <span className="test-progress-text">
              Câu {currentIdx + 1} / {questions.length}
            </span>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="question-container">
            <h3 className="question-text">{currentQuestion?.question_text}</h3>

            {currentQuestion?.question_image_url && (
              <img src={currentQuestion.question_image_url} alt="Hình minh họa" className="question-image" />
            )}

            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion?.id]}
              onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
            />
          </div>

          {answered && <p className="answered-indicator">✓ Đã trả lời</p>}

          <div className="modal-actions placement-actions">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="btn btn-secondary"
            >
              <FiChevronLeft /> Câu trước
            </button>

            {currentIdx === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length !== questions.length}
                className="btn btn-primary"
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="btn btn-secondary"
              >
                Câu tiếp <FiChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component render từng loại câu hỏi
const QuestionRenderer = ({ question, answer, onChange }) => {
  if (!question) return null;

  if (question.exercise_type === 'multiple_choice') {
    const options = question.options || [];
    return (
      <div className="options-group">
        {options.map((opt, idx) => (
          <label key={idx} className="option-label">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={opt}
              checked={answer === opt}
              onChange={(e) => onChange(e.target.value)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.exercise_type === 'fill_blank') {
    return (
      <div className="input-group">
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu trả lời..."
          className="input"
        />
      </div>
    );
  }

  if (question.exercise_type === 'matching') {
    const leftItems = question.options?.left || [];
    const rightItems = question.options?.right || [];
    const currentPairs = answer || {};

    return (
      <div className="matching-container">
        <div className="matching-column">
          <h4>Cột trái</h4>
          {leftItems.map((item, idx) => (
            <div key={idx} className="matching-item">
              <span>{item}</span>
              <select
                value={currentPairs[idx] ?? ''}
                onChange={(e) => {
                  const newPairs = { ...currentPairs, [idx]: parseInt(e.target.value) };
                  onChange(newPairs);
                }}
                className="input"
              >
                <option value="">-- Chọn --</option>
                {rightItems.map((_, rIdx) => (
                  <option key={rIdx} value={rIdx}>
                    {rightItems[rIdx]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <p>Loại câu hỏi không hỗ trợ</p>;
};

export default PlacementTestModal;
