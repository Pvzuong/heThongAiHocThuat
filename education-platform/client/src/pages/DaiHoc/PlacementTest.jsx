import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { getPlacementTest, submitPlacementTest } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const PlacementTest = () => {
  const { pathSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlacementTest(pathSlug)
      .then((res) => setTest(res.data))
      .catch(() => setError('Không thể tải bài kiểm tra'))
      .finally(() => setLoading(false));
  }, [pathSlug]);

  const handleSelect = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!user) return navigate('/login');
    const formatted = Object.entries(answers).map(([question_id, answer]) => ({
      question_id: parseInt(question_id),
      answer,
    }));
    setSubmitting(true);
    try {
      const res = await submitPlacementTest(test.test_id, formatted);
      setResult(res.data);
    } catch {
      setError('Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = test?.questions?.length || 0;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;
  if (!test) return null;

  // Màn hình kết quả
  if (result) {
    return (
      <div className="page-container">
        <div className="placement-result">
          <div className="placement-result-icon">🎯</div>
          <h2>Kết quả đánh giá</h2>
          <p className="placement-recommend">
            Gợi ý bắt đầu từ: <strong>{result.recommended_start}</strong>
          </p>
          <p className="placement-message">{result.message}</p>

          <div className="placement-scores">
            {Object.entries(result.score).map(([module, score]) => (
              <div key={module} className="placement-score-item">
                <span className="placement-score-label">{module}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-bar-fill" style={{ width: `${score}%`, background: score >= 70 ? 'var(--green)' : 'var(--blue)' }} />
                </div>
                <span className="placement-score-val">{score}%</span>
              </div>
            ))}
          </div>

          <div className="done-actions" style={{ marginTop: 24 }}>
            <Link to={`/skill-paths/${pathSlug}`} className="btn btn--primary">
              Xem lộ trình <FiCheckCircle />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/skill-paths">Kỹ năng nghề nghiệp</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/skill-paths/${pathSlug}`}>{pathSlug.replace(/-/g, ' ')}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Kiểm tra trình độ</span>
      </div>

      <div className="page-header">
        <h1>{test.title}</h1>
        <p>{test.description}</p>
      </div>

      {/* Progress */}
      <div className="placement-progress">
        <span>{answeredCount}/{totalCount} câu đã trả lời</span>
        <div className="progress-bar" style={{ flex: 1, maxWidth: 300 }}>
          <div className="progress-bar-fill" style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Questions */}
      <div className="placement-questions">
        {test.questions?.map((q, idx) => (
          <div key={q.id} className="placement-question">
            <div className="placement-q-header">
              <span className="placement-q-num">Câu {idx + 1}</span>
              {q.module_title && <span className="badge badge--blue">{q.module_title}</span>}
            </div>
            <p className="placement-q-text">{q.question_text}</p>
            <div className="placement-options">
              {q.options?.map((opt, oidx) => (
                <button
                  key={oidx}
                  className={`option-btn ${answers[q.id] === opt ? 'option-btn--selected' : ''}`}
                  onClick={() => handleSelect(q.id, opt)}
                >
                  <span className="option-label">{String.fromCharCode(65 + oidx)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="placement-submit">
        {!user && <p className="placement-login-note">Bạn cần <Link to="/login">đăng nhập</Link> để lưu kết quả.</p>}
        <button
          className="btn btn--primary btn--lg"
          onClick={handleSubmit}
          disabled={submitting || answeredCount === 0 || !user}
        >
          {submitting ? 'Đang chấm...' : `Nộp bài (${answeredCount}/${totalCount})`}
        </button>
      </div>
    </div>
  );
};

export default PlacementTest;
