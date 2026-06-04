# LearnHub — Nền tảng Giáo dục Trực tuyến

Nền tảng học trực tuyến gồm 2 phân hệ + tính năng AI:
- **Phổ thông**: Học theo chương trình SGK Lớp 1–5 (Toán)
- **Kỹ năng nghề nghiệp**: Học theo lộ trình Frontend / Backend Developer
- **AI Luyện tập**: Tạo bộ câu hỏi / đề thi bằng Gemini API theo lớp, chủ đề, độ khó

Giao diện: sidebar dọc (Duolingo-style) + topbar tìm kiếm/auth + banner slider có thể kéo thả trên trang chủ.

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 + Axios |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL (pg pool) |
| Auth | JWT (access 15m / refresh 7d httpOnly cookie) + bcryptjs + OTP Gmail |
| Email | Gmail SMTP (nodemailer) |
| AI | Google Gemini API (`@google/generative-ai`) |

---

## Cấu trúc thư mục

```
education-platform/
├── client/               # React frontend (Vite, port 5173)
├── server/               # Express backend (port 5000)
└── database/
    ├── migrations/       # SQL migrations (001 → 009)
    └── seeds/            # SQL seed data (01 → 05)
```

---

## Yêu cầu hệ thống

- Node.js >= 18
- PostgreSQL >= 14
- Git

---

## Cài đặt & Khởi chạy

### 1. Tạo database

```bash
psql -U postgres -c "CREATE DATABASE education_platform;"
```

### 2. Chạy migrations (theo thứ tự)

```bash
psql -U postgres -d education_platform -f database/migrations/001_create_users.sql
psql -U postgres -d education_platform -f database/migrations/002_create_education_structure.sql
psql -U postgres -d education_platform -f database/migrations/003_create_exercises.sql
psql -U postgres -d education_platform -f database/migrations/004_create_progress.sql
psql -U postgres -d education_platform -f database/migrations/005_create_skill_paths.sql
psql -U postgres -d education_platform -f database/migrations/006_create_otp.sql
psql -U postgres -d education_platform -f database/migrations/007_add_user_auth_fields.sql
psql -U postgres -d education_platform -f database/migrations/008_create_practice_sessions.sql
psql -U postgres -d education_platform -f database/migrations/009_create_gemini_generated.sql
```

### 3. Seed dữ liệu mẫu

```bash
psql -U postgres -d education_platform -f database/seeds/01_users.sql
psql -U postgres -d education_platform -f database/seeds/02_grades_subjects.sql
psql -U postgres -d education_platform -f database/seeds/03_chapters_lessons.sql
psql -U postgres -d education_platform -f database/seeds/04_exercises.sql
psql -U postgres -d education_platform -f database/seeds/05_skill_paths.sql
```

### 4. Cấu hình Backend

```bash
cd server
cp .env.example .env
```

Chỉnh `server/.env`:

```env
DB_PASSWORD=<mật khẩu postgres của bạn>
JWT_ACCESS_SECRET=<chuỗi random dài>
JWT_REFRESH_SECRET=<chuỗi random dài khác>
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GEMINI_API_KEY=<Google AI Studio API key>
GEMINI_MODEL=gemini-1.5-flash
```

### 5. Cài dependencies & chạy

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev        # http://localhost:5000

# Terminal 2 — Frontend
cd client
npm install
npm run dev        # http://localhost:5173
```

---

## Tài khoản test

| Email | Mật khẩu | Role |
|-------|----------|------|
| student@test.com | password123 | student |
| admin@test.com | admin123 | admin |

---

## API chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký (gửi OTP Gmail) |
| POST | `/api/auth/verify-email` | Xác nhận OTP |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/grades` | Danh sách lớp học |
| GET | `/api/paths` | Danh sách lộ trình kỹ năng |
| GET | `/api/search?q=` | Tìm kiếm bài học |
| GET | `/api/progress/overview` | Tiến độ học (cần auth) |
| POST | `/api/gemini/generate-questions` | Tạo bộ câu hỏi AI (cần auth) |
| POST | `/api/gemini/generate-test` | Tạo đề thi AI (cần auth) |
| GET | `/api/gemini/collections` | Lịch sử bộ câu hỏi của user (cần auth) |
| POST | `/api/gemini/collections/:id/submit` | Nộp bài + chấm điểm (cần auth) |

---

## Luồng Auth

**Đăng ký:** `/register` → OTP 6 số gửi Gmail → `/verify-otp` → tự động đăng nhập

**Đăng nhập:** `/login` → email + password → vào trang chủ

---

## Lưu ý

- `server/.env` không được commit (có trong `.gitignore`)
- Access token lưu trong **memory** (không dùng localStorage)
- Refresh token lưu trong **httpOnly cookie**
- Xem nhật ký thay đổi tại [CLAUDE.md](./CLAUDE.md)
