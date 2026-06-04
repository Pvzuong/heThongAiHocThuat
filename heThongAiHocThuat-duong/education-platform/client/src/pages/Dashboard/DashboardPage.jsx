import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiZap, FiBook, FiTarget, FiStar } from 'react-icons/fi';
import { getProgressOverview, getHeatmap } from '../../api/lessonApi';
import { getPaths } from '../../api/pathApi';
import { getMySessions } from '../../api/practiceApi';
import Heatmap from '../../components/Heatmap';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

/* ── Helpers ────────────────────────────────────────── */
const XP_PER_LEVEL = 100;
const calcLevel  = (att) => Math.min(Math.floor(att / 10) + 1, 50);
const calcXP     = (att, acc) => (att * 8 + (acc || 0) * 0.5) | 0;
const xpInLevel  = (xp) => xp % XP_PER_LEVEL;
const xpProgress = (xp) => Math.min((xpInLevel(xp) / XP_PER_LEVEL) * 100, 100);

const LEVEL_NAMES = ['Mới bắt đầu','Tập sự','Học viên','Thành thạo','Chuyên gia','Huyền thoại'];
const getLevelName = (lv) => lv >= 40 ? LEVEL_NAMES[5] : lv >= 25 ? LEVEL_NAMES[4] : lv >= 10 ? LEVEL_NAMES[3] : lv >= 5 ? LEVEL_NAMES[2] : lv >= 2 ? LEVEL_NAMES[1] : LEVEL_NAMES[0];

function calcStreak(sessions) {
  if (!sessions?.length) return 0;
  const days = new Set(sessions.map(s => s.played_at?.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  d.setHours(0,0,0,0);
  while (days.has(d.toISOString().slice(0,10))) { streak++; d.setDate(d.getDate()-1); }
  return streak;
}

function AnimNum({ value }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!value) return;
    let cur = 0;
    const step = Math.ceil(value / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setN(value); clearInterval(t); } else setN(cur);
    }, 20);
    return () => clearInterval(t);
  }, [value]);
  return <span ref={ref}>{n}</span>;
}

/* ── Daily Missions ──────────────────────────────────── */
const MISSIONS = [
  { id: 'lesson', icon: '📖', label: 'Học 1 bài',          xp: 20, link: '/pho-thong' },
  { id: 'quiz',   icon: '⚡', label: 'Làm 1 quiz luyện tập', xp: 20, link: '/practice' },
  { id: 'ai',     icon: '🤖', label: 'Luyện tập với AI 1 lần', xp: 10, link: '/ai-coach' },
];

