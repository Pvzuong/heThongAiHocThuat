import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiTrendingUp, FiLayers, FiBookOpen, FiClock, FiHeart } from 'react-icons/fi';
import { getGrades, getSubjectsByGrade, getChaptersBySubject } from '../../api/subjectApi';
import { getPracticeQuestions } from '../../api/practiceApi';
import useAuth from '../../hooks/useAuth';

// ─── Config ───────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  1: { key: 1, label: 'EASY',   labelVi: 'Dễ',        color: '#16a34a', bg: '#dcfce7', sessionMin: 3, secPerQ: 10, maxWrong: 10, recommended: false },
  2: { key: 2, label: 'MEDIUM', labelVi: 'Trung bình', color: '#2563eb', bg: '#eff6ff', sessionMin: 4, secPerQ: 7,  maxWrong: 7,  recommended: true  },
  3: { key: 3, label: 'HARD',   labelVi: 'Khó',        color: '#dc2626', bg: '#fef2f2', sessionMin: 5, secPerQ: 5,  maxWrong: 5,  recommended: false },
};

// Subject icon map
const SUBJECT_ICONS = {
  'toan': '∑', 'vat-ly': '⚗', 'hoa-hoc': '🧪', 'sinh-hoc': '🧬',
  'lich-su': '🕐', 'dia-ly': '🌐', 'tieng-viet': 'Aa', 'ngu-van': '✍',
  'tieng-anh': '🇬🇧', 'tin-hoc': '💻', 'gdcd': '⚖',
};
const getSubjectIcon = (slug) => SUBJECT_ICONS[slug] || '📚';

