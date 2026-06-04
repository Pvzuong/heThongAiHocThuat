import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiBookOpen, FiLock } from 'react-icons/fi';
import { getModuleById } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getModuleById(moduleId)
      .then((res) => setMod(res.data))
      .catch(() => setError('Không thể tải module'))
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;
  if (!mod) return null;

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/skill-paths">Kỹ năng nghề nghiệp</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/skill-paths/${mod.path.slug}`}>{mod.path.title}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{mod.title}</span>
      </div>

      <div className="page-header">
        <h1>{mod.title}</h1>
        <p>{mod.description}</p>
      </div>

      <div className="skill-lessons-list">
        {mod.lessons?.map((lesson, idx) => (
          <Link
            key={lesson.id}
            to={`/skill-paths/lesson/${lesson.id}`}
            className={`skill-lesson-row ${!lesson.has_content ? 'skill-lesson-row--placeholder' : ''}`}
          >
            <span className="skill-lesson-num">{idx + 1}</span>
            <div className="skill-lesson-info">
              <span className="skill-lesson-title">{lesson.title}</span>
              {!lesson.has_content && (
                <span className="skill-lesson-badge">Sắp ra mắt</span>
              )}
            </div>
            {lesson.has_content ? <FiBookOpen className="skill-lesson-icon" /> : <FiLock className="skill-lesson-icon skill-lesson-icon--locked" />}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModuleDetail;
