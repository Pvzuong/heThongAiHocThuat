-- Education levels
INSERT INTO education_levels (name, slug, description, sort_order) VALUES
('Cấp 1', 'cap-1', 'Tiểu học (Lớp 1 - 5)', 1),
('Cấp 2', 'cap-2', 'Trung học cơ sở (Lớp 6 - 9)', 2),
('Cấp 3', 'cap-3', 'Trung học phổ thông (Lớp 10 - 12)', 3);

-- Grades (MVP: Lớp 1 - 5)
INSERT INTO grades (education_level_id, grade_number, name, slug, sort_order) VALUES
(1, 1, 'Lớp 1', 'lop-1', 1),
(1, 2, 'Lớp 2', 'lop-2', 2),
(1, 3, 'Lớp 3', 'lop-3', 3),
(1, 4, 'Lớp 4', 'lop-4', 4),
(1, 5, 'Lớp 5', 'lop-5', 5);

-- Subjects (MVP: chỉ Toán)
INSERT INTO subjects (name, slug, description, is_active) VALUES
('Toán', 'toan', 'Môn Toán theo chương trình Tiểu học', true);

-- Grade-Subject mapping (Lớp 1 - 5 đều học Toán)
INSERT INTO grade_subjects (grade_id, subject_id, is_active) VALUES
(1, 1, true),
(2, 1, true),
(3, 1, true),
(4, 1, true),
(5, 1, true);
