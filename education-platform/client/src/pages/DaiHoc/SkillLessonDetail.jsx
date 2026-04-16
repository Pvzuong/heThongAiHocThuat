import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { getSkillLessonById } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const SkillLessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSkillLessonById(lessonId)
      .then((res) => setLesson(res.data))
      .catch(() => setError('Không thể tải bài học'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;
  if (!lesson) return null;

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/skill-paths">Kỹ năng nghề nghiệp</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/skill-paths/${lesson.path.slug}`}>{lesson.path.title}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{lesson.module.title}</span>
      </div>

      <div className="lesson-layout">
        <article className="lesson-content">
          <h1 className="lesson-title">{lesson.title}</h1>

          {lesson.placeholder ? (
            <div className="skill-placeholder">
              <span className="skill-placeholder-icon">🚧</span>
              <h3>Nội dung đang được xây dựng</h3>
              <p>{lesson.message}</p>
              <Link to={`/skill-paths/${lesson.path.slug}`} className="btn btn--outline" style={{ marginTop: 16 }}>
                <FiArrowLeft /> Quay về lộ trình
              </Link>
            </div>
          ) : (
            <div className="lesson-html" dangerouslySetInnerHTML={{ __html: lesson.content_html }} />
          )}
        </article>
      </div>
    </div>
  );
};

export default SkillLessonDetail;
