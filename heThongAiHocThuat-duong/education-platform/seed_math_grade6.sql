-- Xóa progress data của student@test.com
DELETE FROM school_placement_results
WHERE user_id = (SELECT id FROM users WHERE email = 'student@test.com');

DELETE FROM chapter_progress
WHERE user_id = (SELECT id FROM users WHERE email = 'student@test.com');

DELETE FROM lesson_progress
WHERE user_id = (SELECT id FROM users WHERE email = 'student@test.com');

DELETE FROM exercise_attempts
WHERE user_id = (SELECT id FROM users WHERE email = 'student@test.com');

-- Xóa old data (Toán lớp 6)
DELETE FROM exercises
WHERE lesson_id IN (
  SELECT l.id FROM lessons l
  JOIN chapters c ON c.id = l.chapter_id
  WHERE c.grade_subject_id = (
    SELECT gs.id FROM grade_subjects gs
    JOIN grades g ON g.id = gs.grade_id
    JOIN subjects s ON s.id = gs.subject_id
    WHERE g.grade_number = 6 AND s.slug = 'toan'
  )
);

DELETE FROM lessons
WHERE chapter_id IN (
  SELECT c.id FROM chapters c
  WHERE c.grade_subject_id = (
    SELECT gs.id FROM grade_subjects gs
    JOIN grades g ON g.id = gs.grade_id
    JOIN subjects s ON s.id = gs.subject_id
    WHERE g.grade_number = 6 AND s.slug = 'toan'
  )
);

DELETE FROM chapters
WHERE grade_subject_id = (
  SELECT gs.id FROM grade_subjects gs
  JOIN grades g ON g.id = gs.grade_id
  JOIN subjects s ON s.id = gs.subject_id
  WHERE g.grade_number = 6 AND s.slug = 'toan'
);

-- Thêm chapters mới (Toán lớp 6 SGK)
WITH gs AS (
  SELECT gs.id FROM grade_subjects gs
  JOIN grades g ON g.id = gs.grade_id
  JOIN subjects s ON s.id = gs.subject_id
  WHERE g.grade_number = 6 AND s.slug = 'toan'
)
INSERT INTO chapters (grade_subject_id, title, slug, description, sort_order, is_active)
SELECT (SELECT id FROM gs), 'Chương 1: Tập hợp', 'chuong-1-tap-hop', 'Khái niệm tập hợp, phần tử của tập hợp', 1, true
UNION ALL
SELECT (SELECT id FROM gs), 'Chương 2: Tính chia hết', 'chuong-2-tinh-chia-het', 'Ước, bội, chia hết, số nguyên tố', 2, true
UNION ALL
SELECT (SELECT id FROM gs), 'Chương 3: Số nguyên', 'chuong-3-so-nguyen', 'Số nguyên, phép cộng, trừ số nguyên', 3, true
UNION ALL
SELECT (SELECT id FROM gs), 'Chương 4: Phân số', 'chuong-4-phan-so', 'Phân số, quy đồng, rút gọn phân số', 4, true
UNION ALL
SELECT (SELECT id FROM gs), 'Chương 5: Đo lường và Hình học', 'chuong-5-do-luong-hinh-hoc', 'Chiều dài, diện tích, thể tích, hình học không gian', 5, true;

-- Thêm lessons
INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order, is_active)
SELECT c.id, 'Bài 1: Tập hợp và phần tử', 'bai-1-tap-hop-va-phan-tu', 'theory', '<h2>Khái niệm tập hợp</h2><p>Tập hợp là một tụ tập các đối tượng xác định và phân biệt nhau. Ký hiệu tập hợp bằng chữ cái in hoa: A, B, C,...</p>', 1, true
FROM chapters c WHERE c.slug = 'chuong-1-tap-hop'
UNION ALL
SELECT c.id, 'Bài 2: Cách biểu diễn tập hợp', 'bai-2-cach-bieu-dien-tap-hop', 'theory', '<h2>Biểu diễn tập hợp</h2><p>Có hai cách: (1) Liệt kê phần tử: A = {1, 2, 3} (2) Chỉ ra tính chất: A = {x | x là số chẵn, 0 < x < 10}</p>', 2, true
FROM chapters c WHERE c.slug = 'chuong-1-tap-hop'
UNION ALL
SELECT c.id, 'Bài 3: Ước và Bội', 'bai-3-uoc-va-boi', 'theory', '<h2>Ước và Bội</h2><p>Nếu a chia hết cho b (a = b × k) thì b là ước của a, a là bội của b.</p>', 1, true
FROM chapters c WHERE c.slug = 'chuong-2-tinh-chia-het'
UNION ALL
SELECT c.id, 'Bài 4: Số nguyên tố và Hợp số', 'bai-4-so-nguyen-to', 'theory', '<h2>Số nguyên tố</h2><p>Số nguyên tố là số tự nhiên lớn hơn 1 có chính xác hai ước: 1 và chính nó. Ví dụ: 2, 3, 5, 7, 11, 13...</p>', 2, true
FROM chapters c WHERE c.slug = 'chuong-2-tinh-chia-het'
UNION ALL
SELECT c.id, 'Bài 5: Số nguyên âm và số 0', 'bai-5-so-nguyen-am', 'theory', '<h2>Số nguyên âm</h2><p>Số nguyên âm là những số nhỏ hơn 0, được ký hiệu với dấu - ở phía trước: -1, -2, -3...</p>', 1, true
FROM chapters c WHERE c.slug = 'chuong-3-so-nguyen'
UNION ALL
SELECT c.id, 'Bài 6: Cộng số nguyên', 'bai-6-cong-so-nguyen', 'theory', '<h2>Cộng số nguyên</h2><p>Quy tắc: (1) Cùng dấu: cộng giá trị tuyệt đối, giữ dấu (2) Khác dấu: lấy dấu của số có giá trị tuyệt đối lớn hơn, trừ giá trị tuyệt đối</p>', 2, true
FROM chapters c WHERE c.slug = 'chuong-3-so-nguyen'
UNION ALL
SELECT c.id, 'Bài 7: Khái niệm phân số', 'bai-7-phan-so-va-so-thap-phan', 'theory', '<h2>Phân số</h2><p>Phân số là biểu diễn của phép chia hai số nguyên a/b (b ≠ 0). a gọi là tử số, b gọi là mẫu số.</p>', 1, true
FROM chapters c WHERE c.slug = 'chuong-4-phan-so'
UNION ALL
SELECT c.id, 'Bài 8: Rút gọn phân số', 'bai-8-rut-gon-phan-so', 'theory', '<h2>Rút gọn phân số</h2><p>Rút gọn phân số bằng cách chia cả tử và mẫu cho ước chung (khác 1 và -1). Phân số tối giản là phân số không rút gọn được nữa.</p>', 2, true
FROM chapters c WHERE c.slug = 'chuong-4-phan-so'
UNION ALL
SELECT c.id, 'Bài 9: Hình bình hành và Hình thoi', 'bai-9-hinh-binh-hanh', 'theory', '<h2>Hình bình hành</h2><p>Hình bình hành là tứ giác có các cặp cạnh đối song song. Tính chất: cạnh đối bằng nhau, góc đối bằng nhau.</p>', 1, true
FROM chapters c WHERE c.slug = 'chuong-5-do-luong-hinh-hoc'
UNION ALL
SELECT c.id, 'Bài 10: Diện tích hình', 'bai-10-dien-tich-hinh', 'theory', '<h2>Diện tích hình</h2><p>Diện tích hình chữ nhật = dài × rộng. Diện tích hình bình hành = đáy × chiều cao. Diện tích tam giác = (đáy × chiều cao) / 2</p>', 2, true
FROM chapters c WHERE c.slug = 'chuong-5-do-luong-hinh-hoc';

