import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiClock, FiRefreshCw } from 'react-icons/fi';
import { getPracticeLeaderboard } from '../../api/practiceApi';
import { getGrades, getSubjectsByGrade } from '../../api/subjectApi';
import useAuth from '../../hooks/useAuth';

const DIFF_LABELS = { 1: 'Dễ', 2: 'Trung bình', 3: 'Khó' };
const DIFF_COLORS = { 1: '#16a34a', 2: '#2563eb', 3: '#dc2626' };
const DIFF_BGCOLORS = { 1: '#dcfce7', 2: '#eff6ff', 3: '#fef2f2' };

const fmtTime = (secs) => {
  if (!secs && secs !== 0) return '—';
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
};

const Avatar = ({ name, size = 40 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="lb-avatar" style={{ width: size, height: size, background: `hsl(${hue},60%,55%)` }}>
      {initials}
    </div>
  );
};

const PodiumCard = ({ entry, position }) => {
  if (!entry) return <div className="lb-podium-empty" />;
  const heights = { 1: 'lb-podium--first', 2: 'lb-podium--second', 3: 'lb-podium--third' };
  const medals  = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className={`lb-podium-card ${heights[position]}`}>
      {position === 1 && <div className="lb-podium-crown">👑</div>}
      <Avatar name={entry.display_name} size={position === 1 ? 64 : 52} />
      <div className="lb-podium-name">{entry.display_name}</div>
      <div className="lb-podium-score">{entry.score.toLocaleString()}</div>
      <div className="lb-podium-label">{position === 1 ? 'CHAMPION' : `RANK ${position}`}</div>
      <div className={`lb-podium-bar lb-podium-bar--${position === 1 ? 'first' : position === 2 ? 'second' : 'third'}`} />
    </div>
  );
};

