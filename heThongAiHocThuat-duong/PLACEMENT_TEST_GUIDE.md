# Hướng dẫn Test Tính năng Placement Test

## 1. Chạy Migration

```bash
# Terminal, từ folder project root
psql -U postgres -d education_platform -f database/migrations/013_create_school_placement.sql
```

## 2. Chạy Backend & Frontend

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev  # http://localhost:5000

# Terminal 2: Frontend
cd client
npm install
npm run dev  # http://localhost:5173
```

## 3. Test Manual

### Bước 1: Đăng nhập
- Vào http://localhost:5173
- Click "Đăng nhập"
- Email: `student@test.com`
- Password: `password123`

### Bước 2: Vào môn học
- Click "Phổ thông" hoặc vào URL `/pho-thong`
- Chọn lớp 6 (hoặc lớp bất kỳ)
- Chọn môn Toán

### Bước 3: Xem banner
- **Kỳ vọng**: Thấy banner xanh "Làm bài kiểm tra đầu vào"
- Click nút "Bắt đầu kiểm tra"

### Bước 4: Làm bài
- **Kỳ vọng**: Modal mở với:
  - Progress bar câu hỏi
  - Câu hỏi hiển thị đúng (trắc nghiệm, điền khuyết, matching)
  - Nút "Câu trước" / "Câu tiếp"
  - Nút "Nộp bài" ở câu cuối
- Trả lời hết tất cả câu
- Click "Nộp bài"

### Bước 5: Xem kết quả
- **Kỳ vọng**: Modal hiển thị:
  - Điểm tổng (%)
  - Số câu đúng / tổng
  - Điểm từng chương
  - Chương "Đã nắm vững" (>= 70%) có ✓
  - Gợi ý chương nên bắt đầu
- Click "Đóng và xem danh sách chương"

### Bước 6: Kiểm tra tự động cập nhật
- **Kỳ vọng**:
  - Các chương mastered có badge "✓ Đã nắm vững"
  - Chương recommended có tag "⭐ Nên bắt đầu từ đây"
  - Mở chương mastered: các bài học hiển thị 100% hoàn thành
  - Progress bar chương = 100%

### Bước 7: Làm lại test (optional)
- Scroll lên, banner thay đổi thành "Bạn đã hoàn thành bài kiểm tra đầu vào"
- Click vào chương khác
- Làm bài mới
- **Kỳ vọng**: Kết quả cũ được ghi đè, không mất dữ liệu cũ

---

## 4. Kiểm tra Database

```sql
-- Kết nối vào PostgreSQL
psql -U postgres -d education_platform

-- Kiểm tra bảng được tạo
\dt school_placement_results

-- Xem kết quả placement của user
SELECT * FROM school_placement_results WHERE user_id = (SELECT id FROM users WHERE email = 'student@test.com');

-- Xem lesson_progress được cập nhật
SELECT lp.*, l.id as lesson_id
FROM lesson_progress lp
JOIN lessons l ON l.id = lp.lesson_id
WHERE lp.user_id = (SELECT id FROM users WHERE email = 'student@test.com')
ORDER BY lp.lesson_id LIMIT 10;

-- Xem chapter_progress được cập nhật
SELECT * FROM chapter_progress
WHERE user_id = (SELECT id FROM users WHERE email = 'student@test.com');
```

---

## 5. Test Cases

### Case 1: Student chưa làm test
- Kỳ vọng: Banner "Làm kiểm tra đầu vào" xuất hiện
- API: `GET /placement/lop-6/toan/status` → `{ has_taken: false, result: null }`

### Case 2: Student làm test lần đầu
- Kỳ vọng: Modal hiển thị, submit thành công
- API: `POST /placement/lop-6/toan/submit` → Trả kết quả chấm điểm
- Database: school_placement_results được insert, lesson_progress được update

### Case 3: Student làm lại test (kết quả tốt hơn)
- Kỳ vọng: Kết quả cũ được ghi đè
- Mastered chapters tăng thêm
- API: `GET /placement/lop-6/toan/status` → Trả kết quả mới

### Case 4: Không có exercises
- Kỳ vọng: Error "Chương của môn học này chưa có bài tập để kiểm tra"
- API: `GET /placement/:gradeSlug/:subjectSlug/test` → 400 error

### Case 5: Chưa đăng nhập
- Kỳ vọng: Redirect login, không thấy banner
- API: GET/POST placement → 401 Unauthorized

---

## 6. Responsive Check

- [ ] Desktop: Modal rộng, layout đẹp
- [ ] Mobile: Modal rộp hợp lý, buttons stackable
- [ ] Tablet: Banner full width, modal centered

---

## 7. Edge Cases

- [ ] User trả lời sai tất cả câu → score_percent = 0, mastered_chapter_ids = []
- [ ] User trả lời đúng tất cả câu → mastered_chapter_ids = [tất cả chapters]
- [ ] Chương đầu tiên đạt < 70% → recommended_chapter_id = chapter_id
- [ ] Tất cả chapters đạt >= 70% → recommended_chapter_id = chapter cuối cùng

---

## Troubleshooting

### Banner không hiển thị
- Kiểm tra: User đã đăng nhập chưa?
- Kiểm tra API: `GET /placement/lop-6/toan/status` trả về gì?
- Kiểm tra console browser: có error không?

### Modal không mở
- Kiểm tra: FiTrendingUp icon import có không?
- Kiểm tra: PlacementTestModal.jsx được import đúng không?
- Kiểm tra console: Syntax error?

### Submit bài failed
- Kiểm tra network tab: API response status là gì?
- Kiểm tra server logs: error gì?
- Kiểm tra: Trả lời hết tất cả câu chưa?

### Dữ liệu không update
- Kiểm tra: Migration 013 đã chạy chưa?
- Kiểm tra: Backend đã restart chưa?
- Kiểm tra database: school_placement_results table tồn tại không?
