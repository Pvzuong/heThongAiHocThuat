import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiCpu, FiRefreshCw, FiPlay, FiList, FiZap, FiFileText,
  FiClock, FiCheckSquare, FiBook, FiBriefcase,
} from 'react-icons/fi';
import { generateQuestions, generateTest } from '../../api/geminiApi';
import { useToast } from '../../contexts/ToastContext';
import ExamConfigPanel from './ExamConfigPanel';
import ExamPreviewPanel from './ExamPreviewPanel';
import {
  DIFFICULTIES, QUESTION_TYPES,
  PRACTICE_GRADES, PRACTICE_TOPICS_BY_GRADE,
  SUBJECTS_BY_LEVEL, SKILL_LEVELS, getTopics,
  TOPICS_BY_SKILL_SUBJECT,
} from './examConstants';

// ─── Default forms ────────────────────────────────────────────

const DEFAULT_PRACTICE_SCHOOL = {
  programType: 'pho_thong',
  grade: 1,
  topic: 'Tổng hợp',
  difficulty: 'medium',
  numberOfQuestions: 10,
  questionTypes: ['multiple_choice'],
};

const DEFAULT_PRACTICE_SKILL = {
  programType: 'ky_nang',
  educationLevel: 'co_ban',
  subject: 'Frontend Developer',
  topic: 'Tổng hợp',
  difficulty: 'medium',
  numberOfQuestions: 10,
  questionTypes: ['multiple_choice'],
};

const DEFAULT_EXAM = {
  programType: 'pho_thong',
  educationLevel: 'tieu_hoc',
  grade: 1,
  subject: 'Toán',
  topic: 'Tổng hợp',
  difficulty: 'medium',
  numberOfQuestions: 20,
  mcCount: 15,
  essayCount: 2,
  fillBlankCount: 3,
  testName: '',
  schoolName: '',
  durationMinutes: '',
};

function loadDraft() {
  try { return JSON.parse(localStorage.getItem('exam_draft_v1')); } catch { return null; }
}

// ─── Practice Mode ────────────────────────────────────────────