// ─── Component ────────────────────────────────────────────────
const PracticeSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [levels,   setLevels]   = useState([]);
  const [grades,   setGrades]   = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selLevel,   setSelLevel]   = useState('');
  const [selGrade,   setSelGrade]   = useState('');
  const [selSubject, setSelSubject] = useState(null);  // object {slug, name}
  const [difficulty, setDifficulty] = useState(2);
  const [topicMode,  setTopicMode]  = useState('all'); // 'all' | chapterId
  const [chapterId,  setChapterId]  = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { getGrades().then((r) => setLevels(r.data)); }, []);

  useEffect(() => {
    if (!selLevel) { setGrades([]); setSelGrade(''); return; }
    const lvl = levels.find((l) => l.slug === selLevel);
    setGrades(lvl?.grades || []);
    setSelGrade(''); setSubjects([]); setSelSubject(null); setChapters([]);
  }, [selLevel, levels]);

  useEffect(() => {
    if (!selGrade) { setSubjects([]); setSelSubject(null); return; }
    getSubjectsByGrade(selGrade).then((r) => { setSubjects(r.data); setSelSubject(null); setChapters([]); });
  }, [selGrade]);

  useEffect(() => {
    if (!selGrade || !selSubject) { setChapters([]); return; }
    getChaptersBySubject(selGrade, selSubject.slug).then((r) => setChapters(r.data));
  }, [selGrade, selSubject]);

  const canStart = selGrade && selSubject;

  const handleStart = async () => {
    setLoading(true); setError('');
    try {
      const params = { gradeSlug: selGrade, subjectSlug: selSubject.slug, difficulty, limit: 80 };
      if (topicMode !== 'all') params.chapterId = topicMode;

      const res = await getPracticeQuestions(params);
      const questions = res.data.questions || [];

      if (questions.length === 0) {
        setError('Chưa có câu hỏi cho lựa chọn này. Thử độ khó hoặc chủ đề khác!');
        setLoading(false);
        return;
      }

      const gradeObj   = grades.find((g) => g.slug === selGrade);
      const chapterObj = chapters.find((c) => String(c.id) === String(topicMode));
      const config = DIFFICULTY_CONFIG[difficulty];

      navigate('/practice/arena', {
        state: {
          questions,
          gradeSlug:   selGrade,
          gradeName:   gradeObj?.name  || selGrade,
          subjectSlug: selSubject.slug,
          subjectName: selSubject.name,
          chapterId:   topicMode !== 'all' ? topicMode : null,
          chapterName: chapterObj?.title || 'Tất cả chương',
          difficulty,
          ...config,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi tải câu hỏi');
      setLoading(false);
    }
  };

  const cfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="ps-page">
      {/* ── Page Header ── */}
      <div className="ps-page-header">
        <div>
          <h1 className="ps-page-title">Configure Practice</h1>
          <p className="ps-page-sub">Chọn môn học, mức độ và chủ đề để bắt đầu phiên luyện tập.</p>
        </div>
        <Link to="/practice/leaderboard" className="ps-lb-link">
          <FiTrendingUp size={16} /> Bảng xếp hạng
        </Link>
      </div>

      <div className="ps-layout">
        {/* ── LEFT ── */}
        <div className="ps-left">

          {/* Chọn cấp & lớp */}
          <div className="ps-card">
            <div className="ps-card-title">
              <span className="ps-card-icon">🎓</span> Chọn lớp học
            </div>
            <div className="ps-grade-selects">
              <div className="ps-select-wrap">
                <label>Cấp học</label>
                <select className="form-input" value={selLevel} onChange={(e) => setSelLevel(e.target.value)}>
                  <option value="">-- Chọn cấp --</option>
                  {levels.map((l) => <option key={l.slug} value={l.slug}>{l.level}</option>)}
                </select>
              </div>
              <div className="ps-select-wrap">
                <label>Lớp</label>
                <select className="form-input" value={selGrade} onChange={(e) => setSelGrade(e.target.value)} disabled={!selLevel}>
                  <option value="">-- Chọn lớp --</option>
                  {grades.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="ps-card">
            <div className="ps-card-title">
              <span className="ps-card-icon">📚</span> Subject Selection
            </div>
            {!selGrade ? (
              <p className="ps-placeholder">Chọn lớp để xem danh sách môn học.</p>
            ) : subjects.length === 0 ? (
              <p className="ps-placeholder">Chưa có môn học nào trong lớp này.</p>
            ) : (
              <div className="ps-subject-grid">
                {subjects.map((s) => (
                  <button
                    key={s.slug}
                    id={`ps-subject-${s.slug}`}
                    className={`ps-subject-btn ${selSubject?.slug === s.slug ? 'ps-subject-btn--active' : ''}`}
                    onClick={() => { setSelSubject(s); setTopicMode('all'); setChapterId(''); }}
                  >
                    {selSubject?.slug === s.slug && <span className="ps-subject-check">✓</span>}
                    <span className="ps-subject-icon">{getSubjectIcon(s.slug)}</span>
                    <span className="ps-subject-name">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic Mode */}
          <div className="ps-card">
            <div className="ps-card-title">
              <span className="ps-card-icon">🗂</span> Topic Mode
            </div>
            <div className="ps-topic-grid">
              <button
                className={`ps-topic-btn ${topicMode === 'all' ? 'ps-topic-btn--active' : ''}`}
                onClick={() => setTopicMode('all')}
                disabled={!selSubject}
              >
                <FiLayers size={18} />
                <div>
                  <strong>Comprehensive</strong>
                  <p>Tổng hợp tất cả chương để kiểm tra toàn diện.</p>
                </div>
              </button>

              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  className={`ps-topic-btn ${topicMode === String(ch.id) ? 'ps-topic-btn--active' : ''}`}
                  onClick={() => setTopicMode(String(ch.id))}
                  disabled={!selSubject}
                >
                  <FiBookOpen size={18} />
                  <div>
                    <strong>By Chapter</strong>
                    <p>{ch.title}</p>
                  </div>
                </button>
              ))}

              {selSubject && chapters.length === 0 && (
                <p className="ps-placeholder">Chưa có chương nào trong môn này.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="ps-right">
          <div className="ps-card ps-difficulty-card">
            <div className="ps-card-title">
              <FiZap size={16} /> Difficulty Intensity
            </div>

            {Object.values(DIFFICULTY_CONFIG).map((c) => (
              <button
                key={c.key}
                id={`ps-diff-${c.key}`}
                className={`ps-diff-row ${difficulty === c.key ? 'ps-diff-row--active' : ''}`}
                onClick={() => setDifficulty(c.key)}
              >
                <div className="ps-diff-row-left">
                  <span
                    className="ps-diff-badge"
                    style={{ background: difficulty === c.key ? c.color : '#e5e7eb', color: difficulty === c.key ? '#fff' : '#6b7280' }}
                  >
                    {c.label}
                  </span>
                  <span className="ps-diff-session">{c.sessionMin} min session</span>
                  {c.recommended && <span className="ps-diff-rec">RECOMMENDED</span>}
                </div>
                <div className="ps-diff-row-stats">
                  <span><FiClock size={12} /> {c.secPerQ}s/q</span>
                  <span><FiHeart size={12} /> {c.maxWrong} lives</span>
                </div>
              </button>
            ))}

            {error && <p className="ps-error">{error}</p>}

            <button
              id="ps-start-btn"
              className="ps-start-btn"
              onClick={handleStart}
              disabled={!canStart || loading}
            >
              {loading ? 'Đang tải...' : <><span>Start Practice</span> <FiArrowRight size={18} /></>}
            </button>

            <p className="ps-start-note">
              Kết quả được lưu vào bảng xếp hạng toàn cầu.
            </p>
          </div>

          {/* Leaderboard shortcut */}
          <Link to="/practice/leaderboard" className="ps-card ps-lb-card">
            <div className="ps-lb-card-inner">
              <span className="ps-lb-trophy">🏆</span>
              <div>
                <strong>Bảng xếp hạng</strong>
                <p>Xem thứ hạng của bạn so với người khác</p>
              </div>
              <FiArrowRight size={18} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PracticeSetup;
