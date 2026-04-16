const pool = require('../config/db');

// GET /api/search?q=keyword
const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ lessons: [], paths: [] });
    }

    const keyword = `%${q}%`;

    // Tìm bài học phổ thông (kèm breadcrumb)
    const lessonResult = await pool.query(
      `SELECT l.id, l.title, l.slug,
              ch.title AS chapter_title,
              g.name   AS grade_name,
              g.slug   AS grade_slug,
              s.slug   AS subject_slug
       FROM lessons l
       JOIN chapters ch ON ch.id = l.chapter_id
       JOIN grade_subjects gs ON gs.id = ch.grade_subject_id
       JOIN grades g ON g.id = gs.grade_id
       JOIN subjects s ON s.id = gs.subject_id
       WHERE l.is_active = true
         AND (l.title ILIKE $1 OR ch.title ILIKE $1)
       ORDER BY g.sort_order, ch.sort_order, l.sort_order
       LIMIT 10`,
      [keyword]
    );

    // Tìm skill paths + skill lessons
    const pathResult = await pool.query(
      `SELECT sp.id, sp.title, sp.slug, sp.description, sp.difficulty,
              sp.estimated_hours, sp.module_count
       FROM skill_paths sp
       WHERE sp.is_active = true
         AND (sp.title ILIKE $1 OR sp.description ILIKE $1)
       LIMIT 5`,
      [keyword]
    );

    const skillLessonResult = await pool.query(
      `SELECT sl.id, sl.title,
              sm.title AS module_title,
              sp.title AS path_title,
              sp.slug  AS path_slug
       FROM skill_lessons sl
       JOIN skill_modules sm ON sm.id = sl.module_id
       JOIN skill_paths sp ON sp.id = sm.path_id
       WHERE sl.is_active = true
         AND (sl.title ILIKE $1 OR sm.title ILIKE $1)
       ORDER BY sm.sort_order, sl.sort_order
       LIMIT 8`,
      [keyword]
    );

    res.json({
      lessons: lessonResult.rows,
      paths: pathResult.rows,
      skill_lessons: skillLessonResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
