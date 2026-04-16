import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiClock, FiBookOpen, FiChevronRight, FiClipboard } from 'react-icons/fi';
import { getPathBySlug } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const PathDetail = () => {
  const { pathSlug } = useParams();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPathBySlug(pathSlug)
      .then((res) => setPath(res.data))
      .catch(() => setError('Không thể tải lộ trình'))
      .finally(() => setLoading(false));
  }, [pathSlug]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;
  if (!path) return null;

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/skill-paths">Kỹ năng nghề nghiệp</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{path.title}</span>
      </div>

      {/* Header */}
      <div className="path-detail-header">
        <div>
          <h1>{path.title}</h1>
          <p className="path-detail-desc">{path.description}</p>
          <div className="path-meta" style={{ marginTop: 12 }}>
            <span><FiClock size={14} /> {path.estimated_hours} giờ học</span>
            <span><FiBookOpen size={14} /> {path.modules?.length} modules</span>
          </div>
        </div>
        <Link to={`/skill-paths/${pathSlug}/placement-test`} className="btn btn--outline placement-btn">
          <FiClipboard /> Làm bài kiểm tra trình độ
        </Link>
      </div>

      {/* Timeline modules */}
      <div className="modules-timeline">
        <h2 className="modules-title">Nội dung lộ trình</h2>
        {path.modules?.map((mod, idx) => (
          <div key={mod.id} className="module-item">
            <div className="module-step">
              <div className="module-step-num">{idx + 1}</div>
              {idx < path.modules.length - 1 && <div className="module-step-line" />}
            </div>
            <div className="module-body">
              <div className="module-info">
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
                <div className="module-meta">
                  <span><FiClock size={13} /> {mod.estimated_hours}h</span>
                  <span><FiBookOpen size={13} /> {mod.lesson_count} bài</span>
                </div>
              </div>
              <Link to={`/skill-paths/module/${mod.id}`} className="btn btn--outline btn--sm">
                Xem bài <FiChevronRight />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathDetail;