const PracticeLeaderboard = () => {
  const { user } = useAuth();

  const [levels,   setLevels]   = useState([]);
  const [grades,   setGrades]   = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selLevel,   setSelLevel]   = useState('');
  const [selGrade,   setSelGrade]   = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selDiff,    setSelDiff]    = useState('');  // '' = all

  const [entries,    setEntries]    = useState([]);
  const [myRank,     setMyRank]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Load cấu trúc
  useEffect(() => { getGrades().then((r) => setLevels(r.data)); }, []);

  useEffect(() => {
    if (!selLevel) { setGrades([]); setSelGrade(''); return; }
    const lvl = levels.find((l) => l.slug === selLevel);
    setGrades(lvl?.grades || []);
    setSelGrade(''); setSubjects([]); setSelSubject('');
  }, [selLevel, levels]);

  useEffect(() => {
    if (!selGrade) { setSubjects([]); setSelSubject(''); return; }
    getSubjectsByGrade(selGrade).then((r) => { setSubjects(r.data); setSelSubject(''); });
  }, [selGrade]);

  const fetchLeaderboard = useCallback(async () => {
    if (!selGrade || !selSubject) { setEntries([]); setMyRank(null); return; }
    setLoading(true); setError('');
    try {
      const params = { gradeSlug: selGrade, subjectSlug: selSubject, limit: 50 };
      if (selDiff) params.difficulty = selDiff;
      const res = await getPracticeLeaderboard(params);
      const rows = res.data || [];
      setEntries(rows);

      // Tìm vị trí user hiện tại
      if (user) {
        const myIdx = rows.findIndex((r) => r.user_id === user.id);
        setMyRank(myIdx >= 0 ? { ...rows[myIdx], rank: myIdx + 1 } : null);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Không tải được bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  }, [selGrade, selSubject, selDiff, user]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3);
  const showMyRank = myRank && myRank.rank > 3;

  return (
    <div className="lb-page">
      {/* ── Header ── */}
      <div className="lb-header">
        <div>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-subtitle">So sánh kết quả của bạn với người dùng khác.</p>
        </div>
        <Link to="/practice" className="btn btn--primary btn--sm" id="lb-start-practice">
          <FiZap size={14} /> Luyện tập ngay
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="lb-filters">
        {/* Cấp + Lớp */}
        <div className="lb-filter-group">
          <label>Cấp học</label>
          <select className="form-input lb-select" value={selLevel} onChange={(e) => setSelLevel(e.target.value)}>
            <option value="">-- Chọn cấp --</option>
            {levels.map((l) => <option key={l.slug} value={l.slug}>{l.level}</option>)}
          </select>
        </div>
        <div className="lb-filter-group">
          <label>Lớp</label>
          <select className="form-input lb-select" value={selGrade} onChange={(e) => setSelGrade(e.target.value)} disabled={!selLevel}>
            <option value="">-- Chọn lớp --</option>
            {grades.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
          </select>
        </div>

        {/* Subject pills */}
        {subjects.length > 0 && (
          <div className="lb-filter-group lb-filter-group--subjects">
            <label>Môn học</label>
            <div className="lb-subject-pills">
              {subjects.map((s) => (
                <button
                  key={s.slug}
                  className={`lb-pill ${selSubject === s.slug ? 'lb-pill--active' : ''}`}
                  onClick={() => setSelSubject(selSubject === s.slug ? '' : s.slug)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty pills */}
        <div className="lb-filter-group lb-filter-group--diff">
          <label>Độ khó</label>
          <div className="lb-subject-pills">
            {[{ v: '', l: 'Tất cả' }, { v: '1', l: 'Dễ' }, { v: '2', l: 'Trung bình' }, { v: '3', l: 'Khó' }].map(({ v, l }) => (
              <button
                key={v}
                className={`lb-pill ${selDiff === v ? 'lb-pill--active' : ''}`}
                onClick={() => setSelDiff(v)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button className="lb-refresh-btn" onClick={fetchLeaderboard} title="Làm mới">
          <FiRefreshCw size={15} className={loading ? 'lb-spinning' : ''} />
        </button>
      </div>

      {/* ── Content ── */}
      {!selGrade || !selSubject ? (
        <div className="lb-empty-state">
          <span className="lb-empty-icon">🏆</span>
          <h3>Chọn lớp và môn học</h3>
          <p>để xem bảng xếp hạng</p>
        </div>
      ) : loading ? (
        <div className="lb-loading">
          <div className="spinner" /> <span>Đang tải bảng xếp hạng...</span>
        </div>
      ) : error ? (
        <div className="lb-error">{error}</div>
      ) : entries.length === 0 ? (
        <div className="lb-empty-state">
          <span className="lb-empty-icon">📭</span>
          <h3>Chưa có ai luyện tập</h3>
          <p>Hãy là người đầu tiên lên bảng xếp hạng!</p>
          <Link to="/practice" className="btn btn--primary btn--sm" style={{ marginTop: 12 }}>
            Bắt đầu ngay <FiArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          {/* ── Top 3 Podium ── */}
          {top3.length >= 1 && (
            <div className="lb-podium-wrap">
              {/* Order: 2nd, 1st, 3rd */}
              <PodiumCard entry={top3[1]} position={2} />
              <PodiumCard entry={top3[0]} position={1} />
              <PodiumCard entry={top3[2]} position={3} />
            </div>
          )}

          {/* ── Table ── */}
          <div className="lb-table-card">
            <div className="lb-table-header">
              <span>RANK</span>
              <span>NGƯỜI CHƠI</span>
              <span>ĐIỂM</span>
              <span>THỜI GIAN</span>
            </div>

            {/* Rows 4+ */}
            {rest.map((row, i) => {
              const rank = i + 4;
              const isMe = user && row.user_id === user.id;
              return (
                <div key={`${row.user_id}-${i}`} className={`lb-table-row ${isMe ? 'lb-table-row--me' : ''}`}>
                  <span className="lb-rank-num">{String(rank).padStart(2, '0')}</span>
                  <span className="lb-participant">
                    <Avatar name={row.display_name} size={36} />
                    <span>
                      <strong>{isMe ? 'Bạn' : row.display_name}</strong>
                      {isMe && <em className="lb-me-tag">Bạn đây!</em>}
                    </span>
                  </span>
                  <span className="lb-score">{row.score.toLocaleString()}</span>
                  <span className="lb-time"><FiClock size={12} /> {fmtTime(row.duration_seconds)}</span>
                </div>
              );
            })}

            {/* Current user row nếu ngoài top */}
            {showMyRank && (
              <>
                <div className="lb-table-sep">• • •</div>
                <div className="lb-table-row lb-table-row--me">
                  <span className="lb-rank-num">{String(myRank.rank).padStart(2, '0')} <span className="lb-rank-dot" /></span>
                  <span className="lb-participant">
                    <Avatar name={myRank.display_name} size={36} />
                    <span>
                      <strong>Bạn</strong>
                      <em className="lb-me-tag">Keep practicing!</em>
                    </span>
                  </span>
                  <span className="lb-score lb-score--me">{myRank.score.toLocaleString()}</span>
                  <span className="lb-time lb-time--me"><FiClock size={12} /> {fmtTime(myRank.duration_seconds)}</span>
                </div>
              </>
            )}
          </div>

          {/* Strategy Insight */}
          <div className="lb-insight">
            <span className="lb-insight-icon">💡</span>
            <div>
              <strong>Strategy Insight</strong>
              <p>Luyện tập đều đặn mỗi ngày giúp bạn cải thiện thứ hạng nhanh hơn. Hãy chọn đúng độ khó phù hợp và tập trung vào từng chương!</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PracticeLeaderboard;
