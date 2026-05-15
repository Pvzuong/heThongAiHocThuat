import { useState, useEffect, useRef } from 'react';
import { FiCheck, FiX, FiChevronDown } from 'react-icons/fi';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm' },
  { value: 'fill_in_blank', label: 'Điền vào chỗ trống' },
  { value: 'essay', label: 'Tự luận' },
];
const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
];

export default function ExamQuestionEditor({ question, onSave, onCancel }) {
  const parseOptions = (opts) => {
    if (Array.isArray(opts)) return opts;
    try { return JSON.parse(opts); } catch { return ['', '', '', '']; }
  };

  const getCorrectAnswer = (ca) => {
    if (!ca) return '';
    if (typeof ca === 'object' && ca.answer !== undefined) return ca.answer;
    try { const p = JSON.parse(ca); return p.answer ?? ca; } catch { return String(ca); }
  };

  const [type, setType] = useState(question.question_type || 'multiple_choice');
  const [text, setText] = useState(question.question_text || '');
  const [options, setOptions] = useState(parseOptions(question.options) || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(getCorrectAnswer(question.correct_answer));
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [pointValue, setPointValue] = useState(question.point_value || 1);
  const [difficulty, setDifficulty] = useState(question.difficulty || 'medium');
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = textRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleOptionChange = (idx, val) => {
    const next = [...options];
    next[idx] = val;
    // If changed option was the correct answer, update correct answer
    if (correctAnswer === options[idx]) setCorrectAnswer(val);
    setOptions(next);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'multiple_choice' && options.filter(Boolean).length < 4) {
      setOptions(['', '', '', '']);
    }
    if (newType === 'fill_in_blank' && !text.includes('___')) {
      setText(t => t + ' ___');
    }
  };

  const handleSave = () => {
    const data = {
      question_text: text.trim(),
      question_type: type,
      options: type === 'multiple_choice' ? options.filter(Boolean) : null,
      correct_answer: correctAnswer,
      explanation: explanation.trim(),
      point_value: parseFloat(pointValue) || 1,
    };
    onSave(data);
  };

  const isValid = text.trim().length > 0 &&
    (type !== 'multiple_choice' || (options.filter(Boolean).length >= 2 && correctAnswer && options.includes(correctAnswer)));

  return (
    <div className="qeditor">
      {/* Type selector */}
      <div className="qeditor-row">
        <label className="qeditor-label">Loại câu</label>
        <div className="qeditor-tabs">
          {QUESTION_TYPES.map(t => (
            <button
              key={t.value}
              className={`qeditor-tab${type === t.value ? ' qeditor-tab--active' : ''}`}
              onClick={() => handleTypeChange(t.value)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question text */}
      <div className="qeditor-row">
        <label className="qeditor-label">Nội dung câu hỏi</label>
        <textarea
          ref={textRef}
          className="qeditor-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Nhập nội dung câu hỏi..."
          rows={2}
        />
      </div>

      {/* Options for MC */}
      {type === 'multiple_choice' && (
        <div className="qeditor-row">
          <label className="qeditor-label">Đáp án (tick đáp án đúng)</label>
          <div className="qeditor-options">
            {['A', 'B', 'C', 'D'].map((letter, idx) => (
              <div key={idx} className="qeditor-option-row">
                <button
                  type="button"
                  className={`qeditor-correct-btn${correctAnswer === options[idx] ? ' qeditor-correct-btn--active' : ''}`}
                  onClick={() => options[idx] && setCorrectAnswer(options[idx])}
                  title="Chọn là đáp án đúng"
                >
                  {correctAnswer === options[idx] ? <FiCheck size={13} /> : <span>{letter}</span>}
                </button>
                <input
                  className="qeditor-option-input"
                  type="text"
                  placeholder={`Đáp án ${letter}`}
                  value={options[idx] || ''}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct answer for fill/essay */}
      {type !== 'multiple_choice' && (
        <div className="qeditor-row">
          <label className="qeditor-label">
            {type === 'fill_in_blank' ? 'Đáp án điền vào' : 'Đáp án / Hướng dẫn'}
          </label>
          <input
            className="qeditor-input"
            type="text"
            value={correctAnswer}
            onChange={e => setCorrectAnswer(e.target.value)}
            placeholder={type === 'fill_in_blank' ? 'Nhập đáp án đúng...' : 'Gợi ý đáp án...'}
          />
        </div>
      )}

      {/* Explanation + Points row */}
      <div className="qeditor-row qeditor-row--split">
        <div style={{ flex: 1 }}>
          <label className="qeditor-label">Giải thích</label>
          <input
            className="qeditor-input"
            type="text"
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="Giải thích ngắn gọn..."
          />
        </div>
        <div style={{ width: 90 }}>
          <label className="qeditor-label">Điểm</label>
          <input
            className="qeditor-input"
            type="number"
            step="0.25"
            min="0"
            max="10"
            value={pointValue}
            onChange={e => setPointValue(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="qeditor-actions">
        <button
          className="btn btn--primary btn--sm"
          onClick={handleSave}
          disabled={!isValid}
          type="button"
        >
          <FiCheck size={13} /> Lưu
        </button>
        <button className="btn btn--outline btn--sm" onClick={onCancel} type="button">
          <FiX size={13} /> Hủy
        </button>
      </div>
    </div>
  );
}
