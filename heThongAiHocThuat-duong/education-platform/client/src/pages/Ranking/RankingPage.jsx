import { useState, useEffect } from 'react';
import { getPracticeLeaderboard } from '../../api/practiceApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const RANK_STYLES = [
  { icon: '🥇', bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)', color: '#fff' },
  { icon: '🥈', bg: 'linear-gradient(135deg,#9CA3AF,#D1D5DB)', color: '#fff' },
  { icon: '🥉', bg: 'linear-gradient(135deg,#CD7F32,#D97706)', color: '#fff' },
];

const TABS = [
  { key: 'week',  label: '📅 Tuần này' },
  { key: 'month', label: '🗓 Tháng này' },
  { key: 'all',   label: '🏆 Toàn thời gian' },
];

const RankingPage = () => {
  const { user } = useAuth();
  const [tab, setTab]   = useState('week');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dùng leaderboard của luyện tập nhanh (API hiện có)
  useEffect(() => {
    setLoading(true);
    getPracticeLeaderboard({ gradeSlug: 'lop-9', subjectSlug: 'toan', limit: 20 })
      .then(r => setRows(r.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const myRank = rows.findIndex(r => r.user_id === user?.id) + 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏆 Bảng xếp hạng</h1>
        <p>Cạnh tranh lành mạnh, cùng nhau tiến bộ</p>
      </div>

      {/* Tabs */}
      <div className="ranking-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`ranking-tab${tab === t.key ? ' ranking-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* My rank */}
      {myRank > 0 && (
        <div className="ranking-my-rank">
          <span>🎯 Hạng của bạn:</span>
          <strong>#{myRank}</strong>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && rows.length >= 3 && (
        <div className="ranking-podium">
          {[rows[1], rows[0], rows[2]].map((r, i) => {
            const pos = i === 1 ? 0 : i === 0 ? 1 : 2; // 2nd, 1st, 3rd
            const style = RANK_STYLES[pos];
            return (
              <div key={r.user_id} className={`podium-item podium-item--${pos + 1}`}>
                <div className="podium-avatar" style={{ background: style.bg, color: style.color }}>
                  {(r.display_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="podium-rank">{style.icon}</div>
                <div className="podium-name">{r.display_name || 'Ẩn danh'}</div>
                <div className="podium-score">{r.score} điểm</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {loading ? <LoadingSpinner /> : (
        <div className="ranking-list">
          {rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h3>Chưa có dữ liệu</h3>
              <p>Hãy luyện tập để lên bảng xếp hạng!</p>
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={r.user_id}
                className={`ranking-row${r.user_id === user?.id ? ' ranking-row--me' : ''}`}
              >
                <div className="ranking-pos">
                  {i < 3 ? RANK_STYLES[i].icon : `#${i + 1}`}
                </div>
                <div className="ranking-avatar">
                  {(r.display_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="ranking-info">
                  <div className="ranking-name">{r.display_name || 'Ẩn danh'}{r.user_id === user?.id ? ' (Bạn)' : ''}</div>
                  <div className="ranking-meta">Streak {r.max_streak} · {r.correct_count}/{r.total_questions} câu đúng</div>
                </div>
                <div className="ranking-score">
                  <span className="ranking-score-num">{r.score}</span>
                  <span className="ranking-score-lbl">điểm</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RankingPage;