-- Thêm exercises
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order, is_active)
SELECT l.id, 'multiple_choice'::exercise_type, 'Tập hợp {1, 2, 3} có bao nhiêu phần tử?', '["1","2","3","4"]'::jsonb, '{"answer":"3"}'::jsonb, 'Tập hợp này có 3 phần tử: 1, 2, 3', 1, 1, true
FROM lessons l WHERE l.slug = 'bai-1-tap-hop-va-phan-tu'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, 'Số phần tử của tập hợp {a, b, c, d, e} là:', NULL::jsonb, '{"answer":"5"}'::jsonb, 'Đếm các phần tử: a, b, c, d, e = 5 phần tử', 1, 2, true
FROM lessons l WHERE l.slug = 'bai-1-tap-hop-va-phan-tu'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Số 10 có bao nhiêu ước?', '["2","3","4","5"]'::jsonb, '{"answer":"4"}'::jsonb, 'Ước của 10 là: 1, 2, 5, 10 (tổng cộng 4 ước)', 2, 1, true
FROM lessons l WHERE l.slug = 'bai-3-uoc-va-boi'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, 'Số 12 có bao nhiêu ước?', NULL::jsonb, '{"answer":"6"}'::jsonb, 'Ước của 12: 1, 2, 3, 4, 6, 12 (tổng 6 ước)', 2, 2, true
FROM lessons l WHERE l.slug = 'bai-3-uoc-va-boi'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Số nào là số nguyên tố?', '["1","2","4","6"]'::jsonb, '{"answer":"2"}'::jsonb, 'Số 2 chỉ có hai ước: 1 và 2. Đó là số nguyên tố nhỏ nhất.', 2, 1, true
FROM lessons l WHERE l.slug = 'bai-4-so-nguyen-to'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Trong các số dưới, số nào không là số nguyên tố?', '["7","11","13","15"]'::jsonb, '{"answer":"15"}'::jsonb, 'Số 15 = 3 × 5, có 4 ước nên không là số nguyên tố.', 2, 2, true
FROM lessons l WHERE l.slug = 'bai-4-so-nguyen-to'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, '(-5) + 3 = ?', NULL::jsonb, '{"answer":"-2"}'::jsonb, 'Cộng hai số khác dấu: lấy |−5| − |3| = 5 − 3 = 2, dấu của −5 là âm, nên kết quả = −2', 2, 1, true
FROM lessons l WHERE l.slug = 'bai-6-cong-so-nguyen'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, '7 + (-7) = ?', NULL::jsonb, '{"answer":"0"}'::jsonb, 'Hai số đối nhau cộng lại bằng 0', 1, 2, true
FROM lessons l WHERE l.slug = 'bai-6-cong-so-nguyen'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Phân số nào bằng 1/2?', '["2/4","3/4","2/5","3/5"]'::jsonb, '{"answer":"2/4"}'::jsonb, 'Rút gọn 2/4: chia cả tử và mẫu cho 2, được 1/2', 1, 1, true
FROM lessons l WHERE l.slug = 'bai-7-phan-so-va-so-thap-phan'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Phân số nào tối giản?', '["4/6","5/7","6/9","8/12"]'::jsonb, '{"answer":"5/7"}'::jsonb, 'Phân số 5/7 không thể rút gọn vì ƯCLN(5,7) = 1. Đây là phân số tối giản.', 2, 2, true
FROM lessons l WHERE l.slug = 'bai-7-phan-so-va-so-thap-phan'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, 'Rút gọn phân số 6/9 = ?/?', NULL::jsonb, '{"answer":"2/3"}'::jsonb, 'ƯCLN(6,9) = 3. Chia cả tử và mẫu cho 3: 6÷3=2, 9÷3=3, được 2/3', 1, 1, true
FROM lessons l WHERE l.slug = 'bai-8-rut-gon-phan-so'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, 'Rút gọn phân số 15/20 = ?/?', NULL::jsonb, '{"answer":"3/4"}'::jsonb, 'ƯCLN(15,20) = 5. Chia cả tử và mẫu cho 5: 15÷5=3, 20÷5=4, được 3/4', 1, 2, true
FROM lessons l WHERE l.slug = 'bai-8-rut-gon-phan-so'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Hình bình hành có tính chất nào?', '["Các cạnh đối song song","Tất cả góc đều bằng 90°","Hai đường chéo vuông góc","Không có trục đối xứng"]'::jsonb, '{"answer":"Các cạnh đối song song"}'::jsonb, 'Tính chất của hình bình hành: các cặp cạnh đối song song và bằng nhau', 2, 1, true
FROM lessons l WHERE l.slug = 'bai-9-hinh-binh-hanh'
UNION ALL
SELECT l.id, 'multiple_choice'::exercise_type, 'Diện tích hình bình hành được tính bằng?', '["đáy × chiều cao","dài × rộng","½ × đáy × chiều cao","chu vi ÷ 2"]'::jsonb, '{"answer":"đáy × chiều cao"}'::jsonb, 'Công thức tính diện tích hình bình hành = đáy × chiều cao (h là chiều cao hạ vuông góc từ đỉnh đến đáy)', 2, 2, true
FROM lessons l WHERE l.slug = 'bai-9-hinh-binh-hanh'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, 'Diện tích hình chữ nhật có chiều dài 8cm, chiều rộng 5cm = ? cm²', NULL::jsonb, '{"answer":"40"}'::jsonb, 'Diện tích hình chữ nhật = dài × rộng = 8 × 5 = 40 cm²', 1, 1, true
FROM lessons l WHERE l.slug = 'bai-10-dien-tich-hinh'
UNION ALL
SELECT l.id, 'fill_blank'::exercise_type, 'Diện tích tam giác có đáy 6cm, chiều cao 4cm = ? cm²', NULL::jsonb, '{"answer":"12"}'::jsonb, 'Diện tích tam giác = (đáy × chiều cao) / 2 = (6 × 4) / 2 = 12 cm²', 2, 2, true
FROM lessons l WHERE l.slug = 'bai-10-dien-tich-hinh';
