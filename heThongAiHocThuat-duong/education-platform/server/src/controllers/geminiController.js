const pool = require('../config/db');
const {
  generateQuestions: geminiGenerate,
  generateExam: geminiGenerateExam,
  regenerateSingleQuestion,
} = require('../services/geminiService');

// ─── Admin config ─────────────────────────────────────────────

const ensureConfigTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_config (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

const getGeminiSettings = async (req, res, next) => {
  try {
    await ensureConfigTable();
    const result = await pool.query(
      `SELECT key, value FROM app_config WHERE key IN ('gemini_api_key', 'gemini_model', 'gemini_prompt_template')`
    );
    const settings = {};
    for (const row of result.rows) {
      if (row.key === 'gemini_api_key' && row.value) {
        settings[row.key] = `****${row.value.slice(-4)}`;
      } else {
        settings[row.key] = row.value;
      }
    }
    res.json({
      gemini_api_key: settings.gemini_api_key || null,
      gemini_model: settings.gemini_model || 'gemini-2.5-flash-lite',
      gemini_prompt_template: settings.gemini_prompt_template || '',
    });
  } catch (err) { next(err); }
};

const updateGeminiSettings = async (req, res, next) => {
  try {
    await ensureConfigTable();
    const { gemini_api_key, gemini_model, gemini_prompt_template } = req.body;
    const updates = { gemini_api_key, gemini_model, gemini_prompt_template };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        await pool.query(
          `INSERT INTO app_config (key, value, updated_at) VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [key, value]
        );
      }
    }
    res.json({ message: 'Đã cập nhật cài đặt Gemini' });
  } catch (err) { next(err); }
};

const testGenerate = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Thiếu prompt' });
    res.json({ result: `[Test] Prompt nhận được: "${prompt.slice(0, 100)}..."` });
  } catch (err) { next(err); }
};

// ─── Rate limit ───────────────────────────────────────────────

async function checkRateLimit(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM question_collections
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [userId]
  );
  return parseInt(rows[0].count) >= 20;
}

// ─── Helper: batch insert questions vào 1 query ───────────────

async function batchInsertQuestions(client, collectionId, questions) {
  if (questions.length === 0) return;

  const values = [];
  const params = [];
  let idx = 1;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    values.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
    params.push(
      collectionId,
      q.question_text,
      q.question_type,
      q.options ? JSON.stringify(q.options) : null,
      JSON.stringify({ answer: q.correct_answer }),
      q.explanation || null,
      q.image_svg || null,
      q.section || null,
      q.point_value || 1,
      i
    );
  }

  await client.query(
    `INSERT INTO generated_questions
       (collection_id, question_text, question_type, options, correct_answer,
        explanation, image_svg, section, point_value, sort_order)
     VALUES ${values.join(', ')}`,
    params
  );
}

// ─── Generate Questions ───────────────────────────────────────

const generateQuestions = async (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Tính năng AI chưa sẵn sàng. Liên hệ admin để cấu hình API key.' });
  }
  const {
    numberOfQuestions = 10, grade, topic, difficulty = 'medium',
    questionTypes = ['multiple_choice'], collectionName,
    subject = 'Toán', educationLevel = 'tieu_hoc',
  } = req.body;

  if (!grade) return res.status(400).json({ error: 'Thiếu thông tin lớp học' });
  if (numberOfQuestions < 5 || numberOfQuestions > 30) return res.status(400).json({ error: 'Số câu phải từ 5 đến 30 (free tier limit)' });

  const rateLimited = await checkRateLimit(req.user.id);
  if (rateLimited) return res.status(429).json({ error: 'Bạn đã hết lượt tạo (tối đa 20 lần/giờ). Vui lòng thử lại sau.' });

  // Gọi Gemini trước khi mở transaction (tránh giữ transaction lâu)
  let questions;
  try {
    questions = await geminiGenerate({ numberOfQuestions, grade, topic, difficulty, questionTypes, subject, educationLevel });
  } catch (err) { return next(err); }

  const name = collectionName || `${subject} Lớp ${grade} — ${difficulty === 'easy' ? 'Dễ' : difficulty === 'hard' ? 'Khó' : 'TB'} (${new Date().toLocaleDateString('vi-VN')})`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const colResult = await client.query(
      `INSERT INTO question_collections
         (user_id, collection_name, grade_number, subject, topic, difficulty, question_count, is_test, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8) RETURNING id`,
      [req.user.id, name, grade, subject, topic || null, difficulty, questions.length,
       JSON.stringify({ educationLevel, programType: req.body.programType || 'pho_thong' })]
    );
    const collectionId = colResult.rows[0].id;

    await batchInsertQuestions(client, collectionId, questions);

    const qRows = await client.query(
      `SELECT * FROM generated_questions WHERE collection_id = $1 ORDER BY sort_order`,
      [collectionId]
    );

    await client.query('COMMIT');
    res.json({ success: true, data: { collectionId, collectionName: name, questions: qRows.rows } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── Generate Test ────────────────────────────────────────────

const generateTest = async (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Tính năng AI chưa sẵn sàng. Liên hệ admin để cấu hình API key.' });
  }
  const {
    testName, numberOfQuestions = 10, grade, topic, difficulty = 'medium', durationMinutes,
    subject = 'Toán', educationLevel = 'thcs', programType = 'pho_thong',
    mcCount, fillBlankCount, schoolName,
  } = req.body;

  if (!grade) return res.status(400).json({ error: 'Thiếu thông tin lớp học' });
  if (!testName) return res.status(400).json({ error: 'Cần có tên đề thi' });
  if (numberOfQuestions < 5 || numberOfQuestions > 30) return res.status(400).json({ error: 'Số câu phải từ 5 đến 30 (free tier limit)' });

  const rateLimited = await checkRateLimit(req.user.id);
  if (rateLimited) return res.status(429).json({ error: 'Bạn đã hết lượt tạo (tối đa 20 lần/giờ). Vui lòng thử lại sau.' });

  // Gọi Gemini trước khi mở transaction
  let questions, sections;
  try {
    ({ questions, sections } = await geminiGenerateExam({
      subject, grade, topic, difficulty, educationLevel, programType,
      mcCount: mcCount != null ? parseInt(mcCount) : undefined,
      fillBlankCount: fillBlankCount != null ? parseInt(fillBlankCount) : undefined,
      numberOfQuestions: parseInt(numberOfQuestions),
    }));
  } catch (err) { return next(err); }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const colResult = await client.query(
      `INSERT INTO question_collections
         (user_id, collection_name, grade_number, subject, topic, difficulty,
          question_count, duration_minutes, is_test, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9) RETURNING id`,
      [req.user.id, testName, grade, subject, topic || null, difficulty, questions.length,
       durationMinutes || null,
       JSON.stringify({ testName, sections, educationLevel, programType, schoolName: schoolName || '' })]
    );
    const collectionId = colResult.rows[0].id;

    await batchInsertQuestions(client, collectionId, questions);

    const qRows = await client.query(
      `SELECT * FROM generated_questions WHERE collection_id = $1 ORDER BY sort_order`,
      [collectionId]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      data: { collectionId, testName, questions: qRows.rows, sections, durationMinutes: durationMinutes || null, schoolName: schoolName || '' },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── Collections CRUD ─────────────────────────────────────────

const getMyCollections = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, collection_name, grade_number, subject, topic, question_count, difficulty, is_test, duration_minutes, created_at, metadata
       FROM question_collections WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

const getCollectionDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const colRes = await pool.query(`SELECT * FROM question_collections WHERE id = $1`, [id]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
    const col = colRes.rows[0];
    if (col.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    const qRes = await pool.query(
      `SELECT * FROM generated_questions WHERE collection_id = $1 ORDER BY sort_order`,
      [id]
    );
    res.json({ collection: col, questions: qRes.rows });
  } catch (err) { next(err); }
};

const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const colRes = await pool.query(`SELECT user_id FROM question_collections WHERE id = $1`, [id]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
    if (colRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền xóa' });
    }
    await pool.query(`DELETE FROM question_collections WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── Question CRUD ────────────────────────────────────────────

const updateQuestion = async (req, res, next) => {
  try {
    const { id, qid } = req.params;
    const colRes = await pool.query(`SELECT user_id FROM question_collections WHERE id = $1`, [id]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
    if (colRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền chỉnh sửa' });
    }
    const { question_text, question_type, options, correct_answer, explanation, point_value, section } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (question_text !== undefined) { fields.push(`question_text = $${idx++}`); vals.push(question_text); }
    if (question_type !== undefined) { fields.push(`question_type = $${idx++}`); vals.push(question_type); }
    if (options !== undefined) { fields.push(`options = $${idx++}`); vals.push(options ? JSON.stringify(options) : null); }
    if (correct_answer !== undefined) { fields.push(`correct_answer = $${idx++}`); vals.push(JSON.stringify({ answer: correct_answer })); }
    if (explanation !== undefined) { fields.push(`explanation = $${idx++}`); vals.push(explanation); }
    if (point_value !== undefined) { fields.push(`point_value = $${idx++}`); vals.push(parseFloat(point_value)); }
    if (section !== undefined) { fields.push(`section = $${idx++}`); vals.push(section); }
    if (fields.length === 0) return res.status(400).json({ error: 'Không có trường nào cần cập nhật' });
    vals.push(qid);
    const qRes = await pool.query(
      `UPDATE generated_questions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      vals
    );
    if (qRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    res.json({ success: true, question: qRes.rows[0] });
  } catch (err) { next(err); }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const { id, qid } = req.params;
    const colRes = await pool.query(`SELECT user_id FROM question_collections WHERE id = $1`, [id]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
    if (colRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền xóa' });
    }
    await pool.query(`DELETE FROM generated_questions WHERE id = $1 AND collection_id = $2`, [qid, id]);
    await pool.query(`UPDATE question_collections SET question_count = (SELECT COUNT(*) FROM generated_questions WHERE collection_id = $1) WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

const regenerateQuestion = async (req, res, next) => {
  try {
    const { id, qid } = req.params;
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI chưa sẵn sàng' });
    const colRes = await pool.query(`SELECT * FROM question_collections WHERE id = $1`, [id]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
    const col = colRes.rows[0];
    if (col.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Không có quyền' });

    const qRes = await pool.query(`SELECT * FROM generated_questions WHERE id = $1`, [qid]);
    if (qRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    const oldQ = qRes.rows[0];

    const meta = col.metadata || {};
    const existingTexts = (await pool.query(
      `SELECT question_text FROM generated_questions WHERE collection_id = $1 AND id != $2`,
      [id, qid]
    )).rows.map(r => r.question_text.slice(0, 60));

    const newQ = await regenerateSingleQuestion({
      subject: col.subject || 'Toán',
      grade: col.grade_number,
      topic: col.topic,
      difficulty: col.difficulty,
      educationLevel: meta.educationLevel || 'tieu_hoc',
      questionType: oldQ.question_type,
      existingTexts,
    });

    const updated = await pool.query(
      `UPDATE generated_questions SET question_text=$1, question_type=$2, options=$3, correct_answer=$4, explanation=$5, image_svg=$6
       WHERE id=$7 RETURNING *`,
      [newQ.question_text, newQ.question_type, newQ.options ? JSON.stringify(newQ.options) : null,
       JSON.stringify({ answer: newQ.correct_answer }), newQ.explanation, newQ.image_svg || null, qid]
    );
    res.json({ success: true, question: updated.rows[0] });
  } catch (err) { next(err); }
};

// ─── Clone Collection ─────────────────────────────────────────

const cloneCollection = async (req, res, next) => {
  const { id } = req.params;
  const colRes = await pool.query(`SELECT * FROM question_collections WHERE id = $1`, [id]);
  if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
  const col = colRes.rows[0];
  if (col.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Không có quyền' });

  const qRows = await pool.query(
    `SELECT * FROM generated_questions WHERE collection_id = $1 ORDER BY sort_order`, [id]
  );

  const newName = `[Bản sao] ${col.collection_name}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const newCol = await client.query(
      `INSERT INTO question_collections
         (user_id, collection_name, grade_number, subject, topic, difficulty,
          question_count, duration_minutes, is_test, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [req.user.id, newName, col.grade_number, col.subject, col.topic, col.difficulty,
       col.question_count, col.duration_minutes, col.is_test, col.metadata]
    );
    const newId = newCol.rows[0].id;

    // Batch INSERT thay vì N+1 queries
    if (qRows.rows.length > 0) {
      const values = [];
      const params = [];
      let idx = 1;
      for (const q of qRows.rows) {
        values.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
        params.push(newId, q.question_text, q.question_type, q.options, q.correct_answer,
          q.explanation, q.image_svg, q.section, q.point_value, q.sort_order);
      }
      await client.query(
        `INSERT INTO generated_questions
           (collection_id, question_text, question_type, options, correct_answer,
            explanation, image_svg, section, point_value, sort_order)
         VALUES ${values.join(', ')}`,
        params
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, newCollectionId: newId, collectionName: newName });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── Submit Result ────────────────────────────────────────────

const submitCollectionResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpentSeconds } = req.body;
    const colRes = await pool.query(`SELECT * FROM question_collections WHERE id = $1`, [id]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ câu hỏi' });
    const qRes = await pool.query(`SELECT * FROM generated_questions WHERE collection_id = $1`, [id]);
    const questionsMap = {};
    for (const q of qRes.rows) questionsMap[q.id] = q;
    let correctCount = 0;
    const details = [];
    for (const { questionId, userAnswer } of answers) {
      const q = questionsMap[questionId];
      if (!q) continue;
      const correctAnswer = q.correct_answer?.answer ?? q.correct_answer;
      const isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
      if (isCorrect) correctCount++;
      await pool.query(
        `INSERT INTO generated_question_attempts (user_id, collection_id, question_id, user_answer, is_correct)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, id, questionId, JSON.stringify({ answer: userAnswer }), isCorrect]
      );
      details.push({ questionId, isCorrect, correctAnswer, explanation: q.explanation, questionText: q.question_text, userAnswer });
    }
    const total = answers.length;
    const scorePercent = total > 0 ? parseFloat(((correctCount / total) * 100).toFixed(2)) : 0;
    await pool.query(
      `INSERT INTO generated_session_results (user_id, collection_id, total_questions, correct_count, score_percent, time_spent_seconds)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, id, total, correctCount, scorePercent, timeSpentSeconds || null]
    );
    res.json({ totalQuestions: total, correctCount, scorePercent, details });
  } catch (err) { next(err); }
};

module.exports = {
  getGeminiSettings, updateGeminiSettings, testGenerate,
  generateQuestions, generateTest,
  getMyCollections, getCollectionDetail, deleteCollection,
  updateQuestion, deleteQuestion, regenerateQuestion,
  cloneCollection, submitCollectionResult,
};
