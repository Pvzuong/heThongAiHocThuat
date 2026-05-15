import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiTrash2, FiPlay, FiCpu, FiClock, FiBook } from 'react-icons/fi';
import { getMyCollections, deleteCollection } from '../../api/geminiApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const DIFFICULTY_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

const AICollectionHistory = () => {
  const navigate = useNavigate();
  const { addToast: showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getMyCollections()
      .then((res) => setCollections(res.data))
      .catch(() => showToast('Không tải được lịch sử', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa bộ câu hỏi "${name}"?\nThao tác này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      showToast('Đã xóa bộ câu hỏi', 'success');
    } catch {
      showToast('Không thể xóa. Vui lòng thử lại.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="ai-history-page">
      <div className="ai-history-header">
        <div>
          <h1>Lịch sử bộ câu hỏi AI</h1>
          <p>{collections.length} bộ câu hỏi đã tạo</p>
        </div>
        <Link to="/practice/ai-generator" className="btn btn--primary">
          <FiCpu size={14} /> Tạo mới
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🤖</span>
          <h3>Chưa có bộ câu hỏi nào</h3>
          <p>Hãy dùng AI để tạo câu hỏi Toán phù hợp với bạn!</p>
          <Link to="/practice/ai-generator" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            Tạo ngay
          </Link>
        </div>
      ) : (
        <div className="ai-history-list">
          {collections.map((col) => (
            <div key={col.id} className="ai-history-card">
              <div className="ai-history-card-left">
                <div className="ai-history-card-title">
                  {col.collection_name}
                  {col.is_test && <span className="ai-history-badge">Đề thi</span>}
                </div>
                <div className="ai-history-card-meta">
                  <span><FiBook size={12} /> Lớp {col.grade_number}</span>
                  {col.topic && <span>· {col.topic}</span>}
                  <span>· {col.question_count} câu</span>
                  <span>· {DIFFICULTY_LABEL[col.difficulty] || col.difficulty}</span>
                  {col.duration_minutes && <span><FiClock size={12} /> {col.duration_minutes} phút</span>}
                </div>
                <div className="ai-history-card-date">
                  {new Date(col.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="ai-history-card-actions">
                <button className="btn btn--primary btn--sm" onClick={() => navigate(`/practice/ai-arena/${col.id}`)}>
                  <FiPlay size={13} /> Làm bài
                </button>
                <button
                  className="btn btn--outline btn--sm ai-history-delete-btn"
                  onClick={() => handleDelete(col.id, col.collection_name)}
                  disabled={deletingId === col.id}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AICollectionHistory;
