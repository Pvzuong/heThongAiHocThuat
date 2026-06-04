# 📧 OTP Authentication Flow - Chi Tiết & Phân Tích Code

**Tài liệu này giải thích cơ chế xác thực email bằng OTP từ A đến Z**

---

## 🎯 **Mục Tiêu**

Khi user đăng ký LearnHub, hệ thống sẽ:
1. Nhận email + password từ user
2. Tạo **OTP (One-Time Password) 6 chữ số ngẫu nhiên**
3. **Gửi OTP qua Gmail** để xác thực ownership của email
4. User nhập OTP vào form → hệ thống xác minh
5. Nếu đúng → tự động đăng nhập + tạo JWT tokens
6. Redirect vào dashboard theo role

---

## 📊 **FLOW DIAGRAM (High Level)**

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER PERSPECTIVE                           │
└─────────────────────────────────────────────────────────────────┘

   1. REGISTER PAGE (nhập email + password)
         │
         ↓
   2. API: POST /api/auth/register
         │
         ├─→ [Backend] Kiểm tra rate limit (max 3 lần/10 phút)
         ├─→ [Backend] Hash password bằng bcryptjs
         ├─→ [Backend] Tạo user trong DB (is_verified = false)
         ├─→ [Backend] Tạo OTP 6 chữ số
         ├─→ [Backend] Gửi OTP qua Gmail SMTP
         │
         ↓
   3. OTP PAGE (nhập 6 chữ số từ email)
         │
         ↓
   4. API: POST /api/auth/verify-email (gửi OTP)
         │
         ├─→ [Backend] Kiểm tra OTP đúng không?
         ├─→ [Backend] Kiểm tra OTP còn valid không? (5 phút)
         ├─→ [Backend] Cập nhật user: is_verified = true
         ├─→ [Backend] Tạo JWT tokens
         ├─→ [Backend] Set httpOnly cookie (refresh token)
         │
         ↓
   5. REDIRECT
         │
         ├─→ Lưu access_token vào memory (AuthContext)
         ├─→ Tự động đăng nhập (không cần login lại)
         ├─→ Redirect /dashboard (hoặc /admin tùy role)
         │
         ↓
   ✅ HOÀN THÀNH ĐĂNG KÝ
```

---

## 🔐 **DATABASE SCHEMA (OTP Storage)**

```sql
-- Bảng lưu OTP codes
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,              -- User muốn xác thực
  email VARCHAR(255) NOT NULL,        -- Email để gửi OTP
  otp_code VARCHAR(6) NOT NULL,       -- 6 chữ số (ví dụ: 123456)
  expires_at TIMESTAMP NOT NULL,      -- Hết hạn sau 5 phút
  is_used BOOLEAN DEFAULT false,      -- Đã sử dụng chưa?
  created_at TIMESTAMP DEFAULT NOW()  -- Thời điểm tạo
);

-- Bảng kiểm soát spam (Rate Limiting)
CREATE TABLE otp_rate_limits (
  email VARCHAR(255) PRIMARY KEY,
  request_count INT DEFAULT 0,        -- Lần yêu cầu trong cửa sổ
  window_start TIMESTAMP DEFAULT NOW(),  -- Bắt đầu cửa sổ 10 phút
  last_request_at TIMESTAMP DEFAULT NOW()
);
```

**Ví dụ dữ liệu:**

```
otp_codes:
┌────┬──────────────────────────────────┬─────────────────────┬──────────┬──────────────┬────────┐
│ id │ user_id                          │ email               │ otp_code │ expires_at   │ is_used│
├────┼──────────────────────────────────┼─────────────────────┼──────────┼──────────────┼────────┤
│ 1  │ 550e8400-e29b-41d4-a716-446655 │ student@test.com    │ 456789   │ 2026-06-06  │ false  │
│ 2  │ 550e8400-e29b-41d4-a716-446656 │ user@example.com    │ 123456   │ 2026-06-06  │ true   │
└────┴──────────────────────────────────┴─────────────────────┴──────────┴──────────────┴────────┘

