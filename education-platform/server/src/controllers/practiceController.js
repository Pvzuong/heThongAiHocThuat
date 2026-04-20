const pool = require('../config/db');

// ============================================================
// GET /api/practice/questions
// Query: gradeSlug, subjectSlug, chapterId?, difficulty, limit?
// ============================================================
const getPracticeQuestions = async (req, res, next) => {
  try {
    const { gradeSlug, subjectSlug, chapterId, difficulty = 1, limit = 60 } = req.query;

    if (!gradeSlug || !subjectSlug) {
      return res.status(400).json({ error: 'Thiếu gradeSlug hoặc subjectSlug' });
    }

    const params = [gradeSlug, subjectSlug, parseInt(difficulty)];
    let chapterFilter = '';

    if (chapterId) {
      params.push(parseInt(chapterId));
      chapterFilter = `AND c.id = $${params.length}`;
    }

    params.push(parseInt(limit) || 60);

    const result = await pool.query(
      `SELECT
        e.id,
        e.exercise_type,
        e.question_text,
        e.question_image_url,
        e.options,
        e.correct_answer,
        e.explanation,
        e.difficulty,
        c.title AS chapter_title,
        l.title AS lesson_title
      FROM exercises e
      JOIN lessons l ON l.id = e.lesson_id AND l.is_active = true
      JOIN chapters c ON c.id = l.chapter_id AND c.is_active = true
      JOIN grade_subjects gs ON gs.id = c.grade_subject_id AND gs.is_active = true
      JOIN grades g ON g.id = gs.grade_id
      JOIN subjects s ON s.id = gs.subject_id AND s.is_active = true
      WHERE g.slug = $1
        AND s.slug = $2
        AND e.difficulty = $3
        AND e.is_active = true
        ${chapterFilter}
      ORDER BY RANDOM()
      LIMIT $${params.length}`,
      params
    );

    // Với câu matching: chỉ trả về những câu có ≤ 4 cặp
    const questions = result.rows.filter((q) => {
      if (q.exercise_type !== 'matching') return true;
      try {
        const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        return Array.isArray(opts?.left) && opts.left.length <= 4;
      } catch {
        return false;
      }
    });

    res.json({ questions, total: questions.length });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// POST /api/practice/sessions  — lưu kết quả phiên
// Body: { gradeSlug, subjectSlug, chapterId?, difficulty,
//         totalQuestions, correctCount, wrongCount,
//         score, maxStreak, durationSeconds }
// ============================================================
const savePracticeSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      gradeSlug, subjectSlug, chapterId,
      difficulty, totalQuestions, correctCount,
      wrongCount, score, maxStreak, durationSeconds,
    } = req.body;

    if (!gradeSlug || !subjectSlug || difficulty == null) {
      return res.status(400).json({ error: 'Thiếu thông tin phiên luyện tập' });
    }

    const result = await pool.query(
      `INSERT INTO practice_sessions
        (user_id, grade_slug, subject_slug, chapter_id, difficulty,
         total_questions, correct_count, wrong_count, score, max_streak, duration_seconds)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        userId, gradeSlug, subjectSlug, chapterId || null,
        difficulty, totalQuestions || 0, correctCount || 0,
        wrongCount || 0, score || 0, maxStreak || 0, durationSeconds || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/practice/leaderboard
// Query: gradeSlug, subjectSlug, difficulty?, limit?
// ============================================================
const getLeaderboard = async (req, res, next) => {
  try {
    const { gradeSlug, subjectSlug, difficulty, limit = 20 } = req.query;

    if (!gradeSlug || !subjectSlug) {
      return res.status(400).json({ error: 'Thiếu gradeSlug hoặc subjectSlug' });
    }

    const params = [gradeSlug, subjectSlug];
    let diffFilter = '';
    if (difficulty) {
      params.push(parseInt(difficulty));
      diffFilter = `AND ps.difficulty = $${params.length}`;
    }
    params.push(parseInt(limit) || 20);

    const result = await pool.query(
      `SELECT
        ps.user_id,
        u.display_name,
        u.avatar_url,
        ps.score,
        ps.correct_count,
        ps.total_questions,
        ps.max_streak,
        ps.difficulty,
        ps.duration_seconds,
        ps.played_at,
        RANK() OVER (ORDER BY ps.score DESC, ps.correct_count DESC, ps.duration_seconds ASC) AS rank
      FROM practice_sessions ps
      JOIN users u ON u.id = ps.user_id
      WHERE ps.grade_slug = $1
        AND ps.subject_slug = $2
        ${diffFilter}
      ORDER BY ps.score DESC, ps.correct_count DESC, ps.duration_seconds ASC
      LIMIT $${params.length}`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET /api/practice/my-sessions  — lịch sử của user hiện tại
// ============================================================
const getMySessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      `SELECT id, grade_slug, subject_slug, chapter_id, difficulty,
              total_questions, correct_count, wrong_count, score,
              max_streak, duration_seconds, played_at
       FROM practice_sessions
       WHERE user_id = $1
       ORDER BY played_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPracticeQuestions, savePracticeSession, getLeaderboard, getMySessions };
