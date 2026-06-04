import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiCheckCircle, FiFileText, FiPercent, FiPlus } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { getCoursesInProgress, getProgressOverview } from '../../api/lessonApi';
import { getPaths } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import Heatmap from '../../components/Heatmap';
import CourseCard from '../../components/CourseCard';

/* ── Path card ──────────────────────────────────────────── */
const PathCard = ({ path }) => (
  <Link to={`/skill-paths/${path.slug}`} className="pf-course-card">
    <div className="pf-course-preview pf-course-preview--path">
      <span className="pf-course-preview-icon">🎯</span>
    </div>
    <div className="pf-course-body">
      <span className="pf-course-badge pf-course-badge--blue">Lộ trình</span>
      <div className="pf-course-title">{path.title}</div>
      <div className="pf-course-meta">{path.module_count || 0} modules · {path.estimated_hours}h</div>
    </div>
  </Link>
);

/* ── Explore more card ──────────────────────────────────── */
const ExploreCard = ({ to }) => (
  <Link to={to} className="pf-course-card pf-explore-card">
    <div className="pf-explore-plus">
      <FiPlus size={28} />
    </div>
    <span className="pf-explore-label">Khám phá thêm môn học</span>
  </Link>
);

/* ── Main ───────────────────────────────────────────────── */
const ProfilePage = () => {
  const { user } = useAuth();
  const [courses,  setCourses]  = useState([]);
  const [paths,    setPaths]    = useState([]);
  const [overview, setOverview] = useState(null);
  const [tab,      setTab]      = useState('courses');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getCoursesInProgress(),
      getPaths(),
      getProgressOverview(),
    ])
      .then(([cRes, pRes, oRes]) => {
        setCourses(cRes.data);
        setPaths(pRes.data);
        setOverview(oRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const initial     = (user.display_name || user.email).charAt(0).toUpperCase();
  const displayName = user.display_name || user.email.split('@')[0];
  const handle      = '@' + user.email.split('@')[0];
  const joinedYear  = user.created_at ? new Date(user.created_at).getFullYear() : null;

  const stats = overview ? [
    { icon: <FiCheckCircle size={15} />, label: 'Bài hoàn thành', value: overview.total_lessons_completed },
    { icon: <FiFileText    size={15} />, label: 'Bài tập đã làm', value: overview.total_exercises_attempted },
    { icon: <FiPercent     size={15} />, label: 'Tỉ lệ đúng',     value: `${overview.accuracy_rate}%` },
  ] : [];

  return (
    <div className="pf-layout">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="pf-sidebar">
        <div className="pf-avatar">{initial}</div>

        <div className="pf-name">{displayName}</div>
        <div className="pf-handle">{handle}</div>

        <div className="pf-info-row">
          <span className="pf-info-item"><FiMapPin size={12} /> Việt Nam</span>
          {joinedYear && (
            <>
              <span className="pf-info-dot">·</span>
              <span className="pf-info-item"><FiCalendar size={12} /> Joined {joinedYear}</span>
            </>
          )}
        </div>

        {stats.length > 0 && (
          <div className="pf-stats">
            {stats.map(({ icon, label, value }) => (
              <div key={label} className="pf-stat-row">
                <span className="pf-stat-icon">{icon}</span>
                <span className="pf-stat-label">{label}</span>
                <span className="pf-stat-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── RIGHT MAIN ── */}
      <main className="pf-main">

        {/* Heatmap */}
        <Heatmap />

        {/* Tabs */}
        <div className="pf-tabs">
          <button
            className={`pf-tab${tab === 'courses' ? ' pf-tab--active' : ''}`}
            onClick={() => setTab('courses')}
          >
            Môn đang học
          </button>
          <button
            className={`pf-tab${tab === 'paths' ? ' pf-tab--active' : ''}`}
            onClick={() => setTab('paths')}
          >
            Lộ trình
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner fullPage={false} />
        ) : tab === 'courses' ? (
          <div className="pf-course-grid">
            {courses.map((c) => (
              <CourseCard key={`${c.grade_id}-${c.subject_id}`} course={c} />
            ))}
            <ExploreCard to="/pho-thong" />
          </div>
        ) : (
          <div className="pf-course-grid">
            {paths.map((p) => <PathCard key={p.id} path={p} />)}
            <ExploreCard to="/skill-paths" />
          </div>
        )}

      </main>
    </div>
  );
};

export default ProfilePage;
