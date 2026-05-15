import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { getExercisesByLesson, submitExercise } from '../../api/lessonApi';
import { getLessonById } from '../../api/subjectApi';
import MultipleChoice from '../../components/ExerciseRenderer/MultipleChoice';
import FillInBlank from '../../components/ExerciseRenderer/FillInBlank';
import Matching from '../../components/ExerciseRenderer/Matching';
import LoadingSpinner from '../../components/LoadingSpinner';

const ExercisePage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null); // { is_correct, correct_answer, explanation }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getLessonById(lessonId), getExercisesByLesson(lessonId)])
      .then(([lessonRes, exRes]) => {
        setLesson(lessonRes.data);
        setExercises(exRes.data);
      })
      .catch(() => setError('Không thể tải bài tập'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSubmit = async (answer) => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await submitExercise(exercises[current].id, answer);
      setResult(res.data);
      setScore((s) => ({
        correct: s.correct + (res.data.is_correct ? 1 : 0),
        total: s.total + 1,
      }));
    } catch {
      setError('Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (current + 1 >= exercises.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setResult(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><p className="form-error">{error}</p></div>;
  if (exercises.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <p>Chưa có bài tập nào cho bài học này.</p>
        <Link to={`/lesson/${lessonId}`} className="btn btn--outline" style={{ marginTop: 16 }}>
          Quay lại bài học
        </Link>
      </div>
    );
  }

  const exercise = exercises[current];
  const progress = ((current + (result ? 1 : 0)) / exercises.length) * 100;

  // Màn hình kết quả cuối
  if (done) {
    const percent = Math.round((score.correct / score.total) * 100);
    return (
      <div className="exercise-page">
        <div className="exercise-card exercise-done">
          <div className="done-icon">{percent >= 70 ? '🎉' : '📚'}</div>
          <h2>Hoàn thành!</h2>
          <p className="done-score">
            Bạn trả lời đúng <strong>{score.correct}/{score.total}</strong> câu ({percent}%)
          </p>
          <p className="done-msg">
            {percent === 100 ? 'Xuất sắc! Bạn đã trả lời đúng tất cả.' :
             percent >= 70 ? 'Tốt lắm! Hãy ôn lại các câu sai nhé.' :
             'Cần luyện tập thêm. Thử lại lần nữa nhé!'}
          </p>
          <div className="done-actions">
            <Link to={`/lesson/${lessonId}`} className="btn btn--outline">Xem lại bài học</Link>
            <button className="btn btn--primary" onClick={() => {
              setCurrent(0); setResult(null); setScore({ correct: 0, total: 0 }); setDone(false);
            }}>
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-page">
      {/* Header */}
      <div className="exercise-header">
        <Link to={`/lesson/${lessonId}`} className="exercise-back">
          ← {lesson?.title}
        </Link>
        <span className="exercise-counter">Câu {current + 1} / {exercises.length}</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar exercise-progress">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className="exercise-card">
        <div className="exercise-difficulty">
          {'⭐'.repeat(exercise.difficulty || 1)}
        </div>
        <p className="exercise-question">{exercise.question_text}</p>

        {/* Renderer */}
        {exercise.exercise_type === 'multiple_choice' && (
          <MultipleChoice key={exercise.id} question={exercise} onSubmit={handleSubmit} disabled={!!result || submitting} />
        )}
        {exercise.exercise_type === 'fill_blank' && (
          <FillInBlank key={exercise.id} question={exercise} onSubmit={handleSubmit} disabled={!!result || submitting} />
        )}
        {exercise.exercise_type === 'matching' && (
          <Matching key={exercise.id} question={exercise} onSubmit={handleSubmit} disabled={!!result || submitting} />
        )}

        {/* Kết quả */}
        {result && (
          <div className={`exercise-result ${result.is_correct ? 'exercise-result--correct' : 'exercise-result--wrong'}`}>
            <div className="result-icon">
              {result.is_correct ? <FiCheckCircle size={24} /> : <FiXCircle size={24} />}
              <strong>{result.is_correct ? 'Chính xác!' : 'Chưa đúng'}</strong>
            </div>
            {!result.is_correct && (
              <p>Đáp án đúng: <strong>{JSON.stringify(result.correct_answer)}</strong></p>
            )}
            {result.explanation && <p className="result-explanation">{result.explanation}</p>}
            <button className="btn btn--primary" onClick={handleNext}>
              {current + 1 >= exercises.length ? 'Xem kết quả' : 'Câu tiếp theo'} <FiArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisePage;
