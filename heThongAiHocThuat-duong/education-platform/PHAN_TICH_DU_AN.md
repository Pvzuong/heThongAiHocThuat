# BÁO CÁO PHÂN TÍCH DỰ ÁN — LearnHub

**Ngày đánh giá:** 01/06/2026  
**Người đánh giá:** Senior Developer Review  
**Phiên bản:** 2.0 (sau tái định hướng)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Tên & Mục tiêu

**Tên:** LearnHub — Nền tảng học tập AI  
**Mục tiêu:** Xây dựng hệ thống giáo dục trực tuyến tích hợp AI (Google Gemini) phục vụ ba nhóm người dùng rõ ràng:

| Nhóm | Đặc điểm | Tính năng cốt lõi |
|---|---|---|
| **Học sinh THCS/THPT** (Lớp 6–12) | Tự học, ôn tập | Bài học SGK, luyện tập gamified, dashboard tiến độ |
| **Người học kỹ năng nghề** | Học lập trình tự định hướng | Skill paths, placement test, module lessons |

### 1.2 Lịch sử thay đổi quan trọng

- **v1.0 (ban đầu):** Hệ thống phục vụ lớp 1–12 không phân biệt, tính năng tạo đề nằm lẫn với khu vực học sinh, chỉ có 2 role (student/admin).
- **v2.0 (hiện tại):** Tái định hướng toàn diện — 2 role, xóa lớp 1–5, phân quyền chức năng theo role, redesign UI/UX, responsive hoàn toàn.

---

## 2. SỐ LIỆU DỰ ÁN

### 2.1 Thống kê codebase

| Loại file | Số lượng |
|---|---|
| JavaScript/JSX (client) | 52 files |
| JavaScript (server) | 51 files |
| CSS | 6 files (~9.000 dòng) |
| SQL migrations | 12 files |
| SQL seeds | 5 files |

### 2.2 Phân bổ theo tầng

**Client (React):**
- Pages: 35 components
- Components dùng chung: 10 components
- API clients: 9 files
- Contexts: 2 files
- CSS files: 4 (global.css, teacher.css, homepage.css, dashboard.css)

**Server (Express):**
- Controllers: 11 files
- Routes: 13 files
- Middleware: 3 files
- Services: 3 files (email, gemini, otp)
- Config: 3 files (db, jwt, email)

**Database:**
- Tables: ~18 bảng chính
- Migrations: 12 (đánh số tuần tự)
- Seed data: 5 files

---

## 3. KIẾN TRÚC KỸ THUẬT

### 3.1 Stack công nghệ

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT                          │
│  React 19 + Vite 8 + React Router 7                 │
│  CSS thuần (không dùng framework UI)                │
│  Axios + Context API (không dùng Redux)             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST (JSON)
                       │ Cookie (refresh_token)
┌──────────────────────▼──────────────────────────────┐
│                     SERVER                          │
│  Express.js 5 (Node.js)                             │
│  Middleware: cors, cookie-parser, express-validator  │
│  Auth: JWT (access 15m + refresh 7d in httpOnly)    │
│  AI: Google Gemini API (@google/generative-ai)      │
└──────────────────────┬──────────────────────────────┘
                       │ pg (node-postgres)
┌──────────────────────▼──────────────────────────────┐
│                   DATABASE                          │
│  PostgreSQL (không dùng ORM)                        │
│  SQL thuần với parameterized queries                │
│  JSONB cho options/answers linh hoạt               │
└─────────────────────────────────────────────────────┘
```

### 3.2 Sơ đồ phân tầng Server

```
Request → Route → Middleware (auth/role) → Controller → Service/DB → Response
```

Ví dụ flow tạo đề thi giáo viên:
```
POST /api/teacher/generate-test
  → auth middleware (verify JWT)
  → requireRole('teacher', 'admin')
  → geminiController.generateTest()
  → geminiService.generateExam()    ← gọi Google Gemini API
  → pool.query(INSERT...)           ← lưu vào PostgreSQL
  → res.json(result)
```

### 3.3 Sơ đồ Authentication Flow

```
Đăng ký:
  RegisterPage [chọn role] → POST /auth/register [email+password+role]
  → OTPPage → POST /auth/verify-email
  → login() → redirect theo role

