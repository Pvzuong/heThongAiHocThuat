import { useState, useEffect } from 'react';

const Matching = ({ question, onSubmit, disabled }) => {
  const { left, right } = question.options;
  const [selected, setSelected] = useState(null); // index bên trái đang chọn
  const [pairs, setPairs] = useState([]); // [[leftIdx, rightIdx], ...]

  useEffect(() => {
    setSelected(null);
    setPairs([]);
  }, [question.id]);

  const isLeftPaired = (idx) => pairs.some(([l]) => l === idx);
  const isRightPaired = (idx) => pairs.some(([, r]) => r === idx);
  const getPairForLeft = (idx) => pairs.find(([l]) => l === idx)?.[1];

  const handleLeft = (idx) => {
    if (disabled) return;
    if (isLeftPaired(idx)) {
      // Bỏ cặp
      setPairs((p) => p.filter(([l]) => l !== idx));
      setSelected(null);
    } else {
      setSelected(idx);
    }
  };

  const handleRight = (idx) => {
    if (disabled || selected === null) return;
    if (isRightPaired(idx)) return; // đã có cặp
    setPairs((p) => [...p, [selected, idx]]);
    setSelected(null);
  };

  const handleSubmit = () => {
    onSubmit({ pairs });
  };

  const allPaired = pairs.length === left.length;

  return (
    <div className="matching-wrap">
      <div className="matching-columns">
        <div className="matching-col">
          {left.map((item, idx) => {
            const pairedRight = getPairForLeft(idx);
            return (
              <button
                key={idx}
                className={`matching-item ${selected === idx ? 'matching-item--selected' : ''} ${isLeftPaired(idx) ? 'matching-item--paired' : ''}`}
                onClick={() => handleLeft(idx)}
                disabled={disabled}
              >
                {item}
                {pairedRight !== undefined && (
                  <span className="matching-arrow">→ {right[pairedRight]}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="matching-col">
          {right.map((item, idx) => (
            <button
              key={idx}
              className={`matching-item ${isRightPaired(idx) ? 'matching-item--paired' : ''} ${selected !== null && !isRightPaired(idx) ? 'matching-item--selectable' : ''}`}
              onClick={() => handleRight(idx)}
              disabled={disabled || isRightPaired(idx)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="matching-hint">
        {selected !== null ? `Đang ghép: "${left[selected]}" — chọn đáp án bên phải` : 'Chọn một mục bên trái để bắt đầu ghép'}
      </p>

      <button
        className="btn btn--primary"
        onClick={handleSubmit}
        disabled={disabled || !allPaired}
      >
        Kiểm tra ({pairs.length}/{left.length} cặp)
      </button>
    </div>
  );
};

export default Matching;