/* ── Main ─────────────────────────────────────────────── */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [paths,    setPaths]    = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [missions, setMissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lh_missions_' + new Date().toDateString()) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    Promise.all([
      getProgressOverview(),
      getPaths(),
      getMySessions({ limit: 30 }),
    ]).then(([ov, pa, se]) => {
      setOverview(ov.data);
      setPaths(pa.data.slice(0, 4));
      setSessions(se.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const attempts  = overview?.total_exercises_attempted ?? 0;
  const accuracy  = overview?.accuracy_rate ?? 0;
  const completed = overview?.total_lessons_completed ?? 0;
  const level     = calcLevel(attempts);
  const xp        = calcXP(attempts, accuracy);
  const streak    = calcStreak(sessions);
  const levelName = getLevelName(level);

  // Lưu streak/XP vào localStorage để sidebar đọc
  localStorage.setItem('lh_streak', String(streak));
  localStorage.setItem('lh_xp', String(xp));

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'bạn';

  const toggleMission = (id) => {
    const next = missions.includes(id) ? missions.filter(m => m !== id) : [...missions, id];
    setMissions(next);
    localStorage.setItem('lh_missions_' + new Date().toDateString(), JSON.stringify(next));
  };
  const missionXP = MISSIONS.filter(m => missions.includes(m.id)).reduce((s,m) => s + m.xp, 0);
  const missionDone = missions.length >= MISSIONS.length;

  // Bài gần nhất chưa hoàn thành
  const nextChapter = overview?.chapters?.find(ch => ch.progress_percent < 100);

  return (
    <div className="dashboard-page">

      {/* ── HERO GREETING ──────────────────────────────── */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <div className="dash-hero-greeting">Xin chào, {displayName} 👋</div>
          <div className="dash-hero-streak">
            {streak > 0
              ? <><span>🔥</span> Bạn đang học ngày thứ <strong>{streak}</strong> liên tiếp</>
              : <><span>🌱</span> Hãy bắt đầu streak của bạn hôm nay!</>}
          </div>

          {/* Level + XP */}
          <div className="dash-level-card">
            <div className="dash-level-info">
              <span className="dash-level-badge">Lv.{level}</span>
              <span className="dash-level-name">{levelName}</span>
              <span className="dash-xp-label">{xpInLevel(xp)}/{XP_PER_LEVEL} XP</span>
            </div>
            <div className="progress progress--thick">
              <div className="progress__fill" style={{ width: `${xpProgress(xp)}%` }} />
            </div>
          </div>
        </div>

        <div className="dash-hero-stats">
          <div className="dash-mini-stat">
            <span className="dash-mini-stat-num"><AnimNum value={completed} /></span>
            <span className="dash-mini-stat-lbl">Bài học</span>
          </div>
          <div className="dash-mini-stat">
            <span className="dash-mini-stat-num"><AnimNum value={attempts} /></span>
            <span className="dash-mini-stat-lbl">Bài tập</span>
          </div>
          <div className="dash-mini-stat">
            <span className="dash-mini-stat-num"><AnimNum value={Math.round(accuracy)} />%</span>
            <span className="dash-mini-stat-lbl">Chính xác</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">

        {/* ── CONTINUE LEARNING ──────────────────────── */}
        <div className="dash-col-main">
          {nextChapter ? (
            <div className="dash-continue card card--hover">
              <div className="dash-continue-label">Tiếp tục học</div>
              <h3 className="dash-continue-title">{nextChapter.title}</h3>
              <div className="dash-continue-progress">
                <div className="progress">
                  <div className="progress__fill" style={{ width: `${nextChapter.progress_percent}%` }} />
                </div>
                <span>{Math.round(nextChapter.progress_percent)}% hoàn thành</span>
              </div>
              <div className="dash-continue-meta">
                {nextChapter.completed_lessons}/{nextChapter.total_lessons} bài · {nextChapter.title}
              </div>
              <Link to="/pho-thong" className="btn btn--primary">
                Tiếp tục <FiArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="dash-continue card">
              <div className="dash-continue-label">Bắt đầu học</div>
              <h3 className="dash-continue-title">Chọn chương trình của bạn</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                Bắt đầu với chương trình THCS/THPT hoặc kỹ năng nghề theo sở thích.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/pho-thong"   className="btn btn--primary btn--sm">📚 Phổ thông</Link>
                <Link to="/skill-paths" className="btn btn--outline btn--sm">💻 Kỹ năng</Link>
              </div>
            </div>
          )}

          {/* ── AI INSIGHT ─────────────────────────── */}
          <div className="dash-ai-insight card">
            <div className="dash-ai-insight-header">
              <span className="dash-ai-icon">🤖</span>
              <div>
                <div className="dash-ai-title">AI Insight</div>
                <div className="dash-ai-sub">Phân tích tiến độ của bạn</div>
              </div>
              <Link to="/ai-coach" className="btn btn--primary btn--sm">Luyện AI</Link>
            </div>
            <div className="dash-ai-body">
              {accuracy >= 80 ? (
                <div className="dash-ai-item dash-ai-item--good">
                  <span>💪</span>
                  <span>Tỉ lệ chính xác {accuracy}% — rất tốt! Hãy thử độ khó cao hơn.</span>
                </div>
              ) : attempts > 0 ? (
                <div className="dash-ai-item dash-ai-item--warn">
                  <span>📈</span>
                  <span>Tỉ lệ đúng {accuracy}% — hãy luyện tập thêm để cải thiện.</span>
                </div>
              ) : (
                <div className="dash-ai-item">
                  <span>✨</span>
                  <span>Làm một vài bài tập để AI phân tích điểm mạnh/yếu của bạn.</span>
                </div>
              )}
              <div className="dash-ai-actions">
                <Link to="/ai-coach" className="dash-ai-chip">🤖 Tạo câu hỏi AI</Link>
                <Link to="/practice/ai-history" className="dash-ai-chip">📋 Bộ câu hỏi đã tạo</Link>
                <Link to="/practice"            className="dash-ai-chip">⚡ Luyện tập nhanh</Link>
              </div>
            </div>
          </div>

          {/* ── ACTIVITY HEATMAP ───────────────────── */}
          <div className="card card--flat" style={{ overflow: 'hidden' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Hoạt động học tập</h3>
            <div style={{ overflowX: 'auto' }}>
              <Heatmap />
            </div>
          </div>
        </div>

        {/* ── SIDEBAR COLUMN ─────────────────────────── */}
        <div className="dash-col-side">

          {/* Daily Missions */}
          <div className="card card--flat">
            <div className="dash-mission-header">
              <span>🎯 Daily Mission</span>
              <span className="dash-mission-xp">+{missionXP} XP hôm nay</span>
            </div>
            <div className="dash-missions">
              {MISSIONS.map((m) => {
                const done = missions.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`dash-mission-item${done ? ' dash-mission-item--done' : ''}`}
                    onClick={() => toggleMission(m.id)}
                  >
                    <span className="dash-mission-check">{done ? '✅' : '○'}</span>
                    <span className="dash-mission-icon">{m.icon}</span>
                    <span className="dash-mission-label">{m.label}</span>
                    <span className="dash-mission-reward">+{m.xp} XP</span>
                  </div>
                );
              })}
            </div>
            {missionDone && (
              <div className="dash-mission-complete">
                🎉 Hoàn thành tất cả nhiệm vụ hôm nay!
              </div>
            )}
          </div>

          {/* Skill paths */}
          {paths.length > 0 && (
            <div className="card card--flat">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>🗺️ Lộ trình kỹ năng</h3>
                <Link to="/skill-paths" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Xem tất cả →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paths.map(p => (
                  <Link key={p.slug} to={`/skill-paths/${p.slug}`} className="dash-path-card">
                    <span className="dash-path-icon">💻</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="dash-path-title truncate">{p.title}</div>
                      <div className="dash-path-meta">{p.module_count} modules · {p.estimated_hours}h</div>
                    </div>
                    <FiArrowRight size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick nav */}
          <div className="card card--flat">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⚡ Bắt đầu nhanh</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Luyện tập nhanh',   icon: '⚡', to: '/practice',  color: 'var(--primary)' },
                { label: 'AI Coach',           icon: '🤖', to: '/ai-coach',  color: 'var(--secondary)' },
                { label: 'Xem Ranking',        icon: '🏆', to: '/ranking',   color: 'var(--xp-color)' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="dash-quick-item">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <FiArrowRight size={13} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
