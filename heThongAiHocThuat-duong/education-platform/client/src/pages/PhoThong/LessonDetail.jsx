import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiEdit3 } from 'react-icons/fi';
import { getLessonById } from '../../api/subjectApi';
import { completeLesson } from '../../api/lessonApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setCompleted(false);
    getLessonById(lessonId)
      .then((res) => setLesson(res.data))
      .catch(() => setError('Không thể tải bài học'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleComplete = async () => {
    if (!user) return navigate('/login');
    setCompleting(true);
    try {
      await completeLesson(lessonId);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;
  if (!lesson) return null;

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/pho-thong">Phổ thông</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/pho-thong/${lesson.grade.slug}`}>{lesson.grade.name}</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/pho-thong/${lesson.grade.slug}/${lesson.subject.slug}`}>{lesson.subject.name}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{lesson.chapter.title.length > 35 ? lesson.chapter.title.slice(0, 35) + '…' : lesson.chapter.title}</span>
      </div>

      <div className="lesson-layout">
        <article className="lesson-content">
          <h1 className="lesson-title">{lesson.title}</h1>

          {lesson.content_html ? (
            <div className="lesson-html" dangerouslySetInnerHTML={{ __html: lesson.content_html }} />
          ) : (
            <p className="lesson-placeholder">Nội dung đang được cập nhật.</p>
          )}

          <div className="lesson-actions">
            <Link to={`/lesson/${lessonId}/exercises`} className="btn btn--primary">
              <FiEdit3 /> Làm bài tập
            </Link>
            {user ? (
              <button
                className="btn btn--outline"
                onClick={handleComplete}
                disabled={completing || completed}
              >
                <FiCheckCircle />
                {completed ? 'Đã hoàn thành ✓' : completing ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
              </button>
            ) : (
              <Link to="/login" className="btn btn--outline">Đăng nhập để lưu tiến độ</Link>
            )}
          </div>
        </article>

        <nav className="lesson-nav">
          {lesson.prev_lesson ? (
            <Link to={`/lesson/${lesson.prev_lesson.id}`} className="lesson-nav-btn lesson-nav-btn--prev">
              <FiArrowLeft />
              <div>
                <span>Bài trước</span>
                <strong>{lesson.prev_lesson.title}</strong>
              </div>
            </Link>
          ) : <div />}

          {lesson.next_lesson && (
            <Link to={`/lesson/${lesson.next_lesson.id}`} className="lesson-nav-btn lesson-nav-btn--next">
              <div>
                <span>Bài tiếp theo</span>
                <strong>{lesson.next_lesson.title}</strong>
              </div>
              <FiArrowRight />
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default LessonDetail;