Đăng nhập:
  LoginPage → POST /auth/login
  → nhận access_token (memory) + refresh_token (httpOnly cookie)
  → redirect: teacher→/teacher/dashboard | student→/dashboard | admin→/admin

Refresh:
  axiosInstance interceptor → POST /auth/refresh → access_token mới
  → queue các request đang chờ (tránh race condition)
```

---

## 4. CẤU TRÚC THƯ MỤC

```
education-platform/
├── client/
│   └── src/
│       ├── api/                    # API clients
│       │   ├── axiosInstance.js    # Axios + auto-refresh interceptor
│       │   ├── authApi.js          # Auth endpoints
│       │   ├── teacherApi.js       # Teacher-only endpoints (mới)
│       │   ├── geminiApi.js        # Student AI practice
│       │   ├── lessonApi.js        # Bài học + progress
│       │   └── practiceApi.js      # Luyện tập
│       ├── components/
│       │   ├── Layout/             # MainLayout, Navbar (dynamic/role), Footer
│       │   ├── TeacherRoute.jsx    # Guard: chỉ teacher/admin
│       │   ├── StudentRoute.jsx    # Guard: chỉ student/admin
│       │   ├── ProtectedRoute.jsx  # Guard: đã đăng nhập
│       │   └── Heatmap.jsx         # Activity heatmap component
│       ├── contexts/
│       │   ├── AuthContext.jsx     # user, isStudent, isTeacher, isAdmin
│       │   └── ToastContext.jsx    # Thông báo toast
│       ├── pages/
│       │   ├── Auth/               # Login, Register (2-step), OTP
│       │   ├── Home/               # HomePage (redesign v2)
│       │   ├── Dashboard/          # Dashboard gamification (redesign v2)
│       │   ├── Teacher/            # TeacherLayout, Dashboard, CreateExam, History
│       │   ├── PhoThong/           # GradeList (lớp 6-12), SubjectList, ChapterList, Lesson, Exercise
│       │   ├── DaiHoc/             # PathList, PathDetail, Module, SkillLesson, PlacementTest
│       │   ├── Practice/           # PracticeSetup, Arena, Leaderboard, AI Practice
│       │   ├── Admin/              # AdminLayout, ManageUsers, ManageLessons, GeminiSettings
│       │   ├── Profile/            # ProfilePage
│       │   └── Search/             # SearchPage
│       └── styles/
│           ├── global.css          # Design system, layout, sidebar, auth
│           ├── teacher.css         # Teacher layout + dashboard + responsive
│           ├── homepage.css        # Homepage v2 (animated hero, persona cards)
│           └── dashboard.css       # Dashboard v2 gamification
│
├── server/src/
│   ├── app.js                      # Express setup, route mounting
│   ├── config/                     # db.js, jwt.js, email.js
│   ├── controllers/                # Business logic (11 controllers)
│   ├── routes/                     # Route definitions (13 routes)
│   ├── middleware/                 # auth.js, role.js, errorHandler.js
│   ├── services/                   # geminiService, emailService, otpService
│   └── validators/                 # authValidator
│
└── database/
    ├── migrations/                 # 012 SQL files (schema versioning)
    └── seeds/                      # 05 SQL files (dữ liệu mẫu)
```

---

## 5. DATABASE SCHEMA

### 5.1 Sơ đồ quan hệ chính

```
users (id, email, password_hash, role[student|teacher|admin], display_name, is_verified)
  │
  ├── otp_codes (user_id, otp_code, expires_at, is_used)
  ├── refresh_tokens (user_id, token, expires_at)
  ├── lesson_progress (user_id, lesson_id, is_completed)
  ├── exercise_attempts (user_id, exercise_id, user_answer, is_correct)
  ├── chapter_progress (user_id, chapter_id, progress_percent)
  ├── practice_sessions (user_id, grade_slug, subject_slug, score, streak)
  ├── question_collections (user_id, collection_name, grade_number, subject)
  │     └── generated_questions (collection_id, question_text, options, correct_answer)
  │           └── generated_question_attempts (user_id, question_id, is_correct)
  └── generated_session_results (user_id, collection_id, score_percent)

