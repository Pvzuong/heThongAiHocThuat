-- Xóa exercises cũ (lỗi)
DELETE FROM exercises
WHERE lesson_id IN (
  SELECT l.id FROM lessons l
  JOIN chapters c ON c.id = l.chapter_id
  WHERE c.grade_subject_id = 8
);

-- Thêm exercises mới - chuẩn SGK lớp 6
-- CHƯƠNG 1: TẬP HỢP

-- Bài 1: Tập hợp và phần tử
INSERT INTO exercises (lesson_id, exercise_type, question_text, options, correct_answer, explanation, difficulty, sort_order, is_active)
SELECT l.id, 'multiple_choice'::exercise_type,
  'Tập hợp {1, 2, 3, 4, 5} có bao nhiêu phần tử?',
  '["3","4","5","6"]'::jsonb,
  '{"answer":"5"}'::jsonb,
  'Đếm từng phần tử: 1, 2, 3, 4, 5 = 5 phần tử',
  1, 1, true
FROM lessons l WHERE l.slug = 'bai-1-tap-hop-va-phan-tu'

UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Phần tử 3 có thuộc tập hợp {1, 3, 5, 7} không?',
  '["Có","Không","Không xác định","Tùy trường hợp"]'::jsonb,
  '{"answer":"Có"}'::jsonb,
  'Vì số 3 nằm trong tập hợp đó',
  1, 2, true
FROM lessons l WHERE l.slug = 'bai-1-tap-hop-va-phan-tu'

-- Bài 2: Cách biểu diễn tập hợp
UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Tập hợp các số tự nhiên nhỏ hơn 5 là {0, 1, 2, ?, ?}',
  NULL::jsonb,
  '{"answer":"3, 4"}'::jsonb,
  'Số tự nhiên nhỏ hơn 5: 0, 1, 2, 3, 4',
  1, 1, true
FROM lessons l WHERE l.slug = 'bai-2-cach-bieu-dien-tap-hop'

UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Cách viết nào là đúng để chỉ tập hợp các chữ cái trong từ "HÀ NỘI"?',
  '["{H, À, N, Ộ, I}","{H, A, N, O, I}","{H, N, I}","{Hà, Nội}"]'::jsonb,
  '{"answer":"{H, A, N, O, I}"}'::jsonb,
  'Mỗi phần tử là một chữ cái riêng biệt, không lặp lại',
  2, 2, true
FROM lessons l WHERE l.slug = 'bai-2-cach-bieu-dien-tap-hop'

-- CHƯƠNG 2: TÍNH CHIA HẾT

-- Bài 3: Ước và Bội
UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Số 12 có bao nhiêu ước?',
  '["4","6","8","10"]'::jsonb,
  '{"answer":"6"}'::jsonb,
  'Ước của 12 là: 1, 2, 3, 4, 6, 12 (tổng 6 ước)',
  2, 1, true
FROM lessons l WHERE l.slug = 'bai-3-uoc-va-boi'

UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Các bội của 5 nhỏ hơn 20 là: 0, 5, 10, ?, ?',
  NULL::jsonb,
  '{"answer":"15"}'::jsonb,
  'Bội của 5: 0, 5, 10, 15, 20, 25... Các bội nhỏ hơn 20: 0, 5, 10, 15',
  1, 2, true
FROM lessons l WHERE l.slug = 'bai-3-uoc-va-boi'

-- Bài 4: Số nguyên tố
UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Số nào là số nguyên tố?',
  '["1","2","4","6"]'::jsonb,
  '{"answer":"2"}'::jsonb,
  'Số 2 là số nguyên tố duy nhất chẵn (chỉ có ước 1 và 2)',
  2, 1, true
FROM lessons l WHERE l.slug = 'bai-4-so-nguyen-to'

UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Số 15 có phải số nguyên tố không? Vì sao?',
  '["Có, vì nó là số lẻ","Không, vì có ước 3 và 5","Có, vì lớn hơn 10","Không xác định được"]'::jsonb,
  '{"answer":"Không, vì có ước 3 và 5"}'::jsonb,
  'Số 15 = 3 × 5, có 4 ước (1, 3, 5, 15) nên không phải số nguyên tố',
  2, 2, true
FROM lessons l WHERE l.slug = 'bai-4-so-nguyen-to'

-- CHƯƠNG 3: SỐ NGUYÊN

-- Bài 5: Số nguyên âm
UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Số nguyên âm là gì?',
  '["Số nhỏ hơn 0","Số lớn hơn 0","Số bằng 0","Số không xác định"]'::jsonb,
  '{"answer":"Số nhỏ hơn 0"}'::jsonb,
  'Số nguyên âm: -1, -2, -3, ... đều nhỏ hơn 0',
  1, 1, true
FROM lessons l WHERE l.slug = 'bai-5-so-nguyen-am'

UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Số đối của -7 là ?',
  NULL::jsonb,
  '{"answer":"7"}'::jsonb,
  'Số đối: -7 và 7 là hai số đối nhau, tổng = 0',
  1, 2, true
FROM lessons l WHERE l.slug = 'bai-5-so-nguyen-am'

-- Bài 6: Cộng số nguyên
UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  '(-5) + 3 = ?',
  NULL::jsonb,
  '{"answer":"-2"}'::jsonb,
  'Hai số khác dấu: |−5| − |3| = 5 − 3 = 2, dấu âm → −2',
  2, 1, true
FROM lessons l WHERE l.slug = 'bai-6-cong-so-nguyen'

UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  '(-8) + (-5) = ?',
  NULL::jsonb,
  '{"answer":"-13"}'::jsonb,
  'Hai số cùng dấu âm: |−8| + |−5| = 8 + 5 = 13, dấu âm → −13',
  2, 2, true
FROM lessons l WHERE l.slug = 'bai-6-cong-so-nguyen'

-- CHƯƠNG 4: PHÂN SỐ

-- Bài 7: Khái niệm phân số
UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Phân số 3/5 có tử số là bao nhiêu?',
  '["3","5","8","15"]'::jsonb,
  '{"answer":"3"}'::jsonb,
  'Phân số a/b: a là tử số, b là mẫu số. Ở đây tử = 3, mẫu = 5',
  1, 1, true
FROM lessons l WHERE l.slug = 'bai-7-phan-so-va-so-thap-phan'

UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Phân số nào bằng 1/3?',
  '["2/6","3/9","4/10","5/12"]'::jsonb,
  '{"answer":"2/6"}'::jsonb,
  'Rút gọn 2/6: chia cả tử mẫu cho 2 = 1/3. Hoặc 3/9: chia cho 3 = 1/3',
  1, 2, true
FROM lessons l WHERE l.slug = 'bai-7-phan-so-va-so-thap-phan'

-- Bài 8: Rút gọn phân số
UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Rút gọn phân số 4/8 = ?/?',
  NULL::jsonb,
  '{"answer":"1/2"}'::jsonb,
  'ƯCLN(4,8) = 4. Chia 4÷4=1, 8÷4=2 → 1/2',
  1, 1, true
FROM lessons l WHERE l.slug = 'bai-8-rut-gon-phan-so'

UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Rút gọn phân số 9/12 = ?/?',
  NULL::jsonb,
  '{"answer":"3/4"}'::jsonb,
  'ƯCLN(9,12) = 3. Chia 9÷3=3, 12÷3=4 → 3/4',
  2, 2, true
FROM lessons l WHERE l.slug = 'bai-8-rut-gon-phan-so'

-- CHƯƠNG 5: HÌNH HỌC

-- Bài 9: Hình bình hành
UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Hình bình hành là gì?',
  '["Tứ giác có các cạnh bằng nhau","Tứ giác có các cạnh đối song song","Tứ giác có bốn góc vuông","Tứ giác có hai cạnh song song"]'::jsonb,
  '{"answer":"Tứ giác có các cạnh đối song song"}'::jsonb,
  'Định nghĩa: Hình bình hành là tứ giác có các cặp cạnh đối song song',
  2, 1, true
FROM lessons l WHERE l.slug = 'bai-9-hinh-binh-hanh'

UNION ALL

SELECT l.id, 'multiple_choice'::exercise_type,
  'Tính chất của hình bình hành là gì?',
  '["Các góc đều bằng 90°","Các cạnh đối bằng nhau, góc đối bằng nhau","Tất cả các cạnh bằng nhau","Hai đường chéo vuông góc"]'::jsonb,
  '{"answer":"Các cạnh đối bằng nhau, góc đối bằng nhau"}'::jsonb,
  'Tính chất hình bình hành: AB=CD, AD=BC (cạnh đối), ∠A=∠C, ∠B=∠D (góc đối)',
  2, 2, true
FROM lessons l WHERE l.slug = 'bai-9-hinh-binh-hanh'

-- Bài 10: Diện tích hình
UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Diện tích hình chữ nhật có chiều dài 6cm, chiều rộng 4cm = ? cm²',
  NULL::jsonb,
  '{"answer":"24"}'::jsonb,
  'Công thức: S = dài × rộng = 6 × 4 = 24 cm²',
  1, 1, true
FROM lessons l WHERE l.slug = 'bai-10-dien-tich-hinh'

UNION ALL

SELECT l.id, 'fill_blank'::exercise_type,
  'Diện tích hình bình hành có đáy 8cm, chiều cao 5cm = ? cm²',
  NULL::jsonb,
  '{"answer":"40"}'::jsonb,
  'Công thức: S = đáy × chiều cao = 8 × 5 = 40 cm²',
  2, 2, true
FROM lessons l WHERE l.slug = 'bai-10-dien-tich-hinh';
