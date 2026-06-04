const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { generateOTP, OTP_EXPIRE_MINUTES } = require('../services/otpService');
const { sendOTP } = require('../services/emailService');

const OTP_RATE_LIMIT = 3;
const RATE_WINDOW_MINUTES = 10;
const BCRYPT_ROUNDS = 10;

// ─── Helper: tạo và gửi OTP ─────────────────────────────────
const createAndSendOTP = async (userId, email) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  await pool.query(
    `INSERT INTO otp_codes (user_id, email, otp_code, expires_at) VALUES ($1, $2, $3, $4)`,
    [userId, email, otp, expiresAt]
  );
  await sendOTP(email, otp);
};

// ─── Helper: kiểm tra rate limit OTP (atomic, tránh race condition) ──
const checkOTPRateLimit = async (email) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Dùng FOR UPDATE để lock row, tránh race condition
    const row = await client.query(
      `SELECT request_count, window_start
       FROM otp_rate_limits WHERE email = $1 FOR UPDATE`,
      [email]
    );

    if (row.rows.length > 0) {
      const { request_count, window_start } = row.rows[0];
      const ageMin = (Date.now() - new Date(window_start).getTime()) / 60000;

      if (ageMin < RATE_WINDOW_MINUTES && request_count >= OTP_RATE_LIMIT) {
        await client.query('ROLLBACK');
        return Math.ceil(RATE_WINDOW_MINUTES - ageMin);
      }

      if (ageMin >= RATE_WINDOW_MINUTES) {
        await client.query(
          `UPDATE otp_rate_limits
           SET request_count = 1, window_start = NOW(), last_request_at = NOW()
           WHERE email = $1`,
          [email]
        );
      } else {
        await client.query(
          `UPDATE otp_rate_limits
           SET request_count = request_count + 1, last_request_at = NOW()
           WHERE email = $1`,
          [email]
        );
      }
    } else {
      await client.query(
        `INSERT INTO otp_rate_limits (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
        [email]
      );
    }

    await client.query('COMMIT');
    return null; // null = không bị rate limit
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─── Helper: issue tokens + set cookie ──────────────────────
const issueTokens = async (res, user) => {
  const payload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const refreshExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [user.id, refreshToken, refreshExpire]
  );
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return accessToken;
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
const registerHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password, role = 'student' } = req.body;

    // Kiểm tra email đã tồn tại và đã verified
    const existing = await pool.query(
      `SELECT id, is_verified FROM users WHERE email = $1`, [email]
    );
    if (existing.rows.length > 0 && existing.rows[0].is_verified) {
      return res.status(409).json({ error: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });
    }

    // Rate limit OTP
    const waitMin = await checkOTPRateLimit(email);
    if (waitMin !== null) {
      return res.status(429).json({
        error: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${waitMin} phút.`,
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const safeRole = 'student'; // chỉ còn student role

    let userId;
    if (existing.rows.length > 0) {
      // User chưa verify → cập nhật mật khẩu mới + gửi OTP lại
      userId = existing.rows[0].id;
      await pool.query(
        `UPDATE users SET password_hash = $1, role = $2, updated_at = NOW() WHERE id = $3`,
        [passwordHash, safeRole, userId]
      );
    } else {
      // Tạo user mới (is_verified = false)
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_verified) VALUES ($1, $2, $3, false) RETURNING id`,
        [email, passwordHash, safeRole]
      );
      userId = result.rows[0].id;
    }

    await createAndSendOTP(userId, email);

    res.status(201).json({
      message: 'Mã xác nhận đã được gửi đến email của bạn',
      email,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ────────────────────────────────────────────────────────────
const verifyEmailHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, otp } = req.body;

    const otpRecord = await pool.query(
      `SELECT id, user_id FROM otp_codes
       WHERE email = $1 AND otp_code = $2 AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );
    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ error: 'Mã OTP không đúng hoặc đã hết hạn' });
    }

    const { id: otpId, user_id: userId } = otpRecord.rows[0];

    // Đánh dấu OTP đã dùng + kích hoạt tài khoản
    await pool.query(`UPDATE otp_codes SET is_used = true WHERE id = $1`, [otpId]);
    await pool.query(
      `UPDATE users SET is_verified = true, is_active = true, updated_at = NOW() WHERE id = $1`,
      [userId]
    );

    const userResult = await pool.query(
      `SELECT id, email, role, display_name, avatar_url FROM users WHERE id = $1`, [userId]
    );
    const user = userResult.rows[0];
    const accessToken = await issueTokens(res, user);

    res.json({
      access_token: accessToken,
      user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name, avatar_url: user.avatar_url },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ────────────────────────────────────────────────────────────
const resendOTPHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email } = req.body;

    const userResult = await pool.query(
      `SELECT id, is_verified FROM users WHERE email = $1`, [email]
    );
    if (userResult.rows.length === 0 || userResult.rows[0].is_verified) {
      return res.status(400).json({ error: 'Yêu cầu không hợp lệ' });
    }

    const waitMin = await checkOTPRateLimit(email);
    if (waitMin !== null) {
      return res.status(429).json({
        error: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${waitMin} phút.`,
      });
    }

    await createAndSendOTP(userResult.rows[0].id, email);
    res.json({ message: 'Mã OTP mới đã được gửi' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────
const loginHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const userResult = await pool.query(
      `SELECT id, email, role, display_name, avatar_url, password_hash, is_verified, is_active FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Tài khoản đã bị khoá. Vui lòng liên hệ hỗ trợ.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: 'Tài khoản chưa được xác nhận. Vui lòng kiểm tra email.',
        needVerify: true,
        email,
      });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const accessToken = await issueTokens(res, user);

    res.json({
      access_token: accessToken,
      user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name, avatar_url: user.avatar_url },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ────────────────────────────────────────────────────────────
const refreshTokenHandler = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ error: 'Không có refresh token' });

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: 'Refresh token không hợp lệ' });
    }

    const tokenRecord = await pool.query(
      `SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`, [token]
    );
    if (tokenRecord.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token đã hết hạn hoặc bị thu hồi' });
    }

    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
    res.json({ access_token: accessToken });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────
const logoutHandler = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
    if (token) await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
    res.clearCookie('refresh_token');
    res.json({ message: 'Đã đăng xuất thành công' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────
const getMeHandler = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      `SELECT id, email, role, display_name, avatar_url, created_at FROM users WHERE id = $1`, [req.user.id]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(userResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerHandler,
  verifyEmailHandler,
  resendOTPHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler,
  getMeHandler,
};
