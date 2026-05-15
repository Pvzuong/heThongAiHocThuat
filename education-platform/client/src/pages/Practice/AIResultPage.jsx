import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiCpu, FiHome } from 'react-icons/fi';

const AIResultPage = () => {
  const { collectionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div className="empty-state">
        <p>Không tìm thấy kết quả. <Link to="/practice/ai-generator">Tạo bộ câu hỏi mới</Link></p>
      </div>
    );
  }

  const { totalQuestions, correctCount, scorePercent, details } = result;
  const grade = scorePercent >= 80 ? 'excellent' : scorePercent >= 60 ? 'good' : 'needs-work';
  const gradeLabel = grade === 'excellent' ? 'Xuất sắc! 🎉' : grade === 'good' ? 'Khá tốt! 👍' : 'Cần cố gắng hơn 💪';

  return (
    <div className="ai-result-page">
      {/* Score */}
      <div className={`ai-result-score-card ai-result-score-card--${grade}`}>
        <div className="ai-result-score-num">{correctCount}/{totalQuestions}</div>
        <div className="ai-result-score-pct">{scorePercent}%</div>
        <div className="ai-result-score-label">{gradeLabel}</div>
      </div>

      {/* Actions */}
      <div className="ai-result-actions">
        <button className="btn btn--primary" onClick={() => navigate(`/practice/ai-arena/${collectionId}`)}>
          <FiRefreshCw size={14} /> Làm lại
        </button>
        <Link to="/practice/ai-generator" className="btn btn--outline">
          <FiCpu size={14} /> Tạo bộ mới
        </Link>
        <Link to="/" className="btn btn--outline">
          <FiHome size={14} /> Về trang chủ
        </Link>
      </div>

      {/* Detail */}
      <div className="ai-result-detail">
        <h3>Chi tiết từng câu</h3>
        {details.map((d, i) => (
          <div key={d.questionId} className={`ai-result-item${d.isCorrect ? ' ai-result-item--correct' : ' ai-result-item--wrong'}`}>
            <div className="ai-result-item-header">
              <span className="ai-result-item-num">Câu {i + 1}</span>
              {d.isCorrect
                ? <FiCheckCircle size={18} className="ai-result-icon ai-result-icon--correct" />
                : <FiXCircle size={18} className="ai-result-icon ai-result-icon--wrong" />
              }
            </div>
            <p className="ai-result-item-question">{d.questionText}</p>
            {!d.isCorrect && (
              <div className="ai-result-item-answer">
                <span className="ai-result-answer-wrong">Bạn trả lời: {d.userAnswer || '(bỏ trống)'}</span>
                <span className="ai-result-answer-correct">Đáp án đúng: {d.correctAnswer}</span>
              </div>
            )}
            {d.explanation && (
              <div className="ai-result-explanation">
                💡 {d.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIResultPage;
