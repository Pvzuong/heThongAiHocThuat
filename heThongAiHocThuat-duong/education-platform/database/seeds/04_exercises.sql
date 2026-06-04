-- ============================================================
-- BÀI TẬP CHO CHƯƠNG 1 - LỚP 1
-- ============================================================

-- Bài tập cho Bài 1 (lesson_id = 1): Các số 1, 2, 3
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order) VALUES
(1, 'multiple_choice', 'Có mấy quả táo: 🍎🍎?',
  '["1", "2", "3", "4"]',
  '{"answer": "2"}',
  'Đếm số quả táo: có 2 quả táo 🍎🍎', 1, 1),

(1, 'fill_blank', 'Điền số vào chỗ trống: 🍎🍎🍎 = ___',
  NULL,
  '{"answer": "3"}',
  'Đếm số quả táo: 🍎🍎🍎 có 3 quả, vậy điền 3', 1, 2),

(1, 'multiple_choice', 'Số nào lớn hơn: 2 hay 3?',
  '["2", "3", "Bằng nhau", "Không biết"]',
  '{"answer": "3"}',
  '3 > 2: ba lớn hơn hai', 1, 3);

-- Bài tập cho Bài 2 (lesson_id = 2): Các số 4, 5, 6
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order) VALUES
(2, 'multiple_choice', 'Số nào đứng giữa 4 và 6?',
  '["3", "5", "7", "8"]',
  '{"answer": "5"}',
  'Dãy số: 4, 5, 6 → số đứng giữa là 5', 1, 1),

(2, 'fill_blank', '4 + 2 = ___',
  NULL,
  '{"answer": "6"}',
  '4 + 2 = 6 (bốn cộng hai bằng sáu)', 1, 2),

(2, 'matching', 'Ghép số với số lượng tương ứng:',
  '{"left": ["4", "5", "6"], "right": ["🌟🌟🌟🌟🌟", "🌟🌟🌟🌟🌟🌟", "🌟🌟🌟🌟"]}',
  '{"pairs": [[0,2], [1,0], [2,1]]}',
  '4→🌟🌟🌟🌟, 5→🌟🌟🌟🌟🌟, 6→🌟🌟🌟🌟🌟🌟', 2, 3);

-- Bài tập cho Bài 3 (lesson_id = 3): Các số 7, 8, 9, 10
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order) VALUES
(3, 'multiple_choice', 'Số liền sau của 9 là?',
  '["7", "8", "10", "11"]',
  '{"answer": "10"}',
  '9 + 1 = 10, vậy số liền sau 9 là 10', 1, 1),

(3, 'fill_blank', '7 + ___ = 10',
  NULL,
  '{"answer": "3"}',
  '10 - 7 = 3, vậy 7 + 3 = 10', 2, 2),

(3, 'multiple_choice', 'Số nào nhỏ nhất trong dãy: 10, 7, 9, 8?',
  '["10", "7", "9", "8"]',
  '{"answer": "7"}',
  'So sánh: 7 < 8 < 9 < 10, vậy 7 là số nhỏ nhất', 1, 3);

-- Bài tập cho Bài 4 (lesson_id = 4): Phép cộng phạm vi 10
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order) VALUES
(4, 'multiple_choice', '3 + 4 = ?',
  '["5", "6", "7", "8"]',
  '{"answer": "7"}',
  '3 + 4 = 7 (ba cộng bốn bằng bảy)', 1, 1),

(4, 'fill_blank', '6 + ___ = 10',
  NULL,
  '{"answer": "4"}',
  '10 - 6 = 4, vậy 6 + 4 = 10', 1, 2),

(4, 'matching', 'Ghép phép tính với kết quả:',
  '{"left": ["2 + 3", "4 + 5", "1 + 8"], "right": ["9", "5", "9"]}',
  '{"pairs": [[0,1], [1,0], [2,2]]}',
  '2+3=5, 4+5=9, 1+8=9', 2, 3);

-- Bài tập cho Bài 5 (lesson_id = 5): Phép trừ phạm vi 10
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order) VALUES
(5, 'multiple_choice', '9 - 4 = ?',
  '["3", "4", "5", "6"]',
  '{"answer": "5"}',
  '9 - 4 = 5 (chín trừ bốn bằng năm)', 1, 1),

(5, 'fill_blank', '10 - ___ = 3',
  NULL,
  '{"answer": "7"}',
  '10 - 7 = 3, vậy điền 7 vào chỗ trống', 2, 2),

(5, 'multiple_choice', 'An có 8 viên bi, cho bạn 3 viên. An còn lại mấy viên?',
  '["4", "5", "6", "11"]',
  '{"answer": "5"}',
  '8 - 3 = 5 (tám trừ ba bằng năm)', 1, 3);

-- ============================================================
-- BÀI TẬP MẪU CHO CHƯƠNG 2 (lesson_id = 6, 7)
-- ============================================================
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order) VALUES
(6, 'multiple_choice', '9 + 6 = ?',
  '["13", "14", "15", "16"]',
  '{"answer": "15"}',
  '9 + 6 = 15 (chín cộng sáu bằng mười lăm)', 1, 1),

(6, 'fill_blank', '8 + ___ = 16',
  NULL,
  '{"answer": "8"}',
  '16 - 8 = 8, vậy 8 + 8 = 16', 2, 2),

(7, 'multiple_choice', '17 - 8 = ?',
  '["7", "8", "9", "10"]',
  '{"answer": "9"}',
  '17 - 8 = 9 (mười bảy trừ tám bằng chín)', 1, 1),

(7, 'fill_blank', '20 - ___ = 11',
  NULL,
  '{"answer": "9"}',
  '20 - 9 = 11, vậy điền 9 vào chỗ trống', 2, 2);
