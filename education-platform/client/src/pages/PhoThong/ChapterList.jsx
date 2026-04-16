import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiChevronDown, FiChevronRight, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { getChaptersBySubject, getLessonsByChapter } from '../../api/subjectApi';
import { getChapterProgress } from '../../api/lessonApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const ChapterItem = ({ chapter, gradeSlug, subjectSlug }) => {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const { user } = useAuth();

  const handleToggle = async () => {
    if (!open && lessons.length === 0) {
      setLoadingLessons(true);
      try {
        const [lessonRes, progressRes] = await Promise.all([
          getLessonsByChapter(chapter.id),
          user ? getChapterProgress(chapter.id) : Promise.resolve({ data: [] }),
        ]);
        setLessons(lessonRes.data);
        setProgress(progressRes.data);
      } finally {
        setLoadingLessons(false);
      }
    }
    setOpen((o) => !o);
  };

  const isCompleted = (lessonId) =>
    progress.find((p) => p.lesson_id === lessonId)?.is_completed;

  const completedCount = progress.filter((p) => p.is_completed).length;
  const total = parseInt(chapter.lesson_count) || 0;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="chapter-item">
      <button className="chapter-header" onClick={handleToggle}>
        <div className="chapter-header-left">
          <span className="chapter-toggle">
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </span>
          <div>
            <h3 className="chapter-title">{chapter.title}</h3>
            <span className="chapter-meta">{chapter.lesson_count} bài học</span>
          </div>
        </div>
        {user && (
          <div className="chapter-progress-wrap">
            <span className="chapter-progress-text">{percent}%</span>
            <div className="progress-bar" style={{ width: 80 }}>
              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
      </button>

      {open && (
        <div className="chapter-lessons">
          {loadingLessons ? (
            <LoadingSpinner fullPage={false} />
          ) : (
            lessons.map((lesson) => (
              <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="lesson-row">
                <span className={`lesson-status ${isCompleted(lesson.id) ? 'lesson-status--done' : ''}`}>
                  {isCompleted(lesson.id) ? <FiCheckCircle /> : <FiCircle />}
                </span>
                <span className="lesson-row-title">{lesson.title}</span>
                <span className={`badge badge--${lesson.content_type === 'theory' ? 'blue' : 'green'}`}>
                  {lesson.content_type === 'theory' ? 'Lý thuyết' : 'Thực hành'}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ChapterList = () => {
  const { gradeSlug, subjectSlug } = useParams();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gradeName = gradeSlug.replace('lop-', 'Lớp ');
  const subjectName = subjectSlug === 'toan' ? 'Toán' : subjectSlug;

  useEffect(() => {
    getChaptersBySubject(gradeSlug, subjectSlug)
      .then((res) => setChapters(res.data))
      .catch(() => setError('Không thể tải danh sách chương'))
      .finally(() => setLoading(false));
  }, [gradeSlug, subjectSlug]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/pho-thong">Phổ thông</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to={`/pho-thong/${gradeSlug}`}>{gradeName}</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{subjectName}</span>
        </div>
        <h1>{gradeName} — {subjectName}</h1>
        <p>{chapters.length} chương · Click vào chương để xem danh sách bài</p>
      </div>

      <div className="chapter-list">
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            gradeSlug={gradeSlug}
            subjectSlug={subjectSlug}
          />
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
