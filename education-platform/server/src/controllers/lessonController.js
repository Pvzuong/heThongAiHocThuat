const pool = require('../config/db');

// GET /api/lessons/:lessonId
const getLessonById = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const result = await pool.query(`
      SELECT
        l.id, l.title, l.slug, l.content_html, l.content_type,
        c.id AS chapter_id, c.title AS chapter_title, c.slug AS chapter_slug,
        g.name AS grade_name, g.slug AS grade_slug,
        s.name AS subject_name, s.slug AS subject_slug
      FROM lessons l
      JOIN chapters c ON c.id = l.chapter_id
      JOIN grade_subjects gs ON gs.id = c.grade_subject_id
      JOIN grades g ON g.id = gs.grade_id
      JOIN subjects s ON s.id = gs.subject_id
      WHERE l.id = $1 AND l.is_active = true
    `, [lessonId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    const lesson = result.rows[0];

    // Lấy bài trước và bài sau trong cùng chương
    const siblings = await pool.query(`
      SELECT id, title, slug, sort_order
      FROM lessons
      WHERE chapter_id = $1 AND is_active = true
      ORDER BY sort_order
    `, [lesson.chapter_id]);

    const idx = siblings.rows.findIndex(r => r.id === lesson.id);
    const prev = idx > 0 ? siblings.rows[idx - 1] : null;
    const next = idx < siblings.rows.length - 1 ? siblings.rows[idx + 1] : null;

    res.json({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      content_html: lesson.content_html,
      content_type: lesson.content_type,
      chapter: {
        id: lesson.chapter_id,
        title: lesson.chapter_title,
        slug: lesson.chapter_slug,
      },
      grade: { name: lesson.grade_name, slug: lesson.grade_slug },
      subject: { name: lesson.subject_name, slug: lesson.subject_slug },
      prev_lesson: prev ? { id: prev.id, title: prev.title } : null,
      next_lesson: next ? { id: next.id, title: next.title } : null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLessonById };
