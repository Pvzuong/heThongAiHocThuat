const pool = require('../config/db');

// GET /api/exercises/lesson/:lessonId
// KHÔNG trả về correct_answer
const getExercisesByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const result = await pool.query(`
      SELECT id, exercise_type, question_text, question_image_url, options, difficulty, sort_order
      FROM exercises
      WHERE lesson_id = $1 AND is_active = true
      ORDER BY sort_order
    `, [lessonId]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/exercises/:exerciseId/submit
const submitExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    if (answer === undefined || answer === null) {
      return res.status(400).json({ error: 'Thiếu câu trả lời' });
    }

    // Lấy đáp án đúng từ DB
    const exResult = await pool.query(`
      SELECT id, lesson_id, exercise_type, correct_answer, explanation
      FROM exercises
      WHERE id = $1 AND is_active = true
    `, [exerciseId]);

    if (exResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài tập' });
    }

    const exercise = exResult.rows[0];
    const correctAnswer = exercise.correct_answer;

    // So sánh đáp án
    const isCorrect = checkAnswer(exercise.exercise_type, answer, correctAnswer);

    // Lưu lịch sử làm bài
    await pool.query(`
      INSERT INTO exercise_attempts (user_id, exercise_id, user_answer, is_correct)
      VALUES ($1, $2, $3, $4)
    `, [userId, exerciseId, JSON.stringify({ answer }), isCorrect]);

    // Cập nhật lesson_progress
    await pool.query(`
      INSERT INTO lesson_progress (user_id, lesson_id, last_accessed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET last_accessed_at = NOW()
    `, [userId, exercise.lesson_id]);

    res.json({
      is_correct: isCorrect,
      correct_answer: correctAnswer.answer ?? correctAnswer,
      explanation: exercise.explanation,
    });
  } catch (err) {
    next(err);
  }
};

// So sánh đáp án theo từng loại bài tập
const checkAnswer = (type, userAnswer, correctAnswer) => {
  if (type === 'multiple_choice' || type === 'fill_blank') {
    return String(userAnswer).trim().toLowerCase() === String(correctAnswer.answer).trim().toLowerCase();
  }
  if (type === 'matching') {
    // So sánh mảng pairs
    const userPairs = JSON.stringify(userAnswer?.pairs?.map(p => p.sort()) ?? []);
    const correctPairs = JSON.stringify(correctAnswer.pairs?.map(p => [...p].sort()) ?? []);
    return userPairs === correctPairs;
  }
  return false;
};

module.exports = { getExercisesByLesson, submitExercise };
