import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiX, FiBookOpen } from 'react-icons/fi';
import { getGrades, getSubjectsByGrade, getChaptersBySubject, getLessonsByChapter } from '../../api/subjectApi';
import { getPaths } from '../../api/pathApi';
import {
  createAdminChapter, updateAdminChapter, deleteAdminChapter,
  createAdminLesson, updateAdminLesson, deleteAdminLesson,
  createAdminSkillModule, updateAdminSkillModule, deleteAdminSkillModule,
  createAdminSkillLesson, updateAdminSkillLesson, deleteAdminSkillLesson,
  createAdminSubject, deleteAdminSubjectFromGrade,
} from '../../api/adminApi';

// ─── Generic text modal ───────────────────────────────────────
const FieldModal = ({ title, fields, onClose, onSave }) => {
  const init = Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? '']));
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const autoSlug = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-fill slug từ title nếu slug chưa được chỉnh
      const slugField = fields.find((f) => f.key === 'slug');
      if (key === 'title' && slugField && !prev._slugEdited) {
        next.slug = autoSlug(value);
      }
      if (key === 'slug') next._slugEdited = true;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = { ...form };
    delete payload._slugEdited;
    try {
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            {fields.filter((f) => !f.full).map((f) => (
              <div key={f.key} className="form-group">
                <label>{f.label}{f.required && ' *'}</label>
                {f.type === 'select' ? (
                  <select className="form-input" value={form[f.key]} onChange={(e) => handleChange(f.key, e.target.value)}>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'} className="form-input"
                    placeholder={f.placeholder || ''}
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          {fields.filter((f) => f.full).map((f) => (
            <div key={f.key} className="form-group">
              <label>{f.label}{f.required && ' *'}</label>
              <textarea
                className="form-input form-textarea--code"
                rows={f.rows || 3}
                placeholder={f.placeholder || ''}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            </div>
          ))}
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Skill lesson row inside a module ────────────────────────
const SkillLessonRow = ({ lesson, onRefresh }) => {
  const [modal, setModal] = useState(null);

  const del = async () => {
    if (!window.confirm(`Xoá bài "${lesson.title}"?`)) return;
    await deleteAdminSkillLesson(lesson.id);
    onRefresh();
  };

  return (
    <>
      <div className="admin-lesson-row">
        <span className="admin-lesson-num">{lesson.sort_order}.</span>
        <span className="admin-lesson-title">{lesson.title}</span>
        {!lesson.has_content && <span className="skill-lesson-badge">Chưa có nội dung</span>}
        <div className="admin-actions">
          <button className="admin-btn admin-btn--icon" title="Sửa" onClick={() => setModal(lesson)}>
            <FiEdit2 size={13} />
          </button>
          <button className="admin-btn admin-btn--icon admin-btn--danger" title="Xoá" onClick={del}>
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>
      {modal && (
        <FieldModal
          title="Sửa bài học kỹ năng"
          fields={[
            { key: 'title', label: 'Tiêu đề', required: true, defaultValue: modal.title },
            { key: 'slug', label: 'Slug', required: true, defaultValue: modal.slug },
            { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: modal.sort_order },
            { key: 'content_html', label: 'Nội dung HTML', full: true, rows: 8, defaultValue: modal.content_html || '', placeholder: '<p>Nhập HTML...' },
          ]}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            await updateAdminSkillLesson(lesson.id, data);
            setModal(null); onRefresh();
          }}
        />
      )}
    </>
  );
};

// ─── Skill module row ─────────────────────────────────────────
const SkillModuleRow = ({ module, onRefresh }) => {
  const [open, setOpen]     = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal]     = useState(false);
  const [addLessonModal, setAddLesson] = useState(false);

  const loadLessons = () => {
    setLoading(true);
    import('../../api/pathApi').then(({ getModuleById }) =>
      getModuleById(module.id).then((res) => {
        setLessons(res.data.lessons || []);
        setLoading(false);
      })
    );
  };

  const toggle = () => { if (!open) loadLessons(); setOpen((v) => !v); };

  const del = async () => {
    if (!window.confirm(`Xoá module "${module.title}"?`)) return;
    await deleteAdminSkillModule(module.id);
    onRefresh();
  };

  return (
    <>
      <div className="admin-chapter-row">
        <button className="admin-chapter-toggle" onClick={toggle}>
          {open ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          <span className="admin-chapter-title">{module.title}</span>
          <span className="admin-chapter-meta">{module.lesson_count} bài · {module.estimated_hours}h</span>
        </button>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--icon" title="Thêm bài học" onClick={() => { if (!open) { setOpen(true); loadLessons(); } setAddLesson(true); }}>
            <FiPlus size={14} />
          </button>
          <button className="admin-btn admin-btn--icon" title="Sửa module" onClick={() => setEditModal(true)}>
            <FiEdit2 size={14} />
          </button>
          <button className="admin-btn admin-btn--icon admin-btn--danger" title="Xoá" onClick={del}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div className="admin-lessons-list">
          {loading ? <div className="admin-loading--sm">Đang tải...</div>
            : lessons.length === 0 ? <div className="admin-empty-sm">Chưa có bài học.</div>
            : lessons.map((l) => (
              <SkillLessonRow key={l.id} lesson={l} onRefresh={loadLessons} />
            ))
          }
        </div>
      )}

      {editModal && (
        <FieldModal
          title="Sửa module"
          fields={[
            { key: 'title', label: 'Tiêu đề', required: true, defaultValue: module.title },
            { key: 'slug', label: 'Slug', required: true, defaultValue: module.slug },
            { key: 'estimated_hours', label: 'Số giờ', type: 'number', defaultValue: module.estimated_hours },
            { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: module.sort_order },
            { key: 'description', label: 'Mô tả', full: true, defaultValue: module.description || '' },
          ]}
          onClose={() => setEditModal(false)}
          onSave={async (data) => { await updateAdminSkillModule(module.id, data); setEditModal(false); onRefresh(); }}
        />
      )}
      {addLessonModal && (
        <FieldModal
          title="Thêm bài học kỹ năng"
          fields={[
            { key: 'title', label: 'Tiêu đề', required: true, defaultValue: '' },
            { key: 'slug', label: 'Slug', required: true, defaultValue: '' },
            { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: lessons.length + 1 },
            { key: 'content_html', label: 'Nội dung HTML', full: true, rows: 8, defaultValue: '', placeholder: '<p>Nhập HTML...' },
          ]}
          onClose={() => setAddLesson(false)}
          onSave={async (data) => { await createAdminSkillLesson({ ...data, module_id: module.id }); setAddLesson(false); loadLessons(); }}
        />
      )}
    </>
  );
};

// ─── Phổ thông: Chapter row ───────────────────────────────────
const ChapterRow = ({ chapter, onChapterEdited }) => {
  const [open, setOpen]     = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lessonModal, setLessonModal] = useState(null);
  const [editModal, setEditModal]     = useState(false);

  const loadLessons = () => {
    setLoading(true);
    getLessonsByChapter(chapter.id).then((res) => setLessons(res.data)).finally(() => setLoading(false));
  };

  const toggle = () => { if (!open) loadLessons(); setOpen((v) => !v); };

  const delChapter = async () => {
    if (!window.confirm(`Xoá chương "${chapter.title}"?`)) return;
    await deleteAdminChapter(chapter.id); onChapterEdited();
  };

  const delLesson = async (l) => {
    if (!window.confirm(`Xoá bài "${l.title}"?`)) return;
    await deleteAdminLesson(l.id); loadLessons();
  };

  const lessonFields = (defaults = {}) => [
    { key: 'title', label: 'Tiêu đề', required: true, defaultValue: defaults.title || '' },
    { key: 'slug', label: 'Slug', required: true, defaultValue: defaults.slug || '' },
    { key: 'content_type', label: 'Loại', type: 'select', defaultValue: defaults.content_type || 'theory',
      options: [{ value: 'theory', label: 'Lý thuyết' }, { value: 'practice', label: 'Thực hành' }] },
    { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: defaults.sort_order ?? 0 },
    { key: 'content_html', label: 'Nội dung HTML', full: true, rows: 8, defaultValue: defaults.content_html || '', placeholder: '<p>Nhập HTML...' },
  ];

  return (
    <>
      <div className="admin-chapter-row">
        <button className="admin-chapter-toggle" onClick={toggle}>
          {open ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          <span className="admin-chapter-title">{chapter.title}</span>
          <span className="admin-chapter-meta">#{chapter.sort_order}</span>
        </button>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--icon" title="Thêm bài"
            onClick={() => { if (!open) { setOpen(true); loadLessons(); } setLessonModal('new'); }}>
            <FiPlus size={14} />
          </button>
          <button className="admin-btn admin-btn--icon" title="Sửa chương" onClick={() => setEditModal(true)}>
            <FiEdit2 size={14} />
          </button>
          <button className="admin-btn admin-btn--icon admin-btn--danger" title="Xoá" onClick={delChapter}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div className="admin-lessons-list">
          {loading ? <div className="admin-loading--sm">Đang tải...</div>
            : lessons.length === 0 ? <div className="admin-empty-sm">Chưa có bài học.</div>
            : lessons.map((l) => (
              <div key={l.id} className="admin-lesson-row">
                <span className="admin-lesson-num">{l.sort_order}.</span>
                <span className="admin-lesson-title">{l.title}</span>
                <span className={`badge badge--${l.content_type === 'theory' ? 'blue' : 'green'}`} style={{ fontSize: 11 }}>
                  {l.content_type === 'theory' ? 'Lý thuyết' : 'Thực hành'}
                </span>
                <div className="admin-actions">
                  <button className="admin-btn admin-btn--icon" onClick={() => setLessonModal(l)}><FiEdit2 size={13} /></button>
                  <button className="admin-btn admin-btn--icon admin-btn--danger" onClick={() => delLesson(l)}><FiTrash2 size={13} /></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {editModal && (
        <FieldModal
          title="Sửa chương"
          fields={[
            { key: 'title', label: 'Tiêu đề', required: true, defaultValue: chapter.title },
            { key: 'slug', label: 'Slug', required: true, defaultValue: chapter.slug },
            { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: chapter.sort_order },
            { key: 'description', label: 'Mô tả', full: true, defaultValue: chapter.description || '' },
          ]}
          onClose={() => setEditModal(false)}
          onSave={async (data) => { await updateAdminChapter(chapter.id, data); setEditModal(false); onChapterEdited(); }}
        />
      )}
      {lessonModal && (
        <FieldModal
          title={lessonModal === 'new' ? 'Thêm bài học' : 'Sửa bài học'}
          fields={lessonFields(lessonModal === 'new' ? {} : lessonModal)}
          onClose={() => setLessonModal(null)}
          onSave={async (data) => {
            if (lessonModal === 'new') await createAdminLesson({ ...data, chapter_id: chapter.id });
            else await updateAdminLesson(lessonModal.id, data);
            setLessonModal(null); loadLessons();
          }}
        />
      )}
    </>
  );
};

// ─── Tab Phổ thông ────────────────────────────────────────────
const TabPhoThong = () => {
  const [levels, setLevels]     = useState([]);
  const [grades, setGrades]     = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selLevel,   setSelLevel]   = useState('');
  const [selGrade,   setSelGrade]   = useState('');
  const [selGradeId, setSelGradeId] = useState(null);
  const [selSubject, setSelSubject] = useState('');
  const [selGSId,    setSelGSId]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [addChapter, setAddChapter] = useState(false);
  const [addSubject, setAddSubject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false); // inline confirm xoá môn

  // Load levels + grades
  useEffect(() => {
    getGrades().then((res) => setLevels(res.data));
  }, []);

  // Khi chọn cấp → filter grades
  useEffect(() => {
    if (!selLevel) { setGrades([]); setSelGrade(''); setSelGradeId(null); return; }
    const lvl = levels.find((l) => l.slug === selLevel);
    setGrades(lvl?.grades || []);
    setSelGrade(''); setSelGradeId(null); setSubjects([]); setSelSubject(''); setChapters([]);
  }, [selLevel, levels]);

  // Khi chọn lớp → load subjects
  useEffect(() => {
    if (!selGrade) { setSubjects([]); setSelSubject(''); setSelGradeId(null); return; }
    const g = grades.find((g) => g.slug === selGrade);
    setSelGradeId(g?.id ?? null);
    getSubjectsByGrade(selGrade).then((res) => {
      setSubjects(res.data);
      setSelSubject(''); setChapters([]);
    });
  }, [selGrade]);

  // Khi chọn môn → load chapters
  useEffect(() => {
    if (!selGrade || !selSubject) { setChapters([]); setSelGSId(null); return; }
    const sub = subjects.find((s) => s.slug === selSubject);
    setSelGSId(sub?.grade_subject_id ?? null);
    setLoading(true);
    getChaptersBySubject(selGrade, selSubject).then((res) => setChapters(res.data)).finally(() => setLoading(false));
  }, [selSubject, subjects]); // thêm subjects vào dependency để selGSId luôn đúng

  const reloadSubjects = () => {
    if (!selGrade) return;
    getSubjectsByGrade(selGrade).then((res) => {
      setSubjects(res.data);
    });
  };

  const reloadChapters = () => {
    if (!selGrade || !selSubject) return;
    setLoading(true);
    getChaptersBySubject(selGrade, selSubject).then((res) => setChapters(res.data)).finally(() => setLoading(false));
  };

  return (
    <>
      <div className="admin-filters">
        {/* Cấp học */}
        <select className="form-input admin-filter-select" value={selLevel} onChange={(e) => setSelLevel(e.target.value)}>
          <option value="">-- Chọn cấp --</option>
          {levels.map((l) => <option key={l.slug} value={l.slug}>{l.level}</option>)}
        </select>

        {/* Lớp */}
        <select className="form-input admin-filter-select" value={selGrade} onChange={(e) => setSelGrade(e.target.value)} disabled={!selLevel}>
          <option value="">-- Chọn lớp --</option>
          {grades.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>

        {/* Môn + inline confirm xoá */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            className="form-input admin-filter-select"
            value={selSubject}
            onChange={(e) => { setSelSubject(e.target.value); setConfirmDelete(false); }}
            disabled={!selGrade}
          >
            <option value="">-- Chọn môn --</option>
            {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>

          {selSubject && (
            confirmDelete ? (
              // --- Inline confirm ---
              <>
                <span style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Xoá môn này?
                </span>
                <button
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  title="Xác nhận xoá"
                  onClick={async () => {
                    console.log('[DELETE subject] selGSId =', selGSId);
                    if (!selGSId) {
                      setConfirmDelete(false);
                      alert('Lỗi: Không xác định được ID môn học. Vui lòng chọn lại.');
                      return;
                    }
                    try {
                      await deleteAdminSubjectFromGrade(selGSId);
                      setConfirmDelete(false);
                      setSelSubject('');
                      reloadSubjects();
                    } catch (err) {
                      console.error('[DELETE subject] Lỗi:', err);
                      setConfirmDelete(false);
                      alert(`Xoá thất bại: ${err.response?.data?.error || err.message}`);
                    }
                  }}
                >
                  ✓ Xoá
                </button>
                <button
                  className="admin-btn admin-btn--sm"
                  title="Huỷ"
                  onClick={() => setConfirmDelete(false)}
                >
                  ✕ Huỷ
                </button>
              </>
            ) : (
              // --- Nút xóa thường ---
              <button
                className="admin-btn admin-btn--icon admin-btn--danger"
                title="Xoá môn này khỏi lớp"
                onClick={() => setConfirmDelete(true)}
              >
                <FiTrash2 size={14} />
              </button>
            )
          )}
        </div>

        {/* Nút Thêm môn (khi đã chọn lớp) */}
        {selGrade && (
          <button className="btn btn--primary btn--sm" onClick={() => setAddSubject(true)}>
            <FiBookOpen size={14} style={{ marginRight: 4 }} /> Thêm môn
          </button>
        )}

        {/* Nút Thêm chương (khi đã chọn môn) */}
        {selSubject && (
          <button className="btn btn--primary btn--sm" onClick={() => setAddChapter(true)}>
            <FiPlus /> Thêm chương
          </button>
        )}
      </div>

      {!selSubject ? (
        <div className="admin-guide">Chọn cấp học → lớp → môn để quản lý nội dung.</div>
      ) : loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : chapters.length === 0 ? (
        <div className="admin-guide">Chưa có chương nào.</div>
      ) : (
        <div className="admin-chapters">
          {chapters.map((ch) => (
            <ChapterRow key={ch.id} chapter={ch} onChapterEdited={reloadChapters} />
          ))}
        </div>
      )}

      {addChapter && (
        <FieldModal
          title="Thêm chương mới"
          fields={[
            { key: 'title', label: 'Tiêu đề', required: true, defaultValue: '' },
            { key: 'slug', label: 'Slug', required: true, defaultValue: '' },
            { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: chapters.length + 1 },
            { key: 'description', label: 'Mô tả', full: true, defaultValue: '' },
          ]}
          onClose={() => setAddChapter(false)}
          onSave={async (data) => { await createAdminChapter({ ...data, grade_subject_id: selGSId }); setAddChapter(false); reloadChapters(); }}
        />
      )}

      {addSubject && (
        <FieldModal
          title={`Thêm môn học vào lớp "${grades.find(g=>g.slug===selGrade)?.name || ''}"`}
          fields={[
            { key: 'name', label: 'Tên môn học', required: true, defaultValue: '' },
            { key: 'slug', label: 'Slug (không dấu, viết thường)', required: true, defaultValue: '' },
            { key: 'description', label: 'Mô tả', full: true, defaultValue: '' },
          ]}
          onClose={() => setAddSubject(false)}
          onSave={async (data) => {
            await createAdminSubject({ ...data, grade_id: selGradeId });
            setAddSubject(false);
            reloadSubjects();
          }}
        />
      )}
    </>
  );
};

// ─── Tab Kỹ năng ──────────────────────────────────────────────
const TabKyNang = () => {
  const [paths, setPaths]     = useState([]);
  const [selPath, setSelPath] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModule, setAddModule] = useState(false);

  useEffect(() => {
    getPaths().then((res) => setPaths(res.data));
  }, []);

  useEffect(() => {
    if (!selPath) { setModules([]); return; }
    const path = paths.find((p) => String(p.id) === selPath);
    if (!path) return;
    setLoading(true);
    import('../../api/pathApi').then(({ getPathBySlug }) =>
      getPathBySlug(path.slug).then((res) => { setModules(res.data.modules || []); setLoading(false); })
    );
  }, [selPath, paths]);

  const reloadModules = () => {
    const path = paths.find((p) => String(p.id) === selPath);
    if (!path) return;
    setLoading(true);
    import('../../api/pathApi').then(({ getPathBySlug }) =>
      getPathBySlug(path.slug).then((res) => { setModules(res.data.modules || []); setLoading(false); })
    );
  };

  return (
    <>
      <div className="admin-filters">
        <select className="form-input admin-filter-select" value={selPath} onChange={(e) => setSelPath(e.target.value)}>
          <option value="">-- Chọn lộ trình --</option>
          {paths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>

        {selPath && (
          <button className="btn btn--primary btn--sm" onClick={() => setAddModule(true)}>
            <FiPlus /> Thêm module
          </button>
        )}
      </div>

      {!selPath ? (
        <div className="admin-guide">Chọn lộ trình để quản lý modules và bài học kỹ năng.</div>
      ) : loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : modules.length === 0 ? (
        <div className="admin-guide">Chưa có module nào.</div>
      ) : (
        <div className="admin-chapters">
          {modules.map((m) => (
            <SkillModuleRow key={m.id} module={m} onRefresh={reloadModules} />
          ))}
        </div>
      )}

      {addModule && (
        <FieldModal
          title="Thêm module mới"
          fields={[
            { key: 'title', label: 'Tiêu đề', required: true, defaultValue: '' },
            { key: 'slug', label: 'Slug', required: true, defaultValue: '' },
            { key: 'estimated_hours', label: 'Số giờ', type: 'number', defaultValue: 0 },
            { key: 'sort_order', label: 'Thứ tự', type: 'number', defaultValue: modules.length + 1 },
            { key: 'description', label: 'Mô tả', full: true, defaultValue: '' },
          ]}
          onClose={() => setAddModule(false)}
          onSave={async (data) => {
            await createAdminSkillModule({ ...data, path_id: parseInt(selPath) });
            setAddModule(false); reloadModules();
          }}
        />
      )}
    </>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const ManageLessons = () => {
  const [tab, setTab] = useState('pho-thong');

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Quản lý Nội dung bài học</h2>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'pho-thong' ? 'admin-tab--active' : ''}`} onClick={() => setTab('pho-thong')}>
          Phổ thông
        </button>
        <button className={`admin-tab ${tab === 'ky-nang' ? 'admin-tab--active' : ''}`} onClick={() => setTab('ky-nang')}>
          Kỹ năng nghề nghiệp
        </button>
      </div>

      {tab === 'pho-thong' ? <TabPhoThong /> : <TabKyNang />}
    </div>
  );
};

export default ManageLessons;
