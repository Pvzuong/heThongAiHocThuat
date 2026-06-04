-- Education levels (chỉ THCS và THPT)
INSERT INTO education_levels (name, slug, description, sort_order) VALUES
('Cấp 2', 'cap-2', 'Trung học cơ sở (Lớp 6 - 9)', 1),
('Cấp 3', 'cap-3', 'Trung học phổ thông (Lớp 10 - 12)', 2);

-- Grades (Lớp 6-12, không có tiểu học)
INSERT INTO grades (education_level_id, grade_number, name, slug, sort_order) VALUES
-- Cấp 2
(1, 6,  'Lớp 6',  'lop-6',  1),
(1, 7,  'Lớp 7',  'lop-7',  2),
(1, 8,  'Lớp 8',  'lop-8',  3),
(1, 9,  'Lớp 9',  'lop-9',  4),
-- Cấp 3
(2, 10, 'Lớp 10', 'lop-10', 1),
(2, 11, 'Lớp 11', 'lop-11', 2),
(2, 12, 'Lớp 12', 'lop-12', 3);

-- Subjects
INSERT INTO subjects (name, slug, description, is_active) VALUES
('Toán', 'toan', 'Môn Toán theo chương trình THCS và THPT', true);

-- Grade-Subject mapping (Lớp 6-12 đều học Toán)
-- grade_id 1-7 tương ứng lớp 6-12 theo thứ tự insert ở trên
INSERT INTO grade_subjects (grade_id, subject_id, is_active) VALUES
(1, 1, true),
(2, 1, true),
(3, 1, true),
(4, 1, true),
(5, 1, true),
(6, 1, true),
(7, 1, true);
