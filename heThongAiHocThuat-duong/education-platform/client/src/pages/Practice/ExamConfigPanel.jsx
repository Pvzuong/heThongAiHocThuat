import { useState } from 'react';
import {
  FiCpu, FiRefreshCw, FiSave, FiClock, FiAlertTriangle,
} from 'react-icons/fi';
import {
  PROGRAM_TYPES, EDUCATION_LEVELS, SKILL_LEVELS,
  SUBJECTS_BY_LEVEL, getTopics, getLevelsForProgram, DIFFICULTIES,
} from './examConstants';

function saveDraft(form) {
  try { localStorage.setItem('exam_draft_v1', JSON.stringify(form)); } catch {}
}

export default function ExamConfigPanel({ form, setForm, onGenerate, onReset, loading }) {
  const isSkill = form.programType === 'ky_nang';
  const levels = getLevelsForProgram(form.programType);
  const currentLevel = levels.find(l => l.value === form.educationLevel) || levels[0];
  const subjects = SUBJECTS_BY_LEVEL[form.programType]?.[form.educationLevel] || [];
  const topics = getTopics(form.subject, form.grade, form.programType);

  const totalSplit = (form.mcCount || 0) + (form.fillBlankCount || 0);
  const splitDefined = totalSplit > 0;
  const splitValid = !splitDefined || totalSplit === form.numberOfQuestions;
  const showSplitError = splitDefined && !splitValid;

  const handleProgramChange = (pt) => {
    const newLevels = getLevelsForProgram(pt);
    const newLevel = newLevels[0];
    const newSubjects = SUBJECTS_BY_LEVEL[pt]?.[newLevel.value] || [];
    const newSubject = newSubjects[0] || '';
    const newGrade = newLevel.grades[0];
    setForm(f => ({
      ...f,
      programType: pt,
      educationLevel: newLevel.value,
      grade: newGrade,
      subject: newSubject,
      topic: 'Tổng hợp',
    }));
  };

  const handleLevelChange = (lv) => {
    const newLevel = levels.find(l => l.value === lv);
    const newGrade = newLevel?.grades[0] || 1;
    const newSubjects = SUBJECTS_BY_LEVEL[form.programType]?.[lv] || [];
    const newSubject = newSubjects[0] || '';
    setForm(f => ({ ...f, educationLevel: lv, grade: newGrade, subject: newSubject, topic: 'Tổng hợp' }));
  };

  return (
    <div className="exam-config-panel">
      <div className="exam-config-header">
        <FiCpu size={18} />
        <span>Cấu hình đề thi</span>
      </div>

      {/* Tên đề + trường */}
      <div className="ecf-group">
        <label className="ecf-label">Tên đề thi</label>
        <input className="ecf-input" type="text" placeholder="VD: Đề kiểm tra giữa kỳ"
          value={form.testName}
          onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} />
      </div>
      <div className="ecf-group">
        <label className="ecf-label">Tên trường / Tổ chức</label>
        <input className="ecf-input" type="text" placeholder="VD: Trường THCS Nguyễn Du"
          value={form.schoolName}
          onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))} />
      </div>
      <div className="ecf-group">
        <label className="ecf-label"><FiClock size={12} /> Thời gian (phút)</label>
        <input className="ecf-input" type="number" min={1} placeholder="Không giới hạn"
          value={form.durationMinutes}
          onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
      </div>

      <div className="ecf-divider" />

      {/* Loại chương trình */}
      <div className="ecf-group">
        <label className="ecf-label">Loại chương trình</label>
        <div className="ecf-tabs">
          {PROGRAM_TYPES.map(pt => (
            <button key={pt.value} type="button"
              className={`ecf-tab${form.programType === pt.value ? ' ecf-tab--active' : ''}`}
              onClick={() => handleProgramChange(pt.value)}>
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cấp học / Cấp độ */}
      <div className="ecf-group">
        <label className="ecf-label">{isSkill ? 'Cấp độ' : 'Cấp học'}</label>
        <div className="ecf-tabs">
          {levels.map(lv => (
            <button key={lv.value} type="button"
              className={`ecf-tab${form.educationLevel === lv.value ? ' ecf-tab--active' : ''}`}
              onClick={() => handleLevelChange(lv.value)}>
              {lv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lớp / Module (chỉ hiện với Phổ thông) */}
      {!isSkill && (
        <div className="ecf-group">
          <label className="ecf-label">Lớp</label>
          <div className="ecf-grade-btns">
            {currentLevel.grades.map(g => (
              <button key={g} type="button"
                className={`ecf-grade-btn${form.grade === g ? ' ecf-grade-btn--active' : ''}`}
                onClick={() => setForm(f => ({ ...f, grade: g, topic: 'Tổng hợp' }))}>
                Lớp {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Môn học / Lộ trình */}
      <div className="ecf-group">
        <label className="ecf-label">{isSkill ? 'Lộ trình / Kỹ năng' : 'Môn học'}</label>
        <select className="ecf-select" value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value, topic: 'Tổng hợp' }))}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Chủ đề */}
      <div className="ecf-group">
        <label className="ecf-label">{isSkill ? 'Chủ đề / Module' : 'Chủ đề'}</label>
        <select className="ecf-select" value={form.topic}
          onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

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

      <div className="ecf-divider" />

      {/* Tổng số câu */}
      <div className="ecf-group">
        <label className="ecf-label">
          Tổng số câu: <strong>{form.numberOfQuestions}</strong>
          {form.numberOfQuestions > 60 && (
            <span className="ecf-warning"><FiAlertTriangle size={12} /> Mất nhiều thời gian</span>
          )}
        </label>
        <input className="ecf-range" type="range" min={5} max={30}
          value={form.numberOfQuestions}
          onChange={e => setForm(f => ({ ...f, numberOfQuestions: parseInt(e.target.value) }))} />
        <div className="ecf-range-labels"><span>5</span><span>17</span><span>30</span></div>
      </div>

      {/* Phân chia loại câu */}
      <div className="ecf-group">
        <label className="ecf-label">Phân chia loại câu <span style={{color:'var(--gray-400)',fontSize:'10px',textTransform:'none',letterSpacing:0}}>(tuỳ chọn)</span></label>
        <div className="ecf-split-row">
          <div className="ecf-split-item">
            <span>Trắc nghiệm</span>
            <input className="ecf-split-input" type="number" min={0} max={form.numberOfQuestions}
              value={form.mcCount}
              onChange={e => setForm(f => ({ ...f, mcCount: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="ecf-split-item">
            <span>Điền khuyết</span>
            <input className="ecf-split-input" type="number" min={0} max={form.numberOfQuestions}
              value={form.fillBlankCount}
              onChange={e => setForm(f => ({ ...f, fillBlankCount: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
        {splitDefined && (
          <div className={`ecf-split-status${showSplitError ? ' ecf-split-status--error' : ' ecf-split-status--ok'}`}>
            {showSplitError
              ? `⚠ Tổng ${totalSplit} ≠ ${form.numberOfQuestions} câu`
              : `✓ Hợp lệ (${totalSplit} câu)`}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="ecf-actions">
        <button className="btn btn--primary btn--full" onClick={onGenerate}
          disabled={loading || showSplitError}>
          {loading
            ? <><span className="ecf-spinner" /> Đang tạo đề...</>
            : <><FiCpu size={15} /> Tạo đề thi</>}
        </button>
        <div className="ecf-actions-row">
          <button className="btn btn--outline btn--sm" onClick={() => saveDraft(form)}>
            <FiSave size={13} /> Lưu nháp
          </button>
          <button className="btn btn--outline btn--sm" onClick={onReset}>
            <FiRefreshCw size={13} /> Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}
