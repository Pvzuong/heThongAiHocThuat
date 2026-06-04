import { forwardRef } from 'react';

const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

function parseOptions(opts) {
  if (Array.isArray(opts)) return opts;
  try { return JSON.parse(opts); } catch { return null; }
}

function getAnswer(ca) {
  if (!ca) return '';
  if (typeof ca === 'object' && ca.answer !== undefined) return ca.answer;
  try { const p = JSON.parse(ca); return p.answer ?? ''; } catch { return String(ca); }
}

const ExamPaperA4 = forwardRef(function ExamPaperA4(
  { collection, questions, sections, form, showAnswers },
  ref
) {
  const meta = collection?.metadata || {};
  const schoolName = form?.schoolName || meta.schoolName || 'TRƯỜNG __________________';
  const testName = form?.testName || collection?.collection_name || 'ĐỀ KIỂM TRA';
  const grade = form?.grade || collection?.grade_number || '';
  const subject = form?.subject || collection?.subject || '';
  const diff = form?.difficulty || collection?.difficulty || 'medium';
  const duration = form?.durationMinutes || collection?.duration_minutes || '';
  const activeSections = sections || meta.sections || [];

  // Group questions by section
  const bySection = {};
  for (const q of questions) {
    const sec = q.section || 'A';
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(q);
  }

  // If no sections metadata, build from groups
  const displaySections = activeSections.length > 0
    ? activeSections
    : Object.keys(bySection).map(id => ({
        id,
        title: id === 'A' ? 'Phần A. Trắc nghiệm' : id === 'B' ? 'Phần B. Điền vào chỗ trống' : 'Phần C. Tự luận',
        instruction: id === 'A' ? 'Khoanh tròn vào chữ cái trước câu trả lời đúng:' : id === 'B' ? 'Điền đáp án thích hợp vào chỗ trống:' : 'Trình bày đầy đủ lời giải:',
        total_points: null,
      }));

  // If no sections at all (plain question list)
  const allInOne = displaySections.length === 0;

  let globalIdx = 0;
  const mcAnswers = []; // for answer key at bottom

  return (
    <div className="exam-paper-a4" ref={ref}>
      {/* ── Header ── */}
      <div className="epa-header">
        <div className="epa-header-left">
          <div className="epa-school-name">{schoolName.toUpperCase()}</div>
          <div className="epa-info-row">
            <span>Họ và tên: <span className="epa-dotline" /></span>
            <span>Số báo danh: <span className="epa-dotline epa-dotline--short" /></span>
          </div>
          <div className="epa-info-row">
            <span>Lớp: <span className="epa-dotline epa-dotline--short" /></span>
            <span>Ngày: <span className="epa-dotline epa-dotline--short" /></span>
          </div>
        </div>
        <div className="epa-header-right">
          <div className="epa-exam-title">{testName.toUpperCase()}</div>
          <div className="epa-exam-meta">
            {subject && <span>{subject}</span>}
            {grade && <span> — Lớp {grade}</span>}
            {diff && <span> — {DIFF_LABEL[diff] || diff}</span>}
          </div>
          {duration && <div className="epa-exam-duration">⏱ Thời gian: {duration} phút</div>}
          <div className="epa-exam-score">Tổng điểm: 10</div>
        </div>
      </div>

      <div className="epa-divider" />

      {/* ── Sections ── */}
      {allInOne ? (
        <div className="epa-section">
          {questions.map((q) => {
            globalIdx++;
            return <QuestionBlock key={q.id} q={q} num={globalIdx} showAnswers={showAnswers} mcAnswers={mcAnswers} />;
          })}
        </div>
      ) : (
        displaySections.map(sec => {
          const qs = bySection[sec.id] || [];
          if (qs.length === 0) return null;
          return (
            <div key={sec.id} className="epa-section">
              <div className="epa-section-header">
                <span className="epa-section-title">{sec.title}</span>
                {sec.total_points != null && (
                  <span className="epa-section-pts">({sec.total_points} điểm)</span>
                )}
              </div>
              {sec.instruction && <p className="epa-section-instruction">{sec.instruction}</p>}
              {qs.map(q => {
                globalIdx++;
                return <QuestionBlock key={q.id} q={q} num={globalIdx} showAnswers={showAnswers} mcAnswers={mcAnswers} />;
              })}
            </div>
          );
        })
      )}

      {/* ── Answer Key ── */}
      {showAnswers && mcAnswers.length > 0 && (
        <div className="epa-answer-key">
          <div className="epa-answer-key-title">ĐÁP ÁN PHẦN TRẮC NGHIỆM</div>
          <div className="epa-answer-key-grid">
            {mcAnswers.map(({ num, answer }) => (
              <div key={num} className="epa-answer-key-item">
                <span className="epa-answer-key-num">{num}.</span>
                <span className="epa-answer-key-val">{answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

function QuestionBlock({ q, num, showAnswers, mcAnswers }) {
  const opts = parseOptions(q.options);
  const answer = getAnswer(q.correct_answer);

  if (q.question_type === 'multiple_choice' && opts) {
    // Track for answer key
    if (mcAnswers) {
      const letter = opts.indexOf(answer) >= 0 ? String.fromCharCode(65 + opts.indexOf(answer)) : answer;
      mcAnswers.push({ num, answer: letter });
    }
    return (
      <div className="epa-question">
        <div className="epa-q-header">
          <span className="epa-q-num">Câu {num}.</span>
          {q.point_value && <span className="epa-q-pts">({q.point_value} đ)</span>}
        </div>
        <p className="epa-q-text">{q.question_text}</p>
        {q.image_svg && <div className="epa-q-img" dangerouslySetInnerHTML={{ __html: q.image_svg }} />}
        <div className="epa-mc-opts">
          {opts.map((opt, j) => {
            const letter = String.fromCharCode(65 + j);
            const isCorrect = showAnswers && opt === answer;
            return (
              <span key={j} className={`epa-mc-opt${isCorrect ? ' epa-mc-opt--correct' : ''}`}>
                <span className="epa-mc-label">{letter}.</span> {opt}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (q.question_type === 'fill_in_blank') {
    return (
      <div className="epa-question">
        <div className="epa-q-header">
          <span className="epa-q-num">Câu {num}.</span>
          {q.point_value && <span className="epa-q-pts">({q.point_value} đ)</span>}
        </div>
        <p className="epa-q-text">{q.question_text}</p>
        {showAnswers && answer && <p className="epa-q-answer">→ {answer}</p>}
      </div>
    );
  }

  // Essay
  return (
    <div className="epa-question">
      <div className="epa-q-header">
        <span className="epa-q-num">Câu {num}.</span>
        {q.point_value && <span className="epa-q-pts">({q.point_value} đ)</span>}
      </div>
      <p className="epa-q-text">{q.question_text}</p>
      {showAnswers && answer && <p className="epa-q-answer">Gợi ý: {answer}</p>}
      {!showAnswers && <div className="epa-answer-box" />}
    </div>
  );
}

export default ExamPaperA4;
