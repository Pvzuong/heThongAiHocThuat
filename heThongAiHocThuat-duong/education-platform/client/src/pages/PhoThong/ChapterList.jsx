import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const getLevelFromGrade = (gradeSlug) => {
  const num = parseInt(gradeSlug.replace('lop-', ''));
  if (num <= 5) return { slug: 'cap-1', name: 'Cấp 1' };
  if (num <= 9) return { slug: 'cap-2', name: 'Cấp 2' };
  return { slug: 'cap-3', name: 'Cấp 3' };
};
import { FiChevronDown, FiChevronRight, FiCheckCircle, FiCircle, FiLock, FiTrendingUp } from 'react-icons/fi';
import { getChaptersBySubject, getLessonsByChapter } from '../../api/subjectApi';
import { getChapterProgress } from '../../api/lessonApi';
import { getPlacementStatus } from '../../api/placementApi';
import PlacementTestModal from './PlacementTestModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const ChapterItem = ({ chapter, gradeSlug, subjectSlug, isMastered }) => {
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

  // Bài i bị khóa nếu user đã đăng nhập VÀ bài trước đó chưa hoàn thành
  const isLocked = (idx) => {
    if (!user) return false;
    if (idx === 0) return false;
    return !isCompleted(lessons[idx - 1].id);
  };

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
            {isMastered && (
              <span className="chapter-mastered-badge">
                <FiCheckCircle /> Đã nắm vững
              </span>
            )}
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
            lessons.map((lesson, idx) => {
              const locked = isLocked(idx);
              const done = isCompleted(lesson.id);

              if (locked) {
                return (
                  <div key={lesson.id} className="lesson-row lesson-row--locked">
                    <span className="lesson-status lesson-status--locked">
                      <FiLock size={15} />
                    </span>
                    <span className="lesson-row-title">{lesson.title}</span>
                    <span className="badge badge--gray">Chưa mở khóa</span>
                  </div>
                );
              }

              return (
                <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="lesson-row">
                  <span className={`lesson-status ${done ? 'lesson-status--done' : ''}`}>
                    {done ? <FiCheckCircle /> : <FiCircle />}
                  </span>
                  <span className="lesson-row-title">{lesson.title}</span>
                  <span className={`badge badge--${lesson.content_type === 'theory' ? 'blue' : 'green'}`}>
                    {lesson.content_type === 'theory' ? 'Lý thuyết' : 'Thực hành'}
                  </span>
                </Link>
              );
            })
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
  const [placementStatus, setPlacementStatus] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const { user } = useAuth();

  const gradeName = gradeSlug.replace('lop-', 'Lớp ');
  const subjectName = subjectSlug === 'toan' ? 'Toán' : subjectSlug;
  const level = getLevelFromGrade(gradeSlug);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chaptersRes, placementRes] = await Promise.all([
          getChaptersBySubject(gradeSlug, subjectSlug),
          user ? getPlacementStatus(gradeSlug, subjectSlug) : Promise.resolve(null),
        ]);
        setChapters(chaptersRes.data);
        if (placementRes) {
          setPlacementStatus(placementRes.data);
        }
      } catch (err) {
        setError('Không thể tải danh sách chương');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [gradeSlug, subjectSlug, user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;

  const handleTestSuccess = () => {
    setShowTestModal(false);
    // Reload placement status
    if (user) {
      getPlacementStatus(gradeSlug, subjectSlug)
        .then(res => setPlacementStatus(res.data))
        .catch(() => {});
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/pho-thong">Phổ thông</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/pho-thong" state={{ level: level.slug }}>{level.name}</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to={`/pho-thong/${gradeSlug}`}>{gradeName}</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{subjectName}</span>
        </div>
        <h1>{gradeName} — {subjectName}</h1>
        <p>{chapters.length} chương · Click vào chương để xem danh sách bài</p>
      </div>

      {user && placementStatus && !placementStatus.has_taken && (
        <div className="placement-banner">
          <div className="placement-banner-content">
            <FiTrendingUp className="placement-banner-icon" />
            <div className="placement-banner-text">
              <h3>Làm bài kiểm tra đầu vào</h3>
              <p>Hệ thống sẽ xác định chương nào bạn đã nắm vững và gợi ý chương nên bắt đầu học.</p>
            </div>
            <button
              onClick={() => setShowTestModal(true)}
              className="placement-banner-btn"
            >
              Bắt đầu kiểm tra
            </button>
          </div>
        </div>
      )}

      {user && placementStatus && placementStatus.has_taken && (
        <div className="placement-done-banner">
          <p>
            <FiCheckCircle /> Bạn đã hoàn thành bài kiểm tra đầu vào.
            Nên bắt đầu từ chương được đề xuất.
          </p>
        </div>
      )}

      <div className="chapter-list">
        {chapters.map((chapter) => {
          const isMastered = placementStatus?.result?.mastered_chapter_ids?.includes(chapter.id);
          const isRecommended = placementStatus?.result?.recommended_chapter_id === chapter.id;

          return (
            <div key={chapter.id}>
              {isRecommended && (
                <div className="chapter-recommended-tag">
                  ⭐ Nên bắt đầu từ đây
                </div>
              )}
              <ChapterItem
                chapter={chapter}
                gradeSlug={gradeSlug}
                subjectSlug={subjectSlug}
                isMastered={isMastered}
              />
            </div>
          );
        })}
      </div>

      {showTestModal && (
        <PlacementTestModal
          gradeSlug={gradeSlug}
          subjectSlug={subjectSlug}
          onClose={() => setShowTestModal(false)}
          onSuccess={handleTestSuccess}
        />
      )}
    </div>
  );
};

export default ChapterList;
