import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCheckCircle, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { getProgressOverview } from '../../api/lessonApi';
import { getPaths } from '../../api/pathApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgressOverview(), getPaths()])
      .then(([overviewRes, pathsRes]) => {
        setOverview(overviewRes.data);
        setPaths(pathsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Xin chào, {user?.display_name || user?.email} 👋</h1>
        <p>Tiến độ học tập của bạn</p>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon--blue"><FiCheckCircle size={22} /></div>
          <div>
            <span className="dash-stat-num">{overview?.total_lessons_completed ?? 0}</span>
            <span className="dash-stat-label">Bài đã hoàn thành</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon--green"><FiTarget size={22} /></div>
          <div>
            <span className="dash-stat-num">{overview?.total_exercises_attempted ?? 0}</span>
            <span className="dash-stat-label">Bài tập đã làm</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon--purple"><FiTrendingUp size={22} /></div>
          <div>
            <span className="dash-stat-num">{overview?.accuracy_rate ?? 0}%</span>
            <span className="dash-stat-label">Tỉ lệ trả lời đúng</span>
          </div>
        </div>
      </div>

      {/* Phổ thông progress */}
      <section className="dash-section">
        <div className="dash-section-header">
          <h2><FiBookOpen /> Tiến độ phổ thông</h2>
          <Link to="/pho-thong" className="btn btn--outline btn--sm">Tiếp tục học</Link>
        </div>

        {overview?.chapters?.length > 0 ? (
          <div className="dash-chapter-list">
            {overview.chapters.map((ch) => (
              <div key={ch.chapter_id} className="dash-chapter-item">
                <div className="dash-chapter-info">
                  <span className="dash-chapter-title">{ch.title}</span>
                  <span className="dash-chapter-meta">
                    {ch.completed_lessons}/{ch.total_lessons} bài
                  </span>
                </div>
                <div className="dash-chapter-progress">
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${ch.progress_percent}%` }}
                    />
                  </div>
                  <span className="dash-progress-pct">{ch.progress_percent}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <p>Bạn chưa bắt đầu học bài nào.</p>
            <Link to="/pho-thong" className="btn btn--primary">Bắt đầu học ngay</Link>
          </div>
        )}
      </section>

      {/* Skill paths */}
      <section className="dash-section">
        <div className="dash-section-header">
          <h2>🎯 Lộ trình kỹ năng</h2>
          <Link to="/skill-paths" className="btn btn--outline btn--sm">Xem tất cả</Link>
        </div>
        <div className="dash-path-list">
          {paths.map((path) => (
            <Link key={path.id} to={`/skill-paths/${path.slug}`} className="dash-path-card">
              <div>
                <h3>{path.title}</h3>
                <p>{path.module_count} modules · {path.estimated_hours}h</p>
              </div>
              <span className={`badge badge--${path.difficulty === 'beginner' ? 'green' : 'blue'}`}>
                {path.difficulty === 'beginner' ? 'Cơ bản' : 'Trung cấp'}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
