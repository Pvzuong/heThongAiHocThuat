const pool = require('../config/db');

// GET /api/paths
const getPaths = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        sp.id, sp.title, sp.slug, sp.description,
        sp.estimated_hours, sp.difficulty, sp.sort_order,
        COUNT(sm.id) AS module_count
      FROM skill_paths sp
      LEFT JOIN skill_modules sm ON sm.path_id = sp.id AND sm.is_active = true
      WHERE sp.is_active = true
      GROUP BY sp.id
      ORDER BY sp.sort_order
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/paths/:pathSlug
const getPathBySlug = async (req, res, next) => {
  try {
    const { pathSlug } = req.params;

    const pathResult = await pool.query(`
      SELECT id, title, slug, description, estimated_hours, difficulty
      FROM skill_paths
      WHERE slug = $1 AND is_active = true
    `, [pathSlug]);

    if (pathResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lộ trình' });
    }

    const path = pathResult.rows[0];

    const modulesResult = await pool.query(`
      SELECT
        sm.id, sm.title, sm.slug, sm.description,
        sm.sort_order, sm.estimated_hours,
        COUNT(sl.id) AS lesson_count
      FROM skill_modules sm
      LEFT JOIN skill_lessons sl ON sl.module_id = sm.id AND sl.is_active = true
      WHERE sm.path_id = $1 AND sm.is_active = true
      GROUP BY sm.id
      ORDER BY sm.sort_order
    `, [path.id]);

    res.json({ ...path, modules: modulesResult.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/paths/modules/:moduleId
const getModuleById = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const moduleResult = await pool.query(`
      SELECT sm.id, sm.title, sm.slug, sm.description, sm.estimated_hours,
             sp.id AS path_id, sp.title AS path_title, sp.slug AS path_slug
      FROM skill_modules sm
      JOIN skill_paths sp ON sp.id = sm.path_id
      WHERE sm.id = $1 AND sm.is_active = true
    `, [moduleId]);

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy module' });
    }

    const mod = moduleResult.rows[0];

    const lessonsResult = await pool.query(`
      SELECT id, title, slug, sort_order,
             (content_html IS NOT NULL) AS has_content
      FROM skill_lessons
      WHERE module_id = $1 AND is_active = true
      ORDER BY sort_order
    `, [moduleId]);

    res.json({
      id: mod.id,
      title: mod.title,
      slug: mod.slug,
      description: mod.description,
      estimated_hours: mod.estimated_hours,
      path: { id: mod.path_id, title: mod.path_title, slug: mod.path_slug },
      lessons: lessonsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/paths/lessons/:lessonId
const getSkillLessonById = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const result = await pool.query(`
      SELECT sl.id, sl.title, sl.slug, sl.content_html,
             sm.id AS module_id, sm.title AS module_title, sm.slug AS module_slug,
             sp.id AS path_id, sp.title AS path_title, sp.slug AS path_slug
      FROM skill_lessons sl
      JOIN skill_modules sm ON sm.id = sl.module_id
      JOIN skill_paths sp ON sp.id = sm.path_id
      WHERE sl.id = $1 AND sl.is_active = true
    `, [lessonId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    }

    const lesson = result.rows[0];

    res.json({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      content_html: lesson.content_html,
      placeholder: lesson.content_html === null,
      message: lesson.content_html === null ? 'Nội dung đang được xây dựng. Quay lại sau nhé!' : null,
      module: { id: lesson.module_id, title: lesson.module_title, slug: lesson.module_slug },
      path: { id: lesson.path_id, title: lesson.path_title, slug: lesson.path_slug },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/paths/:pathSlug/placement-test
const getPlacementTest = async (req, res, next) => {
  try {
    const { pathSlug } = req.params;

    const testResult = await pool.query(`
      SELECT pt.id, pt.title, pt.description
      FROM placement_tests pt
      JOIN skill_paths sp ON sp.id = pt.path_id
      WHERE sp.slug = $1 AND pt.is_active = true
      LIMIT 1
    `, [pathSlug]);

    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
    }

    const test = testResult.rows[0];

    const questionsResult = await pool.query(`
      SELECT pq.id, pq.question_text, pq.options, pq.sort_order,
             sm.title AS module_title
      FROM placement_questions pq
      LEFT JOIN skill_modules sm ON sm.id = pq.module_id
      WHERE pq.test_id = $1
      ORDER BY pq.sort_order
    `, [test.id]);

    res.json({
      test_id: test.id,
      title: test.title,
      description: test.description,
      questions: questionsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/paths/placement-test/:testId/submit
const submitPlacementTest = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Thiếu câu trả lời' });
    }

    // Lấy tất cả câu hỏi + đáp án đúng
    const questionsResult = await pool.query(`
      SELECT pq.id, pq.correct_answer, sm.title AS module_title, pq.module_id
      FROM placement_questions pq
      LEFT JOIN skill_modules sm ON sm.id = pq.module_id
      WHERE pq.test_id = $1
    `, [testId]);

    const questions = questionsResult.rows;

    // Tính điểm theo module
    const moduleScores = {};
    const moduleTotals = {};

    for (const q of questions) {
      const key = q.module_title || 'Khác';
      moduleTotals[key] = (moduleTotals[key] || 0) + 1;

      const userAnswer = answers.find(a => a.question_id === q.id);
      if (userAnswer && userAnswer.answer === q.correct_answer?.answer) {
        moduleScores[key] = (moduleScores[key] || 0) + 1;
      }
    }

    // Tính phần trăm từng module
    const score = {};
    let recommendedModule = null;
    let lowestScore = 101;

    for (const [module, total] of Object.entries(moduleTotals)) {
      const correct = moduleScores[module] || 0;
      const percent = Math.round((correct / total) * 100);
      score[module] = percent;

      // Gợi ý module bắt đầu = module có điểm thấp nhất
      if (percent < lowestScore) {
        lowestScore = percent;
        recommendedModule = module;
      }
    }

    // Lưu kết quả
    await pool.query(`
      INSERT INTO placement_results (user_id, test_id, score)
      VALUES ($1, $2, $3)
    `, [userId, testId, JSON.stringify(score)]);

    res.json({
      score,
      recommended_start: recommendedModule,
      message: `Bạn nên bắt đầu từ: ${recommendedModule}`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPaths,
  getPathBySlug,
  getModuleById,
  getSkillLessonById,
  getPlacementTest,
  submitPlacementTest,
};
