const pool = require('../config/db');

// GET /api/progress/overview
const getProgressOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Tổng bài đã hoàn thành
    const completedResult = await pool.query(`
      SELECT COUNT(*) AS total_completed
      FROM lesson_progress
      WHERE user_id = $1 AND is_completed = true
    `, [userId]);

    // Tổng lần làm bài tập
    const attemptsResult = await pool.query(`
      SELECT COUNT(*) AS total_attempts,
             SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_count
      FROM exercise_attempts
      WHERE user_id = $1
    `, [userId]);

    // Tiến độ từng chương
    const chapterResult = await pool.query(`
      SELECT
        cp.chapter_id,
        c.title,
        cp.total_lessons,
        cp.completed_lessons,
        cp.progress_percent
      FROM chapter_progress cp
      JOIN chapters c ON c.id = cp.chapter_id
      WHERE cp.user_id = $1
      ORDER BY c.sort_order
    `, [userId]);

    const totalAttempts = parseInt(attemptsResult.rows[0].total_attempts) || 0;
    const correctCount = parseInt(attemptsResult.rows[0].correct_count) || 0;
    const accuracyRate = totalAttempts > 0
      ? parseFloat(((correctCount / totalAttempts) * 100).toFixed(1))
      : 0;

    res.json({
      total_lessons_completed: parseInt(completedResult.rows[0].total_completed),
      total_exercises_attempted: totalAttempts,
      accuracy_rate: accuracyRate,
      chapters: chapterResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/progress/lesson/:lessonId/complete
const completeLesson = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    // Kiểm tra lesson tồn tại
    const lessonResult = await pool.query(`
      SELECT id, chapter_id FROM lessons WHERE id = $1 AND is_active = true
    `, [lessonId]);

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    const chapterId = lessonResult.rows[0].chapter_id;

    // Upsert lesson_progress
    await pool.query(`
      INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at, last_accessed_at)
      VALUES ($1, $2, true, NOW(), NOW())
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET is_completed = true, completed_at = NOW(), last_accessed_at = NOW()
    `, [userId, lessonId]);

    // Cập nhật chapter_progress
    await updateChapterProgress(userId, chapterId);

    res.json({ message: 'Đã đánh dấu hoàn thành bài học' });
  } catch (err) {
    next(err);
  }
};

// GET /api/progress/chapter/:chapterId
const getChapterProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chapterId } = req.params;

    const result = await pool.query(`
      SELECT
        l.id AS lesson_id,
        l.title,
        l.slug,
        l.sort_order,
        COALESCE(lp.is_completed, false) AS is_completed,
        lp.completed_at,
        lp.last_accessed_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $1
      WHERE l.chapter_id = $2 AND l.is_active = true
      ORDER BY l.sort_order
    `, [userId, chapterId]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Helper: cập nhật chapter_progress sau khi hoàn thành lesson
const updateChapterProgress = async (userId, chapterId) => {
  const total = await pool.query(`
    SELECT COUNT(*) AS cnt FROM lessons WHERE chapter_id = $1 AND is_active = true
  `, [chapterId]);

  const completed = await pool.query(`
    SELECT COUNT(*) AS cnt
    FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = $1 AND l.chapter_id = $2 AND lp.is_completed = true
  `, [userId, chapterId]);

  const totalCount = parseInt(total.rows[0].cnt);
  const completedCount = parseInt(completed.rows[0].cnt);
  const percent = totalCount > 0
    ? parseFloat(((completedCount / totalCount) * 100).toFixed(2))
    : 0;

  await pool.query(`
    INSERT INTO chapter_progress (user_id, chapter_id, total_lessons, completed_lessons, progress_percent, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id, chapter_id)
    DO UPDATE SET
      total_lessons = $3,
      completed_lessons = $4,
      progress_percent = $5,
      updated_at = NOW()
  `, [userId, chapterId, totalCount, completedCount, percent]);
};

module.exports = { getProgressOverview, completeLesson, getChapterProgress };
