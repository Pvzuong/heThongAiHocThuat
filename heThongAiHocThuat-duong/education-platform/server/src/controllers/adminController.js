const pool = require('../config/db');

// ============================================================
// USERS
// ============================================================

// GET /api/admin/users?page=1&limit=20&role=student
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const role = req.query.role;

    let query = `SELECT id, email, display_name, role, is_active, created_at FROM users`;
    const params = [];

    if (role) {
      query += ` WHERE role = $1`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      role ? `SELECT COUNT(*) FROM users WHERE role = $1` : `SELECT COUNT(*) FROM users`,
      role ? [role] : []
    );

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active, display_name } = req.body;

    const fields = [];
    const params = [];

    if (role !== undefined) {
      if (!['student', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role không hợp lệ' });
      }
      params.push(role);
      fields.push(`role = $${params.length}`);
    }
    if (is_active !== undefined) {
      params.push(is_active);
      fields.push(`is_active = $${params.length}`);
    }
    if (display_name !== undefined) {
      params.push(display_name);
      fields.push(`display_name = $${params.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING id, email, role, is_active, display_name`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id  (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
    res.json({ message: 'Đã vô hiệu hoá người dùng' });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// CHAPTERS
// ============================================================

// POST /api/admin/chapters
const createChapter = async (req, res, next) => {
  try {
    const { grade_subject_id, title, slug, description, sort_order } = req.body;

    if (!grade_subject_id || !title || !slug) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: grade_subject_id, title, slug' });
    }

    const result = await pool.query(
      `INSERT INTO chapters (grade_subject_id, title, slug, description, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [grade_subject_id, title, slug, description || null, sort_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/chapters/:id
const updateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, description, sort_order, is_active } = req.body;

    const result = await pool.query(
      `UPDATE chapters SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        sort_order = COALESCE($4, sort_order),
        is_active = COALESCE($5, is_active)
       WHERE id = $6 RETURNING *`,
      [title, slug, description, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chương' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/chapters/:id
const deleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE chapters SET is_active = false WHERE id = $1`, [id]);
    res.json({ message: 'Đã xoá chương' });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// LESSONS
// ============================================================

// POST /api/admin/lessons
const createLesson = async (req, res, next) => {
  try {
    const { chapter_id, title, slug, content_type, content_html, sort_order } = req.body;

    if (!chapter_id || !title || !slug) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: chapter_id, title, slug' });
    }

    const result = await pool.query(
      `INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [chapter_id, title, slug, content_type || 'theory', content_html || null, sort_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/lessons/:id
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, content_type, content_html, sort_order, is_active } = req.body;

    const result = await pool.query(
      `UPDATE lessons SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        content_type = COALESCE($3, content_type),
        content_html = COALESCE($4, content_html),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, slug, content_type, content_html, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/lessons/:id
const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE lessons SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
    res.json({ message: 'Đã xoá bài học' });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// EXERCISES
// ============================================================

// POST /api/admin/exercises
const createExercise = async (req, res, next) => {
  try {
    const { lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order } = req.body;

    if (!lesson_id || !exercise_type || !question_text || !correct_answer) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    if (!['multiple_choice', 'fill_blank', 'matching'].includes(exercise_type)) {
      return res.status(400).json({ error: 'exercise_type không hợp lệ' });
    }

    const result = await pool.query(
      `INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        lesson_id, exercise_type, question_text,
        options ? JSON.stringify(options) : null,
        JSON.stringify(correct_answer),
        explanation || null,
        difficulty || 1,
        sort_order || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/exercises/:id
const updateExercise = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question_text, options, correct_answer, explanation, difficulty, sort_order, is_active } = req.body;

    const result = await pool.query(
      `UPDATE exercises SET
        question_text = COALESCE($1, question_text),
        options = COALESCE($2, options),
        correct_answer = COALESCE($3, correct_answer),
        explanation = COALESCE($4, explanation),
        difficulty = COALESCE($5, difficulty),
        sort_order = COALESCE($6, sort_order),
        is_active = COALESCE($7, is_active)
       WHERE id = $8 RETURNING *`,
      [
        question_text,
        options ? JSON.stringify(options) : null,
        correct_answer ? JSON.stringify(correct_answer) : null,
        explanation, difficulty, sort_order, is_active, id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài tập' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/exercises/:id
const deleteExercise = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE exercises SET is_active = false WHERE id = $1`, [id]);
    res.json({ message: 'Đã xoá bài tập' });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// SKILL MODULES
// ============================================================

// POST /api/admin/skill-modules
const createSkillModule = async (req, res, next) => {
  try {
    const { path_id, title, slug, description, estimated_hours, sort_order } = req.body;
    if (!path_id || !title || !slug) {
      return res.status(400).json({ error: 'Thiếu: path_id, title, slug' });
    }
    const result = await pool.query(
      `INSERT INTO skill_modules (path_id, title, slug, description, estimated_hours, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [path_id, title, slug, description || null, estimated_hours || 0, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/admin/skill-modules/:id
const updateSkillModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, description, estimated_hours, sort_order, is_active } = req.body;
    const result = await pool.query(
      `UPDATE skill_modules SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        estimated_hours = COALESCE($4, estimated_hours),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [title, slug, description, estimated_hours, sort_order, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy module' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/admin/skill-modules/:id
const deleteSkillModule = async (req, res, next) => {
  try {
    await pool.query(`UPDATE skill_modules SET is_active = false WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Đã xoá module' });
  } catch (err) { next(err); }
};

// ============================================================
// SKILL LESSONS
// ============================================================

// POST /api/admin/skill-lessons
const createSkillLesson = async (req, res, next) => {
  try {
    const { module_id, title, slug, content_html, sort_order } = req.body;
    if (!module_id || !title || !slug) {
      return res.status(400).json({ error: 'Thiếu: module_id, title, slug' });
    }
    const result = await pool.query(
      `INSERT INTO skill_lessons (module_id, title, slug, content_html, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [module_id, title, slug, content_html || null, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/admin/skill-lessons/:id
const updateSkillLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, content_html, sort_order, is_active } = req.body;
    const result = await pool.query(
      `UPDATE skill_lessons SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        content_html = COALESCE($3, content_html),
        sort_order = COALESCE($4, sort_order),
        is_active = COALESCE($5, is_active)
       WHERE id = $6 RETURNING *`,
      [title, slug, content_html, sort_order, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài học' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/admin/skill-lessons/:id
const deleteSkillLesson = async (req, res, next) => {
  try {
    await pool.query(`UPDATE skill_lessons SET is_active = false WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Đã xoá bài học kỹ năng' });
  } catch (err) { next(err); }
};

// ============================================================
// SUBJECTS (môn học)
// ============================================================

// GET /api/admin/subjects?gradeId=...
const getSubjects = async (req, res, next) => {
  try {
    const { gradeId } = req.query;
    let query;
    let params;

    if (gradeId) {
      query = `
        SELECT s.id, s.name, s.slug, s.description, s.icon_url, s.is_active,
               gs.id AS grade_subject_id
        FROM subjects s
        JOIN grade_subjects gs ON gs.subject_id = s.id
        WHERE gs.grade_id = $1
        ORDER BY s.name
      `;
      params = [gradeId];
    } else {
      query = `SELECT id, name, slug, description, icon_url, is_active FROM subjects ORDER BY name`;
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/admin/subjects
const createSubject = async (req, res, next) => {
  try {
    const { grade_id, name, slug, description, icon_url } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, slug' });
    }

    // Tạo môn học
    const subjectResult = await pool.query(
      `INSERT INTO subjects (name, slug, description, icon_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
      [name, slug, description || null, icon_url || null]
    );
    const subject = subjectResult.rows[0];

    // Nếu có grade_id → liên kết môn với lớp đó
    if (grade_id) {
      await pool.query(
        `INSERT INTO grade_subjects (grade_id, subject_id, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (grade_id, subject_id) DO UPDATE SET is_active = true`,
        [grade_id, subject.id]
      );
    }

    res.status(201).json(subject);
  } catch (err) { next(err); }
};

// PUT /api/admin/subjects/:id
const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon_url, is_active } = req.body;
    const result = await pool.query(
      `UPDATE subjects SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        icon_url = COALESCE($4, icon_url),
        is_active = COALESCE($5, is_active)
       WHERE id = $6 RETURNING *`,
      [name, slug, description, icon_url, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy môn học' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/admin/subjects/:id  (xoá khỏi lớp)
const deleteSubjectFromGrade = async (req, res, next) => {
  try {
    const { gradeSubjectId } = req.params;
    await pool.query(
      `UPDATE grade_subjects SET is_active = false WHERE id = $1`,
      [gradeSubjectId]
    );
    res.json({ message: 'Đã xoá môn học khỏi lớp' });
  } catch (err) { next(err); }
};

module.exports = {
  getUsers, updateUser, deleteUser,
  createChapter, updateChapter, deleteChapter,
  createLesson, updateLesson, deleteLesson,
  createExercise, updateExercise, deleteExercise,
  createSkillModule, updateSkillModule, deleteSkillModule,
  createSkillLesson, updateSkillLesson, deleteSkillLesson,
  getSubjects, createSubject, updateSubject, deleteSubjectFromGrade,
};
