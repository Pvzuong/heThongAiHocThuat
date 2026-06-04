const pool = require('../config/db');

// GET /api/subjects/:gradeSlug/:subjectSlug/chapters
const getChaptersBySubject = async (req, res, next) => {
  try {
    const { gradeSlug, subjectSlug } = req.params;

    const result = await pool.query(`
      SELECT
        c.id,
        c.title,
        c.slug,
        c.description,
        c.sort_order,
        COUNT(l.id) AS lesson_count
      FROM chapters c
      JOIN grade_subjects gs ON gs.id = c.grade_subject_id
      JOIN grades g ON g.id = gs.grade_id
      JOIN subjects s ON s.id = gs.subject_id
      LEFT JOIN lessons l ON l.chapter_id = c.id AND l.is_active = true
      WHERE g.slug = $1 AND s.slug = $2 AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order
    `, [gradeSlug, subjectSlug]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/chapters/:chapterId/lessons
const getLessonsByChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;

    const result = await pool.query(`
      SELECT id, title, slug, content_type, sort_order
      FROM lessons
      WHERE chapter_id = $1 AND is_active = true
      ORDER BY sort_order
    `, [chapterId]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getChaptersBySubject, getLessonsByChapter };