function PracticeMode() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [programType, setProgramType] = useState('pho_thong');
  const [schoolForm, setSchoolForm] = useState(DEFAULT_PRACTICE_SCHOOL);
  const [skillForm, setSkillForm] = useState(DEFAULT_PRACTICE_SKILL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const isSkill = programType === 'ky_nang';
  const form = isSkill ? skillForm : schoolForm;
  const setForm = isSkill ? setSkillForm : setSchoolForm;

  // School topics
  const schoolTopics = PRACTICE_TOPICS_BY_GRADE[schoolForm.grade] || ['Tổng hợp'];
  // Skill subjects & topics
  const skillSubjects = SUBJECTS_BY_LEVEL['ky_nang']?.[skillForm.educationLevel] || [];
  const skillTopics = TOPICS_BY_SKILL_SUBJECT[skillForm.subject] || ['Tổng hợp'];

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      questionTypes: f.questionTypes.includes(type)
        ? f.questionTypes.filter(t => t !== type)
        : [...f.questionTypes, type],
    }));
  };

  const handleGenerate = async () => {
    if (form.questionTypes.length === 0) {
      addToast('Cần chọn ít nhất 1 dạng câu hỏi', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = isSkill
        ? {
            subject: skillForm.subject,
            grade: 1,
            topic: skillForm.topic === 'Tổng hợp' ? undefined : skillForm.topic,
            difficulty: skillForm.difficulty,
            numberOfQuestions: skillForm.numberOfQuestions,
            questionTypes: skillForm.questionTypes,
            educationLevel: skillForm.educationLevel,
            programType: 'ky_nang',
          }
        : {
            grade: schoolForm.grade,
            topic: schoolForm.topic === 'Tổng hợp' ? undefined : schoolForm.topic,
            difficulty: schoolForm.difficulty,
            numberOfQuestions: schoolForm.numberOfQuestions,
            questionTypes: schoolForm.questionTypes,
            subject: 'Toán',
            educationLevel: schoolForm.grade <= 5 ? 'tieu_hoc' : schoolForm.grade <= 9 ? 'thcs' : 'thpt',
            programType: 'pho_thong',
          };
      const res = await generateQuestions(payload);
      setResult(res.data.data);
      addToast('Tạo câu hỏi thành công!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Không thể tạo câu hỏi. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isSkill) setSkillForm(DEFAULT_PRACTICE_SKILL);
    else setSchoolForm(DEFAULT_PRACTICE_SCHOOL);
    setResult(null);
  };

  const parseOptions = (opts) => {
    if (Array.isArray(opts)) return opts;
    try { return JSON.parse(opts); } catch { return null; }
  };

  return (
    <div className="practice-mode-layout">
      {/* ── Left: Form ── */}
      <div className="practice-form-panel">
        <div className="practice-form-header">
          <FiZap size={16} />
          <span>Cấu hình luyện tập</span>
        </div>

        {/* Program type toggle */}
        <div className="ecf-group">
          <div className="practice-prog-toggle">
            <button
              type="button"
              className={`practice-prog-btn${!isSkill ? ' practice-prog-btn--active' : ''}`}
              onClick={() => { setProgramType('pho_thong'); setResult(null); }}>
              <FiBook size={13} /> Phổ thông
            </button>
            <button
              type="button"
              className={`practice-prog-btn${isSkill ? ' practice-prog-btn--active practice-prog-btn--skill' : ''}`}
              onClick={() => { setProgramType('ky_nang'); setResult(null); }}>
              <FiBriefcase size={13} /> Kỹ năng nghề
            </button>
          </div>
        </div>

        <div className="ecf-divider" />

        {/* ── SCHOOL fields ── */}
        {!isSkill && (
          <>
            <div className="ecf-group">
              <label className="ecf-label">Lớp</label>
              <div className="ecf-grade-btns" style={{ flexWrap: 'wrap' }}>
                {PRACTICE_GRADES.map(g => (
                  <button key={g} type="button"
                    className={`ecf-grade-btn${schoolForm.grade === g ? ' ecf-grade-btn--active' : ''}`}
                    onClick={() => setSchoolForm(f => ({ ...f, grade: g, topic: 'Tổng hợp' }))}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="ecf-group">
              <label className="ecf-label">Chủ đề</label>
              <select className="ecf-select" value={schoolForm.topic}
                onChange={e => setSchoolForm(f => ({ ...f, topic: e.target.value }))}>
                {schoolTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        {/* ── SKILL fields ── */}
        {isSkill && (
          <>
            <div className="ecf-group">
              <label className="ecf-label">Cấp độ</label>
              <div className="ecf-tabs">
                {SKILL_LEVELS.map(lv => (
                  <button key={lv.value} type="button"
                    className={`ecf-tab${skillForm.educationLevel === lv.value ? ' ecf-tab--active' : ''}`}
                    onClick={() => {
                      const subs = SUBJECTS_BY_LEVEL['ky_nang']?.[lv.value] || [];
                      setSkillForm(f => ({ ...f, educationLevel: lv.value, subject: subs[0] || '', topic: 'Tổng hợp' }));
                    }}>
                    {lv.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ecf-group">
              <label className="ecf-label">Lộ trình / Kỹ năng</label>
              <select className="ecf-select" value={skillForm.subject}
                onChange={e => setSkillForm(f => ({ ...f, subject: e.target.value, topic: 'Tổng hợp' }))}>
                {skillSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ecf-group">
              <label className="ecf-label">Chủ đề / Module</label>
              <select className="ecf-select" value={skillForm.topic}
                onChange={e => setSkillForm(f => ({ ...f, topic: e.target.value }))}>
                {skillTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Độ khó */}
        <div className="ecf-group">
          <label className="ecf-label">Độ khó</label>
          <div className="ecf-tabs">
            {DIFFICULTIES.map(d => (
              <button key={d.value} type="button"
                className={`ecf-tab${form.difficulty === d.value ? ' ecf-tab--active' : ''}`}
                style={form.difficulty === d.value ? { borderColor: d.color, color: d.color, background: d.color + '15' } : {}}
                onClick={() => setForm(f => ({ ...f, difficulty: d.value }))}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Số câu */}
        <div className="ecf-group">
          <label className="ecf-label">Số câu: <strong>{form.numberOfQuestions}</strong></label>
          <input className="ecf-range" type="range" min={5} max={90}
            value={form.numberOfQuestions}
            onChange={e => setForm(f => ({ ...f, numberOfQuestions: parseInt(e.target.value) }))} />
          <div className="ecf-range-labels"><span>5</span><span>45</span><span>90</span></div>
        </div>

        {/* Dạng câu hỏi */}
        <div className="ecf-group">
          <label className="ecf-label">Dạng câu hỏi</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {QUESTION_TYPES.map(t => (
              <label key={t.value} className={`practice-type-check${form.questionTypes.includes(t.value) ? ' practice-type-check--active' : ''}`}>
                <input type="checkbox"
                  checked={form.questionTypes.includes(t.value)}
                  onChange={() => toggleType(t.value)} />
                <FiCheckSquare size={13} />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        <div className="ecf-actions">
          <button className="btn btn--primary btn--full" onClick={handleGenerate} disabled={loading}>
            {loading
              ? <><span className="ecf-spinner" /> Đang tạo...</>
              : <><FiCpu size={15} /> Tạo câu hỏi</>}
          </button>
          <button className="btn btn--outline btn--sm btn--full" onClick={handleReset}>
            <FiRefreshCw size={13} /> Đặt lại
          </button>
        </div>
      </div>

      {/* ── Right: Preview ── */}
      <div className="practice-preview-panel">
        {loading && (
          <div className="exam-generating">
            <div className="exam-gen-spinner" />
            <h3>AI đang tạo câu hỏi...</h3>
            <p>Thường mất 5–15 giây</p>
            <div className="exam-gen-dots"><span /><span /><span /></div>
          </div>
        )}

        {!loading && !result && (
          <div className="exam-empty-state">
            <div className="exam-empty-icon">🎯</div>
            <h3>Bắt đầu luyện tập</h3>
            <p>Chọn lớp, chủ đề và nhấn <strong>Tạo câu hỏi</strong></p>
            <ul className="exam-empty-hints">
              <li>✅ Câu hỏi AI sinh tự động theo lớp</li>
              <li>✅ Hỗ trợ trắc nghiệm, điền khuyết, tự luận</li>
              <li>✅ Làm bài ngay sau khi tạo</li>
            </ul>
          </div>
        )}

        {!loading && result && (
          <div className="practice-result">
            <div className="practice-result-header">
              <div>
                <h3 className="practice-result-title">{result.collectionName}</h3>
                <span className="practice-result-count">{result.questions.length} câu hỏi</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--primary btn--sm"
                  onClick={() => navigate(`/practice/ai-arena/${result.collectionId}`)}>
                  <FiPlay size={13} /> Làm bài ngay
                </button>
                <button className="btn btn--outline btn--sm" onClick={handleGenerate}>
                  <FiRefreshCw size={13} /> Tạo lại
                </button>
              </div>
            </div>

            <div className="practice-question-list">
              {result.questions.map((q, i) => {
                const opts = parseOptions(q.options);
                return (
                  <div key={q.id} className="practice-q-card">
                    <div className="practice-q-top">
                      <span className="practice-q-num">Câu {i + 1}</span>
                      <span className={`eqe-badge eqe-badge--${q.question_type}`}>
                        {q.question_type === 'multiple_choice' ? 'Trắc nghiệm'
                          : q.question_type === 'fill_in_blank' ? 'Điền khuyết' : 'Tự luận'}
                      </span>
                    </div>
                    <p className="practice-q-text">{q.question_text}</p>
                    {q.image_svg && <div dangerouslySetInnerHTML={{ __html: q.image_svg }} style={{ margin: '6px 0' }} />}
                    {opts && (
                      <div className="practice-q-opts">
                        {opts.map((opt, j) => (
                          <span key={j} className="practice-q-opt">
                            <span className="practice-q-opt-label">{String.fromCharCode(65 + j)}.</span> {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exam Mode ────────────────────────────────────────────────

function ExamMode() {
  const { addToast } = useToast();
  const draft = loadDraft();
  const [form, setForm] = useState(draft || DEFAULT_EXAM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const total = (form.mcCount || 0) + (form.essayCount || 0) + (form.fillBlankCount || 0);
      const splitOk = total === 0 || total === form.numberOfQuestions;

      const payload = {
        testName: form.testName || `Đề ${form.subject} Lớp ${form.grade}`,
        grade: form.grade,
        subject: form.subject,
        topic: form.topic === 'Tổng hợp' ? undefined : form.topic,
        difficulty: form.difficulty,
        numberOfQuestions: form.numberOfQuestions,
        educationLevel: form.educationLevel,
        programType: form.programType,
        schoolName: form.schoolName,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
        ...(splitOk && total > 0
          ? { mcCount: form.mcCount, essayCount: form.essayCount, fillBlankCount: form.fillBlankCount }
          : {}),
      };

      const res = await generateTest(payload);
      setResult(res.data.data);
      addToast('Tạo đề thi thành công!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Không thể tạo đề thi. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_EXAM);
    setResult(null);
    localStorage.removeItem('exam_draft_v1');
  };

  return (
    <div className="exam-studio-body">
      <ExamConfigPanel form={form} setForm={setForm} onGenerate={handleGenerate} onReset={handleReset} loading={loading} />
      <div className="exam-studio-preview">
        {loading && (
          <div className="exam-generating">
            <div className="exam-gen-spinner" />
            <h3>AI đang tạo đề thi...</h3>
            <p>{form.numberOfQuestions > 60 ? 'Đề lớn — đang tạo theo lô, vui lòng đợi 30–60 giây' : 'Thường mất 10–20 giây'}</p>
            <div className="exam-gen-dots"><span /><span /><span /></div>
          </div>
        )}
        {!loading && !result && (
          <div className="exam-empty-state">
            <div className="exam-empty-icon">📝</div>
            <h3>Chưa có đề thi</h3>
            <p>Cấu hình và nhấn <strong>Tạo đề thi</strong> ở bên trái</p>
            <ul className="exam-empty-hints">
              <li>✅ Hỗ trợ Phổ thông & Kỹ năng nghề nghiệp</li>
              <li>✅ Phân chia 3 loại câu: trắc nghiệm, tự luận, điền khuyết</li>
              <li>✅ Chỉnh sửa từng câu hỏi trực tiếp</li>
              <li>✅ Xuất PDF, in trực tiếp</li>
            </ul>
          </div>
        )}
        {!loading && result && (
          <ExamPreviewPanel result={result} form={form} setResult={setResult} onRegenerate={handleGenerate} />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function AIQuestionGenerator() {
  const [activeTab, setActiveTab] = useState('practice');

  return (
    <div className="exam-studio">
      {/* ── Header ── */}
      <div className="exam-studio-header">
        <div className="esh-left">
          <div className="esh-icon">{activeTab === 'practice' ? '🎯' : '🎓'}</div>
          <div>
            <h1 className="esh-title">
              {activeTab === 'practice' ? 'AI Luyện Tập' : 'AI Tạo Đề Thi'}
            </h1>
            <p className="esh-sub">
              {activeTab === 'practice'
                ? 'Tạo bộ câu hỏi luyện tập theo lớp, chủ đề và độ khó'
                : 'Tạo đề thi hoàn chỉnh, chỉnh sửa và xuất file chuyên nghiệp'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Tab switcher */}
          <div className="mode-tabs">
            <button
              className={`mode-tab${activeTab === 'practice' ? ' mode-tab--active' : ''}`}
              onClick={() => setActiveTab('practice')}>
              <FiZap size={14} /> Luyện tập
            </button>
            <button
              className={`mode-tab${activeTab === 'exam' ? ' mode-tab--active' : ''}`}
              onClick={() => setActiveTab('exam')}>
              <FiFileText size={14} /> Tạo đề thi
            </button>
          </div>

          <Link to="/practice/ai-history" className="btn btn--outline btn--sm">
            <FiList size={14} /> Lịch sử
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      {activeTab === 'practice' ? <PracticeMode /> : <ExamMode />}
    </div>
  );
}
