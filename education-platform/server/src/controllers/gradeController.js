const pool = require('../config/db');

// GET /api/grades
// Trả về danh sách cấp học + lớp, nhóm theo education_level
const getGrades = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        el.name AS level_name,
        el.slug AS level_slug,
        g.id,
        g.name,
        g.slug,
        g.grade_number
      FROM education_levels el
      JOIN grades g ON g.education_level_id = el.id
      ORDER BY el.sort_order, g.sort_order
    `);

    // Nhóm theo cấp học
    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.level_slug]) {
        grouped[row.level_slug] = {
          level: row.level_name,
          slug: row.level_slug,
          grades: [],
        };
      }
      grouped[row.level_slug].grades.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        grade_number: row.grade_number,
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    next(err);
  }
};

// GET /api/grades/:gradeSlug/subjects
const getSubjectsByGrade = async (req, res, next) => {
  try {
    const { gradeSlug } = req.params;

    const result = await pool.query(`
      SELECT gs.id AS grade_subject_id, s.id, s.name, s.slug, s.icon_url, s.description
      FROM subjects s
      JOIN grade_subjects gs ON gs.subject_id = s.id
      JOIN grades g ON g.id = gs.grade_id
      WHERE g.slug = $1 AND gs.is_active = true AND s.is_active = true
      ORDER BY s.name
    `, [gradeSlug]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getGrades, getSubjectsByGrade };
