import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiArrowRight, FiZap, FiTrendingUp, FiLayers, FiBookOpen,
  FiClock, FiHeart, FiAward, FiGrid,
} from 'react-icons/fi';
import { getGrades, getSubjectsByGrade, getChaptersBySubject } from '../../api/subjectApi';
import { getPracticeQuestions, getSkillPathsForPractice, getSkillQuestions } from '../../api/practiceApi';
import useAuth from '../../hooks/useAuth';

// ─── Config ───────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  1: { key: 1, label: 'DỄ',   labelVi: 'Dễ',        color: '#16a34a', bg: '#dcfce7', sessionMin: 3, secPerQ: 10, maxWrong: 10, recommended: false },
  2: { key: 2, label: 'TB',   labelVi: 'Trung bình', color: '#2563eb', bg: '#eff6ff', sessionMin: 4, secPerQ: 7,  maxWrong: 7,  recommended: true  },
  3: { key: 3, label: 'KHÓ',  labelVi: 'Khó',        color: '#dc2626', bg: '#fef2f2', sessionMin: 5, secPerQ: 5,  maxWrong: 5,  recommended: false },
};

const SUBJECT_ICONS = {
  'toan': '∑', 'vat-ly': '⚗', 'hoa-hoc': '🧪', 'sinh-hoc': '🧬',
  'lich-su': '🕐', 'dia-ly': '🌐', 'tieng-viet': 'Aa', 'ngu-van': '✍',
  'tieng-anh': '🇬🇧', 'tin-hoc': '💻', 'gdcd': '⚖',
};
const getSubjectIcon = (slug) => SUBJECT_ICONS[slug] || '📚';

const SKILL_PATH_ICONS = {
  'tu-duy-logic': '🧠', 'toan-hoc-co-ban': '🔢', 'doc-hieu': '📖',
  'viet-lach': '✏️', 'khoa-hoc-tu-nhien': '🔬', 'giao-tiep': '💬',
  'lap-trinh': '💻', 'nghe-thuat': '🎨',
};
const getPathIcon = (slug) => SKILL_PATH_ICONS[slug] || '⚡';

// ─── Mode Tab ─────────────────────────────────────────────────
const MODES = [
  {
    id: 'pho-thong',
    label: 'Phổ Thông',
    icon: '🏫',
    desc: 'Luyện tập theo chương trình giáo dục phổ thông (Lớp 1–12)',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  },
  {
    id: 'ky-nang',
    label: 'Kỹ Năng',
    icon: '⚡',
    desc: 'Luyện tập theo các lộ trình kỹ năng tư duy và học thuật',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  },
];

