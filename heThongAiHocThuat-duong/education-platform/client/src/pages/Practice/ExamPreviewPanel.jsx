import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPrinter, FiDownload, FiCopy, FiShare2, FiShuffle,
  FiEye, FiEyeOff, FiEdit2, FiTrash2, FiRefreshCw, FiPlay,
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import * as geminiApi from '../../api/geminiApi';
import ExamPaperA4 from './ExamPaperA4';
import ExamQuestionEditor from './ExamQuestionEditor';

function parseOptions(opts) {
  if (Array.isArray(opts)) return opts;
  try { return JSON.parse(opts); } catch { return null; }
}

// api prop không còn cần thiết — chỉ dùng geminiApi
export default function ExamPreviewPanel({ result, form, setResult, onRegenerate, hidePlayBtn = false }) {
  const collectionApi = geminiApi;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const paperRef = useRef(null);

  const [showAnswers, setShowAnswers] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  if (!result) return null;

  const { collectionId, questions, sections, testName, durationMinutes, schoolName } = result;

  // ── Print ──────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ── Export PDF ─────────────────────────────────────────────
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const el = paperRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pageW / imgW;
      const scaledH = imgH * ratio;
      let yOff = 0;
      while (yOff < imgH) {
        const sliceH = Math.min(imgH - yOff, pageH / ratio);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgW;
        sliceCanvas.height = sliceH;
        sliceCanvas.getContext('2d').drawImage(canvas, 0, yOff, imgW, sliceH, 0, 0, imgW, sliceH);
        if (yOff > 0) pdf.addPage();
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageW, sliceH * ratio);
        yOff += sliceH;
      }
      const fname = (testName || 'de-thi').replace(/\s+/g, '-').toLowerCase();
      pdf.save(`${fname}${showAnswers ? '-dap-an' : ''}.pdf`);
      addToast('Đã tải PDF thành công!', 'success');
    } catch (e) {
      addToast('Lỗi khi tạo PDF: ' + e.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  // ── Export JSON ────────────────────────────────────────────
  const handleExportJSON = () => {
    const data = JSON.stringify({ ...result, form }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'de-thi.json'; a.click();
    URL.revokeObjectURL(url);
    addToast('Đã xuất JSON!', 'success');
  };

  // ── Random order ───────────────────────────────────────────
  const handleRandomOrder = () => {
    setResult(r => ({ ...r, questions: [...r.questions].sort(() => Math.random() - 0.5) }));
  };

  // ── Random answers ─────────────────────────────────────────
  const handleRandomAnswers = () => {
    setResult(r => ({
      ...r,
      questions: r.questions.map(q => {
        const opts = parseOptions(q.options);
        if (!opts) return q;
        const correctAns = typeof q.correct_answer === 'object'
          ? q.correct_answer.answer
          : (() => { try { return JSON.parse(q.correct_answer).answer; } catch { return q.correct_answer; } })();
        const shuffled = [...opts].sort(() => Math.random() - 0.5);
        return { ...q, options: JSON.stringify(shuffled), correct_answer: JSON.stringify({ answer: correctAns }) };
      }),
    }));
  };

  // ── Clone ──────────────────────────────────────────────────
  const handleClone = async () => {
    try {
      const res = await collectionApi.cloneCollection(collectionId);
      addToast(`Đã sao chép đề thi! ID: ${res.data.newCollectionId}`, 'success');
    } catch { addToast('Lỗi khi sao chép', 'error'); }
  };

  // ── Edit question ──────────────────────────────────────────
  const handleSaveEdit = async (q, data) => {
    setSavingId(q.id);
    try {
      const res = await collectionApi.updateQuestion(collectionId, q.id, data);
      setResult(r => ({
        ...r,
        questions: r.questions.map(item => item.id === q.id ? res.data.question : item),
      }));
      setEditingId(null);
      addToast('Đã lưu câu hỏi!', 'success');
    } catch { addToast('Lỗi khi lưu câu hỏi', 'error'); }
    finally { setSavingId(null); }
  };

  // ── Delete question ────────────────────────────────────────
  const handleDelete = async (q) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    setDeletingId(q.id);
    try {
      await collectionApi.deleteQuestion(collectionId, q.id);
      setResult(r => ({ ...r, questions: r.questions.filter(item => item.id !== q.id) }));
      addToast('Đã xóa câu hỏi!', 'success');
    } catch { addToast('Lỗi khi xóa câu hỏi', 'error'); }
    finally { setDeletingId(null); }
  };

  // ── Regenerate question ────────────────────────────────────
  const handleRegenerate = async (q) => {
    setRegeneratingId(q.id);
    try {
      const res = await collectionApi.regenerateQuestion(collectionId, q.id);
      setResult(r => ({
        ...r,
        questions: r.questions.map(item => item.id === q.id ? res.data.question : item),
      }));
      addToast('Đã tạo lại câu hỏi!', 'success');
    } catch { addToast('Lỗi khi tạo lại câu hỏi', 'error'); }
    finally { setRegeneratingId(null); }
  };

  return (
    <div className="exam-preview-panel">
      {/* ── Toolbar ── */}
      <div className="exam-toolbar">
        <div className="exam-toolbar-left">
          <button className="etb-btn" onClick={() => setShowAnswers(v => !v)} title="Ẩn/hiện đáp án">
            {showAnswers ? <FiEyeOff size={14} /> : <FiEye size={14} />}
            {showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
          <button className="etb-btn" onClick={handleRandomOrder} title="Random thứ tự">
            <FiShuffle size={14} /> Random
          </button>
          <button className="etb-btn" onClick={handleClone} title="Sao chép đề">
            <FiCopy size={14} /> Sao chép
          </button>
        </div>
        <div className="exam-toolbar-right">
          <button className="etb-btn etb-btn--green" onClick={handleExportJSON}>
            <FiDownload size={14} /> JSON
          </button>
          <button className="etb-btn etb-btn--blue" onClick={handleExportPDF} disabled={exporting}>
            <FiDownload size={14} /> {exporting ? 'Đang tạo...' : 'PDF'}
          </button>
          <button className="etb-btn etb-btn--purple" onClick={handlePrint}>
            <FiPrinter size={14} /> In đề
          </button>
          {!hidePlayBtn && (
            <button className="etb-btn etb-btn--primary" onClick={() => navigate(`/practice/ai-arena/${collectionId}`)}>
              <FiPlay size={14} /> Làm bài
            </button>
          )}
        </div>
      </div>

      {/* ── Question List with inline edit ── */}
      <div className="exam-questions-editable">
        {questions.map((q, idx) => {
          const isEditing = editingId === q.id;
          const isRegen = regeneratingId === q.id;
          const isDel = deletingId === q.id;
          const opts = parseOptions(q.options);

          return (
            <div key={q.id} className={`eqe-card${isEditing ? ' eqe-card--editing' : ''}`}>
              {/* Card header */}
              <div className="eqe-card-header">
                <div className="eqe-card-meta">
                  <span className="eqe-num">Câu {idx + 1}</span>
                  <span className={`eqe-badge eqe-badge--${q.question_type}`}>
                    {q.question_type === 'multiple_choice' ? 'Trắc nghiệm'
                      : q.question_type === 'fill_in_blank' ? 'Điền khuyết' : 'Tự luận'}
                  </span>
                  {q.point_value && <span className="eqe-pts">{q.point_value} đ</span>}
                </div>
                <div className="eqe-card-actions">
                  <button className="eqe-btn eqe-btn--edit" title="Sửa"
                    onClick={() => setEditingId(isEditing ? null : q.id)} disabled={isRegen}>
                    <FiEdit2 size={13} />
                  </button>
                  <button className="eqe-btn eqe-btn--regen" title="Tạo lại"
                    onClick={() => handleRegenerate(q)} disabled={isRegen || isDel}>
                    <FiRefreshCw size={13} className={isRegen ? 'spin' : ''} />
                  </button>
                  <button className="eqe-btn eqe-btn--del" title="Xóa"
                    onClick={() => handleDelete(q)} disabled={isRegen || isDel}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <ExamQuestionEditor
                  question={q}
                  onSave={(data) => handleSaveEdit(q, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="eqe-body">
                  <p className="eqe-text">{q.question_text}</p>
                  {opts && (
                    <div className="eqe-opts">
                      {opts.map((opt, j) => (
                        <span key={j} className="eqe-opt">
                          <span className="eqe-opt-label">{String.fromCharCode(65 + j)}.</span> {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── A4 Preview (hidden, used for PDF/Print) ── */}
      <div className="exam-a4-wrapper print-only">
        <ExamPaperA4
          ref={paperRef}
          collection={null}
          questions={questions}
          sections={sections}
          form={{ ...form, testName, durationMinutes, schoolName }}
          showAnswers={showAnswers}
        />
      </div>

      {/* ── Bottom actions ── */}
      <div className="exam-preview-bottom">
        <span className="epb-count">{questions.length} câu hỏi</span>
        <button className="btn btn--outline btn--sm" onClick={onRegenerate}>
          <FiRefreshCw size={13} /> Tạo lại toàn bộ
        </button>
      </div>
    </div>
  );
}
