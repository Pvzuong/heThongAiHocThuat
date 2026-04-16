import { useState } from 'react';

const FillInBlank = ({ question, onSubmit, disabled }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  // Hiển thị question_text với ___ thành input
  const parts = question.question_text.split('___');

  return (
    <form className="fill-blank-form" onSubmit={handleSubmit}>
      <p className="fill-blank-text">
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < parts.length - 1 && (
              <input
                className="fill-blank-input"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={disabled}
                autoFocus
                placeholder="?"
              />
            )}
          </span>
        ))}
      </p>
      <button type="submit" className="btn btn--primary" disabled={disabled || !value.trim()}>
        Kiểm tra
      </button>
    </form>
  );
};

export default FillInBlank;
