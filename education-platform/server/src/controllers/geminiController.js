// Gemini settings được lưu trong bảng config (dùng DB đơn giản thay vì file)
// MVP: chỉ cần lưu/lấy config và endpoint test generate

const pool = require('../config/db');

// Tạo bảng config nếu chưa có (chạy 1 lần)
const ensureConfigTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_config (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

// GET /api/admin/gemini/settings
const getGeminiSettings = async (req, res, next) => {
  try {
    await ensureConfigTable();

    const result = await pool.query(
      `SELECT key, value FROM app_config WHERE key IN ('gemini_api_key', 'gemini_model', 'gemini_prompt_template')`
    );

    const settings = {};
    for (const row of result.rows) {
      // Ẩn API key, chỉ hiện 4 ký tự cuối
      if (row.key === 'gemini_api_key' && row.value) {
        settings[row.key] = `****${row.value.slice(-4)}`;
      } else {
        settings[row.key] = row.value;
      }
    }

    res.json({
      gemini_api_key: settings.gemini_api_key || null,
      gemini_model: settings.gemini_model || 'gemini-pro',
      gemini_prompt_template: settings.gemini_prompt_template || '',
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/gemini/settings
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
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/gemini/generate  (test generate)
const testGenerate = async (req, res, next) => {
  try {
    await ensureConfigTable();

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Thiếu prompt' });
    }

    const apiKeyRow = await pool.query(
      `SELECT value FROM app_config WHERE key = 'gemini_api_key'`
    );

    if (apiKeyRow.rows.length === 0 || !apiKeyRow.rows[0].value) {
      return res.status(400).json({ error: 'Chưa cấu hình Gemini API key' });
    }

    // MVP placeholder: chưa gọi API thật
    // TODO: Tích hợp @google/generative-ai khi cần
    res.json({
      result: `[Placeholder] Gemini sẽ generate nội dung cho prompt: "${prompt.slice(0, 100)}..."`,
      note: 'Tính năng đang được phát triển',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGeminiSettings, updateGeminiSettings, testGenerate };
