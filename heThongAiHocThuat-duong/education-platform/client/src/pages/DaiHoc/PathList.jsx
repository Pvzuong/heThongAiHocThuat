import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { getPaths } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const PATH_ICONS = { 'frontend-developer': '🎨', 'backend-developer': '⚙️' };
const DIFFICULTY_LABEL = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
const DIFFICULTY_COLOR = { beginner: 'badge--green', intermediate: 'badge--blue', advanced: 'badge--purple' };

const PathList = () => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPaths()
      .then((res) => setPaths(res.data))
      .catch(() => setError('Không thể tải danh sách lộ trình'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Kỹ năng nghề nghiệp</span>
        </div>
        <h1>Lộ trình học tập</h1>
        <p>Chọn lộ trình phù hợp và bắt đầu hành trình học lập trình của bạn</p>
      </div>

      <div className="path-grid">
        {paths.map((path) => (
          <div key={path.id} className="path-card">
            <div className="path-card-header">
              <span className="path-icon">{PATH_ICONS[path.slug] || '📚'}</span>
              <span className={`badge ${DIFFICULTY_COLOR[path.difficulty] || 'badge--blue'}`}>
                {DIFFICULTY_LABEL[path.difficulty] || path.difficulty}
              </span>
            </div>
            <h2 className="path-title">{path.title}</h2>
            <p className="path-desc">{path.description}</p>
            <div className="path-meta">
              <span><FiClock size={14} /> {path.estimated_hours}h</span>
              <span><FiBookOpen size={14} /> {path.module_count} modules</span>
            </div>
            <div className="path-card-actions">
              <Link to={`/skill-paths/${path.slug}/placement-test`} className="btn btn--outline">
                Kiểm tra trình độ
              </Link>
              <Link to={`/skill-paths/${path.slug}`} className="btn btn--primary">
                Xem lộ trình <FiArrowRight />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathList;
