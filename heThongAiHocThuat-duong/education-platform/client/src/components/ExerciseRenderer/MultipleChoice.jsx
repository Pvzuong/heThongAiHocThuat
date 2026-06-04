const MultipleChoice = ({ question, onSubmit, disabled }) => {
  const handleSelect = (option) => {
    if (!disabled) onSubmit(option);
  };

  return (
    <div className="exercise-options">
      {question.options.map((option, idx) => (
        <button
          key={idx}
          className="option-btn"
          onClick={() => handleSelect(option)}
          disabled={disabled}
        >
          <span className="option-label">{String.fromCharCode(65 + idx)}</span>
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultipleChoice;