education_levels → grades → grade_subjects → chapters → lessons → exercises
skill_paths → skill_modules → skill_lessons
skill_paths → placement_tests → placement_questions
```

### 5.2 Thiết kế đáng chú ý

- **UUID** cho `users`, `question_collections`, `generated_questions` → tránh đoán ID
- **JSONB** cho `options`, `correct_answer`, `metadata` → linh hoạt với nhiều dạng bài
- **Soft delete** (`is_active`) nhất quán cho chapters, lessons, exercises
- **OTP rate limiting** (otp_rate_limits table) — 3 lần/10 phút
- **exercise_type** dùng PostgreSQL ENUM: `multiple_choice`, `fill_blank`, `matching`

---

## 6. PHÂN QUYỀN NGƯỜI DÙNG (RBAC)

### 6.1 Bảng phân quyền route

| Route/Tính năng | Guest | Student | Teacher | Admin |
|---|---|---|---|---|
| Trang chủ `/` | ✅ | ✅ | ✅ | ✅ |
| Skill Paths (xem) | ✅ | ✅ | ✅ | ✅ |
| Tìm kiếm `/search` | ✅ | ✅ | ✅ | ✅ |
| Học bài `/pho-thong/**` | ❌ login | ✅ | ❌ redirect | ✅ |
| Luyện tập `/practice/**` | ❌ login | ✅ | ❌ redirect | ✅ |
| Luyện AI `/practice/ai-*` | ❌ login | ✅ | ❌ redirect | ✅ |
| Dashboard học sinh | ❌ login | ✅ | ❌ redirect | ✅ |
| Tạo đề thi `/teacher/create-exam` | ❌ | ❌ redirect | ✅ | ✅ |
| Lịch sử đề `/teacher/history` | ❌ | ❌ redirect | ✅ | ✅ |
| Admin Panel `/admin/**` | ❌ | ❌ | ❌ | ✅ |
| Hồ sơ `/profile` | ❌ login | ✅ | ✅ | ✅ |

### 6.2 Navbar theo role

| Role | Menu items |
|---|---|
| **Student** | Dashboard · Học bài · Kỹ năng · Luyện tập · Luyện AI · Hồ sơ |
| **Teacher** | Tổng quan · Tạo đề · Lịch sử đề · Hồ sơ |
| **Admin** | Dashboard · Học bài · Kỹ năng · Luyện tập · Tạo đề · Admin Panel |
| **Guest** | Đăng nhập · Đăng ký |

### 6.3 Redirect sau đăng nhập/đăng ký

```
student → /dashboard
teacher → /teacher/dashboard
admin   → /admin
```

---

## 7. TÍNH NĂNG THEO TỪNG MODULE

### 7.1 Module Học tập (Student)

**Phổ thông (Lớp 6–12):**
- Phân cấp: Lớp → Môn → Chương → Bài học → Bài tập
- Content: HTML rich text (lý thuyết, ví dụ)
- Bài tập: 3 dạng (trắc nghiệm, điền khuyết, matching)
- Progress tracking: per-lesson + per-chapter + tổng quan

**Skill Paths (Lập trình):**
- Placement test để phân loại đầu vào
- Module-based learning (Frontend Dev, Backend Dev)
- Bài học kỹ năng riêng biệt (skill_lessons)

### 7.2 Module Luyện tập (Student)

**Luyện nhanh (Practice Arena):**
- Cấu hình: lớp, môn, chương, độ khó, thời gian, số lần sai tối đa
- Gameplay: timer per-question + session timer, streak bonus, feedback tức thì
- Câu hỏi random từ DB theo filter
- Hỗ trợ 3 dạng: multiple_choice, fill_blank, matching
- Leaderboard theo môn/lớp/độ khó
- Lưu kết quả phiên (practice_sessions)

**Luyện AI (AIQuestionGenerator):**
- Sinh câu hỏi bằng Gemini theo lớp/chủ đề/độ khó
- Lưu thành collection → làm bài ngay (AIPracticeArena)
- Xem kết quả chi tiết (AIResultPage)
- Lịch sử các bộ câu hỏi (AICollectionHistory)

### 7.3 Module Dashboard + Gamification

**Thông tin hiển thị:**
- Avatar + Level badge + XP progress bar (tính từ số bài tập đã làm)
- Streak (ngày liên tiếp có practice_sessions)
- Stats: bài hoàn thành, bài tập đã làm, độ chính xác (animated counter)
- Quick actions: học tiếp, luyện nhanh, leaderboard, kỹ năng
- Activity Heatmap (GitHub-style, dùng lesson_progress.last_accessed_at)
- Badge milestones (6 mốc dựa trên dữ liệu thực)
- Tiến độ từng chương (progress bars)
- Lộ trình kỹ năng đang học

**Công thức gamification:**
```
Level = floor(total_exercises_attempted / 10) + 1  [max 50]
XP    = exercises_attempted × 8 + accuracy_rate × 0.5
Streak = đếm ngày liên tiếp có practice session từ hôm nay trở về trước
```

### 7.4 Module Giáo viên (Teacher)

**Teacher Dashboard:**
- Stats: đề đã tạo, tổng câu hỏi, số đề kiểm tra
- Quick actions: Tạo đề mới, Xem lịch sử
- Recent exams (5 đề gần nhất)
- How-to-use guide cho giáo viên mới

**Tạo đề AI (TeacherCreateExam):**
- Config: môn, lớp, chủ đề, độ khó, số câu, phân phần (MC/tự luận/điền khuyết)
- AI sinh đề qua Gemini với retry logic
- Preview đề (ExamPreviewPanel) với nút "In đề" (không có "Làm bài")
- Chỉnh sửa từng câu trực tiếp (ExamQuestionEditor)
- Export PDF / in trực tiếp (ExamPaperA4 — A4 chuẩn)

**Lịch sử đề thi (TeacherHistory):**
- Danh sách tất cả đề đã tạo
- Xem trước đề → In (fetch từ DB → render ExamPaperA4)
- Xóa đề

### 7.5 Module AI Gemini (Backend Service)

**Khả năng:**
- Sinh câu hỏi đơn lẻ hoặc theo lô (batch)
- Hỗ trợ multiple_choice, fill_in_blank, essay
- Phân chia 3 phần A/B/C cho đề thi
- Batch lớn (> 20 câu) → chia thành nhiều lô với anti-duplication
- Retry logic (2 lần) khi Gemini trả về JSON không hợp lệ
- Validate + clean output trước khi lưu vào DB
- Rate limiting: 20 lần tạo/giờ/user

**Models hỗ trợ:** gemini-2.5-flash-lite (mặc định, cấu hình được qua DB)

---

## 8. ĐÁNH GIÁ ĐIỂM MẠNH (sau v2.0)

### 8.1 Kiến trúc

✅ **Phân tầng rõ ràng** — routes → controllers → services → DB, không có business logic trong routes  
✅ **RBAC đúng chuẩn** — middleware `auth` + `requireRole` tách biệt, route guards frontend theo role  
✅ **Auth pattern bảo mật** — access token in-memory (không localStorage), refresh token httpOnly cookie, auto-refresh với queue  
✅ **Database schema chuẩn** — UUID, JSONB linh hoạt, soft-delete nhất quán, indexes phù hợp  
✅ **Lazy loading** — tất cả pages dùng React.lazy() + Suspense, tránh bundle lớn

### 8.2 UX / Product

✅ **3 persona rõ ràng** — mỗi role có layout, menu, dashboard riêng; không có nhầm lẫn chức năng  
✅ **Gamification thực sự** — Level, XP, Streak, Badge milestone, Heatmap, Leaderboard  
✅ **Homepage mạnh** — animated hero, persona cards, feature grid, stats counter, how-it-works  
✅ **Responsive mobile** — sidebar slide-in, hamburger menu, layouts chuyển đổi mượt theo breakpoint  
✅ **Giáo viên tách biệt** — Teacher section độc lập, không ảnh hưởng khu vực học sinh  
✅ **RegisterPage 2 bước** — chọn role trước → form sau, trải nghiệm rõ ràng hơn

### 8.3 Code Quality

✅ **SQL parameterized** — không có SQL injection risk  
✅ **OTP rate limiting** — chống spam với window-based limiting  
✅ **Error handling nhất quán** — try/catch/next(err) + centralized errorHandler  
✅ **Gemini output validation** — parse + validate + clean trước khi lưu DB  

---

## 9. VẤN ĐỀ CÒN TỒN TẠI

### 9.1 Bảo mật (Security)

⚠️ **[MEDIUM] Hardcode URL trong client:**
```js
// AuthContext.jsx:20, axiosInstance.js:52
'http://localhost:5000/api/auth/refresh'  // hardcode
```
→ *Fix:* Dùng `import.meta.env.VITE_API_URL` từ file `.env`

⚠️ **[MEDIUM] Không có transaction khi insert collection:**
- `geminiController.js` insert từng câu trong `for` loop không có BEGIN/COMMIT
- Nếu câu thứ N fail → collection bị lưu thiếu câu
→ *Fix:* Bọc trong `pool.query('BEGIN')` ... `COMMIT/ROLLBACK`

⚠️ **[LOW] errorHandler lộ message nội bộ:**
```js
res.status(status).json({ error: message }) // message từ err.message
```
→ *Fix:* Production mode chỉ trả về status code, không trả message chi tiết

⚠️ **[LOW] `express.json()` không giới hạn kích thước:**
- Mặc định 100KB; endpoint nhận `content_html` bài học có thể bị DoS
→ *Fix:* `app.use(express.json({ limit: '2mb' }))`

⚠️ **[LOW] Race condition trong OTP rate limit:**
- Đọc → kiểm tra → cập nhật không atomic, 2 request đồng thời có thể bypass
→ *Fix:* Dùng `SELECT ... FOR UPDATE` hoặc atomic UPDATE

### 9.2 Kỹ thuật (Technical Debt)

⚠️ **[MEDIUM] ExamPreviewPanel vẫn gọi `/api/gemini/` khi teacher dùng:**
- TeacherCreateExam dùng ExamPreviewPanel nhưng panel regenerate câu qua `geminiApi` (route /api/gemini/)
- Teacher có thể dùng được nhưng không qua route `/api/teacher/` đúng chuẩn
→ *Fix:* Truyền `api` prop hoặc trích xuất logic vào service layer

⚠️ **[MEDIUM] Seed data còn lớp 1–5 (`02_grades_subjects.sql`):**
- Migration 012 đã xóa runtime nhưng seed file vẫn insert lớp 1–5
- Re-seed sẽ tạo lại lớp 1–5 rồi cần chạy migration 012 lại
→ *Fix:* Cập nhật seed file chỉ giữ lớp 6–12

⚠️ **[LOW] `practice_sessions` lưu slug thay vì FK:**
- `grade_slug`, `subject_slug` là chuỗi văn bản, không phải foreign key
- Không thể JOIN để lấy thông tin đầy đủ
→ *Fix:* Thêm cột `grade_id` và `subject_id` (INT FK)

⚠️ **[LOW] N+1 queries trong clone collection:**
- `geminiController.cloneCollection` copy từng câu trong `for` loop
→ *Fix:* Dùng batch INSERT với `VALUES` nhiều dòng

⚠️ **[LOW] `useEffect` dependency array suppressed:**
```jsx
// PracticeArena.jsx:317,334
}, [phase === 'DONE']); // eslint-disable-line
```
→ *Nguy cơ:* stale closure khi `endGame`, `handleAnswer` được gọi

### 9.3 Nội dung (Content)

⚠️ **Chỉ có 1 môn học (Toán):**
- Seed data chỉ có Toán cho lớp 6–12
- Hệ thống hỗ trợ nhiều môn nhưng chưa có nội dung
→ Cần bổ sung Ngữ văn, Tiếng Anh, Vật lý, Hóa học, Sinh học

⚠️ **Nội dung còn ít:**
- Stats trang chủ hiển thị `120+ bài học` nhưng thực tế có thể ít hơn nhiều
- Cần đánh giá lại con số với dữ liệu thực

### 9.4 Testing

⚠️ **Không có test:**
- `package.json` server: `"test": "echo \"Error: no test specified\""`
- Không có unit test, integration test, hay E2E test
→ Rủi ro cao khi refactor; auth flow đặc biệt cần được test

---

## 10. ĐỀ XUẤT CẢI THIỆN TIẾP THEO

### 10.1 Ưu tiên cao (nên làm ngay)

1. **Fix hardcode URL** — `VITE_API_URL` từ `.env`, tạo `.env.example`
2. **Database transactions** — bọc insert collection + questions
3. **Cập nhật seed file** — xóa lớp 1–5 khỏi `02_grades_subjects.sql`
4. **Thêm .env.example** — liệt kê tất cả biến môi trường cần thiết

### 10.2 Ưu tiên trung bình

5. **Thêm nội dung môn học** — ít nhất 1–2 môn thêm ngoài Toán
6. **Chuẩn hóa TeacherCreateExam API** — dùng `teacherApi` cho mọi thao tác trong ExamPreviewPanel
7. **Input sanitization cho content_html** — DOMPurify trên client trước khi render innerHTML
8. **Giới hạn request body size** — `express.json({ limit: '2mb' })`

### 10.3 Ưu tiên thấp (cải thiện lâu dài)

9. **Viết test** — ít nhất auth flow + API endpoints chính
10. **Thêm môn học** — theo lộ trình SGK
11. **Teacher analytics** — thống kê bài tập học sinh làm từ đề giáo viên
12. **Dark mode** — toggle trong profile settings
13. **Notification system** — thông báo khi học sinh đạt milestone

---

## 11. ĐÁNH GIÁ TỔNG THỂ

### Bảng điểm

| Tiêu chí | Điểm (v1.0) | Điểm (v2.0) | Nhận xét |
|---|---|---|---|
| **Xác định đối tượng** | 3/10 | 9/10 | 3 persona rõ ràng, RBAC đúng chuẩn |
| **Kiến trúc kỹ thuật** | 7/10 | 8/10 | Thêm teacher layer, route guards tốt |
| **Bảo mật** | 6/10 | 6.5/10 | Auth tốt, còn vài điểm cần fix |
| **UI/UX Design** | 4/10 | 7.5/10 | Homepage + Dashboard được redesign toàn diện |
| **Responsive** | 5/10 | 8/10 | Mobile-first, breakpoints đầy đủ |
| **Tính năng** | 7/10 | 8.5/10 | Gamification, Teacher section mới |
| **Code Quality** | 6/10 | 7/10 | Nhất quán hơn, còn một vài technical debt |
| **Testing** | 1/10 | 1/10 | Chưa có test |
| **Nội dung** | 4/10 | 4/10 | Vẫn chỉ có Toán |

**Tổng điểm v1.0:** 43/90 ≈ **4.8/10**  
**Tổng điểm v2.0:** 59/90 ≈ **6.6/10**

### Kết luận

**LearnHub v2.0 đã giải quyết được hai vấn đề cốt lõi mà giảng viên đề ra:**

1. ✅ **Đối tượng người dùng đúng và rõ ràng** — Học sinh THCS/THPT (không còn lớp 1–5), Giáo viên có section riêng, Người học kỹ năng nghề.

2. ✅ **Giao diện thu hút hơn** — Homepage với animated hero/blob, persona cards, feature grid; Dashboard với gamification Level/XP/Streak/Badge/Heatmap; Teacher Dashboard chuyên nghiệp.

**Điểm mạnh nhất của dự án:**
- Auth flow với JWT + refresh token in httpOnly cookie — đúng chuẩn security
- AI integration (Gemini) với retry logic, validation, batch processing — hoàn chỉnh
- Practice Arena gamified — UX tốt, timer per-question, streak, leaderboard
- Cấu trúc code phân tầng rõ ràng, dễ mở rộng

**Điểm cần cải thiện nhất:**
- Hardcode URL (quick fix, 5 phút)
- Thiếu test (rủi ro cao)
- Nội dung ít (cần đầu tư thêm dữ liệu)

Đây là một dự án có nền tảng kỹ thuật tốt, kiến trúc hợp lý và tính năng đa dạng — đủ điều kiện cho một **sản phẩm MVP EdTech** hoàn chỉnh.

---

*Tài liệu này được tạo tự động bởi code review. Cập nhật lần cuối: 01/06/2026*