// ─── Component ────────────────────────────────────────────────
const PracticeSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mode: 'pho-thong' | 'ky-nang'
  const [mode, setMode] = useState('pho-thong');

  // ── Phổ Thông State ──────────────────────────────────────
  const [levels,   setLevels]   = useState([]);
  const [grades,   setGrades]   = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selLevel,   setSelLevel]   = useState('');
  const [selGrade,   setSelGrade]   = useState('');
  const [selSubject, setSelSubject] = useState(null);
  const [topicMode,  setTopicMode]  = useState('all');

  // ── Kỹ Năng State ────────────────────────────────────────
  const [skillPaths,   setSkillPaths]   = useState([]);
  const [selPath,      setSelPath]      = useState(null);   // full path object
  const [selModuleId,  setSelModuleId]  = useState('all'); // 'all' | moduleId

  // Shared
  const [difficulty, setDifficulty] = useState(2);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // ── Load dữ liệu ban đầu ─────────────────────────────────
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

  useEffect(() => {
    if (mode === 'ky-nang' && skillPaths.length === 0) {
      getSkillPathsForPractice().then((r) => setSkillPaths(r.data)).catch(() => {});
    }
  }, [mode]);

  // ── Reset khi đổi mode ───────────────────────────────────
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
  };

  // ── Can Start ────────────────────────────────────────────
  const canStart =
    mode === 'pho-thong'
      ? !!(selGrade && selSubject)
      : !!(selPath);

  // ── Handle Start ─────────────────────────────────────────
  const handleStart = async () => {
    setLoading(true); setError('');
    try {
      let questions = [];
      let arenaState = {};

      if (mode === 'pho-thong') {
        const params = { gradeSlug: selGrade, subjectSlug: selSubject.slug, difficulty, limit: 80 };
        if (topicMode !== 'all') params.chapterId = topicMode;

        const res = await getPracticeQuestions(params);
        questions = res.data.questions || [];

        const gradeObj   = grades.find((g) => g.slug === selGrade);
        const chapterObj = chapters.find((c) => String(c.id) === String(topicMode));
        const config = DIFFICULTY_CONFIG[difficulty];

        arenaState = {
          questions,
          gradeSlug:   selGrade,
          gradeName:   gradeObj?.name  || selGrade,
          subjectSlug: selSubject.slug,
          subjectName: selSubject.name,
          chapterId:   topicMode !== 'all' ? topicMode : null,
          chapterName: chapterObj?.title || 'Tất cả chương',
          difficulty,
          practiceMode: 'pho-thong',
          ...config,
        };
      } else {
        // Kỹ năng — dùng difficulty cố định 1 (chỉ placement_questions)
        const params = { pathSlug: selPath.slug, limit: 60 };
        if (selModuleId !== 'all') params.moduleId = selModuleId;

        const res = await getSkillQuestions(params);
        questions = res.data.questions || [];

        const moduleObj = selPath.modules?.find((m) => String(m.id) === String(selModuleId));
        const config = DIFFICULTY_CONFIG[difficulty];

        arenaState = {
          questions,
          gradeSlug:   selPath.slug,
          gradeName:   selPath.title,
          subjectSlug: selModuleId !== 'all' ? String(selModuleId) : 'all',
          subjectName: moduleObj?.title || 'Tất cả module',
          chapterId:   null,
          chapterName: moduleObj?.title || 'Tất cả module',
          difficulty,
          practiceMode: 'ky-nang',
          pathTitle: selPath.title,
          ...config,
        };
      }

      if (questions.length === 0) {
        setError(
          mode === 'pho-thong'
            ? 'Chưa có câu hỏi cho lựa chọn này. Thử độ khó hoặc chủ đề khác!'
            : 'Lộ trình kỹ năng này chưa có câu hỏi luyện tập. Thử chọn lộ trình khác!'
        );
        setLoading(false);
        return;
      }

      navigate('/practice/arena', { state: arenaState });
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
          <h1 className="ps-page-title">⚡ Luyện Tập</h1>
          <p className="ps-page-sub">Chọn hình thức luyện tập và bắt đầu phiên chinh phục kiến thức.</p>
        </div>
        <Link to="/practice/leaderboard" className="ps-lb-link">
          <FiTrendingUp size={16} /> Bảng xếp hạng
        </Link>
      </div>

      {/* ── AI Banner ── */}
      <Link to="/practice/ai-generator" className="ps-ai-banner">
        <span className="ps-ai-banner-icon">🤖</span>
        <div>
          <div className="ps-ai-banner-title">Tạo câu hỏi bằng AI</div>
          <div className="ps-ai-banner-desc">Gemini tạo bộ câu hỏi Toán theo lớp, chủ đề và độ khó bạn chọn</div>
        </div>
        <FiArrowRight size={18} className="ps-ai-banner-arrow" />
      </Link>

      {/* ── Mode Selector ── */}
      <div className="ps-mode-tabs">
        {MODES.map((m) => (
          <button
            key={m.id}
            id={`ps-mode-${m.id}`}
            className={`ps-mode-tab ${mode === m.id ? 'ps-mode-tab--active' : ''}`}
            onClick={() => handleModeChange(m.id)}
            style={mode === m.id ? { '--tab-color': m.color, '--tab-gradient': m.gradient } : {}}
          >
            <span className="ps-mode-tab-icon">{m.icon}</span>
            <div className="ps-mode-tab-text">
              <strong>{m.label}</strong>
              <span>{m.desc}</span>
            </div>
            {mode === m.id && <span className="ps-mode-tab-check">✓</span>}
          </button>
        ))}
      </div>

      <div className="ps-layout">
        {/* ── LEFT ── */}
        <div className="ps-left">

          {/* ────── MODE: PHỔ THÔNG ────── */}
          {mode === 'pho-thong' && (
            <>
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
                  <span className="ps-card-icon">📚</span> Môn học
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
                        onClick={() => { setSelSubject(s); setTopicMode('all'); }}
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
                  <span className="ps-card-icon">🗂</span> Chủ đề
                </div>
                <div className="ps-topic-grid">
                  <button
                    className={`ps-topic-btn ${topicMode === 'all' ? 'ps-topic-btn--active' : ''}`}
                    onClick={() => setTopicMode('all')}
                    disabled={!selSubject}
                  >
                    <FiLayers size={18} />
                    <div>
                      <strong>Tổng hợp tất cả</strong>
                      <p>Câu hỏi từ toàn bộ chương trình môn học.</p>
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
                        <strong>Theo chương</strong>
                        <p>{ch.title}</p>
                      </div>
                    </button>
                  ))}

                  {selSubject && chapters.length === 0 && (
                    <p className="ps-placeholder">Chưa có chương nào trong môn này.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ────── MODE: KỸ NĂNG ────── */}
          {mode === 'ky-nang' && (
            <>
              {/* Chọn lộ trình kỹ năng */}
              <div className="ps-card">
                <div className="ps-card-title">
                  <span className="ps-card-icon">⚡</span> Lộ trình kỹ năng
                </div>
                {skillPaths.length === 0 ? (
                  <p className="ps-placeholder">Đang tải danh sách lộ trình…</p>
                ) : (
                  <div className="ps-skill-grid">
                    {skillPaths.map((p) => (
                      <button
                        key={p.slug}
                        id={`ps-path-${p.slug}`}
                        className={`ps-skill-btn ${selPath?.slug === p.slug ? 'ps-skill-btn--active' : ''}`}
                        onClick={() => { setSelPath(p); setSelModuleId('all'); }}
                      >
                        {selPath?.slug === p.slug && <span className="ps-subject-check">✓</span>}
                        <span className="ps-skill-icon">{getPathIcon(p.slug)}</span>
                        <span className="ps-skill-name">{p.title}</span>
                        <span className="ps-skill-diff">{p.difficulty}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chọn module (chủ đề con) */}
              <div className="ps-card">
                <div className="ps-card-title">
                  <span className="ps-card-icon"><FiGrid size={16}/></span> Chủ đề kỹ năng
                </div>
                {!selPath ? (
                  <p className="ps-placeholder">Chọn lộ trình để xem các chủ đề.</p>
                ) : (
                  <div className="ps-topic-grid">
                    <button
                      className={`ps-topic-btn ${selModuleId === 'all' ? 'ps-topic-btn--active' : ''}`}
                      onClick={() => setSelModuleId('all')}
                    >
                      <FiLayers size={18} />
                      <div>
                        <strong>Toàn bộ lộ trình</strong>
                        <p>Câu hỏi từ tất cả chủ đề trong {selPath.title}.</p>
                      </div>
                    </button>

                    {(selPath.modules || []).map((mod) => (
                      <button
                        key={mod.id}
                        className={`ps-topic-btn ${selModuleId === String(mod.id) ? 'ps-topic-btn--active' : ''}`}
                        onClick={() => setSelModuleId(String(mod.id))}
                      >
                        <FiAward size={18} />
                        <div>
                          <strong>{mod.title}</strong>
                          <p>Luyện tập chuyên sâu chủ đề này.</p>
                        </div>
                      </button>
                    ))}

                    {selPath.modules?.length === 0 && (
                      <p className="ps-placeholder">Lộ trình này chưa có chủ đề nào.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="ps-right">
          <div className="ps-card ps-difficulty-card">
            <div className="ps-card-title">
              <FiZap size={16} /> Độ khó
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
                  <span className="ps-diff-session">{c.sessionMin} phút</span>
                  {c.recommended && <span className="ps-diff-rec">ĐỀ XUẤT</span>}
                </div>
                <div className="ps-diff-row-stats">
                  <span><FiClock size={12} /> {c.secPerQ}s/câu</span>
                  <span><FiHeart size={12} /> {c.maxWrong} lần sai</span>
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
              {loading ? 'Đang tải...' : <><span>Bắt đầu luyện tập</span> <FiArrowRight size={18} /></>}
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