otp_rate_limits:
┌─────────────────────┬───────────────┬──────────────────────┐
│ email               │ request_count │ window_start         │
├─────────────────────┼───────────────┼──────────────────────┤
│ student@test.com    │ 2             │ 2026-06-06 10:00 AM  │
│ user@example.com    │ 3             │ 2026-06-06 10:05 AM  │
└─────────────────────┴───────────────┴──────────────────────┘
```

---

## 🔧 **BACKEND CODE DETAIL**

### **Bước 1: Tạo OTP (otpService.js)**

```javascript
// server/src/services/otpService.js
const crypto = require('crypto');

const generateOTP = () => {
  // Tạo số ngẫu nhiên từ 100000 đến 999999 (6 chữ số)
  return String(crypto.randomInt(100000, 999999));
};

const OTP_EXPIRE_MINUTES = 5;  // OTP hết hạn sau 5 phút

module.exports = { generateOTP, OTP_EXPIRE_MINUTES };

// ───────────────────────────────────────────────────
// GIẢI THÍCH:
// ───────────────────────────────────────────────────
// crypto.randomInt(100000, 999999) → tạo số ngẫu nhiên
// String() → chuyển thành text (vì DB lưu VARCHAR)
// OTP_EXPIRE_MINUTES = 5 → OTP có hiệu lực 5 phút
```

**Ví dụ output:**
```javascript
generateOTP() // → "456789"
generateOTP() // → "123456"
generateOTP() // → "987654"
```

---

### **Bước 2: Kiểm soát Spam (Rate Limiting)**

```javascript
// server/src/controllers/authController.js (dòng 23-75)

const checkOTPRateLimit = async (email) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');  // ← Bắt đầu transaction

    // ┌─ LẠM DỤNG FOR UPDATE để lock row
    // │  Tránh race condition: 2 request cùng lúc bypass limit
    // ↓
    const row = await client.query(
      `SELECT request_count, window_start
       FROM otp_rate_limits WHERE email = $1 FOR UPDATE`,
      [email]
    );

    if (row.rows.length > 0) {
      const { request_count, window_start } = row.rows[0];
      const ageMin = (Date.now() - new Date(window_start).getTime()) / 60000;

      // ┌─ Kiểm tra: đã vượt quá 3 lần trong 10 phút?
      // │ request_count >= 3 AND ageMin < 10
      // ↓
      if (ageMin < RATE_WINDOW_MINUTES && request_count >= OTP_RATE_LIMIT) {
        await client.query('ROLLBACK');
        // Trả về số phút cần chờ
        return Math.ceil(RATE_WINDOW_MINUTES - ageMin);
      }

      // ┌─ Nếu cửa sổ 10 phút đã hết, reset counter
      // ↓
      if (ageMin >= RATE_WINDOW_MINUTES) {
        await client.query(
          `UPDATE otp_rate_limits
           SET request_count = 1, window_start = NOW()
           WHERE email = $1`,
          [email]
        );
      } else {
        // ┌─ Còn trong cửa sổ 10 phút → tăng counter
        // ↓
        await client.query(
          `UPDATE otp_rate_limits
           SET request_count = request_count + 1
           WHERE email = $1`,
          [email]
        );
      }
    } else {
      // ┌─ Lần đầu yêu cầu OTP → tạo record mới
      // ↓
      await client.query(
        `INSERT INTO otp_rate_limits (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
        [email]
      );
    }

    await client.query('COMMIT');  // ← Hoàn thành transaction
    return null; // null = không bị rate limit
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ───────────────────────────────────────────────────
// GIẢI THÍCH:
// ───────────────────────────────────────────────────
// FOR UPDATE:
//   - Khoá row trong DB đang xử lý
//   - Ngăn race condition (2 request cùng lúc)
//   - Giống như mutex lock
//
// Transaction (BEGIN/COMMIT/ROLLBACK):
//   - Hoặc cập nhật tất cả, hoặc không gì
//   - Đảm bảo data consistency
//
// Rate Limit Logic:
//   Max 3 yêu cầu per 10 phút
//   Sau 10 phút → reset
```

**Ví dụ timeline:**

```
10:00 AM - Request #1 → OK (count=1, window=10:00)
10:02 AM - Request #2 → OK (count=2, window=10:00)
10:03 AM - Request #3 → OK (count=3, window=10:00)
10:04 AM - Request #4 → ❌ BLOCKED! "Chờ 6 phút"
10:10 AM - Window hết → Request #5 → OK (count=1, window=10:10)
```

---

### **Bước 3: Tạo & Gửi OTP**

```javascript
// server/src/controllers/authController.js (dòng 13-21)

const createAndSendOTP = async (userId, email) => {
  // Step 1: Tạo OTP ngẫu nhiên
  const otp = generateOTP();  // → "456789"

  // Step 2: Tính thời gian hết hạn (now + 5 phút)
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  // Ví dụ: 2026-06-06 10:25 AM (+ 5 phút)

  // Step 3: Lưu OTP vào database
  await pool.query(
    `INSERT INTO otp_codes (user_id, email, otp_code, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, email, otp, expiresAt]
  );

  // Step 4: Gửi OTP qua Gmail
  await sendOTP(email, otp);  // → Email nhận: "Mã OTP: 456789"
};

