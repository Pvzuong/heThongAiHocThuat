# HeThongAiHocThuat — Nền tảng Giáo dục Trực tuyến (MVP)

Nền tảng học trực tuyến gồm 2 phần:
- **Phổ thông**: Học theo chương trình SGK Lớp 1–5 (Toán)
- **Kỹ năng nghề nghiệp**: Học theo lộ trình Frontend / Backend Developer

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 + Axios |
| Backend | Node.js + Express |
| Database | PostgreSQL (pg pool) |
| Auth | JWT (access 15m / refresh 7d httpOnly cookie) + bcryptjs + OTP Gmail |
| Email | Gmail SMTP (nodemailer) |

---

## Cấu trúc thư mục

```
education-platform/
├── client/               # React frontend (Vite, port 5173)
├── server/               # Express backend (port 5000)
└── database/
    ├── migrations/       # SQL migrations (001 → 007)
    └── seeds/            # SQL seed data
```

---

## Yêu cầu hệ thống

- Node.js >= 18
- PostgreSQL >= 14 (cài trực tiếp, không dùng Docker)
- Git

---

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/Pvzuong/heThongAiHocThuat.git
cd heThongAiHocThuat
```

### 2. Tạo database PostgreSQL

```bash
psql -U postgres -c "CREATE DATABASE education_platform;"
```

### 3. Chạy migrations (theo thứ tự)

```bash
psql -U postgres -d education_platform -f database/migrations/001_create_users.sql
psql -U postgres -d education_platform -f database/migrations/002_create_education_structure.sql
psql -U postgres -d education_platform -f database/migrations/003_create_exercises.sql
psql -U postgres -d education_platform -f database/migrations/004_create_progress.sql
psql -U postgres -d education_platform -f database/migrations/005_create_skill_paths.sql
psql -U postgres -d education_platform -f database/migrations/006_create_otp.sql
```

> Migration 007 chỉ cần chạy nếu DB đã tạo từ trước (thêm cột password_hash, is_verified):
> ```bash
> psql -U postgres -d education_platform -f database/migrations/007_add_user_auth_fields.sql
> ```

### 4. Seed dữ liệu mẫu

```bash
psql -U postgres -d education_platform -f database/seeds/01_users.sql
psql -U postgres -d education_platform -f database/seeds/02_grades_subjects.sql
psql -U postgres -d education_platform -f database/seeds/03_chapters_lessons.sql
psql -U postgres -d education_platform -f database/seeds/04_exercises.sql
psql -U postgres -d education_platform -f database/seeds/05_skill_paths.sql
```

### 5. Cấu hình Backend

```bash
cd server
cp .env.example .env
```

Chỉnh `.env`:

```env
DB_PASSWORD=<mật khẩu postgres của bạn>

JWT_ACCESS_SECRET=<chuỗi random dài>
JWT_REFRESH_SECRET=<chuỗi random dài khác>

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail App Password (16 ký tự)
```

> Tạo Gmail App Password tại: https://myaccount.google.com/apppasswords
> (Cần bật 2-Step Verification trước)

### 6. Cài dependencies & chạy

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
| POST | `/api/auth/login` | Đăng nhập email + password |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/grades` | Danh sách lớp học |
| GET | `/api/paths` | Danh sách lộ trình kỹ năng |
| GET | `/api/search?q=` | Tìm kiếm bài học |
| GET | `/api/progress/overview` | Tiến độ học (cần auth) |

---

## Luồng Auth

**Đăng ký:**
1. `/register` → nhập email + password
2. OTP 6 số gửi đến Gmail
3. `/verify-otp` → nhập OTP → tự động đăng nhập

**Đăng nhập:**
1. `/login` → nhập email + password → vào trang chủ

---

## Lưu ý

- File `server/.env` **không** được commit (có trong `.gitignore`)
- Access token lưu trong **memory** (không dùng localStorage)
- Refresh token lưu trong **httpOnly cookie**
