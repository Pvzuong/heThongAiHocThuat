import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiBook, FiAward, FiClock } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { getHeatmap, getCoursesInProgress, getProgressOverview } from '../../api/lessonApi';
import { getPaths } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';

/* ────────────────────────────────────────────
   Heatmap helpers
──────────────────────────────────────────── */
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_LABELS = { 1: 'T2', 3: 'T4', 5: 'T6' }; // chỉ hiện T2, T4, T6

function buildGrid(activities, year) {
  // Tạo map date -> count
  const map = {};
  activities.forEach(({ date, count }) => {
    map[date.slice(0, 10)] = parseInt(count);
  });

  // Ngày đầu năm
  const jan1 = new Date(year, 0, 1);
  // Lùi về đầu tuần (T2 = index 1)
  const startOffset = (jan1.getDay() + 6) % 7; // 0=T2
  const start = new Date(jan1);
  start.setDate(start.getDate() - startOffset);

  const weeks = [];
  let d = new Date(start);
  while (d.getFullYear() <= year) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      week.push({ date: key, count: map[key] || 0, inYear: d.getFullYear() === year });
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
    if (d.getFullYear() > year && d.getMonth() > 0) break;
  }
  return weeks;
}

function heatColor(count) {
  if (count === 0) return 'var(--heat-0)';
  if (count <= 2) return 'var(--heat-1)';
  if (count <= 5) return 'var(--heat-2)';
  if (count <= 10) return 'var(--heat-3)';
  return 'var(--heat-4)';
}

function Heatmap({ userId }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getHeatmap(year)
      .then((res) => {
        setActivities(res.data);
        setTotal(res.data.reduce((s, r) => s + parseInt(r.count), 0));
      })
      .catch(() => setActivities([]));
  }, [year]);

  const weeks = buildGrid(activities, year);
  const years = [currentYear, currentYear - 1];

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <span className="heatmap-title">
          <strong>{total}</strong> hoạt động trong năm {year}
        </span>
        <div className="heatmap-year-btns">
          {years.map((y) => (
            <button
              key={y}
              className={`heatmap-year-btn${year === y ? ' active' : ''}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="heatmap-grid-wrap">
        {/* Day labels */}
        <div className="heatmap-day-labels">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <span key={d} className="heatmap-day-label">
              {DAY_LABELS[d] || ''}
            </span>
          ))}
        </div>

        {/* Weeks */}
        <div className="heatmap-weeks">
          {weeks.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  style={{ background: cell.inYear ? heatColor(cell.count) : 'transparent' }}
                  title={cell.inYear ? `${cell.date}: ${cell.count} hoạt động` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Ít hơn</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="heatmap-cell" style={{ background: heatColor(i === 0 ? 0 : i * 3) }} />
        ))}
        <span>Nhiều hơn</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Course card (Môn đang học)
──────────────────────────────────────────── */
const SUBJECT_ICONS = { toan: '🔢', default: '📚' };

function CourseCard({ course }) {
  const pct = course.total_lessons > 0
    ? Math.round((course.completed_lessons / course.total_lessons) * 100)
    : 0;
  const done = pct === 100;

  return (
    <Link
      to={`/pho-thong/${course.grade_slug}/${course.subject_slug}`}
      className="profile-course-card"
    >
      <div className="pcc-icon">{SUBJECT_ICONS[course.subject_slug] || SUBJECT_ICONS.default}</div>
      <div className="pcc-body">
        <div className="pcc-top">
          <span className={`pcc-badge ${done ? 'pcc-badge--done' : 'pcc-badge--progress'}`}>
            {done ? 'HOÀN THÀNH' : 'ĐANG HỌC'}
          </span>
        </div>
        <div className="pcc-title">{course.subject_name} — {course.grade_name}</div>
        <div className="pcc-meta">
          <FiBook size={12} /> {course.completed_lessons}/{course.total_lessons} bài
        </div>
        <div className="pcc-bar">
          <div className="pcc-bar-fill" style={{ width: `${pct}%`, background: done ? 'var(--green)' : 'var(--blue)' }} />
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────
   Path card (Lộ trình đang học)
──────────────────────────────────────────── */
function PathCard({ path }) {
  return (
    <Link to={`/skill-paths/${path.slug}`} className="profile-course-card">
      <div className="pcc-icon">🎯</div>
      <div className="pcc-body">
        <div className="pcc-top">
          <span className="pcc-badge pcc-badge--progress">LỘ TRÌNH</span>
        </div>
        <div className="pcc-title">{path.title}</div>
        <div className="pcc-meta">
          <FiAward size={12} /> {path.module_count || 0} modules
          &nbsp;·&nbsp;
          <FiClock size={12} /> {path.estimated_hours}h
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────
   Main ProfilePage
──────────────────────────────────────────── */
const ProfilePage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [paths, setPaths] = useState([]);
  const [overview, setOverview] = useState(null);
  const [tab, setTab] = useState('courses');
  const [loading, setLoading] = useState(true);

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

  const getInitial = () => (user.display_name || user.email).charAt(0).toUpperCase();
  const getDisplayName = () => user.display_name || user.email.split('@')[0];
  const getHandle = () => '@' + user.email.split('@')[0];
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="profile-layout">
      {/* ── LEFT: Avatar card ── */}
      <aside className="profile-sidebar">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{getInitial()}</div>
        </div>
        <div className="profile-name">{getDisplayName()}</div>
        <div className="profile-handle">{getHandle()}</div>

        <div className="profile-meta-list">
          {joinedDate && (
            <div className="profile-meta-item">
              <FiCalendar size={14} />
              <span>Tham gia từ {joinedDate}</span>
            </div>
          )}
          <div className="profile-meta-item">
            <FiMapPin size={14} />
            <span>Việt Nam</span>
          </div>
          <div className="profile-meta-item">
            <FiBook size={14} />
            <span>{user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</span>
          </div>
        </div>

        {overview && (
          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{overview.total_lessons_completed}</strong>
              <span>Bài hoàn thành</span>
            </div>
            <div className="profile-stat">
              <strong>{overview.total_exercises_attempted}</strong>
              <span>Bài tập đã làm</span>
            </div>
            <div className="profile-stat">
              <strong>{overview.accuracy_rate}%</strong>
              <span>Tỉ lệ đúng</span>
            </div>
          </div>
        )}
      </aside>

      {/* ── RIGHT: Main content ── */}
      <main className="profile-main">
        {/* Heatmap */}
        <Heatmap userId={user.id} />

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab${tab === 'courses' ? ' active' : ''}`}
            onClick={() => setTab('courses')}
          >
            <FiBook size={14} /> Môn đang học ({courses.length})
          </button>
          <button
            className={`profile-tab${tab === 'paths' ? ' active' : ''}`}
            onClick={() => setTab('paths')}
          >
            <FiAward size={14} /> Lộ trình ({paths.length})
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : tab === 'courses' ? (
          courses.length > 0 ? (
            <div className="profile-course-grid">
              {courses.map((c) => (
                <CourseCard key={`${c.grade_id}-${c.subject_id}`} course={c} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <span className="empty-state-icon">📖</span>
              <h3>Chưa bắt đầu học môn nào</h3>
              <p>Hãy vào phần Phổ thông để bắt đầu học!</p>
              <Link to="/pho-thong" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                Khám phá ngay
              </Link>
            </div>
          )
        ) : (
          <div className="profile-course-grid">
            {paths.map((p) => (
              <PathCard key={p.id} path={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