// ───────────────────────────────────────────────────
// GIẢI THÍCH:
// ───────────────────────────────────────────────────
// generateOTP() → tạo "456789"
// expiresAt = now + 5*60*1000 = 5 phút từ bây giờ
// pool.query INSERT → lưu vào bảng otp_codes
// sendOTP() → gửi email (chi tiết ở phần email)
```

---

### **Bước 4: Xử lý Đăng ký (POST /api/auth/register)**

```javascript
// server/src/controllers/authController.js (dòng 99-150)

const registerHandler = async (req, res, next) => {
  try {
    const { email, password, role = 'student' } = req.body;

    // ┌─ KIỂM TRA: Email đã tồn tại và verified?
    // ↓
    const existing = await pool.query(
      `SELECT id, is_verified FROM users WHERE email = $1`, [email]
    );
    if (existing.rows.length > 0 && existing.rows[0].is_verified) {
      return res.status(409).json({ error: 'Email này đã được đăng ký.' });
    }

    // ┌─ KIỂM TRA: Spam? (max 3 lần OTP per 10 phút)
    // ↓
    const waitMin = await checkOTPRateLimit(email);
    if (waitMin !== null) {
      return res.status(429).json({
        error: `Chờ ${waitMin} phút rồi thử lại.`,
      });
    }

    // ┌─ HASH password bằng bcrypt
    // │ Cấp độ salt: 10 (an toàn, mất ~100ms per hash)
    // ↓
    const passwordHash = await bcrypt.hash(password, 10);

    let userId;
    if (existing.rows.length > 0) {
      // Trường hợp: User cũ, lần này đăng ký lại (lần đầu chưa verify)
      userId = existing.rows[0].id;
      await pool.query(
        `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [passwordHash, userId]
      );
    } else {
      // Trường hợp: User mới → tạo record
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, false) RETURNING id`,
        [email, passwordHash, 'student']
      );
      userId = result.rows[0].id;
    }

    // ┌─ TẠO & GỬI OTP
    // ↓
    await createAndSendOTP(userId, email);

    // ┌─ RESPONSE về Client
    // │ Status 201 = Created (resource mới được tạo)
    // ↓
    res.status(201).json({
      message: 'Mã xác nhận đã được gửi đến email của bạn',
      email,
    });
  } catch (err) {
    next(err);
  }
};
```

---

### **Bước 5: Xác minh OTP (POST /api/auth/verify-email)**

```javascript
// server/src/controllers/authController.js

const verifyEmailHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // ┌─ TÌM OTP trong DB
    // ↓
    const result = await pool.query(
      `SELECT id, user_id, otp_code, expires_at, is_used
       FROM otp_codes WHERE email = $1 AND is_used = false
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'OTP không hợp lệ.' });
    }

    const otpRecord = result.rows[0];

    // ┌─ KIỂM TRA: OTP còn valid không?
    // │ (chưa hết 5 phút?)
    // ↓
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ error: 'OTP đã hết hạn.' });
    }

    // ┌─ KIỂM TRA: OTP nhập vào có đúng không?
    // │ So sánh: user input vs OTP stored in DB
    // ↓
    if (String(otp) !== otpRecord.otp_code) {
      return res.status(400).json({ error: 'OTP không chính xác.' });
    }

    // ┌─ TẤT CẢ CHECKS PASS → CẬP NHẬT DB
    // ↓
    // 1. Đánh dấu user: is_verified = true
    const userResult = await pool.query(
      `UPDATE users SET is_verified = true WHERE id = $1 RETURNING *`,
      [otpRecord.user_id]
    );

    // 2. Đánh dấu OTP đã sử dụng
    await pool.query(
      `UPDATE otp_codes SET is_used = true WHERE id = $1`,
      [otpRecord.id]
    );

    // ┌─ ISSUE TOKENS
    // │ Access token (15 phút) + Refresh token (7 ngày)
    // ↓
    const user = userResult.rows[0];
    const accessToken = await issueTokens(res, user);

    // ┌─ RESPONSE: trả token về client
    // ↓
    res.json({
      message: 'Xác thực thành công!',
      user: { id: user.id, email: user.email, role: user.role },
      access_token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};
```

---

### **Bước 6: Tạo Tokens & Set Cookie**

```javascript
// server/src/controllers/authController.js (dòng 77-94)

const issueTokens = async (res, user) => {
  // Step 1: Tạo payload
  const payload = { id: user.id, role: user.role };

  // Step 2: Ký tokens
  const accessToken = generateAccessToken(payload);    // 15 phút
  const refreshToken = generateRefreshToken(payload);  // 7 ngày

  // Step 3: Lưu refresh token vào database
  const refreshExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshToken, refreshExpire]
  );

  // Step 4: Set refresh token vào httpOnly cookie
  // ┌─ httpOnly: không thể access từ JavaScript (bảo vệ XSS)
  // │ secure: chỉ gửi qua HTTPS (bảo vệ MITM)
  // │ sameSite: strict → ngăn CSRF
  // ↓
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,                           // Không access từ JS
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    sameSite: 'strict',                       // Ngăn CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,         // 7 ngày
  });

  return accessToken;  // Trả về access token
};

// ───────────────────────────────────────────────────
// GIẢI THÍCH TOKEN:
// ───────────────────────────────────────────────────
//
// ACCESS TOKEN (15 phút)
//   - Lưu: Memory (không localStorage)
//   - Gửi: Authorization header
//   - Dùng: Call API
//   - Hết hạn: Thay thế bằng refresh token
//
// REFRESH TOKEN (7 ngày)
//   - Lưu: HttpOnly Cookie (bảo vệ XSS)
//   - Gửi: Tự động với request
//   - Dùng: Lấy access token mới
//   - Hết hạn: User phải đăng nhập lại
```

---

## 🎨 **FRONTEND CODE DETAIL**

### **Bước 1: RegisterPage (Nhập Email & Password)**

```javascript
// client/src/pages/Auth/RegisterPage.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // ┌─ VALIDATE: Mật khẩu khớp?
  // ↓
  if (password !== confirm) {
    return setError('Mật khẩu xác nhận không khớp');
  }

  // ┌─ VALIDATE: Mật khẩu đủ dài?
  // ↓
  if (password.length < 6) {
    return setError('Mật khẩu phải có ít nhất 6 ký tự');
  }

  setLoading(true);
  try {
    // ┌─ CALL API: POST /api/auth/register
    // ↓
    await registerApi(email, password, 'student');

    // ┌─ SUCCESS: Chuyển sang trang OTP
    // │ Truyền email để OTP page biết xác thực cho ai
    // ↓
    navigate('/verify-otp', { 
      state: { email, mode: 'register' }
    });
  } catch (err) {
    // ┌─ ERROR: Hiển thị lỗi (rate limit, email exists, etc)
    // ↓
    setError(err.response?.data?.error || 'Có lỗi xảy ra.');
  } finally {
    setLoading(false);
  }
};

// ───────────────────────────────────────────────────
// FLOW:
// ───────────────────────────────────────────────────
// User nhập email + password
//   ↓
// Click "Đăng ký"
//   ↓
// Validate (password match, length)
//   ↓
// registerApi(email, password, 'student')
//   ↓ (HTTP POST → backend)
//   ↓
// Backend: tạo user + OTP + gửi email
//   ↓
// Frontend: navigate('/verify-otp', { state: { email } })
//   ↓
// OTP Page hiển thị
```

---

### **Bước 2: OTPPage (Nhập 6 Chữ Số OTP)**

```javascript
// client/src/pages/Auth/OTPPage.jsx

const handleSubmitOTP = async () => {
  if (!otp || otp.length !== 6) {
    setError('Mã OTP phải là 6 chữ số');
    return;
  }

  setLoading(true);
  try {
    // ┌─ CALL API: POST /api/auth/verify-email
    // │ Gửi email + OTP user nhập
    // ↓
    const res = await verifyEmail(email, otp);

    // ┌─ SUCCESS: Nhận access token
    // │ Lưu vào AuthContext
    // ↓
    login(res.data.access_token, res.data.user);

    // ┌─ REDIRECT: Tự động đăng nhập
    // ↓
    navigate('/dashboard');
  } catch (err) {
    // ┌─ ERROR: OTP sai, hết hạn, etc
    // ↓
    setError(err.response?.data?.error || 'Có lỗi xảy ra.');
  } finally {
    setLoading(false);
  }
};

// ───────────────────────────────────────────────────
// FLOW:
// ───────────────────────────────────────────────────
// User mở email → copy OTP "456789"
//   ↓
// Nhập vào form OTP
//   ↓
// Click "Xác nhận"
//   ↓
// verifyEmail(email, otp)
//   ↓ (HTTP POST → backend)
//   ↓
// Backend: check OTP
//   ↓ (match + expires + not used)
//   ↓
// Update: is_verified = true
// Create: access_token + refresh_token
//   ↓
// Frontend: login(token, user)
//   ↓ (lưu token vào AuthContext)
//   ↓
// navigate('/dashboard')
```

---

## 📧 **EMAIL SERVICE (Gửi OTP)**

```javascript
// server/src/services/emailService.js

const nodemailer = require('nodemailer');

// ┌─ CẤU HÌNH SMTP (Gmail)
// ↓
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,           // your-email@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD,   // 16-char app password
  },
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Mã xác nhận OTP - LearnHub',
    html: `
      <h2>Xác thực email của bạn</h2>
      <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
      <p>Mã này có hiệu lực trong 5 phút.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua.</p>
    `,
  });
};

module.exports = { sendOTP };

// ───────────────────────────────────────────────────
// GIẢI THÍCH:
// ───────────────────────────────────────────────────
// nodemailer.createTransport() → tạo SMTP connection
//   service: 'gmail' → dùng Gmail
//   user: Gmail address
//   pass: App password (không phải password account)
//
// transporter.sendMail() → gửi email
//   from: Ai gửi
//   to: Ai nhận
//   subject: Tiêu đề
//   html: Nội dung (có thể HTML)
```

---

## 🔄 **SEQUENCE DIAGRAM (Chi Tiết)**

```
┌─────────┐           ┌──────────┐           ┌──────────┐           ┌────────┐
│  Client │           │ Backend  │           │  Gmail   │           │   DB   │
└────┬────┘           └────┬─────┘           └────┬─────┘           └────┬───┘
     │                     │                      │                      │
     │ 1. POST /register   │                      │                      │
     ├────────────────────→│                      │                      │
     │  (email, password)  │                      │                      │
     │                     │ 2. Hash password     │                      │
     │                     │ 3. Check rate limit  │                      │
     │                     │ 4. Create user       │                      │
     │                     ├─────────────────────────────────────────────→│
     │                     │   INSERT INTO users  │                      │
     │                     │←─────────────────────────────────────────────┤
     │                     │                      │                      │
     │                     │ 5. Generate OTP      │                      │
     │                     │ 6. Save OTP to DB    │                      │
     │                     ├─────────────────────────────────────────────→│
     │                     │   INSERT INTO otp_codes                      │
     │                     │←─────────────────────────────────────────────┤
     │                     │                      │                      │
     │                     │ 7. Send OTP via email│                      │
     │                     ├─────────────────────→│                      │
     │                     │    nodemailer        │                      │
     │                     │←─────────────────────┤                      │
     │                     │                      │ 8. Email received    │
     │                     │                      │    (user inbox)      │
     │←────────────────────┤                      │                      │
     │ 201 Created         │                      │                      │
     │ (Redirect OTP page) │                      │                      │
     │                     │                      │                      │
     │ [User enters OTP]   │                      │                      │
     │                     │                      │                      │
     │ 9. POST /verify-email│                     │                      │
     ├────────────────────→│                      │                      │
     │   (email, otp)      │                      │                      │
     │                     │ 10. Find OTP in DB   │                      │
     │                     ├─────────────────────────────────────────────→│
     │                     │    SELECT * FROM otp_codes                   │
     │                     │←─────────────────────────────────────────────┤
     │                     │                      │                      │
     │                     │ 11. Validate OTP     │                      │
     │                     │  - Check expires_at  │                      │
     │                     │  - Check is_used     │                      │
     │                     │  - Compare code      │                      │
     │                     │                      │                      │
     │                     │ 12. Update user      │                      │
     │                     ├─────────────────────────────────────────────→│
     │                     │  UPDATE is_verified=true                     │
     │                     │←─────────────────────────────────────────────┤
     │                     │                      │                      │
     │                     │ 13. Generate tokens  │                      │
     │                     │  - Access (15 min)   │                      │
     │                     │  - Refresh (7 days)  │                      │
     │                     │                      │                      │
     │                     │ 14. Save refresh token                       │
     │                     ├─────────────────────────────────────────────→│
     │                     │  INSERT INTO refresh_tokens                  │
     │                     │←─────────────────────────────────────────────┤
     │←────────────────────┤                      │                      │
     │ 200 OK              │                      │                      │
     │ {access_token,      │                      │                      │
     │  user}              │                      │                      │
     │                     │                      │                      │
     │ 15. Save token      │                      │                      │
     │ (AuthContext)       │                      │                      │
     │                     │                      │                      │
     │ 16. Redirect        │                      │                      │
     │ /dashboard          │                      │                      │
     │                     │                      │                      │
     ✅ Login hoàn thành   │                      │                      │
```

---

## 🛡️ **SECURITY MECHANISMS**

### 1️⃣ **Rate Limiting (Chống Spam)**

```javascript
// Max 3 yêu cầu OTP per 10 phút per email

Timeline:
10:00 → Request #1 ✅ (count=1)
10:02 → Request #2 ✅ (count=2)
10:03 → Request #3 ✅ (count=3)
10:04 → Request #4 ❌ (blocked, wait 6 min)
10:10 → Request #5 ✅ (window reset)
```

### 2️⃣ **OTP Expiry (5 phút)**

```javascript
// OTP hết hạn sau 5 phút
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

// Backend kiểm tra:
if (new Date() > expiresAt) {
  return "OTP đã hết hạn";
}
```

### 3️⃣ **Password Hashing (bcryptjs)**

```javascript
// Bcrypt with 10 rounds (OWASP recommendation)
const passwordHash = await bcrypt.hash(password, 10);

// Không thể reverse hash → đảm bảo an toàn
```

### 4️⃣ **Transaction (Race Condition Prevention)**

```javascript
// BEGIN TRANSACTION
await client.query('BEGIN');
// ...
await client.query('COMMIT');  // Hoặc ROLLBACK

// Đảm bảo: hoặc tất cả update, hoặc không gì
```

### 5️⃣ **HttpOnly Cookies (Token Protection)**

```javascript
res.cookie('refresh_token', token, {
  httpOnly: true,  // ← JavaScript không thể access
  secure: true,    // ← HTTPS only
  sameSite: 'strict',  // ← Ngăn CSRF
});
```

---

## 🚨 **ERROR CASES & RESPONSES**

| Lỗi | HTTP Status | Message | Nguyên nhân |
|-----|-----------|---------|-----------|
| Email đã verify | 409 | "Email này đã được đăng ký" | User cố đăng ký lại email verify rồi |
| Rate limit OTP | 429 | "Chờ X phút rồi thử lại" | > 3 lần OTP trong 10 phút |
| OTP không hợp lệ | 400 | "OTP không hợp lệ" | OTP không tồn tại hoặc đã sử dụng |
| OTP hết hạn | 400 | "OTP đã hết hạn" | Quá 5 phút kể từ lúc tạo |
| OTP sai | 400 | "OTP không chính xác" | User nhập SAI chữ số |
| Mật khẩu yếu | 400 | "Mật khẩu phải ≥ 6 ký tự" | Mật khẩu < 6 ký tự |

---

## 📋 **SUMMARY: Mọi Bước**

| Bước | Component | Action | Result |
|------|-----------|--------|--------|
| 1 | RegisterPage | User nhập email + password | State: email, password |
| 2 | registerApi | POST /register | Backend nhận |
| 3 | authController | Kiểm tra rate limit | OK/Rate limit |
| 4 | authController | Hash password bcrypt | Mã hóa password |
| 5 | authController | Tạo/update user | User.is_verified = false |
| 6 | otpService | Tạo OTP 6 chữ số | "456789" |
| 7 | otpService | Tính expires_at (+5 min) | 2026-06-06 10:25 AM |
| 8 | DB | INSERT otp_codes | OTP saved |
| 9 | emailService | Gửi email Gmail | User nhận email |
| 10 | Frontend | Redirect OTPPage | Hiển thị form OTP |
| 11 | OTPPage | User nhập OTP | Form ready |
| 12 | verifyEmail | POST /verify-email | Backend nhận |
| 13 | authController | Tìm OTP trong DB | Kiểm tra |
| 14 | authController | Validate: expires? correct? | OK/Lỗi |
| 15 | authController | UPDATE user.is_verified=true | DB updated |
| 16 | authController | Tạo JWT tokens | access + refresh |
| 17 | authController | Set refresh cookie | httpOnly cookie |
| 18 | Frontend | login(token, user) | AuthContext updated |
| 19 | Frontend | navigate('/dashboard') | Tự động đăng nhập |
| 20 | Dashboard | Hiển thị user info | ✅ Login hoàn thành |

---

## 🎓 **KEY TAKEAWAYS**

1. **OTP là "temporary password"** - hợp lệ 5 phút, 1 lần sử dụng
2. **Rate limiting chống spam** - max 3 yêu cầu/10 phút
3. **bcryptjs mã hóa password** - không thể reverse
4. **Tokens 2 tier** - access (ngắn) + refresh (dài)
5. **httpOnly cookies bảo vệ XSS** - JavaScript không thể access
6. **Transactions tránh race condition** - dùng FOR UPDATE lock
7. **Email SMTP gửi OTP** - Gmail app password (không password account)

---

**🎯 Đây là hệ thống OTP authentication CHUẨN OWASP.**

Bạn có muốn tôi giải thích thêm phần nào không? 👀
